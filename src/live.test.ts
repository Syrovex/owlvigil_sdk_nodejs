import assert from "node:assert/strict";
import test from "node:test";
import { OwlVigil } from "./index.js";

test("live read-only Gateway and Management flow", { skip: process.env.OWLVIGIL_LIVE_TEST !== "1" }, async () => {
  const client = new OwlVigil();
  const models = await client.gateway.listModels();
  assert.ok(models.data.data.length > 0);
  const workspaces = await client.management.listWorkspaces();
  assert.ok(workspaces.data.items.length > 0);
  const usage = await client.management.getUsageSummary(workspaces.data.items[0]!.id);
  assert.ok(usage.data.requests >= 0);
});
