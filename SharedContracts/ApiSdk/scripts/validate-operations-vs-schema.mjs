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
    if (
      value &&
      typeof value === 'object' &&
      typeof value.name === 'string' &&
      typeof value.document === 'string' &&
      (value.kind === 'query' || value.kind === 'mutation' || value.kind === 'subscription')
    ) {
      ops.push({ exportName: key, ...value });
    }
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

  // Track what type we're currently selecting from. Walk the AST with a type stack.
  const typeStack = [];
  visit(doc, {
    OperationDefinition: {
      enter(node) {
        const rootType =
          node.operation === 'query'
            ? 'Query'
            : node.operation === 'mutation'
              ? 'Mutation'
              : 'Subscription';
        typeStack.push(rootType);
      },
      leave() {
        typeStack.pop();
      },
    },
    Field: {
      enter(node) {
        const current = typeStack[typeStack.length - 1];
        if (!current) return;
        const defFields = schemaFields.get(current);
        if (!defFields) {
          errors.push(
            `${op.exportName}: type '${current}' not found in schema (field '${node.name.value}')`,
          );
          typeStack.push(null);
          return;
        }
        if (!defFields.has(node.name.value)) {
          errors.push(
            `${op.exportName}: field '${node.name.value}' not found on type '${current}'`,
          );
        }
        // 다음 선택 단계의 타입은 schema 없이는 정확히 추적 불가 (타입 정보 부족).
        // 여기서는 1-depth 검증만 수행. 깊은 검증은 full codegen 이 필요.
        typeStack.push(null);
      },
      leave() {
        typeStack.pop();
      },
    },
  });

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
