# 快速开始

## 准备工作

- Node.js 20 或更高版本
- OwlVigil Gateway Key
- 该 Key 所在工作区可用的模型

## 安装

```bash
npm install @owlvigil/sdk
export OWLVIGIL_GATEWAY_KEY='your-gateway-key'
```

这个包使用 ESM。创建 `quickstart.mjs`：

```js
import { OwlVigil } from "@owlvigil/sdk";

const client = new OwlVigil();
const models = await client.gateway.listModels();
const model = models.data.data[0];

if (!model) throw new Error("当前 Gateway Key 没有可用模型");

const response = await client.gateway.createChatCompletion({
  model: model.id,
  messages: [{ role: "user", content: "Say hello from OwlVigil." }],
});

console.log(response.data.choices[0]?.message?.content);
console.log(`request_id=${response.meta.requestId}`);
```

运行：

```bash
node quickstart.mjs
```

生产代码应复用一个 `OwlVigil` 实例，并保存 `response.meta.requestId`。在
`listModels()` 确认当前 Key 可访问模型前，不要写死模型名称。

## 第一次 Management 请求

Management 使用另一类 Key：

```bash
export OWLVIGIL_API_KEY='your-management-api-key'
```

```js
const workspaces = await client.management.listWorkspaces();
for (const workspace of workspaces.data.items) {
  console.log(workspace.id, workspace.name);
}
```

Gateway Key 与 Management API Key 不能互换。
