# OwlVigil Node.js SDK Documentation

These guides explain how to integrate `@owlvigil/sdk`. The exported TypeScript
types and generated Management contract in the current repository are the final
source of truth.

## Recommended path

New users should read chapters 1 through 4 in order, then open the chapter for
the task they need.

1. [Quickstart](01-quickstart.md): install the package and make the first Gateway request.
2. [Core Concepts](02-concepts.md): understand clients, credentials, workspaces, request lifetime, and responses.
3. [Authentication and Client Configuration](03-authentication-configuration.md): configure keys, environments, timeouts, retries, and custom endpoints.
4. [Model Calls and Streaming](04-gateway.md): discover models and use regular or streaming Gateway APIs.
5. [Management and Workspaces](05-management.md): use workspaces, pagination, helpers, and the generated catalog.
6. [Members, Access Control, and Gateway Keys](06-management-access-and-keys.md): manage people, permissions, and model-call credentials.
7. [Routing, Observability, and Billing](07-management-operations.md): manage providers and routing, inspect usage, and handle financial workflows.
8. [Webhooks](08-webhooks.md): verify inbound events and manage delivery endpoints.
9. [Errors and Troubleshooting](09-errors-troubleshooting.md): classify failures and recover safely.
10. [API Reference and Examples](10-reference-examples.md): find exported capabilities and runnable examples.

## Public surfaces

| Surface | Purpose |
| --- | --- |
| `OwlVigil` | Shared configuration and access to all clients |
| `client.gateway` | Models, Chat Completions, Responses, Embeddings, Anthropic-compatible Messages, and SSE |
| `client.management` | Workspaces, access control, Gateway Keys, routing, observability, billing, and the 144-operation catalog |
| `client.oauth2` | Authorization-code, refresh-token, client-credentials, revocation, and user-info flows |
| `verifyWebhook` | HMAC-SHA256 verification of inbound Webhook payloads |

## Requirements

- Node.js 20 or later.
- ESM import syntax.
- Pin the package version and review `CHANGELOG.md` before upgrading.
