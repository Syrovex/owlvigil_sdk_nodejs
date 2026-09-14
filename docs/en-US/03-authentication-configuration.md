# Authentication and Client Configuration

## Select the correct credential

Use `OWLVIGIL_GATEWAY_KEY` for model calls and `OWLVIGIL_API_KEY` for
Management operations. Keep both in server-side environment variables or a
secret manager; never expose them in browser code, logs, or source control.

Credentials can be strings or functions resolved at request time:

```ts
const client = new OwlVigil({
  gatewayKey: () => secretManager.get("owlvigil/gateway-key"),
  apiKey: () => secretManager.get("owlvigil/management-key"),
});
```

## Environments

Set `environment` or `OWLVIGIL_ENV`:

| Environment | Gateway | Management | OAuth2 |
| --- | --- | --- | --- |
| `production` | `https://gateway.owlvigil.com` | `https://api.owlvigil.com/v1` | `https://open.owlvigil.com` |
| `staging` | `https://staginggateway.owlvigil.com` | `https://stagingapi.owlvigil.com/v1` | `https://stagingapi.owlvigil.com` |
| `local` | `http://localhost:8080` | `http://localhost:8081/v1` | `http://localhost:8081` |

```ts
const client = new OwlVigil({ environment: "staging" });
```

Explicit `gatewayBaseUrl`, `managementBaseUrl`, and `oauthBaseUrl` values are
supported for a reverse proxy, private deployment, or test server. An explicit
non-OwlVigil URL remains unchanged in local mode.

## Timeouts, retries, and request options

Defaults are a 60-second timeout and two retries. Override them globally or per
request:

```ts
const client = new OwlVigil({ timeoutMs: 30_000, maxRetries: 1 });

await client.gateway.listModels({
  timeoutMs: 5_000,
  maxRetries: 0,
  signal: request.signal,
});
```

`RequestOptions` also supports `workspaceId`, `idempotencyKey`, and safe custom
headers. The SDK rejects overrides for Authorization, Host, Content-Length,
Content-Type, Idempotency-Key, User-Agent, and Accept.

Pass a custom `fetch` implementation only for a compatible runtime, test
double, or controlled HTTP integration.

## OAuth2 application flows

OAuth2 uses `client.oauth2` and does not use either SDK API Key:

```ts
const authorizationUrl = client.oauth2.authorizationUrl({
  clientId: "your-client-id",
  redirectUri: "https://app.example.com/oauth/callback",
  scopes: ["openid", "profile"],
  state: "csrf-state",
});

const token = await client.oauth2.exchange({
  clientId: "your-client-id",
  clientSecret: "your-client-secret",
  code: "authorization-code",
  redirectUri: "https://app.example.com/oauth/callback",
});
```

The client also supports refresh-token and client-credentials grants, token
revocation, user-info, and PKCE parameters. Keep client secrets, authorization
codes, access tokens, refresh tokens, and CSRF state on protected server paths.
