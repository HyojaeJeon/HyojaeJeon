# CorporatePortal

`경로`: `/CorporatePortal`
상위 규칙: `../CLAUDE.md`

## 역할
- 식권 플랫폼의 B2B 고객 기업 전용 포털이다.

## 구현 규칙
- `Next.js App Router + Apollo Client`를 사용한다.
- 공유 계약은 `SharedContracts/ApiSdk/src/mealticket` 단일 원본만 쓴다.
- 서버 상태는 Apollo Client, UI 상태는 로컬 상태로 분리한다.
- Corporate 도메인의 책임만 다루고 BrandHQ / 지점 / 정산 승인 로직은 넣지 않는다.
- 번역 원본은 이 프로젝트 내부 i18n 이다.
- 기능/화면은 route/resource 단위로 분리하고, 여러 기능을 묶는 aggregate `index.ts`는 만들지 않는다.
