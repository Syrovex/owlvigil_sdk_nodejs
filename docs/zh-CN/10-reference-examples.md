# API 参考与示例索引

## 主要导出

| 导出 | 用途 |
| --- | --- |
| `OwlVigil`、`OwlVigilOptions`、`OwlVigilEnvironment` | 创建客户端与选择环境 |
| `GatewayClient` | Gateway 模型与流式方法 |
| `ManagementClient` | 资源方法、生成方法和通用 Management 请求 |
| `OAuth2Client` | OAuth2 流程 |
| `verifyWebhook` | 入站 Webhook 验签 |
| `ApiResponse`、`ResponseMeta`、`RequestOptions` | 共享请求/响应契约 |
| `OwlVigilError`、`OwlVigilApiError`、`OwlVigilOAuthError` | 错误体系 |
| `MANAGEMENT_OPERATIONS` 与生成类型 | 完整 Management 契约 |

## Gateway 方法

- `listModels`、`getModel`
- `createChatCompletion`、`createChatCompletionStream`
- `createResponse`、`createResponseStream`
- `createEmbeddings`
- `createAnthropicMessage`

## Management 方法

Provider、模型、Gateway Key、Workspace 成员、角色、团队、Webhook Endpoint、订阅、用量和
请求日志等常见任务使用资源方法。完整 144 个操作使用生成的 camelCase 方法。
`openApi()` 是类型化 Operation ID 入口，`request()` 是更底层的 Method/Path 入口。

准确字段见以下生成文件：

- `src/management-operations.ts`
- `src/management-methods.ts`
- `src/management-types.ts`

## OAuth2 方法

- `authorizationUrl`
- `exchange`
- `refresh`
- `clientCredentials`
- `revoke`
- `userInfo`

## 仓库示例

```bash
OWLVIGIL_GATEWAY_KEY='...' node examples/quickstart.mjs
OWLVIGIL_API_KEY='...' node examples/management-openapi.mjs
```

示例需要真实凭证；普通测试只检查语法，不会在 CI 中调用在线服务。

## 验证源码仓库

```bash
npm ci
npm run check
```

`npm run check` 会构建并测试 SDK、验证生成的 Management 操作与 Schema、检查示例语法，
并检查 npm 包内容。
