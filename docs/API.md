# API overview

This single-page overview is retained for existing links. For the maintained
task-oriented guide, start with the [documentation](en-US/README.md).

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

## Core concepts and environment selection

`OwlVigil` owns three independently configured HTTP surfaces:

```text
OwlVigil
├── gateway      model calls and SSE
├── management   workspace and generated Management operations
└── oauth2       OAuth2 endpoints
```

Gateway and Management credentials are separate authorization boundaries. A
valid credential sent to the wrong service normally produces `401` or `403`;
do not fix that by swapping keys between clients.

`environment` and `OWLVIGIL_ENV` support the same routing convention as the Go
SDK:

| Environment | Gateway | Management | OAuth2 |
| --- | --- | --- | --- |
| `production` | `https://gateway.owlvigil.com` | `https://api.owlvigil.com/v1` | `https://open.owlvigil.com` |
| `staging` | `https://staginggateway.owlvigil.com` | `https://stagingapi.owlvigil.com/v1` | `https://stagingapi.owlvigil.com` |
| `local` | `http://localhost:8080` | `http://localhost:8081/v1` | `http://localhost:8081` |

```ts
const client = new OwlVigil({
  environment: "staging",
  gatewayKey: process.env.OWLVIGIL_GATEWAY_KEY,
});
```

Use explicit `gatewayBaseUrl`, `managementBaseUrl`, or `oauthBaseUrl` for a
private proxy or test server. An explicit non-OwlVigil URL is not silently
redirected to a localhost endpoint. Credential provider functions are useful
for secret rotation and are resolved when a request is sent.

## Management domain map and safe workflows

The generated Management catalog contains 144 operations. Use a generated
camelCase method or resource helper when one exists; use `openApi()` for the
complete typed catalog:

| Domain | Representative APIs | Safety boundary |
| --- | --- | --- |
| Workspaces | `listWorkspaces`, `getWorkspace`, `updateWorkspace` | Workspace IDs are authorization boundaries; verify access before writes/deletes |
| Teams, members, roles | `listWorkspaceTeams`, `listWorkspaceMembers`, role helpers | Read current permissions before replacing an override |
| Gateway keys | `listGatewayKeys`, `createGatewayKey`, rotate/enable/disable/delete | Treat returned secrets as one-time values and store them immediately |
| Models, providers, routes, policies | `listManagementModels`, `listProviders`, generated route/policy operations | Preview and verify routing changes before changing live traffic |
| Usage, quota, logs, traces | `getUsageSummary`, `getRequestLog`, generated usage/log operations | Payload access can expose sensitive request content |
| Financial governance | generated budget, limit, threshold, and spend operations | Inspect first; do not replay ambiguous payment or budget writes |
| Billing | plans, subscriptions, top-ups, invoices, orders, auto-charge | Treat checkout, payment, retry, and auto-charge as external financial effects |
| Webhooks | endpoint lifecycle, event history, test/retry/redelivery | Deduplicate event IDs; replay creates a new delivery |
| Account | profile, notifications, password, support, invitations | Keep personal data and invite links out of logs |

The generated entry point is type-checked against the operation ID and body
type:

```ts
const members = await client.management.openApi(
  "get_workspaces_workspace_id_members",
  {
    path: { workspace_id: 123 },
    query: { limit: 50 },
  },
);
console.log(members.data, members.meta.requestId);
```

Path values are URL-encoded and `undefined` query values are omitted. Treat
cursor values as opaque and send them back unchanged. Do not invent operation
IDs or query parameters; inspect `MANAGEMENT_OPERATIONS` and the generated
types. For writes, inspect the current state, preview when available, perform
one write, retain the request ID, and re-read the result. Do not automatically
retry invitations, permission updates, provider changes, key rotation,
billing, or webhook redelivery after an ambiguous timeout unless the contract
explicitly supports an idempotency key.

## Webhook receiving and outbound management

`verifyWebhook` must receive the exact raw request bytes before JSON parsing:

```ts
const rawBody = new Uint8Array(await request.arrayBuffer());
const timestamp = request.headers.get("owlvigil-timestamp") ?? "";
const signature = request.headers.get("owlvigil-signature") ?? "";
verifyWebhook(rawBody, `t=${timestamp},${signature}`, secret);
```

`OwlVigil-Timestamp` carries the Unix timestamp and `OwlVigil-Signature`
carries the versioned signature, such as `v1=<hex-hmac>`. The SDK combines
these as `t=<unix-seconds>,v1=<hex-hmac>` for verification. Verification uses
HMAC-SHA256, constant-time comparison, and a five-minute tolerance by default.
Reject missing, malformed, stale, or invalid signatures before business work;
then durably deduplicate the provider event ID before triggering side effects.

Management endpoint helpers cover create, read, update, delete, enable,
disable, secret rotation, and event history. Test/retry/redelivery calls create
new deliveries and must target a receiver that can process duplicates safely.

## Errors, retries, and cancellation

| Status/error | Action |
| --- | --- |
| `400` / `422` | Correct the request; do not retry blindly |
| `401` | Check credential type, value, expiry, and target host |
| `403` | Check scope, Workspace access, and resource permissions |
| `404` | Check the operation path and resource ID |
| `409` | Re-read current state before deciding whether to write again |
| `429` | Honor `Retry-After` and apply caller-level backoff |
| `502` / `503` / `504` | Retry only when replay is safe |

The SDK retries eligible idempotent methods and requests carrying an
idempotency key. It handles retryable transport failures, `408`, `429`, `502`,
`503`, and `504`, honoring numeric or HTTP-date `Retry-After` values. Set
`maxRetries: 0` when the surrounding application owns retries. Use an
`AbortSignal` to cancel a request or stream; breaking out of an SSE loop
releases the response reader.

Always retain `response.meta.requestId` with the SDK version, method/path,
status, and UTC timestamp. Never log Authorization headers, API keys, provider
credentials, webhook secrets, payment details, or sensitive bodies.

## API generation, examples, and validation

The operation and type files are generated from the checked-in Management
contract. When the contract changes, run:

```bash
npm run generate:management-all
npm run check
```

The repository examples are syntax-checked in CI and are not live tests:

```bash
node --check examples/quickstart.mjs
node --check examples/management-openapi.mjs
```

Run live examples only with the intended environment and real credentials.
Keep read-only checks separate from writes and never use a shared production
Workspace for smoke-test mutations.
