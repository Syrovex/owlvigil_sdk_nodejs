# 错误处理与故障排查

## 错误类型

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

- `OwlVigilApiError`：Gateway 或 Management 返回非成功状态。
- `OwlVigilOAuthError`：OAuth Endpoint 返回 OAuth 错误字段。
- `OwlVigilError`：本地校验、超时、传输、协议或 Webhook 验签错误。

## 状态码定位

| 现象 | 优先检查 |
| --- | --- |
| `400` / `422` | 请求字段和生成契约类型；不要用相同输入重试 |
| `401` | 凭证值、凭证类型、过期状态和目标域名 |
| `403` | API Key scope、Workspace 访问和资源权限 |
| `404` | 环境、操作路径和资源 ID |
| `409` | 重新读取资源，再决定是否重复写入 |
| `429` | `Retry-After`、请求量、配额和调用方退避 |
| `502` / `503` / `504` | 只有请求可安全重放时才重试 |

## 取消与重试

通过 `AbortSignal` 取消普通和流式请求。SDK 支持秒数与 HTTP-date 两种 `Retry-After`。
调用方负责重试时设置 `maxRetries: 0`。非幂等写操作只有显式携带幂等键时才会进入 SDK
重试逻辑，同时服务端契约也必须支持该操作的幂等键。

## 提交排障信息

记录 SDK 版本、UTC 时间、服务与环境、操作或方法、HTTP 状态和 Request ID。不得包含
Authorization Header、API Key、Provider Secret、Webhook Secret、支付信息或敏感正文。

文档与代码不一致时，以导出类型和生成契约为准，并在同一次修改中修正文档。
