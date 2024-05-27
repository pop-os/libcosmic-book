# MenuBar

It is also recommended for applications to provide menu bars whenever they have sufficient need to display a variety of selectable options. See the [cosmic::widget::menus][menus] module for more details on the APIs available for menu creation.

> In the future, menu bars will be a source for interacting with global menus.

## Defining MenuAction(s)

Menu bars have their own custom message types. This one will provide just an about settings page.

```rs
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub enum MenuAction {
    About,
}
```

For this type to be usable with a menu bar, it needs to implement the [menu::Action][menu-action] trait. This defines which application message that the menu action should convert into.

```rs
impl menu::Action for MenuAction {
    type Message = Message;

    fn message(&self) -> Self::Message {
        match self {
            MenuAction::About => Message::ToggleContextPage(ContextPage::About),
        }
    }
}
```

## Keybindings

Your preferred key bindings for these menu actions should also be attached to your application's model.

```rs
struct AppModel {
    /// Key bindings for the application's menu bar.
    key_binds: HashMap<menu::KeyBind, MenuAction>,
}
```


## Add to `cosmic::Application`

You can add then add a menu bar to the start of your application's header bar by defining this method in your `cosmic::Application` implementation.

```rs
/// Elements to pack at the start of the header bar.
fn header_start(&self) -> Vec<Element<Self::Message>> {
    let menu_bar = menu::bar(vec![menu::Tree::with_children(
        menu::root(fl!("view")),
        menu::items(
            &self.key_binds,
            vec![menu::Item::Button(fl!("about"), MenuAction::About)],
        ),
    )]);

    vec![menu_bar.into()]
}
```

[menu-action]: https://pop-os.github.io/libcosmic/cosmic/widget/menu/action/trait.MenuAction.html
[menus]: https://pop-os.github.io/libcosmic/cosmic/widget/menu/index.html
