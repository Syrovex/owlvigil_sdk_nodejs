# Errors and Troubleshooting

## Error classes

```ts
try {
  await client.gateway.listModels();
} catch (error) {
  if (error instanceof OwlVigilApiError) {
    console.error(error.status, error.code, error.requestId);
  } else if (error instanceof OwlVigilOAuthError) {
    console.error(error.status, error.errorCode);
  } else if (error instanceof OwlVigilError) {
    console.error(error.message);
  }
}
```

- `OwlVigilApiError`: non-success Gateway or Management response.
- `OwlVigilOAuthError`: OAuth endpoint response with OAuth error fields.
- `OwlVigilError`: local validation, timeout, transport, protocol, or Webhook verification failure.

## Status guide

| Symptom | Check first |
| --- | --- |
| `400` / `422` | Request fields and generated contract types; do not retry unchanged input |
| `401` | Credential value, credential type, expiry, and target host |
| `403` | API-key scopes, Workspace access, and resource permissions |
| `404` | Environment, operation path, and resource ID |
| `409` | Fresh resource state before deciding whether to write again |
| `429` | `Retry-After`, call volume, quota, and caller-level backoff |
| `502` / `503` / `504` | Retry only if the request is safe to replay |

## Cancellation and retries

Use an `AbortSignal` to cancel normal and streaming requests. The SDK honors
numeric and HTTP-date `Retry-After` values. Set `maxRetries: 0` when the caller
owns retry policy. A non-idempotent write is retried only when an idempotency
key is supplied; the server contract must also support that key for the
operation.

## Evidence for support

Record the SDK version, UTC timestamp, service and environment, operation or
method, HTTP status, and request ID. Do not include Authorization headers, API
keys, provider secrets, Webhook secrets, payment details, or sensitive bodies.

If documentation and code disagree, follow the exported types and generated
catalog, then update the documentation in the same change.
