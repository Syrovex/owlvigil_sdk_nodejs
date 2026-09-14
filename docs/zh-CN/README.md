# OwlVigil Node.js SDK 中文文档

这套文档介绍如何接入 `@owlvigil/sdk`。字段、方法签名和返回类型以当前仓库导出的
TypeScript 类型与生成的 Management 契约为最终依据。

## 推荐阅读路径

第一次接入时建议依次阅读第 1～4 章；完成基础接入后，可以直接进入对应任务章节。

1. [快速开始](01-quickstart.md)：安装包并完成第一次 Gateway 请求。
2. [核心概念](02-concepts.md)：理解客户端、凭证、工作区、请求生命周期和返回值。
3. [认证与客户端配置](03-authentication-configuration.md)：配置 Key、环境、超时、重试和自定义地址。
4. [模型调用与流式响应](04-gateway.md)：发现模型并使用普通或流式 Gateway API。
5. [Management 与工作区](05-management.md)：使用工作区、分页、快捷方法和生成契约。
6. [成员、权限与 Gateway Key](06-management-access-and-keys.md)：管理人员、权限和模型调用凭证。
7. [路由、可观测性与账单](07-management-operations.md)：管理 Provider 与路由，查询用量并处理财务流程。
8. [Webhook](08-webhooks.md)：验证入站事件并管理投递端点。
9. [错误处理与故障排查](09-errors-troubleshooting.md)：识别失败并安全恢复。
10. [API 参考与示例](10-reference-examples.md)：查找公开能力和可运行示例。

## 公开能力

| 入口 | 用途 |
| --- | --- |
| `OwlVigil` | 共享配置和所有客户端入口 |
| `client.gateway` | 模型、Chat Completions、Responses、Embeddings、Anthropic 兼容 Messages 和 SSE |
| `client.management` | 工作区、权限、Gateway Key、路由、可观测性、账单和 144 个生成操作 |
| `client.oauth2` | authorization-code、refresh-token、client-credentials、撤销和 user-info |
| `verifyWebhook` | 入站 Webhook 的 HMAC-SHA256 验签 |

## 版本要求

- Node.js 20 或更高版本。
- 使用 ESM import 语法。
- 固定依赖版本，升级前阅读 `CHANGELOG.md`。
