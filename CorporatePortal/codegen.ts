import type { CodegenConfig } from '@graphql-codegen/cli';

// CentralApi 가 실행 중일 때 schema introspection 을 수행한다.
// 오프라인 작업 시 `src/graphql/schema.graphql` 를 대신 사용한다.
const schema =
  process.env.CODEGEN_SCHEMA ??
  process.env.NEXT_PUBLIC_CENTRAL_API_HTTP ??
  'http://localhost:4000/graphql';

const config: CodegenConfig = {
  overwrite: true,
  schema,
  documents: ['src/**/*.{ts,tsx,graphql}'],
  ignoreNoDocuments: true,
  generates: {
    'src/graphql/__generated__/': {
      preset: 'client',
      config: {
        useTypeImports: true,
        scalars: {
          DateTime: 'string',
          Decimal: 'string',
          JSON: 'unknown',
          BigInt: 'string',
        },
      },
    },
  },
};

export default config;
