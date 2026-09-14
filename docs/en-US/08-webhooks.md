# Webhooks

## Verify an inbound delivery

Read the exact request bytes before JSON parsing. OwlVigil sends a Unix
timestamp in `OwlVigil-Timestamp` and a versioned signature such as `v1=...` in
`OwlVigil-Signature`.

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

`verifyWebhook` checks HMAC-SHA256 with constant-time comparison and rejects
missing, malformed, invalid, or stale signatures. The default tolerance is 300
seconds and can be changed with `toleranceSeconds`.

Do not trust a parsed body that was reserialized. Reject failed verification
before business work, then durably deduplicate the event ID before producing
side effects.

## Manage outbound endpoints

Resource helpers cover endpoint listing, creation, retrieval, update, deletion,
enable/disable, and secret rotation. Generated methods cover event history,
test delivery, retry, and redelivery.

```ts
const endpoints = await client.management.listWebhookEndpoints({ workspace_id: 123 });
await client.management.disableWebhookEndpoint(endpointId);
```

Test, retry, and redelivery create new deliveries. Receivers must tolerate
duplicates, and operators should verify the target endpoint before replaying an
event.
