# Core Concepts

## SDK responsibilities

The SDK is an HTTP client. It handles authentication, request construction,
timeouts, safe retries, response decoding, SSE framing, and typed errors. It
does not connect directly to OwlVigil databases, queues, provider systems, or
Dashboard code.

## Clients and credentials

```text
OwlVigil
├── gateway      model calls and streams       OWLVIGIL_GATEWAY_KEY
├── management   workspace and admin APIs      OWLVIGIL_API_KEY
└── oauth2       OAuth2 application flows
```

The two keys are separate authorization boundaries. A key may be valid but
still receive `401` or `403` when sent to the wrong service.

## Responses and request lifetime

Regular Gateway and Management methods return:

```ts
interface ApiResponse<T> {
  data: T;
  meta: { status: number; requestId: string; headers: Headers };
}
```

Use `timeoutMs` for an upper bound and `signal` to connect a request to the
caller's lifecycle. Streaming methods return an async generator of `SseEvent`;
leaving a `for await` loop releases the response reader.

## Workspaces and pagination

Management resources are scoped by Workspace. Use IDs returned by the API,
not names copied from UI URLs. `listWorkspaces()` returns one page;
`listWorkspacesAll()` follows opaque cursors and yields every accessible
Workspace.

## Convenience helpers and generated operations

Resource helpers such as `listProviders()` cover common workflows. Every one
of the 144 published Management operations also has a generated camelCase
method, and `openApi(operationId, request)` provides a single typed entry point.
Use `MANAGEMENT_OPERATIONS` and generated types instead of inventing paths or
operation IDs.

## Retries and write safety

The SDK retries `GET`, `HEAD`, and `OPTIONS`, plus requests with an explicit
idempotency key, for supported transient failures. It does not make an unsafe
write replayable. After an ambiguous write timeout, read current state before
deciding whether to send the write again.
