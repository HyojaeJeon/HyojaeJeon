# SharedContracts

`경로`: `/SharedContracts`
상위 규칙: `../CLAUDE.md`

## 역할
- 모든 TypeScript 앱이 함께 쓰는 공용 계약 패키지다.
- UI, API, Worker, Edge 간에 주고받는 데이터 형식의 단일 원본이다.

## 구현 규칙
- DTO / enum / event / GraphQL input-output / pagination / public response shape를 한 곳에서 정의한다.
- public response shape는 `success / error` 네이밍만 사용한다. `Envelope`, `ok/data` 같은 대체 이름은 쓰지 않는다.
- React 컴포넌트, DB 구현, C++ 코드, 서버 비즈니스 로직은 넣지 않는다.
- 계약 변경은 버전과 호환성을 고려한다.
- `ApiSdk`는 Portal / Edge가 재사용할 typed GraphQL SDK만 담는다.
- BrandAdminPortal, CorporatePortal, SuperAdmin/CentralApi, SyncWorkers, BrandPosApp TS 레이어가 같이 쓴다.
- 계약은 도메인/리소스별로 분리하고, 서로 다른 계약을 한 `index.ts`나 대형 묶음 파일에 몰아넣지 않는다.
- msgKey, locale key, translation internals는 여기 두지 않는다.
