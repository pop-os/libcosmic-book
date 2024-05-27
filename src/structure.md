# Structure

Given that all application state will be stored into one top level application struct, you may be wondering how to manage the complexity of the model. The general advice is not to feel bad about having a model with a lot of fields, a large view method with a many lines of code, and a large update method with many message variants. This is a feature of the MVU design pattern which centralizes the logic in a way that is easy to refactor and reorganize as your application grows naturally.

Use descriptive names when adding new fields to your application model, and group fields together into structs when you feel that it is necessary.

```rs
```

Likewise, you may find it useful to create additional message types which you can wrap in your top level message enum.

```rs
enum Message {
    VariantA,
    VariantB,
    VariantC(CMessage)
}
```
