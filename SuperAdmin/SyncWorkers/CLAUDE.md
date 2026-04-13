# SyncWorkers

`경로`: `/SuperAdmin/SyncWorkers`
상위 규칙: `../../CLAUDE.md`

## 역할
- 중앙 비동기 동기화, 배포, 재시도, reconciliation 워커다.

## 구현 규칙
- UI는 두지 않는다.
- 원본 업무 데이터를 소유하지 않는다.
- 재시도는 idempotency key와 상태 전이 기준으로만 처리한다.
- 공통 job / event 계약은 `SharedContracts`를 따른다.
- outbox / reconciliation 전용 계층으로 유지하고 도메인 규칙을 중복 구현하지 않는다.
- job / handler 는 단위 작업별로 분리하고, 여러 job/event를 묶는 aggregate `index.ts`는 만들지 않는다.
