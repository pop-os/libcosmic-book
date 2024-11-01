# Model-View-Update (MVU)

The [Iced][iced] runtime is an implementation of the MVU (Model-View-Update) design pattern—also known as [TEA (The Elm Architecture)][tea]. The MVU design pattern is a functional approach to GUI design that consists of an event loop with ownership of the application's struct—aka the Model, a view function for generating a View from that model, and an update function for updating the Model.

Similar to how Elm was created, this architecture also emerged naturally in the Rust ecosystem as everyone searched for ways to model applications and services which adhere to Rust's [aliasing XOR mutability rule][aliasing-xor-mutability]. This can be seen with the rise of similar frameworks, such as [Sauron][sauron], [Relm4][relm4], and [tui-realm][tuirealm]. At any given point, the application's model is either being immutably borrowed by its view, or is being mutably borrowed by its update method. Thus it eliminates the need for shared references, interior mutability, and runtime borrow checking.

To describe this in code, see the [iced.rs book][iced-rs-book] example here:

```rs
use magic::{display, interact};

// Initialize the state
let mut counter = Counter::default();

// Be interactive. All the time! 
loop {
    // Run our view logic to obtain our interface
    let interface = counter.view();

    // Display the interface to the user
    display(&interface);

    // Process the user interactions and obtain our messages
    let messages = interact(&interface);

    // Update our state by processing each message
    for message in messages {
        counter.update(message);
    }
}
```

In each iteration of the event loop, the runtime calls the view method of the application's Model to create a new View. The View is a state machine whose purpose is both to describe the layout of the interface and how to draw it; and to be a streamlined pipeline for processing UI events and yielding any Messages from widgets in the View that they triggered. The View can efficiently borrow data directly from the Model because the View has the same lifetime as the borrowed Model.

> Because the majority of the runtime is likely to be spent in drawing, the runtime will diff the layout and state of the View to detect when there is a need to redraw a node in the widget tree. The runtime will also cache certain elements between frames—such as images—to prevent the need to redraw them.

Once the View has been drawn, the runtime will wait for UI events—such as mouse and keyboard events—and process them directly through the View. Those events will be pass through various widgets which may emit any number of Messages in response. After the View has processed the UI event(s), the View is dropped and any received Messages will be passed through the Model's update method, which mutably borrows the Model.

The update method uses pattern matching to find the appropriate branch to execute (which is much faster than dynamic dispatch), and the programmer can then update the model while running any application logic necessary. Once the update method has completed, the next iteration of the loop begins.

[aliasing-xor-mutability]: https://cmpt-479-982.github.io/week1/safety_features_of_rust.html#the-borrow-checker-and-the-aliasing-xor-mutability-principle
[iced]: https://iced.rs/
[iced-rs-book]: https://book.iced.rs/the-runtime.html#looping-around
[pop-os]: https://system76.com/pop
[relm4]: https://crates.io/crates/relm4
[sauron]: https://crates.io/crates/sauron
[system76]: https://system76.com/
[tea]: https://guide.elm-lang.org/architecture/
[tuirealm]: https://crates.io/crates/tuirealm
