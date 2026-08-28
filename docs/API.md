# API overview

`new OwlVigil()` exposes `gateway`, `management`, and `oauth2`. Credentials may
be strings or refreshable credential-provider functions.

## Gateway

- `listModels`
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

Use the numeric ID returned by `listWorkspaces`. Management responses unwrap
the OwlVigil `data` envelope while preserving status, headers, and request ID.

`RequestOptions` supports timeout, `AbortSignal`, retry limit, idempotency key,
workspace ID, and non-reserved headers. HTTP failures throw
`OwlVigilApiError`; local, protocol, and validation failures throw
`OwlVigilError`.

`OAuth2Client` supports authorization-code, refresh-token, and client-credential
flows. `verifyWebhook` verifies the original payload bytes and timestamp before
business processing.
