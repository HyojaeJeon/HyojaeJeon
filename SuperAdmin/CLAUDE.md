# SuperAdmin

`경로`: `/SuperAdmin`
상위 규칙: `../CLAUDE.md`

## 역할
- `Portal`, `CentralApi`, `SyncWorkers`를 묶는 공급사 운영 suite 경계다.
- `Portal`은 독립 웹 앱이고 `CentralApi` 내부에 두지 않는다.

## 구현 규칙
- UI, API, Worker 책임을 섞지 않는다.
- 공통 계약은 `SharedContracts`만 사용한다.
- 번역 원본은 각 하위 프로젝트 내부 i18n 이다. `SharedAssets` 는 사용하지 않는다.
- 브랜드 운영과 EdgePos 로컬 업무를 여기서 직접 구현하지 않는다.
- REST는 `CentralApi` 안에서만 허용한다.
