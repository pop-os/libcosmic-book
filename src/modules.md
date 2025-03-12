# Modules

Modules are used to encapsulate related private data into a central type; along with its own message type and functions.
These could be individual pages of your application, sections of a page, or even a reusable widgets composed of smaller widgets.

Below is a hypothetical application which contains two modules: `main` and `config`.
Each containing their own respective `Page` and `Message` types.

```rs
struct App {
    active_page: PageId,
    main_page: main::Page,
    config_page: config::Page,
}
```

Starting with `main` module:

```rs
mod main {
    pub enum Message {
        Loading { loading_time: std::time::Duration },
        Loaded { message: String },
    }

    pub struct Page {
        loading_time: Option<std::time::Duration>,
        message: String
    }

    impl Page {
        pub fn view(&self) -> cosmic::Element<Message> {
            // ...
        }

        pub fn update(&mut self, message: Message) -> cosmic::Task<cosmic::Action<Message>> {
            match message {
                Message::Loading { loading_time } => {
                    self.loading_time = Some(loading_time);

                }

                Message::Loaded { message } => {
                    self.message = message;
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
            // ...
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
    MainPage(main::Message),
}

#[derive(Debug, Clone)]
enum PageId {
    Config
    Main,
}

// ...

fn view(&self) -> cosmic::Element<Message> {
    match self.active_page {
        PageId::Main => self.main_page.view(),
        PageId::Config => self.config_page.view(),
    }
}

fn update(&mut self, message: Message) -> cosmic::Task<cosmic::Action<Message>> {
    match message {
        Message::SetPage(id) => {
            self.active_page = id;

            match self.active_page {
                PageId::Config => (),
                PageId::Main => return cosmic::task::future(async move {
                    Message::MainPage(main::load().await)
                }),
            }
        }

        Message::ConfigPage(message) => return self.config_page.update(message),

        Message::MainPage(message) => return self.main_page.update(message),
    }
}

```

> While you may be tempted to combine the two together into a single `Page` module, it is important to avoid planning too far ahead of the needs of your application.
> Pages may be similar, but they are not the same.
