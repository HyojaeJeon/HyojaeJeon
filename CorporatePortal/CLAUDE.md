# CorporatePortal

`경로`: `/CorporatePortal`
상위 규칙: `../CLAUDE.md`

## 역할
- 식권 플랫폼의 B2B 고객 기업 전용 포털이다.

## 구현 규칙
- `Next.js App Router + Apollo Client`를 사용한다.
- 공유 계약은 `SharedContracts/ApiSdk` 단일 원본만 쓴다. DTO / enum / event 는 `mealticket`, operation document 는 `operations` 에서 가져온다.
- 서버 상태는 Apollo Client, UI 상태는 로컬 상태로 분리한다.
- Corporate 도메인의 책임만 다루고 BrandHQ / 지점 / 정산 승인 로직은 넣지 않는다.
- 번역 원본은 이 프로젝트 내부 i18n 이다.
- 공용 UI 패턴은 `SharedUI` 를 사용하고, 프로젝트 내부에 별도 공용 UI 원본을 만들지 않는다.
- 식권 계정은 현금 지갑이 아니라 allowance ledger 로 본다. 회사 지원금, 개인 충전, 이월, split payment, funding entry history 를 분리 표현한다.
- `/budget` 화면은 회사 지원금 / 개인 충전 / 원장 내역을 함께 보여주는 요약 페이지로 본다.
- 기능/화면은 route/resource 단위로 분리하고, 여러 기능을 묶는 aggregate `index.ts`는 만들지 않는다.
