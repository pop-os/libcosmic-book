# Tasks

Since the update function is called from the same event loop that renders the application and processes user inputs, the GUI will block for the duration that the application spends inside of the update function. To avoid blocking the GUI, any operation(s) other than what is necessary to update the model should placed into tasks.

```rs
fn update(&mut self, message: Self::Message) -> cosmic::Task<cosmic::Action<Self::Message>> {
    cosmic::task::future(async move {
        Message::BuildResult(build().await)
    })
}
```

[Tasks][task] enable applications to execute operations asynchronously on background thread(s) without blocking the GUI. Returned as the output of the update function, they are spawned for concurrent execution on an async executor running on a background thread. Tasks based on [futures][rust-future] return their output as a message to the application upon completion. Whereas tasks based on [streams][rust-stream] can stream messages to the application throughout their execution.

## Avoid blocking the async executor

However, for the same reason that the GUI blocks when an update function is executing, similar is true for the thread where the async executor is scheduling the execution of its futures. The default executor for COSMIC applications is a [tokio][tokio] runtime configured to use a single background thread for scheduling async tasks. So if the application needs to spawn many futures on the runtime to execute concurrently, any operation that would block the executor should be moved onto another thread with [tokio::task::spawn_blocking][spawn-blocking].

```rs
fn update(&mut self, message: Self::Message) -> cosmic::Task<cosmic::Action<Self::Message>> {
    match message {
        Message::WorkUnitReceived(work_unit) => {
            cosmic::task::future(async move {
                Message::WorkUnitResult(tokio::spawn_blocking(move || {
                    fold_protein("0x23", 110, 80, 19, work_unit)
                }).await)
            })
        }

        // ...
    }
}
```

## COSMIC Actions

The cosmic runtime has its own message type for handling updates to the cosmic runtime: `cosmic::app::Action`. To enable the cosmic runtime to handle messages simultaneously for itself and the application, the application's `Message` type is wrapped alongside `cosmic::app::Action` in the `cosmic::Action<Message>` type.

Since there are situations where applications may need to send messages to the cosmic runtime, all `Application` methods which return `Task`s are defined to return `cosmic::Task<cosmic::Action<Message>>`. This means that you may see a type error if you try to return a `cosmic::Task` directly with your application's `Message` type without mapping it `cosmic::Action::App` beforehand. The `cosmic::task` module contains functions which automatically convert application messages into `cosmic::Action<Message>`.

```rs
fn update(&mut self, message: Self::Message) -> cosmic::Task<cosmic::Action<Self::Message>> {
    // Create a task that emits an application message without needing to await the value.
    let app_task = cosmic::Task::done(Message::ApplicationEvent)
        .map(cosmic::Action::from);

    // Create a cosmic action directly
    let show_window_menu = cosmic::Task::done(cosmic::app::Action::ShowWindowMenu)
        .map(cosmic::Action::from);

    // Use a helper from the ApplicationExt trait to create a cosmic task
    let set_window_title = self.set_window_title("Custom application title".into());

    cosmic::Task::batch(vec![app_task, show_window_menu, set_window_title])
}
```


## Futures

Tasks may be created from futures using [cosmic::task::future](future).

```rs
fn update(&mut self, message: Self::Message) -> cosmic::Task<cosmic::Action<Self::Message>> {
    match message {
        Message::Clicked => {
            self.counter += 1;
            self.counter_text = format!("Clicked {} times", self.counter);

            // Await for 3 seconds in the background, and then request to decrease the counter.
            return cosmic::task::future(async move {
                tokio::time::sleep(Duration::from_millis(3000)).await;
                Message::Decrease
            });
        }

        Message::Decrease =>  {
            self.counter -= 1;
            self.counter_text = format!("Clicked {} times", self.counter);
        }
    }

    Command::none()
}
```

## Streaming

Alternatively, they can produced from types which implement [Stream][rust-stream]. Such as from the receiving end of a channel which it is being pushed to from anothre thread.

```rs
fn update(&mut self, message: Self::Message) -> cosmic::Task<cosmic::Action<Self::Message>> {
    match message {
        Message::Start => {
            self.progress = Some(0);

            let (tx, rx) = tokio::sync::mpsc::unbounded_channel();

            std::thread::spawn(move || {
                std::thread::sleep(std::time::Duration::from_secs(3));
                _ = tx.send(Message::Progress(25));
                std::thread::sleep(std::time::Duration::from_secs(3));
                _ = tx.send(Message::Progress(50));
                std::thread::sleep(std::time::Duration::from_secs(3));
                _ = tx.send(Message::Progress(75));
                std::thread::sleep(std::time::Duration::from_secs(3));
                _ = tx.send(Message::Progress(100));
            });

            return cosmic::Task::stream(tokio_stream::wrappers::UnboundedReceiverStream(rx))
                // Must wrap our app type in `cosmic::Action`.
                .map(cosmic::Action::App);
        }

        Message::Progress(progress) => {
            self.progress = Some(progress);
        }
    }

    cosmic::Task::none()
}
```


## Channel

Streams can be created directly from a future with an async channel using [cosmic::iced_futures::stream::channel][iced-channel-stream].
This is commonly used as an alternative to the lack of async generators in Rust.

```rs
fn update(&mut self, message: Self::Message) -> cosmic::Task<cosmic::Action<Self::Message>> {
    match message {
        Message::Start => {
            self.progress = Some(0);

            return cosmic::Task::stream(cosmic::iced_futures::stream::channel(|tx| async move {
                tokio::time::sleep(std::time::Duration::from_secs(3)).await;
                _ = tx.send(Message::Progress(25)).await;
                tokio::time::sleep(std::time::Duration::from_secs(3)).await;
                _ = tx.send(Message::Progress(50)).await;
                tokio::time::sleep(std::time::Duration::from_secs(3)).await;
                _ = tx.send(Message::Progress(75)).await;
                tokio::time::sleep(std::time::Duration::from_secs(3)).await;
                _ = tx.send(Message::Progress(100)).await;
            }))
            // Must wrap our app type in `cosmic::Action`.
            .map(cosmic::Action::App);
        }

        Message::Progress(progress) => {
            self.progress = Some(progress);
        }
    }

    cosmic::Task::none()
}
```

## Batches

They can also be [batched][batch] for concurrent execution, where messages will be received in the order of completion.

```rs
fn update(&mut self, message: Self::Message) -> cosmic::Task<cosmic::Action<Self::Message>> {
    match message {
        Message::BatchStarted => {
            eprintln!("started handling batch");
        }

        Message::Clicked => {
            self.counter += 1;
            self.counter_text = format!("Clicked {} times", self.counter);

            // Run two async tasks concurrently.
            return cosmic::task::batch(vec![
                // Await for 3 seconds in the background, and then request to decrease the counter.
                cosmic::task::future(async move {
                    tokio::time::sleep(Duration::from_millis(3000)).await;
                    Message::Decrease
                }),
                // Immediately returns a message without waiting.
                cosmic::task::message(Message::BatchStarted)
            ]);
        }

        Message::Decrease =>  {
            self.counter -= 1;
            self.counter_text = format!("Clicked {} times", self.counter);
        }
    }

    Command::none()
}
```

## Widget Operations

They can also be used to perform an operation onto a widget, such as focusing a button or text input.

```rs
return cosmic::widget::button::focus(self.BUTTON_ID);
```

## Chaining

If you need to configure multiple tasks for execution, where some tasks depend on the completion of another before they start, the `Task::chain` method can be used to allow the execution of one task to begin only after the first has finished.

```rs
cosmic::task::future(async move { build().await })
    .chain(cosmic::task::future(async move { clean().await }))
```

## Aborting

This gives an abort handle to the application that you can store in your application to cancel a running task.

```rs
let (task, abort_handle) = cosmic::task::future(async move {
    tokio::time::sleep(std::time::Duration::from_secs(3));
    println!("task finished");
    Message::Finished
}));

abort_handle.abort();
```

[batch]: https://pop-os.github.io/libcosmic/cosmic/task/fn.batch.html
[task]: https://pop-os.github.io/libcosmic/cosmic/iced_winit/runtime/struct.Task.html
[cosmic-tasks]: https://pop-os.github.io/libcosmic/cosmic/task/index.html#functions
[future]: https://pop-os.github.io/libcosmic/cosmic/task/fn.future.html
[iced-channel-stream]: https://pop-os.github.io/libcosmic/iced_futures/stream/fn.channel.html
[rust-future]: https://doc.rust-lang.org/stable/std/future/trait.Future.html
[rust-stream]: https://pop-os.github.io/libcosmic/futures_core/stream/trait.Stream.html
[spawn-blocking]: https://docs.rs/tokio/latest/tokio/task/fn.spawn_blocking.html
[tokio]: https://tokio.rs/
