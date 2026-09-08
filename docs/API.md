# API overview

`new OwlVigil()` exposes `gateway`, `management`, and `oauth2`. Credentials may
be strings or refreshable credential-provider functions.

## Gateway

- `listModels` and `getModel`
- `createChatCompletion` and `createChatCompletionStream`
- `createResponse` and `createResponseStream`
- `createEmbeddings`
- `createAnthropicMessage`

Streaming methods return cancellable async generators of parsed SSE events.
Unknown provider fields can be supplied through the extensible request types.

## Management

- `listWorkspaces`
- `getUsageSummary`
- `getRequestLog`
- `openApi`
- Generated camelCase methods for all 144 OpenAPI operations
- Resource-oriented aliases for common workspace, provider, key, webhook,
  billing, and subscription operations

Use the numeric ID returned by `listWorkspaces`. Management responses unwrap
the OwlVigil `data` envelope while preserving status, headers, and request ID.

`MANAGEMENT_OPERATIONS` contains the 144 published OpenAPI Management
operation IDs. `management.openApi(operationId, request)` executes any of them
with `request.path`, `request.query`, `request.body`, and per-request options.
The operation catalog is generated from the OwlVigil OpenAPI contract with
`npm run generate:management`.

`RequestOptions` supports timeout, `AbortSignal`, retry limit, idempotency key,
workspace ID, and non-reserved headers. HTTP failures throw
`OwlVigilApiError`; local, protocol, and validation failures throw
`OwlVigilError`. OAuth endpoint failures throw `OwlVigilOAuthError` with the
OAuth error code, description, and URI when returned by the server.

`OwlVigil` accepts `environment: "production" | "staging" | "local"` and also
reads `OWLVIGIL_ENV`. Explicit service base URLs take precedence for custom
proxies and test servers.

`OAuth2Client` supports authorization-code, refresh-token, client-credential,
revocation, and user-info flows. `verifyWebhook` verifies the original payload
bytes and timestamp before business processing.
