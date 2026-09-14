# 路由、可观测性与账单

## 模型、Provider、路由与策略

先执行只读查询：

```ts
const models = await client.management.listManagementModels({ workspace_id: 123 });
const providers = await client.management.listProviders({ workspace_id: 123 });
const routes = await client.management.getGatewayRoutes({
  query: { workspace_id: 123 },
});
```

Provider 请求体可能包含上游凭证，不得写入日志或错误消息。修改路由或策略前，先读取当前
资源；存在预览接口时先预览；执行一次修改后，同时验证持久化配置与真实路由请求。

## 用量、日志、Trace 与 Payload

```ts
const usage = await client.management.getUsageSummary(123);
const log = await client.management.getRequestLog(123, "req_...");
const traces = await client.management.getGatewayTraces({
  query: { workspace_id: 123, limit: 20 },
});
```

保存 Gateway 返回的 `requestId`，用于关联 Management 日志与 Trace。Payload 可能包含
Prompt、响应或个人信息，只在必要时读取，不要复制进普通应用日志。

## 财务治理与账单

从只读接口开始：账单概览、余额、套餐、订阅、发票、订单、充值记录、自动扣费和
Workspace 财务治理。金额应按 API 返回的币种和十进制值处理，不要自行猜测分单位或汇率。

Checkout、充值、支付方式、订阅、自动扣费、retry 和预算操作会产生外部财务影响。写入前
向操作人明确展示工作区、金额或套餐、币种和目标状态。请求超时且结果不确定时，先查询
订单或订阅状态。

准确的操作 ID 和方法签名见 `MANAGEMENT_OPERATIONS`、`management-methods.ts` 和
`management-types.ts`。
