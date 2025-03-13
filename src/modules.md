# Modules

Modules are used to encapsulate related private data into a central type; along with its own message type and functions.
These could be individual pages of your application, sections of a page, or even a reusable widgets composed of smaller widgets.

Below is a hypothetical application which contains two modules: `todo` and `config`.
Each containing their own respective `Page` and `Message` types.

```rs
struct App {
    active_page: PageId,
    todo_page: todo::Page,
    config_page: config::Page,
}
```

Starting with `todo` page module, which manages todo tasks.

```rs
mod todo {
    use cosmic::prelude::*;
    use cosmic::widget;

    pub async fn load() -> Message {
        // ..
    }

    #[derive(Debug, Clone)]
    pub enum Message {
        /// Add a new task
        Add,
        /// Edit an existing task
        EditInput(usize, String),
        /// Move the given task down
        MoveDown(usize),
        /// Move the given task up
        MoveUp(usize),
        /// Update the new task input editor
        NewInput(String),
        /// Remove an existing task
        Remove(usize)
        /// Save to disk
        Save
    }

    pub struct Page {
        new_task_input: String,
        tasks: Vec<String>,
    }

    impl Page {
        pub fn view(&self) -> cosmic::Element<Message> {
            // Where new tasks will be input before being added to the task list.
            let new_task_input = widget::text_input("Write down a new task here", &self.new_task_input)
                .on_input(Message::NewInput)
                .on_submit(Message::Add);

            // Fold each enumerated task into a widget that is pushed to a scrollable column.
            let saved_tasks = self.tasks.iter()
                .enumerate()
                .fold(widget::column(), |column, (id, task)| {
                    column.push(
                        // A hypothetical widget created for this app
                        crate::widget::task(task.as_str())
                            .on_remove(Message::Remove(id))
                            .on_input(|text| Message::EditInput(id, text))
                            .on_move_down(Message::MoveDown(id))
                            .on_move_up(Message::MoveUp(id))
                            .into()
                    )
                })
                .apply(widget::scrollable);

            // Compose the above widgets into the column view.
            widget::column::with_capacity(2)
                .spacing(cosmic::theme::active().cosmic().spacing.space_l)
                .push(new_task_input)
                .push(saved_tasks)
                .into()
        }

        pub fn update(&mut self, message: Message) -> cosmic::Task<cosmic::Action<Message>> {
            match message {
                Message::Add => {
                    self.tasks.insert(std::mem::take(&mut self.new_task_input));
                }

                Message::EditInput(id, task) => {
                    self.tasks[id] = task;
                }

                Message::MoveDown(id) => {
                    if id + 1 < self.tasks.len() {
                        self.tasks.swap(id, id + 1);
                    }
                }

                Message::MoveUp(id) => {
                    if id > 0 {
                        self.tasks.swap(id, id - 1);
                    }
                }

                Message::NewInput(input) => {
                    self.new_task_input = input;
                }

                Message::Remove(id) => {
                    self.tasks.remove(id);
                }

                Message::Save => {
                    // Hypothetical method to save the tasks to disk.
                    let save_future = self.save_to_disk();
                    return cosmic::task::future(save_future);
                }
            }

            cosmic::Task::none()
        }
    }
}
```

And now the `config` module:

```rs

mod config {
    #[derive(Debug, Clone)]
    pub enum Message {
        OpenUrl(url::Url)
    }

    pub struct Page {
        author_name: String,
        donate_url: url::Url,
        homepage_url: url::Url,
        repository_urlL: url::Url,
    }

    impl Page {
        pub fn view(&self) -> cosmic::Element<Message> {
            // Hypothetical config page
        }

        pub fn update(&mut self, message: Message) -> cosmic::Task<cosmic::Action<Message>> {
            match message {
                OpenUrl(url) => {
                    tokio::spawn(open_url(url));
                }
            }

            cosmic::Task::none()
        }
    }

    pub async fn open_url(url: url::Url) {
        // ...
    }
}

```

We can then use them in your application's own native view and update functions like so:

```rs
#[derive(Debug, Clone)]
enum Message {
    SetPage(PageId),
    ConfigPage(config::Message),
    TodoPage(todo::Message),
}

#[derive(Debug, Clone)]
enum PageId {
    Config
    Todo,
}

// ...

fn view(&self) -> cosmic::Element<Message> {
    match self.active_page {
        PageId::Todo => self.todo_page.view(),
        PageId::Config => self.config_page.view(),
    }
}

fn update(&mut self, message: Message) -> cosmic::Task<cosmic::Action<Message>> {
    match message {
        Message::SetPage(id) => {
            self.active_page = id;

            match self.active_page {
                PageId::Config => (),
                PageId::Todo => return cosmic::task::future(async move {
                    Message::TodoPage(todo::load().await)
                }),
            }
        }

        Message::ConfigPage(message) => return self.config_page.update(message),

        Message::TodoPage(message) => return self.todo_page.update(message),
    }
}

```

We may even implement the `Application::on_close_requested()` method in our app to handle that `Save` message for our `todo` page.

```rs
fn on_close_requested(&mut self) -> Option<Message> {
    Some(Message::TodoPage(todo::Message::Save))
}
```
