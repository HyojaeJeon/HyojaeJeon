# Persistence

`경로`: `/BrandPosApp/Infrastructure/Persistence`

## 역할

- SQLite 기반 영속 계층이다.
- `Ledger`, `Outbox`, `SyncState` 같은 운영 store도 이 경계에 둔다.

## 반드시 지킬 규칙

- 신규 영속 기준은 `SQLite`다.
- `MSSQL` 폴더는 레거시 호환 및 마이그레이션 참고용이다.
- store는 저장/조회 책임만 가진다.
- 트랜잭션 경계와 업무 흐름은 `UseCases`가 결정한다.
- UI 응답 포맷을 persistence에서 만들지 않는다.
