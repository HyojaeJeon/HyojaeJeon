# ACCOUNT_DIALOG (결제 메인 다이얼로그)

## 0. 문서 정보

| 항목 | 값 |
|---|---|
| 화면명 | `ACCOUNT_DIALOG` |
| 화면 ID | `IDD_ACCOUNT_DIALOG` |
| 원본 파일 | `account-dialog.md` |
| 전환 우선순위 | `P0` |
| 담당 계층 | `PosUi / Presentation / UseCases / Domain / Infrastructure` |
| 상태 | `TODO` |

---

## 1. 화면 개요

레스토랑 POS의 **핵심 결제 다이얼로그**. 테이블 선택 후 주문 내역 확인, 결제수단 선택, 금액 입력, 할인 적용, 회원 연동, 결제 완료까지의 전체 결제 플로우를 처리한다. P0 최우선 마이그레이션 대상이다.

KR/VN 버전이 별도 다이얼로그(IDD_ACCOUNT_DIALOG, IDD_ACCOUNT_DIALOG_VN)로 존재하나, 신규 아키텍처에서는 **i18n 기반 단일 PaymentScreen**으로 통합한다. VN 로케일 차이는 `SharedAssets/i18n/locales/vi/`에서 관리한다.

---

## 2. 상위 기준 연결

| 기준 문서 | 관련 섹션 | 비고 |
|---|---|---|
| 04-Edge-POS-아키텍처-설계서 | 4.x 계층 책임, 9.x Bridge 계약 | 결제 플로우 전체 |
| 05-Edge-POS-전체-흐름-AZ-가이드 | 결제 흐름 | Golden Rule: DB 먼저, UI 다음 |
| 06-P0-P1-설계-보완-체크리스트 | 결제 화면 체크 항목 | P0 대상 |
| CLAUDE.md | 카드/QR 결제 동기 대기, Outbox 규칙 | 카드 승인은 동기 대기, Outbox 재전송 불가 |

---

## 3. 기능 목록

| ID | 기능명 | 우선순위 | Bridge Command | UseCase | Domain/Manager | Infrastructure |
|---|---|---|---|---|---|---|
| AD-F01 | 현금 결제 | P0 | PAYMENT:CASH | ExecuteCashPaymentUseCase | SaleMgr | SellSlipCrud, SellDetailCrud, Printer |
| AD-F02 | 카드 결제 | P0 | PAYMENT:CARD | ExecuteCardPaymentUseCase | SaleMgr | SellSlipCrud, SellDetailCrud, CardReader, PaymentGateways/BCCard |
| AD-F03 | 포인트 결제 | P0 | PAYMENT:APPLY_POINT | ApplyPointUseCase | SaleMgr, CustMgr | SellDetailCrud, CustomerCrud |
| AD-F04 | 쿠폰 결제 | P1 | PAYMENT:EXECUTE | ExecutePaymentUseCase | SaleMgr | SellSlipCrud, SellDetailCrud |
| AD-F05 | 무현금 결제 | P1 | PAYMENT:EXECUTE | ExecutePaymentUseCase | SaleMgr | SellSlipCrud, SellDetailCrud |
| AD-F06 | 할인 적용 | P0 | PAYMENT:APPLY_DISCOUNT | ExecutePaymentUseCase | SaleMgr | SellDetailCrud |
| AD-F07 | 서비스 적용 | P1 | PAYMENT:APPLY_DISCOUNT | ExecutePaymentUseCase | SaleMgr | SellDetailCrud |
| AD-F08 | 결제 완료 (확인) | P0 | PAYMENT:EXECUTE | ExecutePaymentUseCase | SaleMgr | SellSlipCrud, RequestLedgerStore, OutboxStore |
| AD-F09 | 결제 닫기/취소 | P0 | PAYMENT:CANCEL | CancelPaymentUseCase | SaleMgr | SellSlipCrud |
| AD-F10 | 영수증 인쇄 | P0 | SALES:REPRINT | ExecutePaymentUseCase (후처리) | SaleMgr | Printer |
| AD-F11 | 결제 초기화 | P1 | PAYMENT:CANCEL | CancelPaymentUseCase | SaleMgr | SellSlipCrud |
| AD-F12 | 회원 검색 | P0 | CUSTOMER:SEARCH | SearchCustomerUseCase | CustMgr | CustomerCrud |
| AD-F13 | 회원 결제 적용 | P1 | CUSTOMER:APPLY_POINT | ApplyPointUseCase | CustMgr | CustomerCrud |
| AD-F14 | 회원 취소 | P1 | CUSTOMER:SEARCH | SearchCustomerUseCase | CustMgr | CustomerCrud |
| AD-F15 | 시재함 열기 | P2 | PAYMENT:EXECUTE | ExecutePaymentUseCase | AccountingMgr | Device/Printer (캐시드로어) |
| AD-F16 | 팁 입력 | P2 | PAYMENT:EXECUTE | ExecutePaymentUseCase | SaleMgr | SellDetailCrud |
| AD-F17 | 현금영수증 발행 | P1 | PAYMENT:CASH | ExecuteCashPaymentUseCase | SaleMgr | SellSlipCrud, Printer |
| AD-F18 | 임시서명 | P2 | PAYMENT:EXECUTE | ExecutePaymentUseCase | SaleMgr | SellSlipCrud |
| AD-F19 | 테이블 담당자 지정 | P2 | PAYMENT:EXECUTE | ExecutePaymentUseCase | StaffMgr | Tables/Staff/StaffCrud |
| AD-F20 | 이전 결제 보기 | P1 | SALES:VIEW | - | SaleMgr | SellSlipCrud |
| AD-F21 | 결제수단 선택 (ABTN 1~15) | P0 | PAYMENT:EXECUTE | ExecutePaymentUseCase | SaleMgr | SellSlipCrud, SellDetailCrud |
| AD-F22 | 빠른결제 (QUICK 1~5) | P1 | PAYMENT:CASH | ExecuteCashPaymentUseCase | SaleMgr | SellSlipCrud |
| AD-F23 | 숫자패드 입력 | P0 | - (UI 로컬) | - | - | - |
| AD-F24 | 주문목록 스크롤 | P2 | - (UI 로컬) | - | - | - |
| AD-F25 | 결제수단 선택 확인 | P0 | PAYMENT:EXECUTE | ExecutePaymentUseCase | SaleMgr | SellSlipCrud |
| AD-F26 | 금액 직접 입력 | P0 | - (UI 로컬) | - | - | - |

---

## 4. UI 구조

### 4.1 화면 구성

```
screens/PaymentScreen/
  index.tsx
  components/
    PaymentHeader.tsx          -- 테이블번호, 날짜, 인원수, 전표번호, 담당자
    PaymentSummary.tsx         -- 총금액/할인/순금액/부가세/봉사료/받을금액/받은금액/거스름돈
    OrderItemGrid.tsx          -- 주문 항목 그리드 (MFCGridCtrl 대체)
    PaymentMethodPanel.tsx     -- 결제수단 버튼 (현금/카드/포인트/쿠폰/무현금 등)
    PaymentMethodGrid.tsx      -- ABTN 1~15 동적 결제수단 그리드
    QuickPayPanel.tsx          -- QUICK 1~5 빠른결제
    DiscountPanel.tsx          -- 할인/서비스 적용
    CustomerPanel.tsx          -- 회원 검색/표시/포인트 정보
    PaymentActionBar.tsx       -- 결제완료/취소/초기화/인쇄/이전결제
    PaymentHistoryList.tsx     -- 결제내역 리스트
    CustomerSearchList.tsx     -- 고객 검색 리스트
    AmountInput.tsx            -- 금액 직접 입력 영역
    TipInput.tsx               -- 팁 입력 (조건부)
  hooks/
    usePaymentFlow.tsx         -- 결제 플로우 UI 훅
```

### 4.2 재사용 UI (shared/ui/)

| 컴포넌트 | 경로 | 용도 |
|---|---|---|
| NumericKeypad | shared/ui/organisms/NumericKeypad | 숫자패드 (0~9, 00, 000, 0000, BS, CLR) |
| ScrollableList | shared/ui/organisms/ScrollableList | 주문목록 스크롤 |
| DatePicker | shared/ui/molecules/DatePicker | 날짜 표시 (필요 시) |

---

## 5. 구현 명세

### 5.1 상태 소유권

| 상태 | 소유자 | 비고 |
|---|---|---|
| 주문 항목 목록 | RTK Query 캐시 (orderApi: getOrderItems) | 서버 상태 |
| 매출 전표 정보 | RTK Query 캐시 (salesApi: getSellSlip) | 서버 상태 |
| 매출 상세 정보 | RTK Query 캐시 (salesApi: getSellDetails) | 서버 상태 |
| 테이블 정보 | RTK Query 캐시 (tableApi: getTableDetail) | 서버 상태 |
| 고객 정보 | RTK Query 캐시 (customerApi: getCustomer) | 서버 상태 |
| 결제수단 설정 | RTK Query 캐시 (systemApi: getPaymentMethods) | 서버 상태 |
| 받은금액 / 거스름돈 | uiSlice (Redux) | UI 로컬 상태 |
| 숫자패드 입력값 | React 로컬 state | 컴포넌트 로컬 |
| 현재 선택 결제수단 | uiSlice (Redux) | UI 로컬 상태 |

### 5.2 Bridge 계약

**PAYMENT:CASH**
```json
{
  "v": 1,
  "requestId": "uuid",
  "timestamp": "ISO8601",
  "idempotencyKey": "PAYMENT:CASH:{tableId}:{timestamp}",
  "command": "PAYMENT:CASH",
  "params": {
    "tableId": "string",
    "amount": "number",
    "receivedAmount": "number",
    "changeAmount": "number"
  }
}
```
- **Response**: `{ sellSlip: { id, tableId, totalAmount, payType: "CASH", status: "COMPLETED" } }`
- **Error**: `TABLE_NOT_SELECTED`, `AMOUNT_MISMATCH`, `ORDER_EMPTY`
- **Idempotency**: `PAYMENT:CASH:{tableId}:{timestamp}`

**PAYMENT:CARD** (동기 대기 -- synchronous-wait)
```json
{
  "v": 1,
  "requestId": "uuid",
  "timestamp": "ISO8601",
  "idempotencyKey": "PAYMENT:CARD:{tableId}:{timestamp}",
  "command": "PAYMENT:CARD",
  "params": {
    "tableId": "string",
    "amount": "number"
  }
}
```
- **Response**: `{ sellSlip: { id, approvalNo, cardNo, payType: "CARD", status: "COMPLETED" } }`
- **Error**: `CARD_READER_NOT_CONNECTED`, `APPROVAL_DENIED`, `APPROVAL_TIMEOUT`, `AMOUNT_MISMATCH`
> 카드 결제는 **외부 PG 동기 대기** 패턴. CardReader -> PaymentGateway -> 승인 결과 수신 후 DB 저장. **Outbox 재전송 대상이 아니다.**

**PAYMENT:EXECUTE**
```json
{
  "v": 1,
  "requestId": "uuid",
  "timestamp": "ISO8601",
  "idempotencyKey": "PAYMENT:EXECUTE:{sellSlipId}:{timestamp}",
  "command": "PAYMENT:EXECUTE",
  "params": {
    "sellSlipId": "string",
    "paymentMethodId": "number"
  }
}
```

**PAYMENT:APPLY_POINT**
```json
{
  "v": 1,
  "requestId": "uuid",
  "timestamp": "ISO8601",
  "idempotencyKey": "PAYMENT:APPLY_POINT:{sellSlipId}:{customerId}",
  "command": "PAYMENT:APPLY_POINT",
  "params": {
    "sellSlipId": "string",
    "customerId": "string",
    "pointAmount": "number"
  }
}
```

**PAYMENT:APPLY_DISCOUNT**
```json
{
  "v": 1,
  "requestId": "uuid",
  "timestamp": "ISO8601",
  "command": "PAYMENT:APPLY_DISCOUNT",
  "params": {
    "tableId": "string",
    "discountType": "string",
    "discountRate": "number | null",
    "discountAmount": "number | null"
  }
}
```
- **Response**: `{ orderSlip: { discountAmount, totalAmount } }`
- **Error**: `INVALID_DISCOUNT_VALUE`, `ORDER_EMPTY`

**PAYMENT:CANCEL**
```json
{
  "v": 1,
  "requestId": "uuid",
  "timestamp": "ISO8601",
  "command": "PAYMENT:CANCEL",
  "params": {
    "sellSlipId": "string",
    "reason": "string | null"
  }
}
```
- **Response**: `{ sellSlip: { id, status: "CANCELLED" } }`
- **Error**: `ALREADY_CANCELLED`, `CANCEL_PERIOD_EXPIRED`, `PERMISSION_DENIED`

**CUSTOMER:SEARCH**
```json
{
  "v": 1,
  "requestId": "uuid",
  "timestamp": "ISO8601",
  "command": "CUSTOMER:SEARCH",
  "params": {
    "phone": "string"
  }
}
```

**SALES:REPRINT**
```json
{
  "v": 1,
  "requestId": "uuid",
  "timestamp": "ISO8601",
  "command": "SALES:REPRINT",
  "params": {
    "sellSlipId": "string",
    "printType": "receipt | kitchen | card"
  }
}
```
- **Response**: `{ success: true }`
- **Error**: `PRINTER_NOT_CONNECTED`, `SLIP_NOT_FOUND`

### 5.3 UseCase 계약

| UseCase | 책임 | 트랜잭션 | 멱등성 |
|---|---|---|---|
| ExecutePaymentUseCase | 결제 실행, DB 저장, Ledger/Outbox 갱신, 후처리(인쇄/이벤트) 순서 제어 | 단일 트랜잭션 | requestId + idempotencyKey |
| ExecuteCashPaymentUseCase | 현금 결제 전용, 현금영수증 발행 포함 | 단일 트랜잭션 | requestId + idempotencyKey |
| ExecuteCardPaymentUseCase | 카드 결제 전용, CardReader/PG 동기 대기 후 DB 저장 | 외부 승인 후 로컬 트랜잭션 | requestId + idempotencyKey |
| CancelPaymentUseCase | 결제 취소/초기화 | 단일 트랜잭션 | requestId |
| ApplyPointUseCase | 포인트 적용/차감 | 단일 트랜잭션 | requestId + idempotencyKey |
| SearchCustomerUseCase | 회원 검색 (읽기 전용) | 없음 | 없음 |

**UseCase 실패 규칙**

**ExecuteCashPaymentUseCase:**
- 멱등성: 동일 idempotencyKey -> Ledger에서 이전 결과 반환
- 금액 불일치: receivedAmount < totalAmount -> `AMOUNT_MISMATCH`
- 빈 주문: 주문 없는 테이블 -> `ORDER_EMPTY`
- 오프라인: 로컬 DB만 사용, 오프라인 동작 가능
- 트랜잭션: SellSlip + SellDetail + UserPayment INSERT + OrderSlip status UPDATE + Ledger + Outbox 원자적
- 커밋 후: PosRealTimeSender -> `PAYMENT_COMPLETED`, 영수증 인쇄(비동기), Outbox 적재

**ExecuteCardPaymentUseCase:**
- 멱등성: 동일 idempotencyKey -> Ledger 확인
- 카드리더 미연결: `CARD_READER_NOT_CONNECTED` -> 진입 차단
- 승인 거절: `APPROVAL_DENIED` -> DB 저장 안 함, UI에 에러 표시
- 승인 타임아웃: `APPROVAL_TIMEOUT` -> DB 저장 안 함
- 오프라인: 카드 결제는 온라인 필수 아니지만 카드리더 연결 필수
- 트랜잭션: 카드 승인 성공 -> SellSlip + SellDetail INSERT 원자적
- Outbox: 재전송 대상 아님 (카드 승인은 실시간 외부 거래)

### 5.4 Domain/Manager

| Manager | 역할 |
|---|---|
| SaleMgr | 매출 전표 생성/수정, 결제 금액 계산, 할인 적용 로직 |
| CustMgr | 회원 조회, 포인트 적립/차감 계산 |
| AccountingMgr | 시재함 제어 |
| StaffMgr | 테이블 담당자 조회/지정 |

### 5.5 DB / CentralApi / Sync / Realtime

**DB (SQLite)**
- SellSlipCrud: 매출 전표 CRUD
- SellDetailCrud: 매출 상세 CRUD
- CustomerCrud: 고객 정보 CRUD
- RequestLedgerStore: 요청 멱등성 Ledger
- OutboxStore: 중앙 서버 동기화 큐

**Sync 규칙**
- 결제 완료 시 Outbox에 매출 데이터 적재 (중앙 서버 비동기 동기화)
- 카드/QR 승인 요청은 **Outbox 재전송 대상이 아니다** (실시간 외부 거래)

**Realtime (PosRealTimeSender)**
- 결제 완료 이벤트: `PAYMENT:COMPLETED` -> UI 갱신
- 결제 취소 이벤트: `PAYMENT:CANCELLED` -> UI 갱신
- 이벤트 결정권은 UseCases만 가진다

### 5.6 i18n / Error / Permission

**i18n**
- 번역 원본: `SharedAssets/i18n/locales/{ko,en,vi}/`
- KR/VN 별도 다이얼로그 -> 단일 PaymentScreen + i18n 키 기반 전환
- VN 로케일 차이: 결제수단 라벨, 통화 포맷, 세금 표시 방식

**Error**
- 디바이스 에러는 코드 기반 필드 (type, device, code, msgKey, msgParams, severity, recoverable, retryable, action)
- 카드 승인 실패 시 에러 코드 반환, 완성 문장 하드코딩 금지

**Permission**
- 결제 실행 (현금/카드/QR): 로그인 직원 전원
- 결제 취소: 관리자 또는 반품 권한 직원 -> `PERMISSION_DENIED` 시 UI 에러 표시
- 매출 조회: 로그인 직원 전원
- 할인 적용: 관리자 또는 할인 권한 직원 -> `PERMISSION_DENIED` 시 UI 에러 표시
- 숨김 버튼 표시 조건: INI feature flag 또는 시스템 설정 기반

---

## 6. 테스트

| ID | 시나리오 | 검증 항목 |
|---|---|---|
| T-AD-01 | 현금 결제 성공 | DB 저장 -> UI 갱신 -> 영수증 인쇄 순서 |
| T-AD-02 | 카드 결제 동기 대기 | CardReader 호출 -> PG 응답 대기 -> 승인 후 DB 저장 |
| T-AD-03 | 카드 결제 실패 | PG 거부 시 에러 코드 반환, DB 미저장 |
| T-AD-04 | 결제 취소 | 결제 초기화 및 DB 롤백 |
| T-AD-05 | 포인트 적용 | 포인트 차감 + 매출 상세 반영 |
| T-AD-06 | 멱등성 검증 | 동일 idempotencyKey 재전송 시 중복 처리 없음 |
| T-AD-07 | 오프라인 시 카드 결제 차단 | 네트워크 단절 시 카드/QR 결제 진입 차단 |
| T-AD-08 | VN 로케일 전환 | i18n 키 기반 라벨/통화 포맷 정상 표시 |

---

## 7. 완료 기준

- [ ] PaymentScreen 단일 컴포넌트로 KR/VN 통합 (i18n 기반)
- [ ] P0 결제수단 (현금, 카드, 포인트, 할인) 정상 동작
- [ ] 카드/QR 결제 동기 대기 패턴 구현
- [ ] 결제 완료 시 Ledger/Outbox 갱신
- [ ] 숫자패드 shared/ui/organisms/NumericKeypad 재사용
- [ ] 결제수단 그리드 동적 배치 (서버 설정 기반)
- [ ] INI feature flag 기반 조건부 버튼 표시
- [ ] 멱등성 보장 (requestId + idempotencyKey)

---

## 8. 작업 명단

| 계층 | 파일 경로 | 설명 |
|---|---|---|
| UI Screen | BrandPosApp/PosUi/src/screens/PaymentScreen/index.tsx | 결제 화면 진입점 |
| UI Screen | BrandPosApp/PosUi/src/screens/PaymentScreen/components/PaymentHeader.tsx | 헤더 (테이블, 날짜, 인원) |
| UI Screen | BrandPosApp/PosUi/src/screens/PaymentScreen/components/PaymentSummary.tsx | 금액 요약 영역 |
| UI Screen | BrandPosApp/PosUi/src/screens/PaymentScreen/components/OrderItemGrid.tsx | 주문 항목 그리드 |
| UI Screen | BrandPosApp/PosUi/src/screens/PaymentScreen/components/PaymentMethodPanel.tsx | 결제수단 버튼 패널 |
| UI Screen | BrandPosApp/PosUi/src/screens/PaymentScreen/components/PaymentMethodGrid.tsx | ABTN 동적 결제수단 그리드 |
| UI Screen | BrandPosApp/PosUi/src/screens/PaymentScreen/components/QuickPayPanel.tsx | 빠른결제 패널 |
| UI Screen | BrandPosApp/PosUi/src/screens/PaymentScreen/components/DiscountPanel.tsx | 할인/서비스 패널 |
| UI Screen | BrandPosApp/PosUi/src/screens/PaymentScreen/components/CustomerPanel.tsx | 회원 정보 패널 |
| UI Screen | BrandPosApp/PosUi/src/screens/PaymentScreen/components/PaymentActionBar.tsx | 결제 액션바 |
| UI Screen | BrandPosApp/PosUi/src/screens/PaymentScreen/components/PaymentHistoryList.tsx | 결제내역 리스트 |
| UI Screen | BrandPosApp/PosUi/src/screens/PaymentScreen/components/CustomerSearchList.tsx | 고객 검색 리스트 |
| UI Screen | BrandPosApp/PosUi/src/screens/PaymentScreen/components/AmountInput.tsx | 금액 입력 |
| UI Screen | BrandPosApp/PosUi/src/screens/PaymentScreen/components/TipInput.tsx | 팁 입력 |
| UI Screen | BrandPosApp/PosUi/src/screens/PaymentScreen/hooks/usePaymentFlow.ts | 결제 플로우 훅 |
| Shared UI | BrandPosApp/PosUi/src/shared/ui/organisms/NumericKeypad.tsx | 숫자패드 |
| Shared UI | BrandPosApp/PosUi/src/shared/ui/organisms/ScrollableList.tsx | 스크롤 리스트 |
| Store | BrandPosApp/PosUi/src/store/api/salesApi.ts | 매출 RTK Query |
| Store | BrandPosApp/PosUi/src/store/api/customerApi.ts | 고객 RTK Query |
| Store | BrandPosApp/PosUi/src/store/api/paymentApi.ts | 결제 RTK Query |
| Store | BrandPosApp/PosUi/src/store/slices/uiSlice.ts | UI 상태 (받은금액, 거스름돈 등) |
| Bridge | BrandPosApp/PosUi/src/bridge/commands/paymentCommands.ts | 결제 Bridge 커맨드 |
| Bridge | BrandPosApp/PosUi/src/bridge/commands/customerCommands.ts | 고객 Bridge 커맨드 |
| C++ Actions | BrandPosApp/Presentation/CEF/InternalBridge/PosRequestActions/Payment/PaymentActions.cpp | 결제 액션 라우터 |
| C++ Actions | BrandPosApp/Presentation/CEF/InternalBridge/PosRequestActions/Payment/PaymentActions.h | 결제 액션 헤더 |
| C++ UseCase | BrandPosApp/UseCases/Payment/ExecutePaymentUseCase.cpp | 결제 실행 유스케이스 |
| C++ UseCase | BrandPosApp/UseCases/Payment/ExecuteCashPaymentUseCase.cpp | 현금 결제 유스케이스 |
| C++ UseCase | BrandPosApp/UseCases/Payment/ExecuteCardPaymentUseCase.cpp | 카드 결제 유스케이스 |
| C++ UseCase | BrandPosApp/UseCases/Payment/CancelPaymentUseCase.cpp | 결제 취소 유스케이스 |
| C++ UseCase | BrandPosApp/UseCases/Payment/ApplyPointUseCase.cpp | 포인트 적용 유스케이스 |
| C++ Domain | BrandPosApp/Domain/Payment/SaleMgr.cpp | 매출 매니저 |
| C++ Domain | BrandPosApp/Domain/Customer/CustMgr.cpp | 고객 매니저 |
| C++ Infra | BrandPosApp/Infrastructure/Persistence/SQLite/Tables/Payment/SellSlipCrud.cpp | 매출전표 CRUD |
| C++ Infra | BrandPosApp/Infrastructure/Persistence/SQLite/Tables/Payment/SellDetailCrud.cpp | 매출상세 CRUD |
| C++ Infra | BrandPosApp/Infrastructure/Persistence/SQLite/Tables/Customer/CustomerCrud.cpp | 고객 CRUD |
| i18n | SharedAssets/i18n/locales/ko/payment.json | 한국어 결제 번역 |
| i18n | SharedAssets/i18n/locales/en/payment.json | 영어 결제 번역 |
| i18n | SharedAssets/i18n/locales/vi/payment.json | 베트남어 결제 번역 |

---

## 9. Handoff (관련 문서)

| 대상 | 문서 | 비고 |
|---|---|---|
| VN 로케일 차이 | `account-dialog-vn.md` | VN 고유 i18n/통화 차이점 |
| 결제수단 버튼 배치 | `account-bselect.md` | BTN 1~15 동적 배치, QR/더치페이 |
| 결제수단 VN 변형 | `account-bselect-vn.md` | ZALOPAY, NAPAS, UserPayment |
| 기타 결제 입력 | `accetc-dialig.md` | 식권/예치금/카드미승인/OK캐시백 |
| 할인/세일 관리 | `saledc.md` | 할인 적용/취소 상세 |
| 매출 조회/반품 | `sellview.md` | VoidPaymentUseCase, 카드 반품 |
| 매출 필터 | `sellview-select.md` | 매출 조회 조건 필터 모달 |
| 매출 현황 | `selllistview.md` | 탭 기반 매출 목록 뷰 |
| 포인트 적립 조회 | `pointsavesell.md` | 포인트 내역/수동 저장 |
| 마트 판매 | `martsell-dlg.md` | 바코드 기반 즉시결제 통합 |

---

## Appendix: 레거시 참조

### A.1 레거시 다이얼로그 정보

| 항목 | KR (IDD_ACCOUNT_DIALOG) | VN (IDD_ACCOUNT_DIALOG_VN) |
|---|---|---|
| 리소스 값 | 101 | 443 |
| 크기 (DLU) | 519 x 383 | 519 x 383 |
| 총 UI 요소 수 | 96 | 96 |
| 버튼 | 58 | 58 |
| 텍스트/라벨 | 33 | 33 |
| 입력 필드 | 2 | 2 |
| 그리드/리스트 | 3 | 3 |
| 소스 파일 | Restaurant.rc | Restaurant.rc |

### A.2 주요 레거시 컨트롤 -> 신규 컴포넌트 매핑

| 레거시 ID | 용도 | 신규 컴포넌트 |
|---|---|---|
| IDC_A_CASH | 현금 결제 | PaymentMethodPanel |
| IDC_A_CARD | 카드 결제 | PaymentMethodPanel |
| IDC_A_POINT | 포인트 결제 | PaymentMethodPanel |
| IDC_A_COUPON | 쿠폰 결제 | PaymentMethodPanel |
| IDC_A_NOCASH | 무현금 결제 | PaymentMethodPanel |
| IDC_A_DISCOUNT | 할인 | DiscountPanel |
| IDC_A_SERVICE | 서비스 | DiscountPanel |
| IDC_A_BILLPRINT | 영수증 인쇄 | PaymentActionBar |
| IDOK | 결제 완료 | PaymentActionBar |
| IDCANCEL | 닫기 | PaymentActionBar |
| IDC_A_ACCLEAR | 결제 초기화 | PaymentActionBar |
| IDC_A_PHONE | 회원 검색 | CustomerPanel |
| IDC_A_MEMBER | 회원 결제 | CustomerPanel |
| IDC_A_MEMBERCALLBACK | 회원 취소 | CustomerPanel |
| IDC_A_NUM* (15개) | 숫자패드 | shared/ui/organisms/NumericKeypad |
| IDC_A_ABTN1~15 (15개) | 결제수단 그리드 | PaymentMethodGrid |
| IDC_A_QUICK1~5 (5개) | 빠른결제 | QuickPayPanel |
| IDC_A_UP, IDC_A_DOWN | 스크롤 | shared/ui/organisms/ScrollableList |
| IDC_A_TABLENUM | 테이블 번호 | PaymentHeader |
| IDC_A_PERSON | 인원수 | PaymentHeader |
| IDC_A_BILLNUM | 전표번호 | PaymentHeader |
| IDC_A_RECEIVEAMP | 받은금액 | PaymentSummary |
| IDC_A_GIVECHANGE | 거스름돈 | PaymentSummary |
| IDC_A_RECEIVABLEAMP | 받을금액 | PaymentSummary |
| IDC_AS_* | 금액 요약 라벨 | PaymentSummary |
| IDC_A_MEM* | 회원 정보 라벨 | CustomerPanel |
| IDC_GRID | 주문 그리드 | OrderItemGrid |
| IDC_A_ACCOUNTLIST | 결제내역 리스트 | PaymentHistoryList |
| IDC_A_CUSTLIST | 고객 리스트 | CustomerSearchList |
| IDC_A_INPUTAMP | 금액 입력 | AmountInput |
| IDC_A_TIP | 팁 | TipInput |
| IDC_A_MONEYBOX | 시재함 | PaymentActionBar |
| IDC_A_CASHBILL | 현금영수증 | PaymentMethodPanel |
| IDC_A_TEMPSIGN | 임시서명 | PaymentActionBar |
| IDC_A_TABLEEMP | 테이블 담당자 | PaymentHeader |
| IDC_A_BEFOREACC | 이전 결제 | PaymentActionBar |
| IDC_A_SELECT | 결제수단 확인 | PaymentMethodGrid |

### A.3 VN 로케일 차이 사항

- KR/VN 컨트롤 ID, 레이아웃, 기능 동일
- 신규 아키텍처에서는 i18n 기반 단일 PaymentScreen으로 통합
- 번역 원본: `SharedAssets/i18n/locales/vi/`
- KR/EN/VN 언어 전환은 런타임 i18n 키 기반 처리

---

## 9. 작업 진행 기록
| 날짜 | 범위 | 상태 | 완료 범위 | 남은 범위 | 내용 |
|---|---|---|---|---|---|
| 2026-04-05 | Shell 구현 | 완료 | 레이아웃+로컬상태+stub | Bridge/UseCase 연동 | PaymentScreen/index.tsx + PaymentHeader, PaymentSummary, OrderItemGrid, PaymentMethodPanel, PaymentMethodGrid, QuickPayPanel, DiscountPanel, CustomerPanel, PaymentActionBar, PaymentHistoryList, usePaymentFlow hook shell 구현 완료 |
