# Introduction

> Before beginning, I would recommend using the official [COSMIC App Template][cosmic-app-template] to build applications with while reading the documentation below. You can generate a cosmic application using the [cargo-generate][cargo-generate] utility with `cargo generate gh:pop-os/cosmic-app-template`.

[libcosmic][toolkit] is a GUI toolkit for creating [COSMIC](cosmic)-themed applets and applications.
Based on the cross-platform [iced][iced] GUI library—which it utilizes for its runtime and rendering primitives—the COSMIC toolkit features an advanced and responsive widget library based on COSMIC's design language, which supports personalizable desktop themes, cross-desktop theming integrations, a consistent interface guidelines, a standardized configuration system, and platform integrations.

Although the toolkit was created for the COSMIC desktop environment, it is also cross-platform, and thus it can be used to build COSMIC-themed applications for any Linux distribution (X11 & Wayland), [Redox OS](redox-os), Windows, Mac, and even mobile platforms like Android.
The goal of the cosmic library is to enable the creation of a cross-platform ecosystem of desktop applications that are easy to port from one OS to another.
We would also welcome any that would like to build their own OS experiences with the COSMIC toolkit.

> As a Rust-based GUI toolkit, experience with [Rust](rust) is required.
> Rust's rich type system and language features are key to what makes the COSMIC toolkit a much friendlier developer experience—enabling secure, reliable, and efficient applications to be developed at a faster pace than would be possible otherwise.
> For those interested in learning Rust, there are a lot of good resources available: [Learn Rust in a Month of Lunches][month-of-lunches], [Rust in Action][rust-in-action], [Rust by Example][rust-by-example], the official [Rust Book][rust-book], and [Rustlings][rustlings].

[cargo-generate]: https://github.com/cargo-generate/cargo-generate
[cosmic]: https://github.com/pop-os/cosmic-epoch
[cosmic-app-template]: https://github.com/pop-os/cosmic-app-template
[iced]: https://iced.rs/
[month-of-lunches]: https://www.manning.com/books/learn-rust-in-a-month-of-lunches
[redox-os]: https://redox-os.org/
[rust]: https://www.rust-lang.org/
[rust-book]: https://doc.rust-lang.org/stable/book/
[rust-by-example]: https://doc.rust-lang.org/rust-by-example/
[rust-in-action]: https://www.manning.com/books/rust-in-action
[rustlings]: https://github.com/rust-lang/rustlings
[toolkit]: https://github.com/pop-os/libcosmic
