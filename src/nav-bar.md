# Nav Bar

COSMIC's Nav Bar is a common element found in most applications with navigatable interfaces. The `cosmic::Application` trait comes with some predefined methods that can be optionally set to enable integration with the Nav Bar with minimal setup.

First, it is necessary to add the [nav_bar::Model][nav-model] to your application's model.

```rs
struct AppModel {
    /// A model that contains all of the pages assigned to the nav bar panel.
    nav: nav_bar::Model,
}
```

The nav bar can then be enabled by implementing these methods in your `cosmic::Application` trait.


```rs
/// Enable the nav bar to appear in your application when `Some`.
fn nav_model(&self) -> Option<&nav_bar::Model> {
    Some(&self.nav)
}

/// Activate the nav item when selected.
fn on_nav_select(&mut self, id: nav_bar::Id) -> Command<Self::Message> {
    // Activate the page in the model.
    self.nav.activate(id);
}
```

Items can be added and modified from the init or update methods.

```rs
fn init(core: Core, _flags: Self::Flags) -> (Self, Command<Self::Message>) {
    let mut nav = nav_bar::Model::default();

    nav.insert()
        .text("Page 1")
        .data::<Page>(Page::Page1)
        .icon(icon::from_name("applications-science-symbolic"))
        .activate();

    nav.insert()
        .text("Page 2")
        .data::<Page>(Page::Page2)
        .icon(icon::from_name("applications-system-symbolic"));

    nav.insert()
        .text("Page 3")
        .data::<Page>(Page::Page3)
        .icon(icon::from_name("applications-games-symbolic"));

    let mut app = YourApp {
        core,
        nav,
    };

    (app, Command::none())
}
 ```
 
Each item in the model can hold any number of custom data types, which can be fetched by their type.
 
 ```rs
 if let Some(page) = self.nav.data::<Page>().copied() {
     eprintln!("the current page is {page}");
 }
 ```
 
 [nav-model]: https://pop-os.github.io/libcosmic/cosmic/widget/nav_bar/type.Model.html
