import { OwlVigil } from "@owlvigil/sdk";

// Set OWLVIGIL_GATEWAY_KEY before running this example.
const client = new OwlVigil();
const response = await client.gateway.createChatCompletion({
  model: "your-model",
  messages: [{ role: "user", content: "Hello from Node.js" }],
});

console.log(response.data.choices[0]?.message?.content ?? "No content returned");
