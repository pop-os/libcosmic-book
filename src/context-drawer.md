# Context Drawer

COSMIC applications use the Context Drawer to display additional application context for a select context. This overlay widget will be placed above the contents of the window on the right side of the application window.

## Context Page

As the context drawer is a reusable element, you want to define a type for describing which context to show. To start with, we will make a context page which shows an about page. This will require that your application has the menu bar added to it from the previous chapter.

```rs
/// Identifies a context page to display in the context drawer.
#[derive(Copy, Clone, Debug, Default, Eq, PartialEq)]
pub enum ContextPage {
    #[default]
    About,
}

impl ContextPage {
    fn title(&self) -> String {
        match self {
            Self::About => fl!("about"),
        }
    }
}
```

You will also want to assign this to your application model

```rs
struct AppModel {
    /// Display a context drawer with the designated page if defined.
    context_page: ContextPage,
}
```

## cosmic::Application integration

The `context_drawer` method can be defined to show the context drawer. When this method returns an Element, the context drawer will be displayed. The COSMIC runtime keeps track of when the context drawer should be shown, so we can use this as a hint to when we can show it or not. How you define the view of this page is up to you.

```rs
/// Display a context drawer if the context page is requested.
fn context_drawer(&self) -> Option<Element<Self::Message>> {
    if !self.core.window.show_context {
        return None;
    }

    Some(match self.context_page {
        ContextPage::About => self.about(),
    })
}
```

## Toggling the context drawer

In the previous chapter, we defined a message for toggling the context drawer and assigning the page. This glue will toggle the visibility of the context drawer, assign the context page, and set the title of the context drawer. Note that the `set_context_title` is a method from [cosmic::ApplicationExt][appext]. This method sets the title of the context page in the `cosmic::app::Core`.

```rs
match message {
    Message::ToggleContextPage(context_page) => {
        if self.context_page == context_page {
            // Close the context drawer if the toggled context page is the same.
            self.core.window.show_context = !self.core.window.show_context;
        } else {
            // Open the context drawer to display the requested context page.
            self.context_page = context_page;
            self.core.window.show_context = true;
        }

        // Set the title of the context drawer.
        self.set_context_title(context_page.title());
    }
}
```

[appext]: https://pop-os.github.io/libcosmic/cosmic/app/trait.ApplicationExt.html#method.set_context_title
