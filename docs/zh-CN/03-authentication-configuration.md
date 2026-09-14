# 认证与客户端配置

## 选择正确的凭证

模型调用使用 `OWLVIGIL_GATEWAY_KEY`，Management 操作使用 `OWLVIGIL_API_KEY`。
两者都只应存放在服务端环境变量或密钥管理服务中，不得进入浏览器代码、日志或 Git。

凭证可以是字符串，也可以是每次发送请求时解析的函数：

```ts
const client = new OwlVigil({
  gatewayKey: () => secretManager.get("owlvigil/gateway-key"),
  apiKey: () => secretManager.get("owlvigil/management-key"),
});
```

## 环境

通过 `environment` 或 `OWLVIGIL_ENV` 选择环境：

| 环境 | Gateway | Management | OAuth2 |
| --- | --- | --- | --- |
| `production` | `https://gateway.owlvigil.com` | `https://api.owlvigil.com/v1` | `https://open.owlvigil.com` |
| `staging` | `https://staginggateway.owlvigil.com` | `https://stagingapi.owlvigil.com/v1` | `https://stagingapi.owlvigil.com` |
| `local` | `http://localhost:8080` | `http://localhost:8081/v1` | `http://localhost:8081` |

```ts
const client = new OwlVigil({ environment: "staging" });
```

反向代理、私有部署或测试服务器可显式设置 `gatewayBaseUrl`、`managementBaseUrl` 和
`oauthBaseUrl`。local 模式不会改写显式提供的非 OwlVigil 地址。

## 超时、重试与单次请求选项

默认超时为 60 秒，默认最多重试两次。可以全局或单次覆盖：

```ts
const client = new OwlVigil({ timeoutMs: 30_000, maxRetries: 1 });

await client.gateway.listModels({
  timeoutMs: 5_000,
  maxRetries: 0,
  signal: request.signal,
});
```

`RequestOptions` 还支持 `workspaceId`、`idempotencyKey` 和安全的自定义 Header。SDK
禁止覆盖 Authorization、Host、Content-Length、Content-Type、Idempotency-Key、
User-Agent 和 Accept。

自定义 `fetch` 只应用于兼容运行时、测试替身或受控 HTTP 集成。

## OAuth2 应用流程

OAuth2 使用 `client.oauth2`，不使用上述任一 SDK API Key：

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

客户端还支持 refresh-token、client-credentials、Token 撤销、user-info 和 PKCE 参数。
Client Secret、Authorization Code、Access Token、Refresh Token 与 CSRF state 必须保留在
受保护的服务端流程中。
