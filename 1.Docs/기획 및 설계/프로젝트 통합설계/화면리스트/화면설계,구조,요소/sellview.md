# SELLVIEW (매출 조회/재인쇄/반품)

## 0. 문서 정보

| 항목 | 값 |
|---|---|
| 문서 ID | SCR-SELLVIEW |
| 레거시 다이얼로그 | IDD_SELLVIEW (리소스 389) |
| 신규 화면 경로 | screens/SalesScreen |
| 최종 수정일 | 2026-04-05 |
| 상태 | 설계 |

---

## 1. 화면 개요

**매출 조회/재인쇄/반품** 핵심 화면. 날짜 범위, 담당자, POS 번호 기준으로 매출을 검색하고, 매출 전표 목록/상세/결제 요약을 3개 그리드로 표시한다. 재판매, 영수증 재인쇄, 반품(매출 취소), 카드 반품, 회원포인트 적립 등의 후속 처리를 제공한다. P0 마이그레이션 대상이다.

---

## 2. 상위 기준 연결

| 기준 문서 | 관련 섹션 | 비고 |
|---|---|---|
| 04-Edge-POS-아키텍처-설계서 | 4.x 계층 책임 | 매출 조회/반품 흐름 |
| 05-Edge-POS-전체-흐름-AZ-가이드 | 매출 조회 흐름 | Golden Rule 적용 |
| CLAUDE.md | 카드/QR 결제 동기 대기, Outbox 규칙, 멱등성/Ledger | 카드 반품은 동기 대기 |

---

## 3. 기능 목록

| ID | 기능명 | 우선순위 | Bridge Command | UseCase | Domain/Manager | Infrastructure |
|---|---|---|---|---|---|---|
| SV-F01 | 매출 조회 (검색) | P0 | SALES:SEARCH | - | SaleMgr | SellSlipCrud, SellDetailCrud |
| SV-F02 | 매출 조건 초기화 | P1 | SALES:SEARCH | - | SaleMgr | SellSlipCrud |
| SV-F03 | 재판매 (재주문) | P1 | SALES:REORDER | CompleteOrderUseCase | SaleMgr, OrderMgr | SellSlipCrud, Tables/Order/OrderSlipCrud |
| SV-F04 | 영수증/계산서 재인쇄 | P0 | SALES:REPRINT | - | SaleMgr | SellSlipCrud, Printer |
| SV-F05 | 반품 (매출 취소) | P0 | SALES:VOID | VoidPaymentUseCase | SaleMgr | SellSlipCrud, SellDetailCrud, RequestLedgerStore |
| SV-F06 | 주문전표 재인쇄 | P1 | SALES:REPRINT | - | SaleMgr, OrderMgr | SellSlipCrud, Printer |
| SV-F07 | 카드전표 재인쇄 | P1 | SALES:REPRINT | - | SaleMgr | SellSlipCrud, Printer |
| SV-F08 | 현금거래꼭지 재인쇄 | P1 | SALES:REPRINT | - | SaleMgr | SellSlipCrud, Printer |
| SV-F09 | 매출 목록 인쇄 | P1 | SALES:EXPORT | - | SaleMgr | SellSlipCrud, Printer |
| SV-F10 | 상품별 목록 인쇄 | P2 | SALES:EXPORT | - | SaleMgr, ItemMgr | SellDetailCrud, Printer |
| SV-F11 | 캐시백 처리 | P2 | PAYMENT:SAVE_POINT | SavePointUseCase | CustMgr | CustomerCrud |
| SV-F12 | 회원포인트 적립 | P1 | PAYMENT:SAVE_POINT | SavePointUseCase | CustMgr | CustomerCrud |
| SV-F13 | 매출그리드 스크롤 | P2 | - (UI 로컬) | - | - | - |
| SV-F14 | 매출그리드 페이지 이동 | P2 | - (UI 로컬) | - | - | - |
| SV-F15 | 영업마감 | P2 | SALES:EXPORT | - | AccountingMgr | SellSlipCrud, OutboxStore |
| SV-F16 | 카드매입 취소/반품 | P1 | PAYMENT:VOID | VoidPaymentUseCase | SaleMgr | SellSlipCrud, CardReader, PaymentGateways/BCCard |
| SV-F17 | 닫기 | P0 | - (UI 로컬) | - | - | - |
| SV-F18 | 로그 보기 | P2 | - | - | SystemMgr | - |

---

## 4. UI 구조

### 4.1 화면 구성

```
screens/SalesScreen/
  index.tsx
  components/
    SalesSearchPanel.tsx       -- 날짜 범위, 담당자, POS번호, 분석 기준
    SalesGrid.tsx              -- 매출 전표 목록 그리드 (IDC_GRID 대체)
    SalesDetailGrid.tsx        -- 매출 상세 항목 그리드 (IDC_GRID2 대체)
    PaymentSummaryGrid.tsx     -- 결제 요약 그리드 (IDC_GRID4 대체)
    SalesActionBar.tsx         -- 재판매/재인쇄/반품/카드반품/캐시백/포인트/인쇄
    SalesHeader.tsx            -- 조회기준 날짜/담당자/POS 표시, 닫기
    SalesDebugPanel.tsx        -- 로그 보기 (P2)
  hooks/
    useSalesSearch.tsx         -- 매출 조회 UI 훅
```

### 4.2 재사용 UI (shared/ui/)

| 컴포넌트 | 경로 | 용도 |
|---|---|---|
| DatePicker | shared/ui/molecules/DatePicker | 시작일/종료일 선택 (SysDateTimePick32 대체) |
| ScrollableList | shared/ui/organisms/ScrollableList | 그리드 스크롤/페이지 이동 |

---

## 5. 구현 명세

### 5.1 상태 소유권

| 상태 | 소유자 | 비고 |
|---|---|---|
| 매출 전표 목록 | RTK Query 캐시 (salesApi: getSellSlips) | 서버 상태 |
| 매출 상세 항목 | RTK Query 캐시 (salesApi: getSellDetails) | 서버 상태 |
| 매출 전표 단건 | RTK Query 캐시 (salesApi: getSellSlip) | 서버 상태 |
| 담당자 목록 | RTK Query 캐시 (systemApi: getStaffList) | 서버 상태 |
| 시스템 설정 | RTK Query 캐시 (systemApi: getSystemConfig) | 서버 상태 |
| 조회 날짜 범위 | uiSlice (Redux) | UI 로컬 상태 |
| 분석 기준 | uiSlice (Redux) | UI 로컬 상태 |

### 5.2 Bridge 계약

**SALES:SEARCH**
```json
{
  "v": 1,
  "requestId": "uuid",
  "timestamp": "ISO8601",
  "command": "SALES:SEARCH",
  "params": {
    "startDate": "YYYY-MM-DD",
    "endDate": "YYYY-MM-DD",
    "posNo": "string | null",
    "tableId": "string | null",
    "staffId": "string | null",
    "sellType": "string | null"
  }
}
```
- **Response**: `{ sellSlips: [...], summary: { totalAmount, cashAmount, cardAmount, etcAmount } }`
- **Error**: (없음 -- 읽기 전용)

**SALES:VOID** (반품)
```json
{
  "v": 1,
  "requestId": "uuid",
  "timestamp": "ISO8601",
  "idempotencyKey": "SALES:VOID:{sellSlipId}:{timestamp}",
  "command": "SALES:VOID",
  "params": {
    "sellSlipId": "string"
  }
}
```

**PAYMENT:VOID** (카드 반품 -- 동기 대기)
```json
{
  "v": 1,
  "requestId": "uuid",
  "timestamp": "ISO8601",
  "idempotencyKey": "PAYMENT:VOID:{sellSlipId}:{timestamp}",
  "command": "PAYMENT:VOID",
  "params": {
    "sellSlipId": "string",
    "reason": "string | null"
  }
}
```
- **Response**: `{ sellSlip: { id, status: "VOIDED" } }`
- **Error**: `ALREADY_VOIDED`, `CARD_VOID_FAILED` (카드 취소 동기 대기), `PERMISSION_DENIED`
> 카드 반품은 **CardReader + 외부 PG 동기 대기** 패턴. **Outbox 재전송 대상이 아니다.**

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

**SALES:REORDER**
```json
{
  "v": 1,
  "requestId": "uuid",
  "timestamp": "ISO8601",
  "idempotencyKey": "SALES:REORDER:{sellSlipId}:{timestamp}",
  "command": "SALES:REORDER",
  "params": {
    "sellSlipId": "string"
  }
}
```

### 5.3 UseCase 계약

| UseCase | 책임 | 트랜잭션 | 멱등성 |
|---|---|---|---|
| VoidPaymentUseCase | 반품/매출 취소, DB 반영, Ledger 갱신 | 단일 트랜잭션 | requestId + idempotencyKey |
| CompleteOrderUseCase | 재판매 시 기존 매출 기반 새 주문 생성 | 단일 트랜잭션 | requestId + idempotencyKey |
| SavePointUseCase | 회원포인트/캐시백 적립 | 단일 트랜잭션 | requestId + idempotencyKey |

**UseCase 실패 규칙**

**VoidPaymentUseCase:**
- 카드 반품: 카드사 취소 동기 대기 -> 실패 시 `CARD_VOID_FAILED`
- 현금 반품: 로컬 DB만, 오프라인 가능
- 권한: 관리자 또는 반품 권한 직원만 -> `PERMISSION_DENIED`
- 멱등성: 동일 idempotencyKey -> Ledger에서 이전 결과 반환
- 이미 반품됨: `ALREADY_VOIDED`

### 5.4 Domain/Manager

| Manager | 역할 |
|---|---|
| SaleMgr | 매출 조회, 반품 처리, 전표 데이터 접근 |
| OrderMgr | 재판매 시 주문 생성 |
| ItemMgr | 상품별 목록 데이터 |
| CustMgr | 회원포인트 적립 |
| AccountingMgr | 영업마감 |
| StaffMgr | 담당자 필터 |
| SystemMgr | 로그 보기 |

### 5.5 DB / CentralApi / Sync / Realtime

**DB (SQLite)**
- SellSlipCrud: 매출 전표 조회
- SellDetailCrud: 매출 상세 조회
- RequestLedgerStore: 반품 멱등성 Ledger
- OutboxStore: 영업마감 데이터 동기화

**Sync 규칙**
- 반품(VoidPaymentUseCase)은 Ledger + Outbox 갱신 필수
- 카드 반품 승인 요청은 **Outbox 재전송 대상이 아니다**
- 영업마감 결과는 Outbox 통해 중앙 서버 비동기 동기화

**Realtime**
- 반품 완료 이벤트: `SALES:VOIDED` -> UI 갱신 (UseCases만 이벤트 결정)

### 5.6 i18n / Error / Permission

**Permission**
- 매출 조회: 로그인 직원 전원
- 반품 (매출 취소/Void): 관리자 또는 반품 권한 직원 -> `PERMISSION_DENIED` 시 UI 에러 표시
- 카드 반품: 관리자 또는 반품 권한 직원 (카드사 취소 동기 대기)
- 매출 삭제: 관리자 전용
- 회원포인트 적립: 로그인 직원 전원

- 인쇄는 비동기 후처리 패턴 (커밋 후 Device/Printer)
- 영업마감(IDC_SELLVIEW_ECLO)은 숨김 처리, 설정 기반 조건부 표시

---

## 6. 테스트

| ID | 시나리오 | 검증 항목 |
|---|---|---|
| T-SV-01 | 날짜 범위 매출 조회 | 3개 그리드 데이터 정상 표시 |
| T-SV-02 | 반품 실행 | DB 반품 처리 + Ledger 갱신 + UI 반영 |
| T-SV-03 | 반품 멱등성 | 동일 idempotencyKey 재전송 시 중복 없음 |
| T-SV-04 | 카드 반품 동기 대기 | CardReader + PG 응답 대기 -> 승인 후 DB |
| T-SV-05 | 카드 반품 실패 | PG 거부 시 에러 반환, Outbox 미적재 |
| T-SV-06 | 영수증 재인쇄 | 비동기 후처리, Printer 정상 출력 |
| T-SV-07 | 재판매 | 기존 매출 기반 새 주문 생성 |

---

## 7. 완료 기준

- [ ] 3개 독립 RTK Query 기반 그리드 구현
- [ ] 반품 VoidPaymentUseCase + RequestLedgerStore 멱등성 보장
- [ ] 카드 반품 동기 대기 패턴 구현 (Outbox 재전송 불가)
- [ ] DatePicker shared/ui/molecules/DatePicker 재사용
- [ ] 재인쇄 비동기 후처리 패턴
- [ ] 영업마감 조건부 표시

---

## 8. 작업 명단

| 계층 | 파일 경로 | 설명 |
|---|---|---|
| UI Screen | BrandPosApp/PosUi/src/screens/SalesScreen/index.tsx | 매출 조회 화면 진입점 |
| UI Screen | BrandPosApp/PosUi/src/screens/SalesScreen/components/SalesSearchPanel.tsx | 검색 조건 패널 |
| UI Screen | BrandPosApp/PosUi/src/screens/SalesScreen/components/SalesGrid.tsx | 매출 전표 그리드 |
| UI Screen | BrandPosApp/PosUi/src/screens/SalesScreen/components/SalesDetailGrid.tsx | 매출 상세 그리드 |
| UI Screen | BrandPosApp/PosUi/src/screens/SalesScreen/components/PaymentSummaryGrid.tsx | 결제 요약 그리드 |
| UI Screen | BrandPosApp/PosUi/src/screens/SalesScreen/components/SalesActionBar.tsx | 매출 액션바 |
| UI Screen | BrandPosApp/PosUi/src/screens/SalesScreen/components/SalesHeader.tsx | 매출 헤더 |
| UI Screen | BrandPosApp/PosUi/src/screens/SalesScreen/hooks/useSalesSearch.ts | 매출 조회 훅 |
| Shared UI | BrandPosApp/PosUi/src/shared/ui/molecules/DatePicker.tsx | 날짜 선택 |
| Store | BrandPosApp/PosUi/src/store/api/salesApi.ts | 매출 RTK Query |
| Bridge | BrandPosApp/PosUi/src/bridge/commands/salesCommands.ts | 매출 Bridge 커맨드 |
| C++ Actions | BrandPosApp/Presentation/CEF/InternalBridge/PosRequestActions/Payment/SalesActions.cpp | 매출 액션 라우터 |
| C++ UseCase | BrandPosApp/UseCases/Payment/VoidPaymentUseCase.cpp | 반품 유스케이스 |
| C++ Domain | BrandPosApp/Domain/Payment/SaleMgr.cpp | 매출 매니저 |
| C++ Infra | BrandPosApp/Infrastructure/Persistence/SQLite/Tables/Payment/SellSlipCrud.cpp | 매출전표 CRUD |
| C++ Infra | BrandPosApp/Infrastructure/Persistence/SQLite/Tables/Payment/SellDetailCrud.cpp | 매출상세 CRUD |

---

## Appendix: 레거시 참조

### A.1 레거시 다이얼로그 정보

| 항목 | 값 |
|---|---|
| 다이얼로그 ID | IDD_SELLVIEW |
| 리소스 값 | 389 |
| 크기 (DLU) | 512 x 384 |
| 총 UI 요소 수 | 30 (버튼 21, 텍스트 4, 입력 2, 그리드 3) |
| 소스 파일 | Restaurant.rc |

### A.2 주요 레거시 컨트롤 -> 신규 매핑

| 레거시 ID | 용도 | 신규 컴포넌트 |
|---|---|---|
| IDC_SELLVIEW_SEARCH | 검색 | SalesSearchPanel |
| IDC_SELLVIEW_RESEARCH | 검색초기화 | SalesSearchPanel |
| IDC_RESELL | 재판매 | SalesActionBar |
| IDC_REPRN | 영수증 재인쇄 | SalesActionBar |
| IDC_SELLVOID | 반품 | SalesActionBar |
| IDC_KICHENREPRN | 주문전표 재인쇄 | SalesActionBar |
| IDC_CARDREPRN | 카드전표 재인쇄 | SalesActionBar |
| IDC_CASHREPRN | 현금거래꼭지 재인쇄 | SalesActionBar |
| IDC_SELLVIEW_PRINT | 매출 목록 인쇄 | SalesActionBar |
| IDC_SELLVIEW_CARDVOID | 카드 반품 (숨김) | SalesActionBar |
| IDC_CUSTPOINT | 회원포인트 적립 | SalesActionBar |
| IDC_CASHBAG | 캐시백 처리 | SalesActionBar |
| IDC_STARTDATE | 시작일 | SalesSearchPanel (DatePicker) |
| IDC_ENDDATE | 종료일 | SalesSearchPanel (DatePicker) |
| IDC_GRID | 매출 전표 그리드 | SalesGrid |
| IDC_GRID2 | 매출 상세 그리드 | SalesDetailGrid |
| IDC_GRID4 | 결제 요약 그리드 | PaymentSummaryGrid |
| IDC_RESEL_DATE | 조회 날짜 | SalesSearchPanel |
| IDC_RESEL_EMP | 담당자 | SalesSearchPanel |
| IDC_RESEL_POS | POS 번호 | SalesSearchPanel |

---

## 9. 작업 진행 기록
| 날짜 | 범위 | 상태 | 완료 범위 | 남은 범위 | 내용 |
|---|---|---|---|---|---|
| 2026-04-05 | Shell 구현 | 완료 | 레이아웃+로컬상태+stub | Bridge/UseCase 연동 | SalesViewDialog.tsx shell 구현 완료. 3그리드(전표/상세/결제요약), 검색패널, 재판매/재인쇄/반품/카드반품/포인트적립 stub 포함 |
