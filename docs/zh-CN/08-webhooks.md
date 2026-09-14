# Webhook

## 验证入站投递

必须在 JSON 解析前读取原始请求字节。OwlVigil 通过 `OwlVigil-Timestamp` 发送 Unix
时间戳，通过 `OwlVigil-Signature` 发送 `v1=...` 形式的版本化签名。

```ts
import { verifyWebhook } from "@owlvigil/sdk";

export async function handleWebhook(request: Request, secret: string) {
  const rawBody = new Uint8Array(await request.arrayBuffer());
  const timestamp = request.headers.get("owlvigil-timestamp") ?? "";
  const signature = request.headers.get("owlvigil-signature") ?? "";

  verifyWebhook(rawBody, `t=${timestamp},${signature}`, secret);
  const event = JSON.parse(new TextDecoder().decode(rawBody));
  return event;
}
```

`verifyWebhook` 使用 HMAC-SHA256 和恒定时间比较，拒绝缺失、格式错误、无效或过期的签名。
默认时间容差为 300 秒，可通过 `toleranceSeconds` 调整。

不要对解析后重新序列化的正文验签。验签失败时先拒绝请求；验签通过后按事件 ID 持久化
去重，再执行副作用。

## 管理出站端点

资源方法覆盖端点列表、创建、查询、更新、删除、启用/禁用和 Secret 轮换。事件历史、测试
投递、retry 和 redelivery 使用生成方法。

```ts
const endpoints = await client.management.listWebhookEndpoints({ workspace_id: 123 });
await client.management.disableWebhookEndpoint(endpointId);
```

测试、retry 和 redelivery 都会产生新的投递。接收端必须能处理重复事件，操作人应在重投前
确认目标 Endpoint。
