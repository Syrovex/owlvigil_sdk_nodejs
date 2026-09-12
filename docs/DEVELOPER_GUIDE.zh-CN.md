# OwlVigil Node.js SDK 开发者文档

> 包名：`@owlvigil/sdk` · Node.js：20+ · ESM · 当前版本：`0.2.0`

本文以当前 TypeScript 导出类型、生成的 Management 契约和测试为准。

## 1. 安装与第一次调用

```bash
npm install @owlvigil/sdk
```

Gateway 和 Management 使用不同的凭证：

```bash
export OWLVIGIL_GATEWAY_KEY='your-gateway-key'
export OWLVIGIL_API_KEY='your-management-api-key'
```

```ts
import { OwlVigil } from "@owlvigil/sdk";

const client = new OwlVigil();
const models = await client.gateway.listModels();
console.log(models.data.data.map((model) => model.id));
```

Gateway Key 只用于模型调用，Management API Key 只用于工作区和管理操作，不能互换。

## 2. 客户端、环境与凭证

```text
OwlVigil
├── gateway      模型调用与 SSE
├── management   工作区与 144 个生成的 Management 操作
└── oauth2       OAuth2 接口
```

`environment` 和 `OWLVIGIL_ENV` 支持以下地址：

| 环境 | Gateway | Management | OAuth2 |
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

也可以显式配置 `gatewayBaseUrl`、`managementBaseUrl` 和 `oauthBaseUrl`，用于反向代理、
私有部署或测试服务器。字符串凭证、异步凭证提供函数和环境变量都受支持。凭证提供函数
会在请求发送时解析，适合密钥轮换。

## 3. Gateway 模型调用与流式响应

```ts
const response = await client.gateway.createChatCompletion({
  model: "your-model-id",
  messages: [{ role: "user", content: "Say hello from OwlVigil." }],
});
console.log(response.data.choices[0]?.message?.content);
console.log(response.meta.requestId);
```

生产代码应先使用 `listModels()`，需要单个模型元数据时使用 `getModel(model)`。支持：

- Chat Completions：`createChatCompletion`
- Responses：`createResponse`
- Embeddings：`createEmbeddings`
- Anthropic-compatible Messages：`createAnthropicMessage`
- SSE：`createChatCompletionStream`、`createResponseStream`

流式方法返回可取消的异步生成器。退出 `for await` 循环会释放 response body；不要让
多个消费者同时读取同一个生成器。

## 4. Management 与工作区

先列出工作区，再使用返回的数值 ID：

```ts
const workspaces = await client.management.listWorkspaces();
const workspaceId = workspaces.data.items[0]?.workspace_id
  ?? workspaces.data.items[0]?.id;

if (workspaceId !== undefined) {
  const usage = await client.management.getUsageSummary(workspaceId);
  console.log(usage.data.requests, usage.meta.requestId);
}
```

管理域包括：

| 领域 | 代表 API | 注意事项 |
| --- | --- | --- |
| 工作区 | `listWorkspaces`、`getWorkspace`、`updateWorkspace` | Workspace ID 是授权边界 |
| 团队、成员、角色 | `listWorkspaceTeams`、`listWorkspaceMembers` | 替换权限前先读取当前状态 |
| Gateway Key | 创建、轮换、启用、禁用、删除 | 返回的 Secret 立即写入密钥管理服务 |
| 模型、Provider、路由、策略 | `listManagementModels`、Provider/Route/Policy 操作 | 先预览并重新读取确认 |
| 用量、配额、日志、Trace | `getUsageSummary`、`getRequestLog` | Payload 可能包含敏感内容 |
| 财务与 Billing | 预算、订阅、充值、订单、自动扣费 | 支付和 retry 是外部财务副作用 |
| Webhook | Endpoint、事件、重试、重投 | 按事件 ID 去重 |
| 账户 | Profile、通知、密码、支持请求、邀请 | 不要记录个人数据和邀请链接 |

完整 144 个操作可通过 `openApi` 调用；每个操作也有生成的 camelCase 方法：

```ts
const members = await client.management.openApi(
  "get_workspaces_workspace_id_members",
  { path: { workspace_id: 123 }, query: { limit: 50 } },
);
```

路径参数会编码，`undefined` 查询参数会省略。Cursor 必须原样传回，不要自行发明操作 ID
或查询参数，应以 `MANAGEMENT_OPERATIONS` 和生成类型为准。

## 5. OAuth2

```ts
const authorizationUrl = client.oauth2.authorizationUrl({
  clientId: "your-client-id",
  redirectUri: "https://app.example.com/oauth/callback",
  scopes: ["openid", "profile"],
  state: "csrf-state",
});
console.log(authorizationUrl.toString());
```

支持 authorization-code、refresh-token、client-credentials、撤销和 user-info。client
secret、authorization code、access token、refresh token 和 `state` 只能放在受保护的服务端。

## 6. Webhook 验签

必须在 JSON 解析前读取原始请求字节：

```ts
import { verifyWebhook } from "@owlvigil/sdk";

const rawBody = new Uint8Array(await request.arrayBuffer());
verifyWebhook(rawBody, request.headers.get("owlvigil-signature") ?? "", webhookSecret);
```

签名格式为 `t=<unix-seconds>,v1=<hex-hmac>`，默认五分钟容差，算法为 HMAC-SHA256。验签
失败应先返回非成功 HTTP 状态；验签成功后再按事件 ID 持久化去重并触发业务处理。

Management 的 Endpoint 测试、retry 和 redelivery 会产生新的投递，只能针对具备幂等消费
能力的接收端执行。

## 7. 错误、重试与取消

| 状态 | 建议 |
| --- | --- |
| `400` / `422` | 修正请求，不要重试 |
| `401` | 检查 Key 类型、值、过期状态和目标域名 |
| `403` | 检查 scope、Workspace 访问和资源权限 |
| `404` | 检查资源 ID、路径和环境 |
| `409` | 先读取当前状态，再决定是否写入 |
| `429` | 遵循 `Retry-After` 和调用方退避策略 |
| `502` / `503` / `504` | 只有确认可安全重放时才重试 |

SDK 默认只对幂等方法或带幂等键的请求重试，并处理可重试传输错误、`408`、`429`、`502`、
`503`、`504`。用 `maxRetries: 0` 关闭 SDK 重试，用 `AbortSignal` 取消请求或流。

HTTP 错误是 `OwlVigilApiError`，OAuth 错误是 `OwlVigilOAuthError`，本地、协议、传输和
校验问题是 `OwlVigilError`。重要请求保存 `response.meta.requestId`、SDK 版本、方法/路径、
状态码和 UTC 时间，并脱敏所有凭证、Provider secret、Webhook secret、支付信息和敏感正文。

## 8. 生成、示例与验证

Management 操作和类型来自已提交的契约。契约变化后执行：

```bash
npm run generate:management-all
npm run check
```

本地验证：

```bash
npm ci
npm test
npm pack --dry-run
node --check examples/quickstart.mjs
node --check examples/management-openapi.mjs
```

示例需要真实凭证，不会在 CI 中作为 live test 执行。涉及写操作时，使用隔离 Workspace，
不要针对共享生产 Workspace 自动执行 smoke test。
