# SyncWorkers

`경로`: `/SuperAdmin/SyncWorkers`

## 역할

- 중앙 비동기 동기화, 배포, 재시도, reconciliation 워커다.

## 고정 스택

- `Node.js(TypeScript) + BullMQ + Redis`

## 반드시 지킬 규칙

- UI를 가지지 않는다.
- 원본 업무 데이터를 소유하지 않는다.
- 재시도는 idempotency key와 상태 전이를 기준으로만 수행한다.
- 공통 job / event 계약은 `SharedContracts`를 따른다.
- 다국어 알림은 문장 하드코딩 대신 locale key + payload로 처리한다.
