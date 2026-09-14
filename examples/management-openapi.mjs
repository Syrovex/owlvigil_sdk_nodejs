import { OwlVigil, MANAGEMENT_OPERATIONS } from "@owlvigil/sdk";

// Set OWLVIGIL_API_KEY before running this example.
const client = new OwlVigil();
const operationId = "get_workspaces";

console.log(`Calling ${MANAGEMENT_OPERATIONS[operationId].method} ${MANAGEMENT_OPERATIONS[operationId].path}`);
const response = await client.management.openApi(operationId, {
  query: { limit: 20 },
});

console.log(response.data);
