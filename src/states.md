## States

One of the most useful aspects of Rust for application development is the ability to use sum types with pattern matching to implement state machines.
Messages received by the application can apply transitions to states within the application seamlessly.
Which can make logic errors less likely to occur when you remove the need to guess the state based on values alone.

```rs
enum Package {
    Downloading { package: String, progress: usize, total: usize, time: std::time::Duration },
    Installed { package: String },
    Installable { package: String },
}

struct Installer {
    package: Option<Package>,
}
```

At any given moment, the state of the `package` in the `Installer` has four possible variants: none, downloading, installed, or installable. This makes the task of determining what to display in the view simple. Only values necessary for that state will be stored in the model.

```rs
pub fn view(&self) -> cosmic::Element<Message> {
    match self.package {
        Some(Package::Downloading { package, progress, total, time }) => {
            widget::text(format!("{package}} installing ({progress}/{total} {}s)", time.as_secs()))
                .into()
        }

        Some(Package::Installed { package }) => {
            widget::text(format!("{package} has already been installed"))
                .into()
        }

        Some(Package::Installable { package }) => {
            widget::button::text(format!("Install {package}"))
                .on_press(Message::Install)
                .into()
        }

        None => {
            widget::text("Select a package to install").into()
        }
    }
}
```

You could similarly use this in an application to enable it to store data only for the currently-active page in the application.

```rs
struct App {
    page: Page,
}

enum Page {
    AboutPage(about::Page),
    ConfigPage(config::Page),
    TodoPage(todo::Page),
}

#[derive(Debug, Clone)]
enum PageId {
    Config
    Todo,
}

#[derive(Debug, Clone)]
enum Message {
    SetPage(PageId),
    ConfigPage(config::Message),
    TodoPage(todo::Message),
}

// ...

fn view(&self) -> cosmic::Element<Message> {
    match self.page {
        Page::Todo(page) => page.view(),
        Page::Config(page) => page.view(),
    }
}

fn update(&mut self, message: Message) -> cosmic::Task<cosmic::Action<Message>> {
    match message {
        // Change the active page.
        Message::SetPage(id) => {
            match id {
                PageId::Config => {
                    self.page = Page::Config(config::Page::new());
                }

                PageId::Todo(page) => {
                    self.page = Page::Todo(todo::Page::new());
                    return cosmic::task::future(async {
                        Message::TodoPage(todo::load().await)
                    });
                }
            };
        }

        // Apply the message only if the config page is active.
        Message::ConfigPage(message) => {
            if let Page::Config(ref mut page) = self.page {
                return page.update(message);
            }
        }

        // Apply the message only if the todo page is active.
        Message::TodoPage(message) => {
            if let Page::Todo(ref mut page) = self.page {
                return page.update(message);
            }
        }
    }
}
```
