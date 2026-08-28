import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import test from "node:test";
import { readFileSync } from "node:fs";
import { OwlVigil, OwlVigilApiError, OwlVigilError, VERSION, verifyWebhook } from "./index.js";

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

test("rejects attempts to override authentication header", async () => {
  const client = new OwlVigil({ gatewayKey: "test_gateway_key", fetch: async () => new Response("{}") });
  await assert.rejects(
    client.gateway.listModels({ headers: { AuThOrIzAtIoN: "Bearer wrong" } }),
    (error: unknown) => error instanceof OwlVigilError && /managed by the SDK/.test(error.message),
  );
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
