# Management and Workspaces

## Start with accessible Workspaces

```ts
const page = await client.management.listWorkspaces({ limit: 50 });
for (const workspace of page.data.items) {
  console.log(workspace.id, workspace.name);
}

for await (const workspace of client.management.listWorkspacesAll()) {
  console.log(workspace.id);
}
```

Treat cursors as opaque. `listWorkspacesAll()` detects a repeated cursor instead
of looping forever.

## Choose the right entry point

Use a resource helper for common tasks:

```ts
const workspace = await client.management.getWorkspace(123);
const usage = await client.management.getUsageSummary(123);
const requestLog = await client.management.getRequestLog(123, "req_...");
```

Use a generated camelCase method when it expresses the exact contract:

```ts
const routes = await client.management.getGatewayRoutes({
  query: { workspace_id: 123, limit: 20 },
});
```

Use `openApi()` when code selects an operation by its contract ID:

```ts
const members = await client.management.openApi(
  "get_workspaces_workspace_id_members",
  { path: { workspace_id: 123 }, query: { limit: 50 } },
);
```

Path parameters are URL-encoded, arrays become repeated query parameters, and
`null` or `undefined` query values are omitted. Management response envelopes
are unwrapped into `response.data`; HTTP metadata remains in `response.meta`.

## Safe workflow for changes

For a Management write: read current state, preview when the API supports it,
perform one write, retain the request ID, and read the resource again. Do not
automatically replay invitations, permissions, provider changes, billing
operations, or redelivery after an ambiguous timeout.
