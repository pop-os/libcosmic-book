# The Application Trait

> Before beginning, I would recommend cloning the [COSMIC App Template][cosmic-app-template] to experiment with while reading the documentation below.

## Model

Every application begins with the application model. All application state will be stored in this model, and it will be wise to cache data that will be needed by your application's widgets. It is important that it contains at least a [cosmic::app::Core][app-core], which will provide a way of interacting with certain aspects of the COSMIC app runtime.

```rs
use cosmic::prelude::*;

struct AppModel {
    core: cosmic::app::Core,
    counter: u32,
    counter_text: String,
}
```

## Message

Alongside that struct, there will also be a Message type, which describes the kinds of events that widgets in the applications are going to emit.

```rs
#[derive(Debug, Clone)]
pub enum Message {
    Clicked
}
```

## The Trait

Together, these will be used to create a [cosmic::Application][app-trait]. Implementing this trait will automatically generate all of the necessary code to run a COSMIC application which integrates consistently within the COSMIC desktop.

Note that the following associated types and constants are required:

- `Executor` is the async executor that will be used to run your application's commands.
- `Flags` is the data that your application needs to use before it starts.
- `Message` is the enum that contains all the possible variants that your application will need to transmit messages.
- `APP_ID` is the unique identifier of your application.

We also need to provide methods to enable the COSMIC app runtime to access the application's Core.

```rs
impl cosmic::Application for AppModel {
    type Executor = cosmic::executor::Default;
    type Flags = ();
    type Message = Message;

    const APP_ID: &str = "tld.domain.AppName";

    fn core(&self) -> &Core {
        &self.core
    }

    fn core_mut(&mut self) -> &mut Core {
        &mut self.core
    }
}
```

## Init

This is where your application model will be constructed, and any necessary tasks scheduled for execution on init. This will typically be where you want to set the name of the window title.

```rs
fn init(core: Core, _flags: Self::Flags) -> (Self, Command<Self::Message>) {
    let mut app = AppModel {
        core,
        counter: 0,
        counter_text: String::new(),
    };

    app.counter_text = format!("Clicked {} times", app.counter);
  
    let command = app.set_window_title("AppName");

    (app, command)
}
 ```

## View

At the beginning of each iteration of the runtime's event loop, the [view method][view-method] will be called to create a view which describes the current state of the UI. The returned state machine defines the layout of the interface, how it is to be drawn, and what messages widgets will emit when triggered by certain UI events.

```rs
impl cosmic::Application for AppModel {
    ...
    
    /// The returned Element has the same lifetime as the model being borrowed.
    fn view(&self) -> Element<Self::Message> {
        let button = widget::button(&self.counter_text)
            .on_press(Message::Clicked);
            
        widget::container(button)
            .width(iced::Length::Fill)
            .height(iced::Length::Shrink)
            .center_x()
            .center_y()
            .into()
    }
}
```

This method will be composed from widget functions that you can get from the [cosmic::widget][cosmic-widget] module. Note that widgets are composed functionally, and therefore they are designed to have their fields set through a [Builder pattern][builder-pattern].

## Update

Messages emitted by the view will later be passed through the application's [update method][update-method]. This will use Rust's pattern matching to choose a branch to execute, make any changes necessary to the application's model, and may optionally return one or more commands.

```rs
impl cosmic::Application for AppModel {
    ...
    
    fn update(&mut self, message: Self::Message) -> Command<Self::Message> {
        match message {
            Message::Clicked => {
                self.counter += 1;
                self.counter_text = format!("Clicked {} times", self.counter);
            }
        }
        
        Command::none()
    }
}
```

Because this method executes in the runtime's event loop, the application will block for the duration that this method is being called. It is therefore imperative that any application logic executed here should be swift to prevent the user from experiencing an application freeze. Anything that requires either asynchronous or long execution time should either be returned as a [Command](commands.md), or placed into a [Subscription](subscriptions.md).

## Running the application

Once the trait has been implemented, you can run it from your main function like so:

```rs
fn main() -> cosmic::iced::Result {
    let settings = cosmic::app::Settings::default();
    cosmic::app::run::<AppModel>(settings, ())
}
```

[app-core]: https://pop-os.github.io/libcosmic/cosmic/app/struct.Core.html
[app-trait]: https://pop-os.github.io/libcosmic/cosmic/app/trait.Application.html
[builder-pattern]: https://rust-unofficial.github.io/patterns/patterns/creational/builder.html
[cosmic-app-template]: https://github.com/pop-os/cosmic-app-template
[cosmic-widget]: https://pop-os.github.io/libcosmic/cosmic/widget/index.html
[update-method]: https://pop-os.github.io/libcosmic/cosmic/app/trait.Application.html#method.update
[view-method]: https://pop-os.github.io/libcosmic/cosmic/app/trait.Application.html#tymethod.view
