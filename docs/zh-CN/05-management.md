# Management 与工作区

## 从可访问工作区开始

```ts
const page = await client.management.listWorkspaces({ limit: 50 });
for (const workspace of page.data.items) {
  console.log(workspace.id, workspace.name);
}

for await (const workspace of client.management.listWorkspacesAll()) {
  console.log(workspace.id);
}
```

Cursor 是不透明值，应原样传回。`listWorkspacesAll()` 会检测重复 Cursor，避免无限循环。

## 选择调用入口

常见任务使用资源方法：

```ts
const workspace = await client.management.getWorkspace(123);
const usage = await client.management.getUsageSummary(123);
const requestLog = await client.management.getRequestLog(123, "req_...");
```

需要精确表达契约时使用生成的 camelCase 方法：

```ts
const routes = await client.management.getGatewayRoutes({
  query: { workspace_id: 123, limit: 20 },
});
```

按契约 ID 选择操作时使用 `openApi()`：

```ts
const members = await client.management.openApi(
  "get_workspaces_workspace_id_members",
  { path: { workspace_id: 123 }, query: { limit: 50 } },
);
```

路径参数会 URL 编码，数组会转换成重复查询参数，`null` 和 `undefined` 会被省略。
Management 的 `data` 信封会解包，HTTP 元数据保留在 `response.meta`。

## 安全修改流程

写操作应先读取当前状态，在契约支持时先预览，只执行一次写入，保存 Request ID，再重新
读取。邀请、权限、Provider、账单或 Webhook 重投超时后，不要自动重复执行。
