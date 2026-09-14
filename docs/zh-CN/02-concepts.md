# 核心概念

## SDK 的职责

SDK 是 HTTP 客户端，负责认证、请求构造、超时、安全重试、响应解析、SSE 帧拆分和错误
分类。它不会直接连接 OwlVigil 数据库、队列、Provider 系统或 Dashboard 代码。

## 客户端与凭证

```text
OwlVigil
├── gateway      模型调用与流式响应      OWLVIGIL_GATEWAY_KEY
├── management   工作区与管理 API        OWLVIGIL_API_KEY
└── oauth2       OAuth2 应用流程
```

两类 Key 是不同的授权边界。凭证本身有效但发给错误服务时，仍可能收到 `401` 或 `403`。

## 返回值与请求生命周期

普通 Gateway 和 Management 方法返回：

```ts
interface ApiResponse<T> {
  data: T;
  meta: { status: number; requestId: string; headers: Headers };
}
```

用 `timeoutMs` 设置时限，用 `signal` 把请求绑定到调用方生命周期。流式方法返回
`SseEvent` 异步生成器；退出 `for await` 循环时会释放 response reader。

## 工作区与分页

Workspace 是 Management 资源边界。使用 API 返回的 ID，不要从 UI URL 猜测。
`listWorkspaces()` 返回一页；`listWorkspacesAll()` 使用不透明 Cursor 遍历所有可访问工作区。

## 快捷方法与生成操作

`listProviders()` 等资源方法用于常见流程。144 个 Management 操作都有生成的 camelCase
方法，`openApi(operationId, request)` 提供统一的类型化入口。操作 ID、路径和字段以
`MANAGEMENT_OPERATIONS` 和生成类型为准。

## 重试与写操作安全

SDK 只为 `GET`、`HEAD`、`OPTIONS` 以及显式携带幂等键的请求处理受支持的暂时性失败。
幂等键不会自动让危险写操作变安全。写请求超时且结果不确定时，先查询当前状态。
