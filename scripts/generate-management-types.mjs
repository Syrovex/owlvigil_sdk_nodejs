import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const specPath = path.resolve(process.env.OWLVIGIL_OPENAPI_SPEC ?? process.argv[2] ?? "../../owlvigil_openapi/api/swagger.json");
const outputPath = path.resolve(process.argv[3] ?? "src/management-types.ts");
const spec = JSON.parse(fs.readFileSync(specPath, "utf8"));
const definitions = spec.definitions ?? {};
const names = new Map();

function title(value) {
  return value.split(/[^A-Za-z0-9]+/).filter(Boolean).map((part) => part[0].toUpperCase() + part.slice(1)).join("");
}

function typeName(reference) {
  const key = reference.replace(/^#\/definitions\//, "");
  if (!names.has(key)) {
    const moduleMatch = key.match(/_modules_([^.]*)\.([^.]*)$/);
    const listMatch = key.match(/\.List_[^_]*_owlvigil_.*_modules_([^.]*)\.([^.]*)_$/);
    const name = listMatch
      ? `List${title(listMatch[1])}${title(listMatch[2])}`
      : moduleMatch
        ? `${title(moduleMatch[1])}${title(moduleMatch[2])}`
        : title(key.split(".").at(-1));
    names.set(key, name || "AnonymousSchema");
  }
  return names.get(key);
}

for (const key of Object.keys(definitions)) typeName(`#/definitions/${key}`);

function schemaType(schema) {
  if (!schema) return "unknown";
  if (schema.$ref) return typeName(schema.$ref);
  if (schema.enum) return schema.enum.map((value) => JSON.stringify(value)).join(" | ") || "never";
  if (schema.allOf) return schema.allOf.map(schemaType).join(" & ") || "unknown";
  if (schema.anyOf || schema.oneOf) return (schema.anyOf ?? schema.oneOf).map(schemaType).join(" | ") || "unknown";
  if (schema.type === "array") return `Array<${schemaType(schema.items)}>`;
  if (schema.type === "object" || schema.properties || schema.additionalProperties) {
    const properties = Object.entries(schema.properties ?? {});
    const required = new Set(schema.required ?? []);
    const fields = properties.map(([key, value]) => `${JSON.stringify(key)}${required.has(key) ? "" : "?"}: ${schemaType(value)};`);
    if (schema.additionalProperties) fields.push(`[key: string]: ${schema.additionalProperties === true ? "unknown" : schemaType(schema.additionalProperties)};`);
    return fields.length ? `{ ${fields.join(" ")} }` : "Record<string, unknown>";
  }
  if (schema.type === "integer" || schema.type === "number") return "number";
  if (schema.type === "boolean") return "boolean";
  if (schema.type === "string") return "string";
  return "unknown";
}

const lines = [
  "/** Generated from the OwlVigil OpenAPI Management contract. */",
  "",
];
for (const [key, schema] of Object.entries(definitions)) {
  const name = typeName(`#/definitions/${key}`);
  const properties = Object.entries(schema.properties ?? {});
  const required = new Set(schema.required ?? []);
  if (schema.type === "object" || properties.length || schema.additionalProperties) {
    lines.push(`export interface ${name} {`);
    for (const [property, value] of properties) lines.push(`  ${JSON.stringify(property)}${required.has(property) ? "" : "?"}: ${schemaType(value)};`);
    if (schema.additionalProperties) lines.push(`  [key: string]: ${schema.additionalProperties === true ? "unknown" : schemaType(schema.additionalProperties)};`);
    lines.push("}", "");
  } else {
    lines.push(`export type ${name} = ${schemaType(schema)};`, "");
  }
}

lines.push("export interface ManagementOperationData {");
for (const operations of Object.values(spec.paths ?? {})) {
  for (const operation of Object.values(operations)) {
    if (typeof operation.operationId !== "string") continue;
    const success = Object.entries(operation.responses ?? {}).find(([status, response]) => /^2\d\d$/.test(status) && response.schema);
    const schema = success?.[1]?.schema;
    const dataSchema = schema?.properties?.data ?? schema;
    lines.push(`  ${JSON.stringify(operation.operationId)}: ${schemaType(dataSchema)};`);
  }
}
lines.push("}", "");

lines.push("export interface ManagementOperationBody {");
for (const operations of Object.values(spec.paths ?? {})) {
  for (const operation of Object.values(operations)) {
    if (typeof operation.operationId !== "string") continue;
    const body = operation.parameters?.find((parameter) => parameter.in === "body")?.schema;
    lines.push(`  ${JSON.stringify(operation.operationId)}: ${schemaType(body)};`);
  }
}
lines.push("}", "");

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, lines.join("\n"));
console.log(`generated ${Object.keys(definitions).length} OpenAPI schemas into ${outputPath}`);
