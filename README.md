# OwlVigil Node.js SDK

Dependency-free-at-runtime, ESM-first TypeScript client for the OwlVigil AI
Gateway, Management API, OAuth2, and webhook verification. Requires Node.js
20+. Version 0.1.x is a preview with a focused Management API surface.

## Installation

After version 0.2.0 is published:

```bash
npm install @owlvigil/sdk
```

Until then, install from a trusted source checkout with `npm install`.

## Quick start

Set `OWLVIGIL_GATEWAY_KEY` and pass a provider-facing model name:

```ts
import { OwlVigil } from "@owlvigil/sdk";

const client = new OwlVigil();
const response = await client.gateway.createChatCompletion({
  model: "deepseek-v4-flash",
  messages: [{ role: "user", content: "Hello" }],
});
console.log(response.data.choices[0]?.message?.content);
```

For streaming, consume the returned async generator. Breaking out of the loop
cancels and releases the response body.

```ts
for await (const event of client.gateway.createChatCompletionStream({
  model: "deepseek-v4-flash",
  messages: [{ role: "user", content: "Hello" }],
})) {
  console.log(event.data);
}
```

Set `OWLVIGIL_API_KEY` only for Management calls. List workspaces first, then
pass the returned numeric workspace ID to workspace-scoped methods. Request
options support timeout, cancellation, retry limits, idempotency keys, and safe
custom headers. Retries apply only to idempotent requests or calls with an
idempotency key.

## Supported preview surface

- Gateway models, Chat Completions, Responses, Embeddings, and Anthropic Messages
- SSE streaming for Chat Completions and Responses
- Workspace listing, usage summary, and request-log lookup
- OAuth2 authorization and token flows
- Webhook HMAC verification

## Development

```bash
npm ci
npm test
npm pack --dry-run
```

Live tests are opt-in and read-only. See the [API overview](docs/API.md), [CONTRIBUTING.md](CONTRIBUTING.md),
[SECURITY.md](SECURITY.md), [SUPPORT.md](SUPPORT.md), and
[CHANGELOG.md](CHANGELOG.md). Licensed under the [MIT License](LICENSE).
