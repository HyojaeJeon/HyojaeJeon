# MARTSELL_DLG (마트/소매 판매 메인)

## 0. 문서 정보

| 항목 | 값 |
|---|---|
| 문서 ID | SCR-MARTSELL-DLG |
| 레거시 다이얼로그 | IDD_MARTSELL_DLG (리소스 175) |
| 신규 화면 경로 | screens/OrderScreen (마트 모드 변형) |
| 최종 수정일 | 2026-04-05 |
| 상태 | 설계 |

---

## 1. 화면 개요

**마트/소매 판매 메인 화면**. 바코드 스캔 기반 판매 + 즉시 결제 통합 화면이다. 레스토랑 POS의 테이블 -> 주문 -> 결제 흐름과 달리, 바코드 스캔 -> 주문 목록 -> 즉시 결제 원스텝 흐름을 제공한다. 신규 구조에서는 OrderScreen의 마트 모드 변형으로 구현하거나, 별도 MartSellScreen으로 분리 가능하다.

---

## 2. 상위 기준 연결

| 기준 문서 | 관련 섹션 | 비고 |
|---|---|---|
| 04-Edge-POS-아키텍처-설계서 | 4.x 계층 책임 | 주문/결제 통합 흐름 |
| 05-Edge-POS-전체-흐름-AZ-가이드 | 주문 흐름 | Golden Rule: DB 먼저, UI 다음 |
| CLAUDE.md | Offline-First, Scanner 디바이스 | 바코드 스캔 디바이스 연동 |

---

## 3. 기능 목록

| ID | 기능명 | 우선순위 | Bridge Command | UseCase | Domain/Manager | Infrastructure |
|---|---|---|---|---|---|---|
| MS-F01 | 바코드/상품 스캔 입력 | P0 | ORDER:COMPLETE | CompleteOrderUseCase | OrderMgr, ItemMgr | Tables/Order/OrderItemCrud, Tables/Item/ItemCrud, Scanner |
| MS-F02 | 수량 입력 | P0 | ORDER:COMPLETE | CompleteOrderUseCase | OrderMgr | Tables/Order/OrderItemCrud |
| MS-F03 | 회원 검색 | P0 | CUSTOMER:SEARCH | SearchCustomerUseCase | CustMgr | CustomerCrud |
| MS-F04 | 상품 검색 | P1 | ORDER:COMPLETE | CompleteOrderUseCase | ItemMgr | Tables/Item/ItemCrud |
| MS-F05 | 단체 검색 | P2 | CUSTOMER:SEARCH | SearchCustomerUseCase | CustMgr | CustomerCrud |
| MS-F06 | 주문 항목 선택 | P0 | ORDER:COMPLETE | CompleteOrderUseCase | OrderMgr | Tables/Order/OrderItemCrud |
| MS-F07 | 영수증 인쇄 | P0 | SALES:REPRINT | - | SaleMgr | SellSlipCrud, Printer |
| MS-F08 | 근태 관리 | P2 | - | - | StaffMgr | Tables/Staff/StaffCrud |
| MS-F09 | 최소화 | P2 | - (UI 로컬) | - | - | - |
| MS-F10 | 주문목록 위로 스크롤 | P2 | - (UI 로컬) | - | - | - |
| MS-F11 | 주문목록 아래로 스크롤 | P2 | - (UI 로컬) | - | - | - |
| MS-F12 | 수량 증가 | P0 | ORDER:COMPLETE | CompleteOrderUseCase | OrderMgr | Tables/Order/OrderItemCrud |
| MS-F13 | 글자 크기 조절 | P2 | - (UI 로컬) | - | - | - |
| MS-F14 | 닫기 | P0 | - (UI 로컬) | - | - | - |

---

## 4. UI 구조

### 4.1 화면 구성

```
screens/OrderScreen/          -- 마트 모드 변형 (또는 별도 MartSellScreen)
  components/
    BarcodeInput.tsx           -- 바코드 스캔/수동 입력 (IDC_BARCODENUM 대체)
    QuantityInput.tsx          -- 수량 입력
    ItemSearchPanel.tsx        -- 상품 검색
    CustomerSearchPanel.tsx    -- 회원 검색
    TeamSearchPanel.tsx        -- 단체 검색 (P2, 조건부)
    OrderItemGrid.tsx          -- 주문 항목 그리드 (IDC_GRID 대체)
    OrderSummary.tsx           -- 주문금액/할인/총액/받은금액/거스름돈
    OrderHeader.tsx            -- 날짜/시간/POS번호/직원명/매출건수
    OrderActionBar.tsx         -- 영수증 인쇄
    PaymentQuickView.tsx       -- 결제내역 사이드 (IDC_ACCLIST 대체)
    CustomerQuickView.tsx      -- 고객정보 사이드 (IDC_CUSTLIST 대체)
    OrderFooter.tsx            -- 공지사항 (조건부)
```

### 4.2 재사용 UI (shared/ui/)

| 컴포넌트 | 경로 | 용도 |
|---|---|---|
| ScrollableList | shared/ui/organisms/ScrollableList | 주문목록 스크롤 |

---

## 5. 구현 명세

### 5.1 상태 소유권

| 상태 | 소유자 | 비고 |
|---|---|---|
| 주문 전표 | RTK Query 캐시 (orderApi: getOrderSlip) | 서버 상태 |
| 주문 항목 | RTK Query 캐시 (orderApi: getOrderItems) | 서버 상태 |
| 고객 정보 | RTK Query 캐시 (customerApi: getCustomer) | 서버 상태 |
| 시스템 설정 | RTK Query 캐시 (systemApi: getSystemConfig) | 서버 상태 |
| 담당자 목록 | RTK Query 캐시 (systemApi: getStaffList) | 서버 상태 |
| 보류 주문 | RTK Query 캐시 (orderApi: getHoldOrders) | 서버 상태 |
| 매출 요약 | RTK Query 캐시 (salesApi: getSalesSummary) | 서버 상태 |
| 공지사항 | RTK Query 캐시 (systemApi: getNotices) | 서버 상태 |
| 매출 상세 | RTK Query 캐시 (salesApi: getSellDetails) | 서버 상태 |
| 받은 금액 / 거스름돈 | uiSlice (Redux) | UI 로컬 상태 |
| 바코드 입력값 | React 로컬 state | 컴포넌트 로컬 |

### 5.2 Bridge 계약

**ORDER:COMPLETE** (바코드 스캔 -> 주문 추가)
```json
{
  "v": 1,
  "requestId": "uuid",
  "timestamp": "ISO8601",
  "idempotencyKey": "ORDER:ADD_ITEM:{orderSlipId}:{barcode}:{timestamp}",
  "command": "ORDER:COMPLETE",
  "params": {
    "orderSlipId": "string",
    "barcode": "string",
    "quantity": "number"
  }
}
```

**CUSTOMER:SEARCH**
```json
{
  "v": 1,
  "requestId": "uuid",
  "timestamp": "ISO8601",
  "command": "CUSTOMER:SEARCH",
  "params": {
    "phone": "string",
    "searchType": "INDIVIDUAL | TEAM"
  }
}
```

**SALES:REPRINT** (영수증 재인쇄)
```json
{
  "v": 1,
  "requestId": "uuid",
  "timestamp": "ISO8601",
  "command": "SALES:REPRINT",
  "params": {
    "sellSlipId": "string",
    "printType": "RECEIPT | SALES_SLIP"
  }
}
```
Response: `{ success }`. Error: `PRINTER_NOT_CONNECTED`. → handoff: sellview.md 섹션 5.2 참조.

### 5.3 UseCase 계약

| UseCase | 책임 | 트랜잭션 | 멱등성 |
|---|---|---|---|
| CompleteOrderUseCase | 바코드 스캔 -> 상품 조회 -> 주문 항목 추가/수량 변경 | 단일 트랜잭션 | requestId + idempotencyKey. 멱등성: 동일 requestId → Ledger 이전 결과 반환. 바코드 미존재 → BARCODE_NOT_FOUND. 오프라인: 로컬 DB만 사용하므로 동작 (마트/바코드 판매는 오프라인 동작 가능). 트랜잭션: SQLite TX 내에서 OrderItem INSERT/UPDATE + Ledger INSERT + Outbox INSERT 원자적 수행. 커밋 후: PosRealTimeSender로 ORDER_ITEM_CHANGED 이벤트 |
| SearchCustomerUseCase | 회원/단체 검색 (읽기 전용) | 없음 | 없음. 조회 전용: 멱등성/락/Outbox 불필요. 오프라인: 로컬 DB만 사용하므로 동작 |

### 5.4 Domain/Manager

| Manager | 역할 |
|---|---|
| OrderMgr | 주문 항목 추가/수량 변경/선택 |
| ItemMgr | 바코드 -> 상품 매핑, 상품 검색 |
| CustMgr | 회원/단체 검색 |
| SaleMgr | 매출 건수, 결제내역, 영수증 데이터 |
| StaffMgr | 직원 정보, 근태 관리 |

### 5.5 DB / CentralApi / Sync / Realtime

**DB (SQLite)**
- Tables/Order/OrderItemCrud: 주문 항목 CRUD
- Tables/Item/ItemCrud: 상품 마스터 조회 (바코드 매핑)
- CustomerCrud: 고객 조회
- SellSlipCrud: 매출 데이터 (영수증 인쇄용)

**Device**
- Scanner: 바코드 스캔 디바이스 연동 + 수동 입력 겸용
- Printer: 영수증 인쇄 (비동기 후처리)

**Realtime**
- 주문 항목 변경 이벤트: `ORDER:ITEM_CHANGED` -> UI 갱신

### 5.6 i18n / Error / Permission

**Permission**
- 바코드 스캔/주문 추가/수량 변경/회원 검색/상품 검색: 로그인된 직원 전원
- 근태 관리: 관리자 또는 권한 직원
- 영수증 인쇄: 로그인된 직원 전원

**i18n / Error**
- 단체 검색(IDC_BTN_TEAMSEARCH)은 숨김 처리, 설정 기반 조건부 표시
- 공지사항(IDC_NOTICES1)은 숨김 처리, 시스템 설정 기반 하단 티커
- 바코드 스캔 실패 시 에러 코드 기반 반환 (msgKey + msgParams). `BARCODE_NOT_FOUND`: 해당 바코드 상품 없음

---

## 6. 테스트

| ID | 시나리오 | 검증 항목 |
|---|---|---|
| T-MS-01 | 바코드 스캔 -> 주문 추가 | Scanner 연동, DB 저장, 그리드 갱신 |
| T-MS-02 | 수동 바코드 입력 | EditText 입력 -> 상품 조회 -> 주문 추가 |
| T-MS-03 | 수량 변경 | 수량 입력/증가 -> DB 반영 |
| T-MS-04 | 회원 검색 | 전화번호 -> 고객 정보 표시 |
| T-MS-05 | 영수증 인쇄 | 비동기 후처리 정상 |
| T-MS-06 | 주문 금액 계산 | 주문금액/할인/총액/거스름돈 정상 계산 |
| T-MS-07 | 바코드 미존재 상품 | 에러 코드 반환, UI 에러 표시 |

---

## 7. 완료 기준

- [ ] 바코드 스캔/수동 입력 -> 주문 추가 플로우
- [ ] Scanner 디바이스 연동
- [ ] 주문 항목 그리드 + 금액 요약 표시
- [ ] 회원 검색 연동
- [ ] 결제내역/고객정보 사이드 패널
- [ ] 영수증 인쇄 비동기 후처리
- [ ] TODO: 마트 모드 vs 별도 MartSellScreen 결정

---

## 8. 작업 명단

| 계층 | 파일 경로 | 설명 |
|---|---|---|
| UI Screen | BrandPosApp/PosUi/src/screens/OrderScreen/components/BarcodeInput.tsx | 바코드 입력 |
| UI Screen | BrandPosApp/PosUi/src/screens/OrderScreen/components/QuantityInput.tsx | 수량 입력 |
| UI Screen | BrandPosApp/PosUi/src/screens/OrderScreen/components/ItemSearchPanel.tsx | 상품 검색 |
| UI Screen | BrandPosApp/PosUi/src/screens/OrderScreen/components/CustomerSearchPanel.tsx | 회원 검색 |
| UI Screen | BrandPosApp/PosUi/src/screens/OrderScreen/components/OrderItemGrid.tsx | 주문 항목 그리드 |
| UI Screen | BrandPosApp/PosUi/src/screens/OrderScreen/components/OrderSummary.tsx | 주문 요약 |
| UI Screen | BrandPosApp/PosUi/src/screens/OrderScreen/components/OrderHeader.tsx | 주문 헤더 |
| UI Screen | BrandPosApp/PosUi/src/screens/OrderScreen/components/OrderActionBar.tsx | 주문 액션바 |
| UI Screen | BrandPosApp/PosUi/src/screens/OrderScreen/components/PaymentQuickView.tsx | 결제내역 사이드 |
| UI Screen | BrandPosApp/PosUi/src/screens/OrderScreen/components/CustomerQuickView.tsx | 고객정보 사이드 |
| UI Screen | BrandPosApp/PosUi/src/screens/OrderScreen/components/OrderFooter.tsx | 공지사항 |
| Shared UI | BrandPosApp/PosUi/src/shared/ui/organisms/ScrollableList.tsx | 스크롤 리스트 |
| Store | BrandPosApp/PosUi/src/store/api/orderApi.ts | 주문 RTK Query |
| Store | BrandPosApp/PosUi/src/store/api/salesApi.ts | 매출 RTK Query |
| Store | BrandPosApp/PosUi/src/store/api/customerApi.ts | 고객 RTK Query |
| Store | BrandPosApp/PosUi/src/store/api/systemApi.ts | 시스템 RTK Query |
| Bridge | BrandPosApp/PosUi/src/bridge/commands/orderCommands.ts | 주문 Bridge 커맨드 |
| C++ Actions | BrandPosApp/Presentation/CEF/InternalBridge/PosRequestActions/Order/OrderActions.cpp | 주문 액션 라우터 |
| C++ UseCase | BrandPosApp/UseCases/Order/CompleteOrderUseCase.cpp | 주문 완료 유스케이스 |
| C++ Domain | BrandPosApp/Domain/Order/OrderMgr.cpp | 주문 매니저 |
| C++ Domain | BrandPosApp/Domain/Item/ItemMgr.cpp | 상품 매니저 |
| C++ Infra | BrandPosApp/Infrastructure/Persistence/SQLite/Tables/Order/OrderItemCrud.cpp | 주문항목 CRUD |
| C++ Infra | BrandPosApp/Infrastructure/Persistence/SQLite/Tables/Item/ItemCrud.cpp | 상품 CRUD |
| C++ Infra | BrandPosApp/Infrastructure/Device/Scanner/ | 바코드 스캐너 |
| Screen Shell | BrandPosApp/PosUi/src/screens/PaymentScreen/components/MartSellDialog.tsx | DONE (shell) |

---

## Appendix: 레거시 참조

### A.1 레거시 다이얼로그 정보

| 항목 | 값 |
|---|---|
| 다이얼로그 ID | IDD_MARTSELL_DLG |
| 리소스 값 | 175 |
| 크기 (DLU) | 512 x 383 |
| 총 UI 요소 수 | 33 (버튼 15, 텍스트 14, 입력 1, 그리드 3) |
| 소스 파일 | Restaurant.rc |

### A.2 주요 레거시 컨트롤 -> 신규 매핑

| 레거시 ID | 용도 | 신규 컴포넌트 |
|---|---|---|
| IDC_BARCODENUM | 바코드 입력 | BarcodeInput |
| IDC_BTN_ENTER | 입력 확인 | BarcodeInput |
| IDC_O_NUMINPUT | 수량 입력 | QuantityInput |
| IDC_O_CUSTSERCH | 회원 검색 | CustomerSearchPanel |
| IDC_O_ITEMSEARCH | 상품 검색 | ItemSearchPanel |
| IDC_BTN_TEAMSEARCH | 단체 검색 (숨김) | TeamSearchPanel |
| IDC_O_SELECT | 주문 항목 선택 | OrderItemGrid |
| IDC_A_BILLPRINT2 | 영수증 인쇄 | OrderActionBar |
| IDC_O_DILIGENCE | 근태 관리 | OrderHeader |
| IDC_O_MINIMIZE | 최소화 | OrderHeader |
| IDC_O_UP/DOWN | 스크롤 | ScrollableList |
| IDC_O_NUMBERADD4 | 수량 증가 | OrderItemGrid |
| IDC_BTN_PLUSIZE | 글자 크기 | OrderItemGrid |
| IDC_O_ORDERMONEY | 주문 금액 | OrderSummary |
| IDC_O_DISMONEY | 할인 금액 | OrderSummary |
| IDC_O_TOTALMONEY | 총 금액 | OrderSummary |
| IDC_O_RECEIVED | 받은 금액 | OrderSummary |
| IDC_O_CHANGEMONEY | 거스름돈 | OrderSummary |
| IDC_S_DATE | 날짜 | OrderHeader |
| IDC_S_TIME | 시간 | OrderHeader |
| IDC_S_POSNO | POS 번호 | OrderHeader |
| IDC_S_EMP | 직원명 | OrderHeader |
| IDC_S_COUNT | 매출 건수 | OrderHeader |
| IDC_S_ITEMQTY | 주문 품목 수 | OrderSummary |
| IDC_O_HOLDVIEW | 보류 건수 | OrderSummary |
| IDC_O_HEADER | 주문 헤더 | OrderHeader |
| IDC_NOTICES1 | 공지사항 (숨김) | OrderFooter |
| IDC_GRID | 주문 항목 그리드 | OrderItemGrid |
| IDC_ACCLIST | 결제내역 리스트 | PaymentQuickView |
| IDC_CUSTLIST | 고객정보 리스트 | CustomerQuickView |
