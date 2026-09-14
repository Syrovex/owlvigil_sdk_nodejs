# 模型调用与流式响应

## 发现模型

```ts
const models = await client.gateway.listModels();
const model = await client.gateway.getModel("your-model-id");
```

模型名称是 Provider 侧名称，不是 Management 资源 ID。可用性取决于当前 Workspace、
Gateway Key 和路由规则。

## Chat Completions

```ts
const response = await client.gateway.createChatCompletion({
  model: "your-model-id",
  messages: [{ role: "user", content: "Summarize this incident." }],
});

console.log(response.data.choices[0]?.message?.content);
console.log(response.meta.requestId);
```

## Responses、Embeddings 与 Anthropic 兼容 Messages

```ts
await client.gateway.createResponse({ model: "your-model-id", input: "Hello" });
await client.gateway.createEmbeddings({ model: "your-embedding-model", input: ["one", "two"] });
await client.gateway.createAnthropicMessage({
  model: "your-model-id",
  max_tokens: 512,
  messages: [{ role: "user", content: "Hello" }],
});
```

可扩展请求类型能够携带 Gateway 支持的 Provider 字段，但“兼容”不代表包含厂商官方 SDK
的全部辅助方法。

## 流式响应

Chat Completions 和 Responses 会返回拆分后的 SSE 事件：

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

`event.data` 是协议载荷字符串，应根据事件类型解码，不能假设所有事件共享一种 JSON
结构。每个生成器只能有一个消费者；下游断开时应取消请求，下游消费较慢时使用有界缓冲。
