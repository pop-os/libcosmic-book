# Model-View-Update (MVU)

[Iced][iced] is a GUI libray for Rust which uses the MVU (Model-View-Update) architecture—also known as [TEA (The Elm Architecture)][tea]. The MVU architecture consists of a single event loop with exclusive ownership of the application model, a view function for creating views from the model, and an update function for updating the model. The model creates the view, the view is displayed to the user, the user sends inputs to the view, and any messages emitted by widgets in view are used to update the model.

A simplified abstract code example is provided below.

```rs
use magic::{display, interact};

// Initialize the state
let mut app = AppModel::init();

// Be interactive. All the time!
loop {
    // Run our view logic to obtain our interface
    let view = view(&app);

    // Display the interface to the user
    display(&view);

    // Process the user interactions and obtain our messages
    let messages = interact(&view);

    // Update our state by processing each message
    for message in messages {
        update(&mut app);
    }
}
```

## View logic

In each iteration of the event loop, the runtime begins by calling the view function with a reference to the application's model. The application author will use this function to construct the entire layout of their interface. Combining widget elements together until they are one—the View.

The View is a widget element itself that contains a tree of widget elements inside of it. Each with their own set of functions for performing layout, drawing, and event handling. Together, the View serves its role as a state machine that the runtime will use to render the application and the intercept application inputs.

Widgets in the View are stateless. They rely directly on the model as the single source of truth for their state. With the combination of Rust and the way the Iced library was architected, they can even borrow their values directly from the application model. Therefore, the View is a direct reflection of the current state of the model at any given point in time.

As Views are replaced in each iteration, the runtime will use an optimization technique to compare the differences with the previous View in order to decide which widgets in the layout need to be redrawn, and if any cached widget data should be culled.

> If you were to create a widget that contains an image, the runtime will retain any image buffers it generates from the source image for reuse as long as the image widget remains in the tree. Similarly, pre-rendered text buffers will also be cached for reuse.

## Update logic

After the View has been drawn, the runtime will wait for UI events to intercept—such as mouse and keyboard events—and pass them through the View's widget tree. Widgets that receive these events through their own internal update methods can decide to emit Message(s) to the runtime in response. The application author defines which messages will be emitted when those conditions are met.

Once messages have been emitted, they are passed directly to the update function for the application author to handle. In addition to updating the state of the model, the application may also decide to spawn tasks for execution in the background. These will execute asynchronously on background thread(s), and may emit messages back to the runtime over the course of their execution.

> Similar to how Elm was created, this architecture has emerged naturally across the Rust ecosystem as a viable and efficient method of modeling applications and services which adhere to Rust's [aliasing XOR mutability rule][aliasing-xor-mutability]. This can be seen with the rise of similar frameworks, such as [Sauron][sauron], [Relm4][relm4], and [tui-realm][tuirealm]. At any given point, the application's model is either being immutably borrowed by its view, or is being mutably borrowed by its update method. Thus it eliminates the need for shared references, interior mutability, and runtime borrow checking.

[aliasing-xor-mutability]: https://cmpt-479-982.github.io/week1/safety_features_of_rust.html#the-borrow-checker-and-the-aliasing-xor-mutability-principle
[iced]: https://iced.rs/
[iced-rs-book]: https://book.iced.rs/the-runtime.html#looping-around
[pop-os]: https://system76.com/pop
[relm4]: https://crates.io/crates/relm4
[sauron]: https://crates.io/crates/sauron
[system76]: https://system76.com/
[tea]: https://guide.elm-lang.org/architecture/
[tuirealm]: https://crates.io/crates/tuirealm
