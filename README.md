# OwlVigil Node.js SDK

[![CI](https://github.com/Syrovex/owlvigil_sdk_nodejs/actions/workflows/ci.yml/badge.svg)](https://github.com/Syrovex/owlvigil_sdk_nodejs/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/@owlvigil/sdk)](https://www.npmjs.com/package/@owlvigil/sdk)
[![License: MIT](https://img.shields.io/github/license/Syrovex/owlvigil_sdk_nodejs)](LICENSE)

Node.js 20+ SDK for the OwlVigil Gateway, Management API, OAuth2 flows, and
webhook signature verification. The SDK is written in TypeScript, published as
an ESM package, and has no runtime dependencies.

Gateway model calls use `https://gateway.owlvigil.com` with a Gateway Key.
Management calls use `https://api.owlvigil.com/v1` with a scoped Management API
Key. These credentials are separate and are not interchangeable.

## Install

```bash
npm install @owlvigil/sdk
```

The package requires Node.js 20 or later and uses the built-in Fetch API.

## Run a Gateway request

Set the Gateway Key in the server environment:

```bash
export OWLVIGIL_GATEWAY_KEY='your-gateway-key'
```

Create one client and reuse it across requests:

```ts
import { OwlVigil } from "@owlvigil/sdk";

const client = new OwlVigil();
const models = await client.gateway.listModels();
console.log(models.data.data.map((model) => model.id));

const response = await client.gateway.createChatCompletion({
  model: "your-model-id",
  messages: [{ role: "user", content: "Say hello from OwlVigil." }],
});

console.log(response.data.choices[0]?.message?.content);
console.log(`request_id=${response.meta.requestId}`);
```

Use `listModels()` first to discover models available to the current Workspace
and Gateway Key. Use `getModel("your-model-id")` when the model metadata for a
single model is needed. Model names are provider-facing names, not internal
model IDs.

## Run a Management request

Set a separate Management API Key:

```bash
export OWLVIGIL_API_KEY='your-management-api-key'
```

List Workspaces before calling workspace-scoped methods:

```ts
const workspaces = await client.management.listWorkspaces();

for (const workspace of workspaces.data.items) {
  console.log(`${workspace.id} ${workspace.name}`);
}

const workspaceId = workspaces.data.items[0]?.workspace_id
  ?? workspaces.data.items[0]?.id;

if (workspaceId !== undefined) {
  const usage = await client.management.getUsageSummary(workspaceId);
  console.log(`requests=${usage.data.requests}`);
}
```

Do not use the Management API Key as a Gateway Key. Management responses
unwrap the OwlVigil `data` envelope while preserving HTTP status, headers, and
request ID in `response.meta`.

The SDK also exposes the complete 144-operation OpenAPI Management catalog
through `client.management.openApi(operationId, request)`. The request accepts
path parameters, query parameters, a request body, and the same per-request
options as the convenience methods:

```ts
const providers = await client.management.openApi("get_gateway_providers", {
  query: { workspace_id: 7, limit: 20 },
});
```

The catalog is generated from the OwlVigil OpenAPI contract. In a checkout that
also contains the OpenAPI repository, regenerate it with
`npm run generate:management`.

The generated Management schema types are exported from the package as well.
Regenerate them with `npm run generate:management-types` when the OpenAPI
contract changes.

## Streaming

Chat Completions and Responses provide cancellable async generators of parsed
SSE events:

```ts
for await (const event of client.gateway.createChatCompletionStream({
  model: "your-model-id",
  messages: [{ role: "user", content: "Stream a short greeting." }],
})) {
  process.stdout.write(event.data);
}
```

Breaking out of the loop cancels the reader and releases the response body.

## OAuth2

The client exposes authorization-code, refresh-token, and client-credentials
flows. `oauthBaseUrl` defaults to `https://open.owlvigil.com` and may include a
path prefix when using a reverse proxy.

```ts
const authorizationUrl = client.oauth2.authorizationUrl({
  clientId: "your-client-id",
  redirectUri: "https://your-app.example.com/oauth/callback",
  scopes: ["openid", "profile"],
  state: "csrf-state",
});

console.log(authorizationUrl.toString());

const token = await client.oauth2.clientCredentials({
  clientId: "your-client-id",
  clientSecret: "your-client-secret",
});
console.log(token.access_token);

const user = await client.oauth2.userInfo(token.access_token ?? "");
await client.oauth2.revoke(token.access_token ?? "");
```

Keep OAuth client secrets on the server. Do not expose them in browser code or
commit them to source control.

## Webhook verification

Verify the original request body bytes before parsing or processing the event:

```ts
import { verifyWebhook } from "@owlvigil/sdk";

verifyWebhook(rawBodyBytes, request.headers.get("owlvigil-signature") ?? "", webhookSecret);
```

The signature header must contain the timestamp and HMAC signature, for example
`t=1700000000,v1=...`. The default timestamp tolerance is five minutes.

## Configuration

```ts
const client = new OwlVigil({
  gatewayKey: () => secretManager.get("owlvigil/gateway-key"),
  apiKey: () => secretManager.get("owlvigil/api-key"),
  gatewayBaseUrl: "https://gateway.example.com",
  managementBaseUrl: "https://api.example.com/v1",
  oauthBaseUrl: "https://auth.example.com/owlvigil",
  timeoutMs: 30_000,
  maxRetries: 1,
});
```

The defaults are the production endpoints, a 60-second timeout, two retries,
and an `owlvigil-node/<SDK version>` User-Agent. String credentials, credential
provider functions, and the `OWLVIGIL_GATEWAY_KEY` / `OWLVIGIL_API_KEY`
environment variables are supported.

Per-request `RequestOptions` support timeout, `AbortSignal`, retry limits,
idempotency keys, Workspace IDs, and safe custom headers. Retries apply only to
idempotent requests or requests with an idempotency key.

Use custom base URLs for staging, local tests, or private deployments. Do not
let ordinary end users control these URLs.

## Supported surface

- Gateway models, Chat Completions, Responses, Embeddings, and Anthropic Messages
- Gateway model lookup with `listModels` and `getModel`
- SSE streaming for Chat Completions and Responses
- Workspace listing, usage summary, and request-log lookup
- OAuth2 authorization-code, refresh-token, client-credentials, revocation, and user-info flows
- Webhook HMAC verification
- Typed error handling through `OwlVigilError` and `OwlVigilApiError`

See the [API overview](docs/API.md) for the public method list and response
behavior.

## Errors

HTTP errors throw `OwlVigilApiError`, which includes the HTTP status, request ID,
and error code when available. OAuth errors throw `OwlVigilOAuthError`, which
includes the OAuth error code, description, and URI. Transport, protocol,
validation, and local SDK failures throw `OwlVigilError`. All of these errors
share the `OwlVigilError` base class.

## Development and verification

```bash
npm ci
npm test
npm pack --dry-run
```

`npm test` compiles the TypeScript source and runs the Node.js test suite. Live
Gateway and Management tests are opt-in and read-only:

```bash
OWLVIGIL_LIVE_TEST=1 \
OWLVIGIL_GATEWAY_KEY='replace-with-gateway-key' \
OWLVIGIL_API_KEY='replace-with-management-key' \
npm test
```

The SDK is HTTP-only. It does not import OwlVigil Dashboard or backend code and
does not connect directly to databases, queues, or provider infrastructure.

## Community and security

- Read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request.
- Report vulnerabilities using [SECURITY.md](SECURITY.md).
- See [SUPPORT.md](SUPPORT.md) for usage questions and bug reports.
- Releases and compatibility changes are documented in [CHANGELOG.md](CHANGELOG.md).

Licensed under the [MIT License](LICENSE).
