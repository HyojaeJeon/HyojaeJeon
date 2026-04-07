# @platform/api-sdk

한국어:
- 포털 3개와 향후 Edge 연계에서 공통으로 사용할 GraphQL SDK 패키지입니다.
- 현재는 `SuperAdmin/CentralApi` 기준의 typed operation과 APQ 대응 fetch client를 제공합니다.
- `npm run build` 시 persisted query allow-list용 해시 매니페스트도 자동 생성합니다.
- 서버 스키마와 문서가 안정화될수록 operation 범위를 확장합니다.

Tiếng Việt:
- Đây là gói GraphQL SDK dùng chung cho 3 portal và các tích hợp Edge trong tương lai.
- Hiện tại gói cung cấp typed operation theo `SuperAdmin/CentralApi` và fetch client hỗ trợ APQ.
- Khi chạy `npm run build`, gói cũng tự tạo manifest hash cho persisted query allow-list.
- Khi schema máy chủ và tài liệu ổn định hơn, phạm vi operation sẽ được mở rộng.

## Included

- `PlatformApiSdk`
- `loginOperation`
- `auditLogConnectionOperation`
- `syncEventConnectionOperation`
- `distributorsOperation`
- `brandsOperation`
- `branchesOperation`
- `branchOperation`
- `edgePosTerminalsOperation`
- `edgePosTerminalOperation`
- `effectivePolicyOperation`
- `deployPackagesOperation`
- `deployReleasesOperation`
- `deployReleaseOperation`
- `languagesOperation`
- persisted operation manifest (`dist/persisted-operation-manifest.json`)

## Usage

```ts
import {
  PlatformApiSdk,
  loginOperation,
  auditLogConnectionOperation,
  syncEventConnectionOperation,
} from '@platform/api-sdk';

const sdk = new PlatformApiSdk({
  endpoint: 'http://localhost:4000/graphql',
  usePersistedQueries: true,
});

const auth = await sdk.execute(loginOperation, {
  input: {
    loginId: 'admin',
    password: 'password123',
  },
});

const audit = await sdk.execute(auditLogConnectionOperation, {
  first: 20,
});

const sync = await sdk.execute(syncEventConnectionOperation, {
  first: 20,
});
```
