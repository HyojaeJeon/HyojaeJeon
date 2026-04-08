# Portal

`경로`: `/SuperAdmin/Portal`
상위 규칙: `../../CLAUDE.md`

## 역할
- 공급사 운영용 독립 웹 앱이다.
- `CentralApi` 내부 구현과 섞지 말고, `SuperAdmin` suite의 web client 경계로 취급한다.

## 구현 규칙
- 서버 상태는 `Apollo Client`만 사용한다.
- `Redux Toolkit`은 UI 상태에만 사용한다.
- `Redis`와 `DataLoader`는 직접 사용하지 않는다.
- 공통 계약은 `SharedContracts`를 사용한다.
- 번역 원본은 이 포털 내부 i18n 이다.
- 공용 UI 패턴은 `SharedUI` 를 사용하고, 포털 내부에 별도 공용 UI 원본을 만들지 않는다.
- `CentralApi`, `SyncWorkers`의 구현을 가져와서 중복 구현하지 않는다.
- CentralApi의 계정/RBAC/정책 화면만 소비하고, 로직을 중복 구현하지 않는다.
- 화면/기능은 단일 책임 기준으로 분리하고, 여러 기능을 묶는 aggregate `index.ts`는 만들지 않는다.
- 화면 구조는 `Dashboard / Tenants / Deploy / Governance / Operations / Audit & System` 이 최상위이고, `Branches` 와 `Catalog` 는 `Tenants > Brands` 상세 탭으로만 둔다.
- Edge POS 단말 CRUD 는 `Tenants > Brands > Branches > Edge POS` 탭에 두고, `Operations > EdgePos Telemetry` 는 fleet monitor 로만 둔다.
