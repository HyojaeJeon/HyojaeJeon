# SuperAdmin

`경로`: `/SuperAdmin`
상위 규칙: `../CLAUDE.md`

## 역할
- `Portal`, `CentralApi`, `SyncWorkers`를 묶는 공급사 운영 suite 경계다.
- `Portal`은 독립 웹 앱이고 `CentralApi` 내부에 두지 않는다.

## 구현 규칙
- UI, API, Worker 책임을 섞지 않는다.
- 공통 계약은 `SharedContracts`만 사용한다.
- 파일/이미지 업로드는 `@platform/api-sdk`의 `useUpload` 훅을 사용하고, 업로드 후 후속 작업 실패 시 반드시 `rollback(keys)`으로 롤백한다.
- 번역 원본은 각 하위 프로젝트 내부 i18n 이다. `SharedAssets` 는 사용하지 않는다.
- Portal 같은 웹 UI 는 `SharedUI` 를 소비한다. `BrandPosApp` 만 예외로 자체 `PosUi/src/shared/ui` 를 유지한다.
- 웹 인증은 `CentralApi` 의 rotating refresh session 표준을 그대로 따른다. Portal 류 앱은 refresh token 을 저장/노출하지 않고, access token 도 `localStorage/sessionStorage` 에 영구 저장하지 않는다.
- `/login` 은 navigation shell 없이 로그인 UI만 렌더링한다. auth 실패/세션 만료는 `/login?reason=...` 만으로 안내하고, sidebar/topbar 는 auth route 에서 숨긴다.
- 브랜드 운영과 EdgePos 로컬 업무를 여기서 직접 구현하지 않는다.
- REST는 `CentralApi` 안에서만 허용한다.
