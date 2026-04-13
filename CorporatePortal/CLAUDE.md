# CorporatePortal

`경로`: `/CorporatePortal`
상위 규칙: `../CLAUDE.md`

## 역할
- 식권 플랫폼의 B2B 고객 기업 전용 포털이다.

## 구현 규칙
- `Next.js App Router + Apollo Client`를 사용한다.
- 공유 계약은 `SharedContracts/ApiSdk` 단일 원본만 쓴다. DTO / enum / event 는 `mealticket`, operation document 는 `operations` 에서 가져온다.
- 서버 상태는 Apollo Client, UI 상태는 로컬 상태로 분리한다.
- **1P1Q (1 Page 1 Query)**: 각 화면의 GraphQL operation은 서버 스키마에 실제 존재하는 query/mutation/field만 사용한다. 클라이언트가 임의로 필드를 추가하지 않으며, 스키마 변경이 필요하면 서버를 먼저 수정한다.
- Corporate 도메인의 책임만 다루고 BrandPosApp/PosUi 쪽의 메뉴 / 지점 / 정산 승인 로직은 넣지 않는다.
- 파일/이미지 업로드는 `@platform/api-sdk`의 `useUpload` 훅을 사용하고, 업로드 후 후속 mutation 실패 시 반드시 `rollback(keys)`으로 롤백한다.
- 번역 원본은 이 프로젝트 내부 i18n 이다.
- 공용 UI 패턴은 `SharedUI` 를 사용하고, 프로젝트 내부에 별도 공용 UI 원본을 만들지 않는다.
- 인증은 `memory access token + HttpOnly refresh cookie` 표준을 따른다. access token 을 `localStorage/sessionStorage` 에 저장하지 않고, 앱 시작 시 silent refresh 로 세션을 복구하며 refresh 실패 시 즉시 로그아웃 처리한다.
- `/login` 과 `/forgotPassword` 는 navigation shell 없이 auth UI만 렌더링한다. sidebar/topbar 는 auth route 에서 숨기고, auth 실패/세션 만료는 `/login?reason=...` 만으로 안내한다.
- 식권 계정은 현금 지갑이 아니라 allowance ledger 로 본다. 회사 지원금, 개인 충전, 이월, split payment, funding entry history 를 분리 표현한다.
- `/budget` 화면은 회사 지원금 / 개인 충전 / 원장 내역을 함께 보여주는 요약 페이지로 본다.
- 기능/화면은 route/resource 단위로 분리하고, 여러 기능을 묶는 aggregate `index.ts`는 만들지 않는다.
- route entry 는 얇게 유지하고, 차트 / 지도 / CSV / PDF / 대형 테이블 같은 무거운 블록은 동일 resource 하위 `chunks/` 로 분리해 `dynamic()` 으로 불러온다.
