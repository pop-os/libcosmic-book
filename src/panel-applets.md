# Panel Applets

COSMIC panel applets are built using the same libcosmic toolkit that desktop applications are built with.
They operate as their own self-contained application processes with transparent headerless windows.
No need to use a custom JavaScript API; or use a different shell toolkit; in a restrictive runtime environment.

The panel—which is actually a wayland compositor itself—reads its config file on startup to determine which applications to launch by their desktop entry names.
Their position in the config determines where the panel will position their main window within itself.
The popup windows that these applets create are forwarded to the host compositor to be displayed outside of the panel.

This architecture has many security benefits, in addition to easing the burden of development.
Once you know how to build a COSMIC application, you can already create applets with only a few adjustments to the application.
First of which is to run the application with [cosmic::applet::run][applet-run] instead of `cosmic::app::run`.

> Must enable the `applet` feature in libcosmic. May also want to remove `wgpu` to use a software renderer for lower memory usage.

```rs
cosmic::applet::run::<Power>(())
```

Next, you will define the view for main window, which will be used inside of the panel.
There is a template provided by the `cosmic::Core` in case you wish to create a standard icon button.
You only need to provide a message for toggling the popup created by the panel.


```rs
fn view(&self) -> cosmic::Element<Message> {
    self.core
        .applet
        .icon_button(&self.icon_name)
        .on_press_down(Message::TogglePopup)
        .into()
}
```

In your `update()` method, you can create a popup window like so, which will destroy the popup if a popup is already active.


```rs
match message {
    Message::TogglePopup => {
        if let Some(p) = self.popup.take() {
            cosmic::iced::platform_specific::shell::commands::popup::destroy_popup(p)
        } else {
            let new_id = window::Id::unique();
            self.popup.replace(new_id);

            let mut popup_settings = self.core.applet.get_popup_settings(
                self.core.main_window_id().unwrap(),
                new_id,
                Some((500, 500)),
                None,
                None,
            );

            popup_settings.positioner.size_limits = Limits::NONE
                .min_width(100.0)
                .min_height(100.0)
                .max_height(400.0)
                .max_width(500.0);

            cosmic::iced::platform_specific::shell::commands::popup::get_popup(popup_settings)
        }
    }
}
```

Now you can define the view of your popup window using [Application::view_window][view-window], which takes a window ID as an input in the event that you have multiple windows to display views for.
This particular example is from the power applet:


```rs
fn view_window(&self, id: window::Id) -> cosmic::Element<Message> {
    let Spacing {
        space_xxs,
        space_s,
        space_m,
        ..
    } = theme::active().cosmic().spacing;

    if matches!(self.popup, Some(p) if p == id) {
        let settings = menu_button(text::body(fl!("settings")))
            .on_press(Message::Settings);

        let session = column![
            menu_button(
                row![
                    text_icon("system-lock-screen-symbolic", 24),
                    text::body(fl!("lock-screen")),
                    Space::with_width(Length::Fill),
                    text::body(fl!("lock-screen-shortcut")),
                ]
                .align_y(Alignment::Center)
                .spacing(space_xxs)
            )
            .on_press(Message::Action(PowerAction::Lock)),
            menu_button(
                row![
                    text_icon("system-log-out-symbolic", 24),
                    text::body(fl!("log-out")),
                    Space::with_width(Length::Fill),
                    text::body(fl!("log-out-shortcut")),
                ]
                .align_y(Alignment::Center)
                .spacing(space_xxs)
            )
            .on_press(Message::Action(PowerAction::LogOut)),
        ];

        let power = row![
            power_buttons("system-suspend-symbolic", fl!("suspend"))
                .on_press(Message::Action(PowerAction::Suspend)),
            power_buttons("system-reboot-symbolic", fl!("restart"))
                .on_press(Message::Action(PowerAction::Restart)),
            power_buttons("system-shutdown-symbolic", fl!("shutdown"))
                .on_press(Message::Action(PowerAction::Shutdown)),
        ]
        .spacing(space_m)
        .padding([0, space_m]);

        let content = column![
            settings,
            padded_control(divider::horizontal::default()).padding([space_xxs, space_s]),
            session,
            padded_control(divider::horizontal::default()).padding([space_xxs, space_s]),
            power
        ]
        .align_x(Alignment::Start)
        .padding([8, 0]);

        self.core
            .applet
            .popup_container(content)
            .max_height(400.)
            .max_width(500.)
            .into()
    } else {
        widget::text("").into()
    }
}
```

You'll also want to use the applet style to get the transparent window background using [Application::style][app-style].

```rs
fn style(&self) -> Option<cosmic::iced_runtime::Appearance> {
    Some(cosmic::applet::style())
}
```

Now all that's left is informing cosmic-settings about the existence of the applet by adding some keys to its desktop entry.
See the power applet's desktop entry as an example, which defines `NoDisplay=true`, `X-CosmicApplet=true`, `X-CosmicHoverPopup=Auto`, `X-CosmicHoverPopup=Auto`, and `X-OverflowPriority=10`.

```ini
[Desktop Entry]
Name=User Session
Name[hu]=Felhasználói Munkamenet
Name[pl]=Sesja użytkownika
Type=Application
Exec=cosmic-applet-power
Terminal=false
Categories=COSMIC;
Keywords=COSMIC;Iced;
# Translators: Do NOT translate or transliterate this text (this is an icon file name)!
Icon=com.system76.CosmicAppletPower-symbolic
StartupNotify=true
NoDisplay=true
X-CosmicApplet=true
X-CosmicHoverPopup=Auto
```

[applet-run]: https://github.com/pop-os/libcosmic/blob/c7edd37b03cac28650cb96023a9cb965d3e062ac/src/applet/mod.rs#L379-L428
[view-window]: https://pop-os.github.io/libcosmic/cosmic/app/trait.Application.html#method.view_window
[app-style]: https://pop-os.github.io/libcosmic/cosmic/app/trait.Application.html#method.style
