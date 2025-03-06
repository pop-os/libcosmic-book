# Subscriptions

Subscriptions are long-running async tasks which listen for external events passively, and forward Messages back to the application runtime. They can be used to continuously monitor events for the entire lifetime of the application.

## Channels

The most common form of a subscription will be that of a channel. This will effectively behave as an async generator which yields messages to the application runtime. The source of your events could be from a channel, async stream, or a custom event loop.

```rs
struct MySubscription;
let subscription = cosmic::subscription::channel(
    std::any::TypeId::of::<MySubscription>(),
    4,
    move |mut output| async move {
        let stream = streamable_operation();

        while let Some(event) = stream.next().await {
            let _res = output.send(Message::StreamedMessage(event)).await;
        }

        futures::future::pending().await
    },
);
```

## Batches

If your application needs more than one Subscription, you can batch them together in one with `Subscription::batch`.

```rs
Subscription::batch(vec![
    subscription1,
    subscription2,
    subscription3,
])
```
