# Quickstart

## Prerequisites

- Node.js 20 or later
- an OwlVigil Gateway Key
- a model available to that key's Workspace

## Install

```bash
npm install @owlvigil/sdk
export OWLVIGIL_GATEWAY_KEY='your-gateway-key'
```

The package is ESM. Create `quickstart.mjs`:

```js
import { OwlVigil } from "@owlvigil/sdk";

const client = new OwlVigil();
const models = await client.gateway.listModels();
const model = models.data.data[0];

if (!model) throw new Error("No model is available to this Gateway Key");

const response = await client.gateway.createChatCompletion({
  model: model.id,
  messages: [{ role: "user", content: "Say hello from OwlVigil." }],
});

console.log(response.data.choices[0]?.message?.content);
console.log(`request_id=${response.meta.requestId}`);
```

Run it:

```bash
node quickstart.mjs
```

Reuse one `OwlVigil` instance and retain `response.meta.requestId` for
troubleshooting. Do not hard-code a model until `listModels()` confirms that the
current Gateway Key can use it.

## First Management request

Management uses a separate key:

```bash
export OWLVIGIL_API_KEY='your-management-api-key'
```

```js
const workspaces = await client.management.listWorkspaces();
for (const workspace of workspaces.data.items) {
  console.log(workspace.id, workspace.name);
}
```

A Gateway Key and a Management API Key are not interchangeable.
