import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const specPath = path.resolve(process.env.OWLVIGIL_OPENAPI_SPEC ?? process.argv[2] ?? "../../owlvigil_openapi/api/swagger.json");
const outputPath = path.resolve(process.argv[3] ?? "src/management-operations.ts");
const spec = JSON.parse(fs.readFileSync(specPath, "utf8"));
const methods = new Set(["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"]);
let operationCount = 0;
const lines = [
  'export type ManagementHttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS";',
  "export interface ManagementOperationDefinition { method: ManagementHttpMethod; path: string }",
  "",
  "/**",
  " * The published OpenAPI Management operation catalog.",
  " *",
  " * This file is generated from the OwlVigil OpenAPI contract. Keep the",
  " * operation IDs and paths aligned with the contract before releasing.",
  " */",
  "export const MANAGEMENT_OPERATIONS = {",
];

for (const [sourcePath, operations] of Object.entries(spec.paths ?? {})) {
  for (const [method, operation] of Object.entries(operations)) {
    const upperMethod = method.toUpperCase();
    if (!methods.has(upperMethod) || typeof operation.operationId !== "string") continue;
    const sdkPath = sourcePath.replace(/^\/v1/, "") || "/";
    lines.push(`  ${JSON.stringify(operation.operationId)}: { method: ${JSON.stringify(upperMethod)}, path: ${JSON.stringify(sdkPath)} },`);
    operationCount += 1;
  }
}

lines.push(
  "} as const satisfies Record<string, ManagementOperationDefinition>;",
  "",
  "export type ManagementOperationId = keyof typeof MANAGEMENT_OPERATIONS;",
  "",
);
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, lines.join("\n"));
console.log(`generated ${operationCount} OpenAPI operations into ${outputPath}`);
