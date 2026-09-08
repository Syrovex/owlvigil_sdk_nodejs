import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const requestedSpecPath = path.resolve(process.env.OWLVIGIL_OPENAPI_SPEC ?? process.argv[2] ?? "../../owlvigil_openapi/api/swagger.json");
const specPath = fs.existsSync(requestedSpecPath) ? requestedSpecPath : path.resolve("contracts/management-contract.json");
const sourcePath = path.resolve(process.argv[3] ?? "src/management-operations.ts");
const typesSourcePath = path.resolve(process.argv[4] ?? "src/management-types.ts");
const spec = JSON.parse(fs.readFileSync(specPath, "utf8"));
const source = fs.readFileSync(sourcePath, "utf8");
const typesSource = fs.readFileSync(typesSourcePath, "utf8");
const expected = new Map();
const methods = new Set(["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"]);

if (spec.operations) {
  for (const [operationId, definition] of Object.entries(spec.operations)) expected.set(operationId, definition);
} else {
  for (const [sourceRoute, operations] of Object.entries(spec.paths ?? {})) {
    for (const [method, operation] of Object.entries(operations)) {
      const upperMethod = method.toUpperCase();
      if (!methods.has(upperMethod) || typeof operation.operationId !== "string") continue;
      expected.set(operation.operationId, { method: upperMethod, path: sourceRoute.replace(/^\/v1/, "") || "/" });
    }
  }
}

const actual = new Map();
const entryPattern = /^  ("[^"]+"): \{ method: "([A-Z]+)", path: "([^"]*)" \},$/gm;
for (const match of source.matchAll(entryPattern)) actual.set(JSON.parse(match[1]), { method: match[2], path: match[3] });

const errors = [];
for (const [operationId, definition] of expected) {
  const got = actual.get(operationId);
  if (!got) errors.push(`missing operation ${operationId}`);
  else if (got.method !== definition.method || got.path !== definition.path) errors.push(`mismatch ${operationId}: got ${got.method} ${got.path}, want ${definition.method} ${definition.path}`);
}
for (const operationId of actual.keys()) if (!expected.has(operationId)) errors.push(`unexpected operation ${operationId}`);
if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
const expectedSchemaCount = spec.schemaCount ?? Object.keys(spec.definitions ?? {}).length;
const schemaSection = typesSource.split("export interface ManagementOperationData", 1)[0];
const actualSchemaCount = [...schemaSection.matchAll(/^export (?:interface|type) /gm)].length;
if (actualSchemaCount !== expectedSchemaCount) {
  console.error(`schema count mismatch: got ${actualSchemaCount}, want ${expectedSchemaCount}`);
  process.exit(1);
}
console.log(`OpenAPI Management catalog aligned: ${actual.size} operations, ${actualSchemaCount} schemas`);
