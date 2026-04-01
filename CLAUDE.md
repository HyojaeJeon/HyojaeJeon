# HyojungPOSApp

POS 아키텍처 전환 프로젝트: `Sciter/MFC -> CEF + Next.js + Redux Toolkit + RTK Query`

이 문서는 Claude Code가 이 저장소에서 작업할 때 따라야 하는 **최우선 개발 규칙 요약본**이다.
세부 설계의 원본은 아래 문서를 따른다.

## Source Of Truth

- 메인 설계 기준서:
  `/Users/hyojae/projects/HyojungPOSApp/Docs/기획 및 설계/프로젝트 통합설계/01-CEF-NextJS-전환-계획서.md`
- 보완 체크리스트:
  `/Users/hyojae/projects/HyojungPOSApp/Docs/기획 및 설계/프로젝트 통합설계/02-P0-P1-설계-보완-체크리스트.md`

규칙:
- 아키텍처, 디렉토리 구조, 계층 책임, 통신 방식은 위 설계 문서를 기준으로 판단한다.
- 현재 코드 구조가 설계 문서와 다르더라도, **현행 코드를 답습하지 말고 설계 문서를 목표 구조로 본다.**
- 사용자 요청이 설계 문서와 충돌하면, 임의로 구현하지 말고 먼저 설계 기준과 충돌 지점을 명확히 설명하거나 문서를 함께 갱신한다.

## 핵심 결정사항

- 운영 모델은 `Offline-First`다.
- 업무 데이터의 원본은 원격 서버가 아니라 **고객사 POS 기기 내부의 로컬 MSSQL**이다.
- 상태 관리는 `RTK Query` 하나로 통일한다. `React Query`는 사용하지 않는다.
- 메인 UI는 `CEF Browser 단일 인스턴스`를 유지하고, 화면 전환은 React 상태/라우팅으로 처리한다.
- 핵심 계층 흐름은 `UI/Bridge -> UseCases -> Domain/Manager -> Infrastructure` 단방향이다.
- 핵심 3개 화면부터 점진 전환한다: `테이블 -> 주문 -> 결제`
- 화면 전환과 롤백은 `INI feature flag`로 제어한다.
- `x86/x64` 듀얼 빌드를 유지한다.

## 디렉토리 구조 이해 규칙

유일한 기준 구조는 설계 문서 `2.3 통합 목표 디렉토리 구조 (최종 기준)`이다.
Claude는 아래 역할 분리를 항상 전제하고 작업한다.

### C++ 계층

- `AppHost/`
  실행 진입점, 부트스트랩, 서비스 조립
- `Presentation/CEF/`
  CEF 호스팅, 브라우저 수명주기, `InternalBridge`
- `Presentation/LegacyDlg/`
  점진 전환 중 유지되는 기존 MFC Dialog
- `UseCases/`
  유스케이스 오케스트레이션, 트랜잭션, 멱등성, 락, 후처리
- `Domain/`
  순수 업무 규칙과 매니저
- `Infrastructure/`
  MSSQL, Ledger/Outbox, Sync, Device, ExternalBridge, Observability

### PosUI 계층

- `src/app/`
  Next.js 라우트 계층
- `src/app/design-system/`
  브라우저에서 직접 띄우는 디자인 시스템 카탈로그/프리뷰 라우트
- `src/design-system/`
  공용 UI 원본 라이브러리. atoms/molecules/organisms/templates/tokens
- `src/screens/`
  실제 제품 화면 구현
- `src/store/api/`
  RTK Query API 계층
- `src/store/slices/`
  UI/클라이언트 상태 전용 slice
- `src/bridge/`
  C++ transport 및 command 계층
- `src/mocks/`
  mock transport와 화면 fixture 데이터
- `src/shared/`
  앱 전반 공용 유틸과 POS 문맥이 섞인 공용 조합 컴포넌트

### Shared 계층

- `SharedCpp/`
  공용 계약, foundation, observability, testing, build support
- `Shared/`
  i18n 등 런타임 자산 원본

금지:
- 도메인 구현을 `SharedCpp/`에 넣지 않는다.
- 설계 문서에 없는 임의 폴더를 먼저 만들지 않는다.
- 구조 변경이 필요하면 먼저 설계 문서의 구조와 책임 경계를 맞춘다.

## 레이어 책임 규칙

### 1. InternalBridge

- `PosRequestResponder`, `PosRequestActions`, `PosRealTimeSender`
- 역할: 요청 파싱, 파라미터 검증, 응답 포맷, UI 이벤트 송신
- `PosRequestActions`는 **thin router**여야 한다.

금지:
- `Actions`에서 직접 SQL 실행
- `Actions`에서 여러 Manager를 직접 조합
- `Actions`에서 트랜잭션/락/멱등성 처리

### 2. UseCases

- 실제 작업 단위의 중심이다.
- 여러 Manager 호출 순서 조정
- `requestId`, `idempotencyKey` 검사
- 작업 단위 락 획득
- 트랜잭션 실행
- `RequestLedgerStore`, `OutboxStore` 갱신
- 커밋 후 UI 이벤트, 중앙 서버 sync ACK, 인쇄/장치 호출 순서 제어

중요:
- **UI 이벤트 결정권과 `PosRealTimeSender` 호출 권한은 `UseCases`만 가진다.**

### 3. Domain / Manager

- 순수 업무 계산
- DB row 생성/수정
- 도메인 결과 반환
- 도메인별 전면 Repository 없이 `Infrastructure/Persistence` 기반으로 동작

금지:
- `PosRealTimeSender` 직접 호출
- 외부 ACK 발송 여부 결정
- 브라우저/화면 전환 상태 결정

### 4. Persistence / Store

- `Infrastructure/Persistence/MSSQL`은 공통 영속화 기반이다.
- 운영 저장소는 `*Store` 형태만 분리한다.
- 허용 예시:
  - `RequestLedgerStore`
  - `OutboxStore`
  - `SyncStateStore`

금지:
- `TableRepository`, `OrderRepository`, `PaymentRepository` 같은 Manager 대응 Repository 전면 도입
- Manager와 같은 책임의 CRUD 래퍼를 한 겹 더 만드는 것

### 5. ExternalBridge

- 외부 payload 인증/검증
- 외부 포맷을 내부 DTO로 변환
- `UseCases` 호출

금지:
- 직접 SQL 실행
- 직접 UI 송신
- 주문/결제 확정 상태 임의 결정

## 데이터 흐름 규칙

### Golden Rule

- `ExternalBridge -> UseCases -> DB/Manager -> PosRealTimeSender -> UI`
- **DB에 저장되지 않은 정보는 UI에 띄우지 않는다.**
- `ExternalBridge`는 `PosRealTimeSender`를 직접 호출할 수 없다.
- `Manager`도 `PosRealTimeSender`를 직접 호출할 수 없다.

### PosRequest

- UI -> C++ 왕복 요청 채널
- 진입점: `PosUI/src/bridge/PosRequestSender.js`
- C++ 측: `PosRequestResponder -> PosRequestActions -> UseCases`

### PosRealTime

- C++ -> UI 단방향 방송 채널
- C++ 측: `UseCases -> PosRealTimeSender`
- UI 측: `PosRealTimeReceiver`

## 계약 / JSON 봉투 규칙

모든 PosRequest / PosRealTime 메시지는 공통 헤더를 가진다.

- `v`
- `requestId`
- `timestamp`
- `idempotencyKey` (조건부)

중요:
- 구현 예시와 실제 코드 모두 이 봉투 규격을 따라야 한다.
- ad-hoc JSON shape를 새로 만들지 않는다.

### Device Error 규칙

디바이스 에러는 완성 문장 `msg`를 싣지 않는다.
반드시 코드 기반 필드로 전달한다.

- `type`
- `device`
- `code`
- `msgKey`
- `msgParams`
- `severity`
- `recoverable`
- `retryable`
- `action`

문구 원본은 `Shared/i18n/locales/`다.

## i18n 규칙

- 번역의 진실의 원천은 `Shared/i18n/locales/` 하나다.
- `PosUI/src/i18n/locales/`와 `Build/locales/`는 산출물(복사본)이다.
- UI payload, device error, 상태 코드는 가능하면 `msgKey + msgParams` 기반으로 처리한다.

금지:
- 브릿지 payload에 한국어/영어/베트남어 완성 문장을 하드코딩
- 번역 원본을 `PosUI` 또는 `Build` 쪽에서 직접 수정

## PosUI 개발 규칙

### 디자인 시스템

- `src/design-system/`은 공용 UI의 **원본**이다.
- `src/app/design-system/`은 카탈로그/프리뷰 라우트다.
- `src/screens/`는 실제 제품 화면이다.
- 카탈로그에서 보는 화면은 **실제 `screens/*` 구현을 그대로 재사용**한다.

금지:
- 디자인 시스템 카탈로그를 위해 별도의 가짜 화면 구현을 또 만들기
- 디자인 시스템 완료 후 `design-system/` 원본을 지우고 `shared/`에 복사해 이관하기

원칙:
- `design-system/`은 유지한다.
- `shared/`는 POS 문맥이 들어간 공용 조합 컴포넌트와 유틸에 사용한다.
- 제거 가능한 것은 `app/design-system/`와 `mocks/` 같은 개발 보조 계층이다.

### RTK Query

- `posApi.js`는 루트 `createApi`
- `tableApi.js`, `orderApi.js`, `paymentApi.js`, `syncApi.js`, `systemApi.js`는 `injectEndpoints()`
- `index.js`는 도메인별 hook re-export
- 서버 상태는 RTK Query 캐시가 원본
- Redux slice는 UI 상태만 저장

금지:
- RTK Query 결과를 slice로 복사 저장
- `React Query` 병행 도입
- 컴포넌트에서 `window.cefQuery` 직접 호출

### Screen 규칙

- `screens/*/hooks`는 **UI 전용 훅만**
- 데이터 조회/변경은 `store/api/*Api.js` 훅 사용
- 장치 imperative action은 `bridge/commands/` 사용

### Bridge 규칙

- `PosRequestSender.js`는 저수준 transport
- 내부에서 `cefTransport` / `mockTransport`를 선택
- `next dev` + `app/design-system/` + `mockTransport` 조합으로 C++ 없이 UI 개발 가능해야 한다

## Offline-First / Sync 규칙

- 로컬 MSSQL 커밋이 업무 성공의 기준이다.
- RTK Query 캐시는 복구 원본이 아니다.
- 복구 기준은 `로컬 MSSQL + Ledger + Outbox`다.

### Outbox 규칙

`Outbox`는 **중앙 온라인 서버로 송출 가능한 동기화 데이터만** 적재한다.

예:
- 매출/주문 집계 업로드
- 본사 보고용 거래 내역
- 동기화용 변경 로그

금지:
- 카드 승인/취소 요청을 Outbox 재전송 대상으로 넣기
- QR 결제 승인 요청을 Outbox 재전송 대상으로 넣기
- 배달앱 실시간 수락/거절/상태변경을 Outbox 재전송 대상으로 넣기

실시간 외부 거래는:
- 오프라인이면 `UseCases`가 진입 차단
- 온라인 복구 후에도 과거 요청 자동 재실행 금지

## 멱등성 / Ledger 규칙

- 결제/주문/배달 수신은 `requestId + idempotencyKey` 기준 멱등성 보장
- 하나의 UseCase 트랜잭션 안에서 아래를 함께 기록한다:
  - 업무 데이터
  - Ledger 상태
  - Outbox 레코드

최소 상태:
- Ledger: `RECEIVED`, `PROCESSING`, `SUCCEEDED`, `FAILED`, `COMPENSATED`
- Outbox: `PENDING`, `DISPATCHING`, `ACKED`, `FAILED_RETRYABLE`, `FAILED_TERMINAL`

## CEF / UI 운영 규칙

- 메인 `CefBrowser`는 단일 인스턴스 유지
- 화면 전환 시 `CloseBrowser` 호출 금지
- `1024x768` 고정 해상도와 터치 사용성 기준 준수
- renderer crash 복구는 브라우저 메모리가 아니라 **DB/UseCase bootstrap 데이터 기준**으로 수행
- crash loop 기준과 fallback 계약을 무시하고 구현하지 않는다

## MFC 마이그레이션 규칙

기존 Dialog 코드는 아래 4곳으로 분리한다.

- UI 레이아웃/버튼/Grid -> `PosUI/src/design-system/` + `PosUI/src/screens/`
- 버튼 클릭 분기 -> `CEF/InternalBridge/PosRequestActions/`
- 유스케이스 조정/트랜잭션/멱등성/후처리 -> `UseCases/`
- 실제 DB 쿼리/금액 계산/데이터 처리 -> `Domain/Manager` + `Infrastructure/Persistence`
- 도메인별 Repository 전면 분리 -> 하지 않음
- 운영 저장소 분리 -> `*Store`만 허용

마이그레이션 순서:
1. UI 분리
2. Actions 라우터 생성
3. UseCases 추출
4. DB/Manager 정리

도입 우선순위:
1. `UseCases/Shared`
2. `RequestLedgerStore`, `OutboxStore`
3. `ExecutePaymentUseCase`, `CreateOrderUseCase`, `ReceiveDeliveryOrderUseCase`
4. `PosRequestActions` thin router화
5. `ExternalBridge` 직접 DB/UI 접근 제거

## Claude 작업 프로토콜

Claude Code는 기능 개발 시 아래 순서로 사고한다.

1. 이 작업이 어느 계층의 책임인지 먼저 판별한다
2. 설계 문서 `2.3`, `4.x`, `6.x`, `7.x`, `8.x`, `9.x`와 충돌 없는지 확인한다
3. 디렉토리 위치를 설계 기준 구조에 맞춘다
4. 화면 작업이면 먼저 `design-system` 또는 `screens` 중 어디 책임인지 구분한다
5. 데이터 작업이면 RTK Query / UseCases / Manager / Infrastructure 중 책임을 분리한다
6. 외부 연동이면 Offline-First, Ledger, Outbox 규칙 위반 여부를 먼저 확인한다
7. 임시 우회 구현보다 설계 기준 책임 경계를 우선한다

### 작업 중 항상 지킬 것

- 새 기능을 추가할 때는 현재 코드 편의보다 설계 기준 구조를 우선
- 아키텍처 규칙을 깨는 빠른 해결책을 임의로 넣지 않기
- 화면 구현 시 디자인 시스템 우선
- 서버 상태는 RTK Query 우선
- UI 상태만 slice에 두기
- 외부 이벤트는 항상 `UseCases` 경유
- 설계 문서와 구현이 어긋나면 둘 중 하나를 명시적으로 정리

### 명시적 금지 목록

- `window.cefQuery`를 Screen/Component에서 직접 호출
- `Actions`에서 SQL 실행
- `Manager`에서 UI 이벤트 직접 송신
- `ExternalBridge`에서 DB 저장/결제 확정/UI 송신 직접 수행
- RTK Query 결과를 slice로 다시 저장
- `React Query` 도입
- `design-system` 원본 삭제 후 `shared/`로 복사 이관
- 브라우저 메모리/Redux snapshot을 복구 원본으로 사용

## Skill routing

When the user's request matches an available skill, ALWAYS invoke it using the Skill
tool as your FIRST action. Do NOT answer directly, do NOT use other tools first.
The skill has specialized workflows that produce better results than ad-hoc answers.

Key routing rules:
- Product ideas, "is this worth building", brainstorming -> invoke office-hours
- Bugs, errors, "why is this broken", 500 errors -> invoke investigate
- Ship, deploy, push, create PR -> invoke ship
- QA, test the site, find bugs -> invoke qa
- Code review, check my diff -> invoke review
- Update docs after shipping -> invoke document-release
- Weekly retro -> invoke retro
- Design system, brand -> invoke design-consultation
- Visual audit, design polish -> invoke design-review
- Architecture review -> invoke plan-eng-review
