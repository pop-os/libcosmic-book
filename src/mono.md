
## Reducing Monomorphization

Rust uses monorphization to create multiple separate instances of types and functions that use generics—one for each type used.
Although it improves performance over dynamic dispatch, it will increase compile times and binary size significantly if used excessively.
If this is a concern, it will be important to keep elements across your application of the same message type.
One way that you can reduce this is to pass a closure into your view and update functions to allow the caller to perform the conversion in advance.

```rs
pub fn view<Out>(&self, on_message: impl Fn(Message) -> Out) -> cosmic::Element<Out> {
    // Where new tasks will be input before being added to the task list.
    let new_task_input = widget::text_input("Write down a new task here", &self.new_task_input)
        .on_input(on_message(Message::NewInput))
        .on_submit(on_message(Message::Add));

    // Fold each enumerated task into a widget that is pushed to a scrollable column.
    let saved_tasks = self.tasks.iter()
        .enumerate()
        .fold(widget::column(), |column, (id, task)| {
            column.push(
                // A hypothetical widget created for this app
                crate::widget::task(task.as_str())
                    .on_remove(on_message(Message::Remove(id)))
                    .on_input(|text| on_message(Message::EditInput(id, text)))
                    .on_move_down(on_message(Message::MoveDown(id)))
                    .on_move_up(on_message(Message::MoveUp(id)))
                    .into()
            )
        })
        .apply(widget::scrollable);

    // Compose the above widgets into the column view.
    widget::column::with_capacity(2)
        .spacing(cosmic::theme::active().cosmic().spacing.space_l)
        .push(new_task_input)
        .push(saved_tasks)
        .into()
}
```

However, since this function takes an `impl` type as an input paramter, it too will be monomorphized across different closure types used as the input.
In some cases you might want to use a [non-generic inner function](https://www.possiblerust.com/pattern/non-generic-inner-functions) where the inner function can be declared `#[inline(never)]`.
In others, it may be easier to use dynamic dispatch with trait objects via the dyn keyword.

```rs
pub fn view<Out>(&self, on_message: &dyn Fn(Message) -> Out) -> cosmic::Element<Out>
```

Or

```rs
pub fn view<Out>(&self, on_message: Box<dyn Fn(Message) -> Out>) -> cosmic::Element<Out>
```
