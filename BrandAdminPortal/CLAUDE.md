# BrandAdminPortal

`경로`: `/BrandAdminPortal`
상위 규칙: `../CLAUDE.md`

## 역할
- 브랜드 본사 운영자의 웹 포털이다.
- POS와 MEAL_TICKET capability를 UI에서 분기해 보여준다.

## 구현 규칙
- `Next.js App Router + Apollo Client`를 사용한다.
- 서버 상태는 GraphQL-first, UI 상태는 `Redux Toolkit`이다.
- capability gating은 UX 목적이며 실제 enforcement는 CentralApi가 담당한다.
- 공통 계약은 `SharedContracts`를 쓰고, 번역 원본은 이 프로젝트 내부 i18n 이다.
- BrandHQ 운영과 식권 참여 화면만 다루고, SuperAdmin/Edge local 업무는 섞지 않는다.
- 기능/화면은 route/resource 단위로 분리하고, 여러 기능을 묶는 aggregate `index.ts`는 만들지 않는다.
