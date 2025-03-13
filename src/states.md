## States

Rust's first class support for sum types and pattern matching can be used to implement state machines which apply transitions from one state to another.
This can be useful to enable the application to discard data that is no longer relevant for the current state of the application.

```rs
enum Page {
    AboutPage(about::Page),
    ConfigPage(config::Page),
    MainPage(main::Page),
}

struct App {
    page: Page,
}
```


Starting with `main` module:

```rs
mod main {
    #[derive(Debug, Clone)]
    pub enum Message {
        Loading { loading_time: std::time::Duration },
        Loaded { message: String },
    }

    pub enum Page {
        Loading { progress: std::time::Duration },
        Loaded { message: String }
    }

    impl Page {
        pub fn new() -> Self {
            Self::Loading { progress: std::time::Duration::from_secs(0) }
        }

        pub fn view(&self) -> cosmic::Element<Message> {
            match self {
                Self::Loading { progress } => {
                    // ..
                }

                Self::Loaded { message } => {
                    // ...
                }
            }
        }

        pub fn update(&mut self, message: Message) -> cosmic::Task<cosmic::Action<Message>> {
            match message {
                Message::Loading { loading_time } => {
                    self = Page::Loading { loading_time }
                }

                Message::Loaded { message } => {
                    self = Page::Loaded { message }
                }
            }

            cosmic::Task::none()
        }
    }

    pub async fn load() -> Message {
        // ..
    }
}
```

Which can then be implemented in the application like so:

```rs
#[derive(Debug, Clone)]
enum Message {
    SetPage(PageId),
    ConfigPage(config::Message),
    MainPage(main::Message),
}

#[derive(Debug, Clone)]
enum PageId {
    Config
    Main,
}

// ...

fn view(&self) -> cosmic::Element<Message> {
    match self.page {
        Page::Main(page) => page.view(),
        Page::Config(page) => page.view(),
    }
}

fn update(&mut self, message: Message) -> cosmic::Task<cosmic::Action<Message>> {
    match message {
        Message::SetPage(id) => {
            match id {
                PageId::Config => {
                    self.page = Page::Config(config::Page::new());
                }

                PageId::Main(page) => {
                    self.page = Page::Main(main::Page::new());
                    return cosmic::task::future(async {
                        Message::MainPage(main::load().await)
                    });
                }
            };
        }

        Message::ConfigPage(message) => {
            if let Page::Config(ref mut page) = self.page {
                return page.update(message);
            }
        }

        Message::MainPage(message) => {
            if let Page::Main(ref mut page) = self.page {
                return page.update(message);
            }
        }
    }
}
```
