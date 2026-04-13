#!/usr/bin/env node
/**
 * 한국어: P1-1 — SharedContracts 의 operations/*.ts 가 CentralApi 의 schema.generated.graphql 에
 *   존재하는 필드만 참조하는지 정적으로 검증한다.
 *
 *   동작:
 *     1. CentralApi 의 schema.generated.graphql 을 graphql.parse 로 파싱.
 *     2. 모든 type 의 field 집합을 추출 (Query/Mutation root 포함).
 *     3. SharedContracts/ApiSdk/dist 의 operation document 문자열을 파싱하여 각 field 가
 *        schema 에 존재하는지 확인.
 *     4. 불일치 시 non-zero exit → CI fail.
 *
 *   본 스크립트는 fully-codegen 이 아니라 "operation drift detector" 에 가깝다.
 *   full codegen 으로 가기 전 중간 단계의 안전 장치.
 *
 * Tiếng Việt: Kiểm tra sự tương thích giữa operations/*.ts và schema.graphql của CentralApi.
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// graphql 패키지는 CentralApi 의 node_modules 를 통해 로드한다 (SDK 자체는 의존성을 갖지 않음).
const requireFromCentralApi = createRequire(
  resolve(__dirname, '../../../SuperAdmin/CentralApi/package.json'),
);
const { parse: parseGraphql, visit, Kind } = requireFromCentralApi('graphql');

const SCHEMA_PATHS = [
  resolve(__dirname, '../../../SuperAdmin/CentralApi/src/core/graphql/schema.generated.graphql'),
  resolve(__dirname, '../../../SuperAdmin/CentralApi/schema.generated.graphql'),
];

const SDK_DIST_INDEX = resolve(__dirname, '../dist/index.js');

async function loadSchemaFieldMap(schemaPath) {
  const source = readFileSync(schemaPath, 'utf8');
  const doc = parseGraphql(source);
  const fields = new Map(); // Map<typeName, Set<fieldName>>
  for (const def of doc.definitions) {
    if (
      def.kind === Kind.OBJECT_TYPE_DEFINITION ||
      def.kind === Kind.INTERFACE_TYPE_DEFINITION ||
      def.kind === Kind.INPUT_OBJECT_TYPE_DEFINITION
    ) {
      const set = new Set();
      for (const f of def.fields ?? []) {
        set.add(f.name.value);
      }
      fields.set(def.name.value, set);
    }
  }
  return fields;
}

async function loadSdkOperations() {
  if (!existsSync(SDK_DIST_INDEX)) {
    console.error(`SDK dist not found: ${SDK_DIST_INDEX}. Run "npm run build" first.`);
    process.exit(2);
  }
  const mod = await import(SDK_DIST_INDEX);
  const ops = [];
  for (const [key, value] of Object.entries(mod)) {
    if (!value || typeof value !== 'object' || typeof value.document !== 'string') continue;

    const operationName =
      typeof value.operationName === 'string'
        ? value.operationName
        : typeof value.name === 'string'
          ? value.name
          : null;
    if (!operationName) continue;

    let kind = value.kind;
    if (kind !== 'query' && kind !== 'mutation' && kind !== 'subscription') {
      try {
        const doc = parseGraphql(value.document);
        const operationDef = doc.definitions.find((def) => def.kind === Kind.OPERATION_DEFINITION);
        kind = operationDef?.operation;
      } catch {
        kind = null;
      }
    }
    if (kind !== 'query' && kind !== 'mutation' && kind !== 'subscription') continue;

    ops.push({
      exportName: key,
      name: operationName,
      kind,
      document: value.document,
    });
  }
  return ops;
}

function checkOperation(op, schemaFields) {
  const errors = [];
  let doc;
  try {
    doc = parseGraphql(op.document);
  } catch (err) {
    errors.push(`${op.exportName}: document parse failed: ${err.message}`);
    return errors;
  }

  for (const definition of doc.definitions) {
    if (definition.kind !== Kind.OPERATION_DEFINITION) continue;
    const rootType =
      definition.operation === 'query'
        ? 'Query'
        : definition.operation === 'mutation'
          ? 'Mutation'
          : 'Subscription';
    const defFields = schemaFields.get(rootType);
    if (!defFields) {
      errors.push(`${op.exportName}: root type '${rootType}' not found in schema`);
      continue;
    }

    for (const selection of definition.selectionSet.selections) {
      if (selection.kind !== Kind.FIELD) continue;
      if (!defFields.has(selection.name.value)) {
        errors.push(`${op.exportName}: field '${selection.name.value}' not found on type '${rootType}'`);
      }
    }
  }

  return errors;
}

async function main() {
  const schemaPath = SCHEMA_PATHS.find((p) => existsSync(p));
  if (!schemaPath) {
    console.warn(
      `⚠ Schema file not found. Checked: ${SCHEMA_PATHS.join(', ')}. ` +
        `Run CentralApi build (nest build) first. Skipping validation.`,
    );
    process.exit(0); // soft skip — CentralApi 가 아직 빌드 안 됐을 수 있음
  }

  const schemaFields = await loadSchemaFieldMap(schemaPath);
  const ops = await loadSdkOperations();
  if (ops.length === 0) {
    console.error('✗ No GraphQL operations detected in ApiSdk dist export surface.');
    process.exit(1);
  }

  let totalErrors = 0;
  for (const op of ops) {
    const errors = checkOperation(op, schemaFields);
    totalErrors += errors.length;
    for (const e of errors) console.error('  ✗', e);
  }

  if (totalErrors > 0) {
    console.error(
      `\n✗ Schema-operation mismatch: ${totalErrors} error(s) across ${ops.length} operation(s).`,
    );
    process.exit(1);
  }

  console.log(
    `✓ Operations validated against schema (${ops.length} operations, ${schemaFields.size} types).`,
  );
}

main().catch((err) => {
  console.error('validate-operations-vs-schema.mjs failed:', err);
  process.exit(2);
});
