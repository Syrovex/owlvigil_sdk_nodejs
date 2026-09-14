# API Reference and Example Index

## Main exports

| Export | Purpose |
| --- | --- |
| `OwlVigil`, `OwlVigilOptions`, `OwlVigilEnvironment` | Client construction and environment selection |
| `GatewayClient` | Gateway model and streaming methods |
| `ManagementClient` | Resource helpers, generated methods, and generic Management requests |
| `OAuth2Client` | OAuth2 flows |
| `verifyWebhook` | Inbound Webhook signature verification |
| `ApiResponse`, `ResponseMeta`, `RequestOptions` | Shared request/response contract |
| `OwlVigilError`, `OwlVigilApiError`, `OwlVigilOAuthError` | Error hierarchy |
| `MANAGEMENT_OPERATIONS`, generated Management types | Complete Management catalog |

## Gateway methods

- `listModels`, `getModel`
- `createChatCompletion`, `createChatCompletionStream`
- `createResponse`, `createResponseStream`
- `createEmbeddings`
- `createAnthropicMessage`

## Management methods

Use resource helpers for common providers, models, Gateway Keys, Workspace
members, roles, teams, Webhook endpoints, subscription, usage, and request-log
tasks. Use the generated camelCase methods for the complete 144-operation
surface. `openApi()` is the typed operation-ID entry point; `request()` is the
lower-level method/path entry point.

Inspect these generated exports for exact fields:

- `src/management-operations.ts`
- `src/management-methods.ts`
- `src/management-types.ts`

## OAuth2 methods

- `authorizationUrl`
- `exchange`
- `refresh`
- `clientCredentials`
- `revoke`
- `userInfo`

## Runnable repository examples

```bash
OWLVIGIL_GATEWAY_KEY='...' node examples/quickstart.mjs
OWLVIGIL_API_KEY='...' node examples/management-openapi.mjs
```

Examples require real credentials and are syntax-checked, not executed against
live services, by the normal test suite.

## Validate a checkout

```bash
npm ci
npm run check
```

`npm run check` builds and tests the SDK, validates the generated Management
catalog and schemas, checks example syntax, and inspects the npm package.
