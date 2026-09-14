# Routing, Observability, and Billing

## Models, providers, routes, and policies

Start with read operations:

```ts
const models = await client.management.listManagementModels({ workspace_id: 123 });
const providers = await client.management.listProviders({ workspace_id: 123 });
const routes = await client.management.getGatewayRoutes({
  query: { workspace_id: 123 },
});
```

Provider bodies may contain upstream credentials. Keep them out of logs and
error messages. For routing or policy changes, inspect the current resource,
use a preview operation when available, make one change, then verify both the
stored configuration and a real routed request.

## Usage, logs, traces, and payloads

```ts
const usage = await client.management.getUsageSummary(123);
const log = await client.management.getRequestLog(123, "req_...");
const traces = await client.management.getGatewayTraces({
  query: { workspace_id: 123, limit: 20 },
});
```

Preserve the Gateway `requestId` so it can be correlated with Management logs
and traces. Payload access may expose prompts, responses, or personal data;
request it only when necessary and do not copy it into ordinary application
logs.

## Financial governance and billing

Use read-only methods first: billing overview, balance, plans, subscription,
invoices, orders, top-up history, auto-charge, and Workspace financial
governance. Treat prices as decimal values in the currency returned by the API;
do not infer cents or exchange rates.

Checkout, top-up, payment-method, subscription, auto-charge, retry, and budget
operations have external financial effects. Before a write, show the intended
Workspace, amount or plan, currency, and resulting state to the operator. After
an ambiguous timeout, query the order or subscription before trying again.

The exact operation IDs and generated method signatures are in
`MANAGEMENT_OPERATIONS`, `management-methods.ts`, and `management-types.ts`.
