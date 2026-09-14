# 成员、权限与 Gateway Key

## 资源关系

Workspace 包含 Team、Member、Role、Invitation 和 Gateway Key。Management API Key
只能执行自身 scope 与调用者工作区权限共同允许的操作。

## 团队、成员与角色

```ts
const members = await client.management.listWorkspaceMembers(123, { limit: 50 });
const teams = await client.management.listWorkspaceTeams(123);
const roles = await client.management.listWorkspaceRoles(123);
```

创建方法接受生成的请求体类型：

```ts
await client.management.createWorkspaceMember(123, {
  // 使用 ManagementOperationBody["post_workspaces_workspace_id_members"] 要求的字段。
});
```

覆盖角色或权限前，先读取当前状态。邀请生命周期、团队成员关系和权限覆盖等没有快捷方法
的操作，应使用对应的生成方法。

## Gateway Key 生命周期

```ts
const keys = await client.management.listGatewayKeys({ workspace_id: 123 });
const created = await client.management.createGatewayKey({
  // 使用当前生成契约要求的字段。
});

await client.management.disableGatewayKey(keyId);
await client.management.enableGatewayKey(keyId);
const rotated = await client.management.rotateGatewayKey(keyId);
```

创建或轮换返回的 Secret 可能只显示一次。应立即写入密钥管理服务，不得打印，只分发给
目标工作负载。轮换时先创建或轮换，再更新消费者并验证流量，随后禁用旧 Key，最后删除。

## 安全检查

- 从最新查询结果解析 Workspace 和目标资源。
- 确认 Management Key 只有所需 scope。
- 保存 Request ID 作为审计和恢复依据。
- 每次修改后重新读取。
- 权限或 Key 修改超时后不要盲目重试。
