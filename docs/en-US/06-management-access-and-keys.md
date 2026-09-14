# Members, Access Control, and Gateway Keys

## Resource relationships

Workspaces contain teams, members, roles, invitations, and Gateway Keys. A
Management API Key can call only the operations allowed by its scopes and the
caller's Workspace access.

## Teams, members, and roles

```ts
const members = await client.management.listWorkspaceMembers(123, { limit: 50 });
const teams = await client.management.listWorkspaceTeams(123);
const roles = await client.management.listWorkspaceRoles(123);
```

Creation helpers accept generated body types:

```ts
await client.management.createWorkspaceMember(123, {
  // Use fields required by ManagementOperationBody["post_workspaces_workspace_id_members"].
});
```

Read the current role and permission state before applying a replacement or
override. Use generated methods for invitation lifecycle, team membership, and
member permission operations not covered by a short resource helper.

## Gateway Key lifecycle

```ts
const keys = await client.management.listGatewayKeys({ workspace_id: 123 });
const created = await client.management.createGatewayKey({
  // Use the generated request body fields for the current contract.
});

await client.management.disableGatewayKey(keyId);
await client.management.enableGatewayKey(keyId);
const rotated = await client.management.rotateGatewayKey(keyId);
```

Create and rotation responses may contain a secret that cannot be retrieved
again. Store it immediately in a secret manager, never print it, and distribute
it only to the intended workload. Rotation should be staged: create or rotate,
update consumers, verify traffic, then disable the previous key before deletion.

## Safety checklist

- Resolve the Workspace and target resource from a fresh read.
- Confirm the Management key has only the required scopes.
- Retain request IDs for audit and recovery.
- Re-read after each mutation.
- Do not retry permission or key mutations blindly after a timeout.
