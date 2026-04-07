# PURCHASEMGR_DLG - 발주 관리

## 0. 문서정보

| 항목 | 값 |
|------|---|
| 문서 ID | SCR-PURCHASEMGR |
| 레거시 다이얼로그 | IDD_PURCHASEMGR_DLG (190) |
| 신규 화면 경로 | screens/PurchaseScreen |
| 작성일 | 2026-04-05 |
| 상태 | 초안 |

## 1. 화면개요

발주 관리 화면이다. 발주의 신규 생성, 저장, 삭제, 조회를 포함하는 복합 CRUD 화면이다. 거래처를 선택하고, 상품을 바코드/검색으로 추가하며, 발주 유형/정산 유형을 지정하여 발주서를 관리한다. 금액(세액/부가세/면세/총매입액)은 UI에서 실시간 계산하고, 저장 시 UseCase에서 검증한다.

## 2. 상위기준연결

| 기준 문서 | 관련 섹션 |
|-----------|-----------|
| 04-Edge-POS-아키텍처-설계서 | 계층 흐름: UI/Bridge -> UseCases -> Domain/Manager -> Infrastructure |
| 05-Edge-POS-전체-흐름-AZ-가이드 | 재고/발주 업무 흐름 |
| CLAUDE.md | Offline-First, Outbox 규칙, 멱등성/Ledger 규칙 |

## 3. 기능목록

| ID | 기능명 | 우선순위 | Bridge Command | UseCase | Domain/Manager | Infrastructure |
|---|---|---|---|---|---|---|
| PM-F01 | 신규 발주 생성 | P0 | PURCHASE:CREATE | CreatePurchaseUseCase | StockMgr | Tables/Purchase/PurchaseCrud, OutboxStore |
| PM-F02 | 발주 저장 | P0 | PURCHASE:CREATE | CreatePurchaseUseCase | StockMgr | Tables/Purchase/PurchaseCrud, OutboxStore |
| PM-F03 | 발주 삭제 | P0 | PURCHASE:MODIFY | ModifyPurchaseUseCase | StockMgr | Tables/Purchase/PurchaseCrud, OutboxStore |
| PM-F04 | 발주 조회 | P0 | PURCHASE:GET_LIST | GetPurchaseHistoryUseCase | StockMgr | Tables/Purchase/PurchaseCrud |
| PM-F05 | 거래처1 선택 | P0 | PURCHASE:SEARCH | GetPurchaseHistoryUseCase | StockMgr | Tables/Purchase/SupplierCrud |
| PM-F06 | 상품 검색 | P0 | PURCHASE:SEARCH | GetPurchaseHistoryUseCase | ItemMgr | Tables/Stock/ItemCrud |
| PM-F07 | 거래처2 선택 | P1 | PURCHASE:SEARCH | GetPurchaseHistoryUseCase | StockMgr | Tables/Purchase/SupplierCrud |
| PM-F08 | 상품 취소 (행 제거) | P1 | PURCHASE:MODIFY | ModifyPurchaseUseCase | StockMgr | Tables/Purchase/PurchaseCrud |
| PM-F09 | 바코드 인쇄 | P1 | PURCHASE:SEARCH | GetPurchaseHistoryUseCase | StockMgr, SystemMgr | 장치 I/O (비동기 후처리) |
| PM-F10 | 바코드/상품명 입력 | P1 | - | - | - | - |
| PM-F11 | 시작일 선택 | P1 | - | - | - | - |
| PM-F12 | 종료일 선택 | P1 | - | - | - | - |
| PM-F13 | 발주일 선택 | P1 | - | - | - | - |
| PM-F14 | 메모 입력 | P2 | - | - | - | - |
| PM-F15 | 발주 유형 라디오 선택 | P1 | - | - | - | - |
| PM-F16 | 정산 유형 라디오 선택 | P1 | - | - | - | - |
| PM-F17 | 거래처1 콤보박스 (조건부) | P2 | - | - | - | - |
| PM-F18 | 거래처2 콤보박스 (조건부) | P2 | - | - | - | - |
| PM-F19 | F5 단축키 (바코드 조회) | P2 | PURCHASE:SEARCH | GetPurchaseHistoryUseCase | ItemMgr | Tables/Stock/ItemCrud |
| PM-F20 | 다이얼로그 닫기 | P2 | - (React 라우팅) | - | - | - |

## 4. UI 구조

### 4.1 화면 레이아웃

```
+---------------------------------------------------------------+
|                          [신규] [저장] [삭제] [닫기]           |
+---------------------------------------------------------------+
| [시작일]~[종료일]  [발주일]   [상태 배지]                      |
| 거래처1: [선택][조회]   거래처2: [선택]                        |
| 매출유형: (o)유형1 (o)유형2   정산: (o)정산1 (o)정산2          |
| 메모: [_________________]                                      |
|   세액: ₩0  부가세: ₩0  면세: ₩0  총매입액: ₩0               |
+---------------+-----------------------------------------------+
| 발주 목록     | [바코드/상품명 입력 (F5)] [상품조회] [바코드인쇄] [상품취소] |
| DataGrid      | 발주 상세 DataGrid                             |
|               |                                                |
+---------------+-----------------------------------------------+
```

### 4.2 shared/ui 컴포넌트 매핑

| shared/ui 컴포넌트 | 용도 | 비고 |
|---|---|---|
| shared/ui/organisms/DataGrid | 발주 목록 그리드 | IDC_GRID 대체 |
| shared/ui/organisms/DataGrid | 발주 상세 그리드 | IDC_GRID2 대체 |
| shared/ui/molecules/DatePicker | 시작일/종료일/발주일 선택 | 3개 인스턴스 |
| shared/ui/molecules/Select | 거래처 콤보박스 (조건부) | IDC_CB_PUR, IDC_CB_PUR2 대체 |
| shared/ui/atoms/TextInput | 바코드/상품명 입력 | IDC_EDT_BARCODE 대체 |
| shared/ui/atoms/TextInput | 메모 입력 | IDC_EDT_MEMO 대체 |
| shared/ui/atoms/RadioGroup | 발주 유형 선택 | 2개 옵션 |
| shared/ui/atoms/RadioGroup | 정산 유형 선택 | 2개 옵션 |

## 5. 구현명세

### 5.1 PosRequest 명세

| Command | Payload | 응답 | 비고 |
|---|---|---|---|
| PURCHASE:CREATE | `{ supplierId, items: [{ itemId, qty, unitPrice }], date }` | `{ purchase: { purchaseId, supplierId, items, date, totalAmount, createdAt } }` | 멱등성 보장. Error: `SUPPLIER_NOT_FOUND` |
| PURCHASE:MODIFY | `{ purchaseId, items: [{ itemId, qty, unitPrice }] }` | `{ purchase: { purchaseId, items, totalAmount, updatedAt } }` | 항목 수정. Error: `PURCHASE_NOT_FOUND` |
| PURCHASE:GET_LIST | `{ startDate, endDate }` | `{ purchases: [...] }` | 조회. Error: (없음) |
| PURCHASE:SEARCH | `{ type: "supplier" \| "item", keyword }` | `{ results: [...] }` | 거래처/상품 검색 |

### 5.2 RTK Query endpoint

| endpoint | 태그 | 캐시 전략 |
|---|---|---|
| purchaseApi.getPurchaseList | `PurchaseList:{startDate}-{endDate}` | 기간별 태그 |
| purchaseApi.getPurchaseDetail | `Purchase:{id}` | mutation 성공 시 updateQueryData |
| purchaseApi.getSupplierInfo | `Supplier:{id}` | 거래처 선택 시 캐시 |

### 5.3 UseCase 흐름

**CreatePurchaseUseCase (P0)**
1. requestId + idempotencyKey 검사 (RequestLedgerStore)
2. 작업 단위 락 획득
3. StockMgr.CreatePurchase() - 발주 데이터 생성, 금액 검증
4. 트랜잭션 내: 업무 데이터 + Ledger(SUCCEEDED) + Outbox(PENDING) 기록
5. 커밋 후: PosRealTimeSender로 UI 갱신 이벤트 방송

**ModifyPurchaseUseCase (P0)**
1. requestId + idempotencyKey 검사
2. StockMgr.DeletePurchase() 또는 StockMgr.RemovePurchaseItem()
3. 트랜잭션 내: 업무 데이터 + Ledger + Outbox 기록
4. 커밋 후: PosRealTimeSender 방송

### 5.4 Domain/Manager

| Manager | 메서드 | 책임 |
|---|---|---|
| StockMgr | CreatePurchase() | 발주 데이터 생성, 세액/부가세/면세/총매입액 계산 검증 |
| StockMgr | DeletePurchase() | 발주 삭제 |
| StockMgr | RemovePurchaseItem() | 발주 항목 제거 |
| ItemMgr | SearchItem() | 바코드/상품명 검색 |

### 5.5 Infrastructure

| 모듈 | 파일 | 책임 |
|---|---|---|
| Tables/Purchase/PurchaseCrud | PurchaseCrud.h/cpp | 발주 CRUD |
| Tables/Purchase/SupplierCrud | SupplierCrud.h/cpp | 거래처 조회 |
| Tables/Stock/ItemCrud | ItemCrud.h/cpp | 상품 검색 |
| OutboxStore | OutboxStore.h/cpp | 중앙 서버 동기화 큐 |
| RequestLedgerStore | RequestLedgerStore.h/cpp | 멱등성 기록 |

### 5.6 PosRealTime 이벤트

| 이벤트 | 발행 시점 | 수신 UI 처리 |
|---|---|---|
| PURCHASE:CREATED | CreatePurchaseUseCase 커밋 후 | 발주 목록 갱신 (외부 변경만) |
| PURCHASE:MODIFIED | ModifyPurchaseUseCase 커밋 후 | 발주 상세 갱신 (외부 변경만) |

### 5.7 Permission

| 대상 기능 | 권한 | 비고 |
|---|---|---|
| 발주 생성 (PURCHASE:CREATE) | 관리자 전용 | TODO: 발주 권한 코드(PURCHASE_WRITE 등) 확정 필요 |
| 발주 수정 (PURCHASE:MODIFY) | 관리자 전용 | 생성과 동일 권한 |
| 발주 조회 (PURCHASE:GET_LIST) | 관리자 전용 | 발주 화면 진입 자체에 관리자 권한 필요 |
| 거래처/상품 검색 (PURCHASE:SEARCH) | 관리자 전용 | 발주 화면 내 기능 |

## 6. 테스트

| ID | 시나리오 | 검증 항목 |
|---|---|---|
| PM-T01 | 신규 발주 생성 후 저장 | DB 저장, Outbox 생성 확인 |
| PM-T02 | 발주 삭제 | DB 삭제, Outbox 기록 확인 |
| PM-T03 | 동일 idempotencyKey 중복 요청 | 멱등성 보장 확인 |
| PM-T04 | 바코드 검색 후 상품 추가 | 상품 정보 정확성, 금액 재계산 |
| PM-T05 | 세액/부가세/면세 계산 검증 | UI 표시 금액 = UseCase 검증 금액 |
| PM-T06 | 바코드 인쇄 | 비동기 후처리 정상 완료 |

## 7. 완료기준

- [ ] CreatePurchaseUseCase 트랜잭션/멱등성/Outbox 일괄 처리 구현
- [ ] ModifyPurchaseUseCase 삭제/항목제거 구현
- [ ] StockMgr 발주 관련 도메인 로직 구현
- [ ] screens/PurchaseScreen 화면 구현 (shared/ui 컴포넌트 활용)
- [ ] RTK Query purchaseApi endpoint 구현 및 캐시 갱신 전략 적용
- [ ] 금액 계산 유틸 (`shared/utils/taxCalculator`) 구현
- [ ] PosRequestActions thin router 구현
- [ ] F5 단축키 React 키보드 이벤트 핸들러 구현

## 8. 작업명단

| 계층 | 파일 경로 |
|------|-----------|
| Screen | BrandPosApp/PosUi/src/screens/PurchaseScreen/index.tsx |
| Screen hooks | BrandPosApp/PosUi/src/screens/PurchaseScreen/hooks/usePurchase.ts |
| shared/ui | BrandPosApp/PosUi/src/shared/ui/organisms/DataGrid.tsx |
| shared/ui | BrandPosApp/PosUi/src/shared/ui/molecules/DatePicker.tsx |
| shared/ui | BrandPosApp/PosUi/src/shared/ui/molecules/Select.tsx |
| shared/ui | BrandPosApp/PosUi/src/shared/ui/atoms/TextInput.tsx |
| shared/ui | BrandPosApp/PosUi/src/shared/ui/atoms/RadioGroup.tsx |
| shared/utils | BrandPosApp/PosUi/src/shared/utils/taxCalculator.ts |
| RTK Query | BrandPosApp/PosUi/src/store/api/purchaseApi.ts |
| Bridge Command | BrandPosApp/PosUi/src/bridge/commands/purchaseCommands.ts |
| PosRequestActions | BrandPosApp/Presentation/CEF/InternalBridge/PosRequestActions/Purchase/PurchaseActions.cpp |
| PosRequestActions | BrandPosApp/Presentation/CEF/InternalBridge/PosRequestActions/Purchase/PurchaseActions.h |
| UseCase | BrandPosApp/UseCases/Purchase/CreatePurchaseUseCase.cpp |
| UseCase | BrandPosApp/UseCases/Purchase/CreatePurchaseUseCase.h |
| UseCase | BrandPosApp/UseCases/Purchase/ModifyPurchaseUseCase.cpp |
| UseCase | BrandPosApp/UseCases/Purchase/ModifyPurchaseUseCase.h |
| UseCase | BrandPosApp/UseCases/Purchase/GetPurchaseHistoryUseCase.cpp |
| UseCase | BrandPosApp/UseCases/Purchase/GetPurchaseHistoryUseCase.h |
| Domain | BrandPosApp/Domain/Stock/StockMgr.cpp |
| Domain | BrandPosApp/Domain/Stock/StockMgr.h |
| Domain | BrandPosApp/Domain/Item/ItemMgr.cpp |
| Domain | BrandPosApp/Domain/Item/ItemMgr.h |
| Infrastructure | BrandPosApp/Infrastructure/Persistence/SQLite/Tables/Purchase/PurchaseCrud.cpp |
| Infrastructure | BrandPosApp/Infrastructure/Persistence/SQLite/Tables/Purchase/PurchaseCrud.h |
| Infrastructure | BrandPosApp/Infrastructure/Persistence/SQLite/Tables/Purchase/SupplierCrud.cpp |
| Infrastructure | BrandPosApp/Infrastructure/Persistence/SQLite/Tables/Purchase/SupplierCrud.h |
| Infrastructure | BrandPosApp/Infrastructure/Persistence/SQLite/Tables/Stock/ItemCrud.cpp |
| Infrastructure | BrandPosApp/Infrastructure/Persistence/SQLite/Tables/Stock/ItemCrud.h |

---

## Appendix: 레거시 참조

### 레거시 다이얼로그 정보

| 항목 | 값 |
|------|---|
| 다이얼로그 ID | IDD_PURCHASEMGR_DLG |
| 리소스 값 | 190 |
| 크기 (DLU) | 512 x 384 |
| 다이얼로그 타입 | DIALOGEX |
| 스타일 | DS_SETFONT \| WS_POPUP |
| 폰트 | 10, "System", 0, 0, 0x1 |
| 소스 파일 | Restaurant.rc |
| 총 UI 요소 수 | 43 (버튼 11, 텍스트/라벨 19, 입력 필드 11, 그리드/리스트 2) |

### 레거시 UI 요소 → 신규 매핑

| 레거시 ID | 레거시 용도 | 신규 대응 |
|---|---|---|
| IDC_BTN_NEW | 신규 버튼 | screens/PurchaseScreen > 신규 버튼 |
| IDC_BTN_SAVE | 저장 버튼 | screens/PurchaseScreen > 저장 버튼 |
| IDC_BTN_DEL | 삭제 버튼 | screens/PurchaseScreen > 삭제 버튼 |
| IDCANCEL | 닫기 버튼 | React 라우팅으로 대체 |
| IDOK | 확인 (숨김) | 제거 |
| IDC_BTN_SUPPLY, IDC_BTN_SUPPLY2 | 거래처 선택 버튼 | 거래처 선택 모달 |
| IDC_BTN_PURSEARCH | 조회 버튼 | 조회 버튼 |
| IDC_BTN_ITEMSEARCH | 상품 검색 버튼 | 상품 검색 버튼 |
| IDC_BTN_ITEMCAN | 상품 취소 버튼 | 행 삭제 버튼 |
| IDC_BTN_BARPRN | 바코드 인쇄 버튼 | 바코드 인쇄 버튼 (비동기 후처리) |
| IDC_EDT_BARCODE | 바코드 입력 | shared/ui/atoms/TextInput |
| IDC_EDT_MEMO | 메모 입력 | shared/ui/atoms/TextInput |
| IDC_STARTDATE, IDC_ENDDATE, IDC_PURDATE | 날짜 선택 (SysDateTimePick32) | shared/ui/molecules/DatePicker |
| IDC_RAD_PUR, IDC_RAD_PUR2 | 발주 유형 라디오 | shared/ui/atoms/RadioGroup |
| IDC_RAD_ACC, IDC_RAD_ACC2 | 정산 유형 라디오 | shared/ui/atoms/RadioGroup |
| IDC_CB_PUR, IDC_CB_PUR2 | 거래처 콤보박스 (숨김) | shared/ui/molecules/Select (조건부) |
| IDC_STA_TAX | 세액 표시 | 금액 표시 영역 |
| IDC_STA_VAT | 부가세 표시 | 금액 표시 영역 |
| IDC_STA_TAXFREE | 면세 표시 | 금액 표시 영역 |
| IDC_STA_TOTPUR | 총매입액 표시 | 합계 금액 표시 |
| IDC_STA_SUPPLY, IDC_STA_SUPPLY2 | 거래처명 표시 | 거래처 텍스트 |
| IDC_STA_STATE | 상태 표시 | 상태 배지 |
| IDC_GRID | 발주 목록 그리드 (MFCGridCtrl) | shared/ui/organisms/DataGrid |
| IDC_GRID2 | 발주 상세 그리드 (MFCGridCtrl) | shared/ui/organisms/DataGrid |
| IDC_STATIC 시리즈 (숨김 라벨) | 폼 라벨 | React 폼 라벨로 자연스럽게 전환 |

---

## Progress

| 날짜 | 작업 | 상태 |
|------|------|------|
| 2026-04-05 | UI Shell 구현: `BrandPosApp/PosUi/src/screens/StockScreen/components/PurchaseManagerDialog.tsx` | DONE |
