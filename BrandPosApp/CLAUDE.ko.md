# BrandPosApp

`경로`: `/BrandPosApp`
상위 규칙: `../CLAUDE.md`

## 역할
- 실제 매장에 설치되는 EdgePos 패키지다.
- POS mode와 Setup / Maintenance mode를 하나의 앱으로 제공한다.

## 구현 규칙
- 로컬 SQLite가 업무 원본이다.
- 중앙 API를 로컬 거래 원본처럼 사용하지 않는다.
- `AppHost`는 composition root, `Presentation`은 thin bridge, `UseCases`만 트랜잭션 / idempotency / lock / ledger / outbox를 결정한다.
- `Domain`은 순수 규칙만 가진다.
- `SharedKernel`은 C++ low-level 공용, `SharedContracts`는 TS 계약 원본이다.
- UI 상태는 `Redux Toolkit + RTK Query`만 사용하고 `React Query`는 사용하지 않는다.
- 번역 원본은 BrandPosApp 내부 i18n 이다.
- BrandPosApp 은 `SharedUI` 를 소비하지 않는 예외다. UI 원본은 `PosUi/src/shared/ui` 로만 유지한다.
- 상세 규칙은 각 하위 폴더의 `CLAUDE.md`를 따른다.
- feature / resource / use case 는 한 폴더에 묶지 말고 분리한다. 여러 리소스를 모은 aggregate `index.ts`는 만들지 않는다.
