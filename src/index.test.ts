import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import test from "node:test";
import { readFileSync } from "node:fs";
import { MANAGEMENT_OPERATIONS, OwlVigil, OwlVigilApiError, OwlVigilError, VERSION, verifyWebhook } from "./index.js";

test("public version matches package version", () => {
  const packageJson = JSON.parse(readFileSync("package.json", "utf8")) as { version: string };
  assert.equal(VERSION, packageJson.version);
});

test("lists models with gateway authentication", async () => {
  const requests: Request[] = [];
  const client = new OwlVigil({
    gatewayKey: "test_gateway_key",
    gatewayBaseUrl: "https://gateway.example.test",
    fetch: async (input, init) => {
      const request = new Request(input, init);
      requests.push(request);
      return new Response(JSON.stringify({ object: "list", data: [{ id: "deepseek-v4-flash" }] }), {
        status: 200,
        headers: { "content-type": "application/json", "x-request-id": "req_models" },
      });
    },
  });

  const response = await client.gateway.listModels();
  assert.equal(response.data.data[0]?.id, "deepseek-v4-flash");
  assert.equal(response.meta.requestId, "req_models");
  assert.equal(requests[0]?.headers.get("authorization"), "Bearer test_gateway_key");
});

test("gets a typed Gateway model", async () => {
  const client = new OwlVigil({
    gatewayKey: "test_gateway_key",
    fetch: async (input) => {
      assert.equal(new URL(input instanceof Request ? input.url : input).pathname, "/v1/models/gpt-4o-mini");
      return new Response(JSON.stringify({ id: "gpt-4o-mini", object: "model", owned_by: "openai" }), { status: 200 });
    },
  });
  const response = await client.gateway.getModel("gpt-4o-mini");
  assert.equal(response.data.owned_by, "openai");
});

test("verifies webhook signature", () => {
  const payload = Buffer.from('{"type":"test"}');
  const timestamp = 1_700_000_000;
  const signature = createHmac("sha256", "whsec_test")
    .update(String(timestamp))
    .update(".")
    .update(payload)
    .digest("hex");

  assert.doesNotThrow(() => verifyWebhook(payload, `t=${timestamp},v1=${signature}`, "whsec_test", {
    now: new Date(timestamp * 1000),
  }));
});

test("preserves management error request id from envelope", async () => {
  const client = new OwlVigil({
    apiKey: "test_api_key",
    managementBaseUrl: "https://api.example.test/v1",
    fetch: async () => new Response(JSON.stringify({ code: "denied", message: "no access", request_id: "req_body" }), { status: 403 }),
  });
  await assert.rejects(client.management.listWorkspaces(), (error: unknown) => {
    assert.ok(error instanceof OwlVigilApiError);
    assert.equal(error.requestId, "req_body");
    return true;
  });
});

test("iterates paginated Management workspaces", async () => {
  const urls: string[] = [];
  const client = new OwlVigil({
    apiKey: "test_api_key",
    managementBaseUrl: "https://api.example.test/v1",
    fetch: async (input) => {
      const url = new URL(input instanceof Request ? input.url : input);
      urls.push(url.toString());
      const cursor = url.searchParams.get("cursor");
      return new Response(JSON.stringify({
        items: cursor ? [{ id: 2, name: "Second" }] : [{ id: 1, name: "First" }],
        page_info: cursor ? { has_more: false } : { has_more: true, next_cursor: "page-2" },
      }), { status: 200 });
    },
  });
  const workspaces = [];
  for await (const workspace of client.management.listWorkspacesAll({ pageSize: 1 })) workspaces.push(workspace);
  assert.deepEqual(workspaces.map((workspace) => workspace.id), [1, 2]);
  assert.match(urls[0] ?? "", /limit=1/);
  assert.match(urls[1] ?? "", /cursor=page-2/);
});

test("normalizes a bare Management workspace array", async () => {
  const client = new OwlVigil({
    apiKey: "test_api_key",
    fetch: async () => new Response(JSON.stringify([{ id: 1, name: "Workspace" }]), { status: 200 }),
  });
  const response = await client.management.listWorkspaces();
  assert.deepEqual(response.data.items, [{ id: 1, name: "Workspace" }]);
  assert.deepEqual(response.data.page_info, {});
});

test("executes operations from the OpenAPI Management catalog", async () => {
  assert.equal(Object.keys(MANAGEMENT_OPERATIONS).length, 144);
  let request: Request | undefined;
  const client = new OwlVigil({
    apiKey: "test_api_key",
    managementBaseUrl: "https://api.example.test/v1",
    fetch: async (input, init) => {
      request = new Request(input, init);
      return new Response(JSON.stringify({ request_id: "req_provider", code: "ok", message: "", data: { id: 9 } }), { status: 201 });
    },
  });
  const response = await client.management.openApi("post_gateway_providers", {
    query: { workspace_id: 7 },
    body: { name: "Primary", api_key: "upstream-key", type: "openai", workspace_id: 7 },
  });
  assert.equal(response.data.id, 9);
  assert.equal(request?.method, "POST");
  assert.equal(request?.url, "https://api.example.test/v1/gateway/providers?workspace_id=7");
  assert.deepEqual(await request?.json(), { name: "Primary", api_key: "upstream-key", type: "openai", workspace_id: 7 });
});

test("rejects attempts to override authentication header", async () => {
  const client = new OwlVigil({ gatewayKey: "test_gateway_key", fetch: async () => new Response("{}") });
  await assert.rejects(
    client.gateway.listModels({ headers: { AuThOrIzAtIoN: "Bearer wrong" } }),
    (error: unknown) => error instanceof OwlVigilError && /managed by the SDK/.test(error.message),
  );
});

test("normalizes exhausted transport failures", async () => {
  const client = new OwlVigil({
    gatewayKey: "test_gateway_key",
    maxRetries: 0,
    fetch: async () => { throw new Error("DNS unavailable"); },
  });
  await assert.rejects(client.gateway.listModels(), (error: unknown) => {
    assert.ok(error instanceof OwlVigilError);
    assert.match(error.message, /transport request failed: DNS unavailable/);
    return true;
  });
});

test("preserves custom OAuth base paths", async () => {
  const urls: string[] = [];
  const client = new OwlVigil({
    oauthBaseUrl: "https://proxy.example.test/owlvigil",
    fetch: async (input) => {
      urls.push(new URL(input instanceof Request ? input.url : input).toString());
      return new Response(JSON.stringify({ access_token: "token" }), { status: 200 });
    },
  });

  assert.equal(client.oauth2.authorizationUrl({ clientId: "client", redirectUri: "https://app.example.test/callback" }).pathname, "/owlvigil/oauth/authorize");
  await client.oauth2.clientCredentials({ clientId: "client", clientSecret: "secret" });
  assert.equal(urls[0], "https://proxy.example.test/owlvigil/oauth/token");
});

test("supports OAuth revocation and user info", async () => {
  const requests: Request[] = [];
  const client = new OwlVigil({
    oauthBaseUrl: "https://oauth.example.test",
    fetch: async (input, init) => {
      const request = new Request(input, init);
      requests.push(request);
      if (request.url.endsWith("/oauth/userinfo")) {
        return new Response(JSON.stringify({ sub: "user-1", email: "user@example.test" }), { status: 200 });
      }
      return new Response(null, { status: 204 });
    },
  });
  await client.oauth2.revoke("access-token");
  const user = await client.oauth2.userInfo("access-token");
  assert.equal(user.sub, "user-1");
  assert.equal(requests[0]?.url, "https://oauth.example.test/oauth/revoke");
  assert.equal(requests[1]?.headers.get("authorization"), "Bearer access-token");
});

test("wraps malformed successful OAuth responses", async () => {
  const client = new OwlVigil({
    oauthBaseUrl: "https://oauth.example.test",
    fetch: async () => new Response("", { status: 200, headers: { "x-request-id": "oauth_req" } }),
  });
  await assert.rejects(client.oauth2.clientCredentials({ clientId: "client", clientSecret: "secret" }), (error: unknown) => {
    assert.ok(error instanceof OwlVigilError);
    assert.match(error.message, /invalid OAuth JSON response status=200 request_id=oauth_req/);
    return true;
  });
});

test("retains SSE event id until a new id is received", async () => {
  const payload = new TextEncoder().encode("id: event-1\ndata: one\n\ndata: two\n\n");
  const client = new OwlVigil({
    gatewayKey: "test_gateway_key",
    fetch: async () => new Response(new ReadableStream({ start(controller) { controller.enqueue(payload); controller.close(); } }), { status: 200 }),
  });
  const events = [];
  for await (const event of client.gateway.createChatCompletionStream({ model: "deepseek-v4-flash", messages: [] })) events.push(event);
  assert.deepEqual(events.map((event) => event.id), ["event-1", "event-1"]);
});
