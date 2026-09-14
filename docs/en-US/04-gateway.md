# Model Calls and Streaming

## Discover models

```ts
const models = await client.gateway.listModels();
const model = await client.gateway.getModel("your-model-id");
```

Model names are provider-facing names, not OwlVigil Management resource IDs.
Availability depends on the current Workspace, Gateway Key, and routing rules.

## Chat Completions

```ts
const response = await client.gateway.createChatCompletion({
  model: "your-model-id",
  messages: [{ role: "user", content: "Summarize this incident." }],
});

console.log(response.data.choices[0]?.message?.content);
console.log(response.meta.requestId);
```

## Responses, Embeddings, and Anthropic-compatible Messages

```ts
await client.gateway.createResponse({ model: "your-model-id", input: "Hello" });
await client.gateway.createEmbeddings({ model: "your-embedding-model", input: ["one", "two"] });
await client.gateway.createAnthropicMessage({
  model: "your-model-id",
  max_tokens: 512,
  messages: [{ role: "user", content: "Hello" }],
});
```

The extensible request types accept provider fields supported by the Gateway,
but compatibility does not mean every helper from a provider's official SDK is
present.

## Streaming

Chat Completions and Responses expose parsed SSE frames:

```ts
const controller = new AbortController();

for await (const event of client.gateway.createChatCompletionStream(
  {
    model: "your-model-id",
    messages: [{ role: "user", content: "Stream a short answer." }],
  },
  { signal: controller.signal, timeoutMs: 120_000 },
)) {
  console.log(event.event, event.id, event.data);
}
```

`event.data` is the protocol payload string. Decode it according to the event
type instead of assuming that every event shares one JSON shape. Use one
consumer per generator, cancel when the downstream client disconnects, and
apply bounded buffering when the downstream consumer is slower than the model.
