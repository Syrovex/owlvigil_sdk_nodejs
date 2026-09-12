# OwlVigil Node.js SDK Documentation

These guides describe the current TypeScript/ESM package. The exported source
types, generated Management contract, and tests are the final authority for
method names and request fields.

## Recommended path

1. Start with the [repository README](https://github.com/Syrovex/owlvigil_sdk_nodejs#readme)
   for installation and the first Gateway/Management request.
2. Read the [API overview](API.md) for the public clients, generated Management
   operations, OAuth2, Webhooks, retries, and errors.
3. Read the [中文开发者文档](DEVELOPER_GUIDE.zh-CN.md) for the same integration
   workflow in Chinese.
4. Read [Releasing](RELEASING.md) before building or publishing a version.

## Public surface

| Surface | API | Responsibility |
| --- | --- | --- |
| Shared client | `OwlVigil`, `RequestOptions`, `ApiResponse` | lifecycle, credentials, timeouts, retries, response metadata |
| Gateway | `client.gateway` | models, Chat Completions, Responses, Embeddings, Anthropic-compatible Messages, SSE |
| Management | `client.management` | workspaces plus the generated 144-operation OpenAPI catalog |
| OAuth2 | `client.oauth2` | authorization-code, refresh-token, client-credentials, revocation, user-info |
| Webhook | `verifyWebhook` | raw-body HMAC-SHA256 verification |

## Contract and source references

- [TypeScript source](https://github.com/Syrovex/owlvigil_sdk_nodejs/tree/main/src)
- [Generated operation catalog](https://github.com/Syrovex/owlvigil_sdk_nodejs/blob/main/src/management-operations.ts)
- [Generated Management types](https://github.com/Syrovex/owlvigil_sdk_nodejs/blob/main/src/management-types.ts)
- [OwlVigil Developer Center](https://github.com/Syrovex/owlvigil_openapi/blob/main/docs/owlvigil-developer-center.md)

When a guide and a generated contract disagree, follow the generated contract
and update the guide in the same change.
