# STOCK_INPUT - 재고 입고

## 0. 문서정보

| 항목 | 값 |
|------|---|
| 문서 ID | SCR-STOCK-INPUT |
| 레거시 다이얼로그 | IDD_STOCK_INPUT (105) |
| 신규 화면 경로 | screens/StockScreen/Input |
| 작성일 | 2026-04-05 |
| 상태 | 초안 |

## 1. 화면개요

재고 입고 화면이다. 거래처를 선택하고, 카테고리/품목 그리드에서 입고 대상 품목을 고른 뒤, 수량/금액을 숫자패드로 입력하여 입고 내역을 저장한다. 발주 데이터를 불러와 입고 처리하는 기능도 지원한다.

## 2. 상위기준연결

| 기준 문서 | 관련 섹션 |
|-----------|-----------|
| 04-Edge-POS-아키텍처-설계서 | 계층 흐름: UI/Bridge -> UseCases -> Domain/Manager -> Infrastructure |
| 05-Edge-POS-전체-흐름-AZ-가이드 | 재고/발주 업무 흐름 |
| CLAUDE.md | Offline-First, Outbox 규칙, PosRequest/PosRealTime 규칙 |

## 3. 기능목록

| ID | 기능명 | 우선순위 | Bridge Command | UseCase | Domain/Manager | Infrastructure |
|---|---|---|---|---|---|---|
| SI-F01 | 재고 입고 저장 | P0 | STOCK:INPUT | InputStockUseCase | StockMgr | Tables/Stock/StockInputCrud, OutboxStore |
| SI-F02 | 거래처 선택 | P0 | PURCHASE:SEARCH | GetPurchaseHistoryUseCase | StockMgr | Tables/Purchase/SupplierCrud |
| SI-F03 | 발주 불러오기 | P0 | PURCHASE:GET_LIST | GetPurchaseHistoryUseCase | StockMgr | Tables/Purchase/PurchaseCrud |
| SI-F04 | 선택 항목 삭제 | P1 | STOCK:MODIFY | ModifyStockUseCase | StockMgr | Tables/Stock/StockInputCrud |
| SI-F05 | 숫자패드 입력 (0~9, 00, 천) | P1 | - | - | - | - |
| SI-F06 | 백스페이스/클리어 | P1 | - | - | - | - |
| SI-F07 | 날짜 선택 | P1 | - | - | - | - |
| SI-F08 | 시간 선택 | P1 | - | - | - | - |
| SI-F09 | 입고 유형 라디오 선택 | P1 | - | - | - | - |
| SI-F10 | 주문 품목 표시 (조건부) | P2 | STOCK:GET_HISTORY | ViewStockUseCase | StockMgr | Tables/Stock/StockInputCrud |
| SI-F11 | 카테고리 그리드 스크롤 | P2 | - | - | - | - |
| SI-F12 | 품목 그리드 스크롤 | P2 | - | - | - | - |
| SI-F13 | 입고 상세 그리드 스크롤 | P2 | - | - | - | - |
| SI-F14 | 다이얼로그 닫기 | P2 | - (React 라우팅) | - | - | - |

## 4. UI 구조

### 4.1 화면 레이아웃

```
+---------------------------------------------------------------+
| [거래처명]  [거래처 연락처]               [저장] [닫기]         |
| [날짜 선택] [시간 선택]   [거래처 선택]  [발주 불러오기]       |
+----------+-----------+----------------------------------------+
| 카테고리  | 품목 목록  |  입고 유형 (RadioGroup)                |
| DataGrid  | DataGrid  |  [숫자패드 NumPad]                     |
|           |           |  합계 금액: ₩0                         |
|           |           +----------------------------------------+
|           |           |  입고 상세 DataGrid                    |
|           |           |                         [행 삭제]      |
+----------+-----------+----------------------------------------+
```

### 4.2 shared/ui 컴포넌트 매핑

| shared/ui 컴포넌트 | 용도 | 비고 |
|---|---|---|
| shared/ui/organisms/NumPad | 수량/금액 숫자 입력 | 0~9, 00, 천, BS, CLR 통합 |
| shared/ui/organisms/DataGrid | 카테고리 그리드 | 가상 스크롤 적용 |
| shared/ui/organisms/DataGrid | 품목 그리드 | 가상 스크롤 적용 |
| shared/ui/organisms/DataGrid | 입고 상세 그리드 | 가상 스크롤 적용 |
| shared/ui/molecules/DatePicker | 날짜 선택 | 레거시 SysDateTimePick32 대체 |
| shared/ui/molecules/TimePicker | 시간 선택 | 레거시 SysDateTimePick32 대체 |
| shared/ui/atoms/RadioGroup | 입고 유형 선택 | 3개 라디오 옵션 |

## 5. 구현명세

### 5.1 PosRequest 명세

| Command | Payload | 응답 | 비고 |
|---|---|---|---|
| STOCK:INPUT | `{ itemId, qty, unitPrice, date, memo? }` | `{ stockRecord: { stockInputId, itemId, qty, unitPrice, date, memo, createdAt } }` | 멱등성 보장. Error: `ITEM_NOT_FOUND`, `INVALID_QTY` |
| PURCHASE:SEARCH | `{ keyword }` | `{ suppliers: [{ id, name, phone }] }` | 거래처 검색 |
| PURCHASE:GET_LIST | `{ supplierId, startDate, endDate }` | `{ purchases: [...] }` | 발주 목록 조회 |
| STOCK:MODIFY | `{ stockInputId, removeItemCodes: [...] }` | `{ success }` | 항목 삭제 |

### 5.2 RTK Query endpoint

| endpoint | 태그 | 캐시 전략 |
|---|---|---|
| stockApi.getCategories | `StockCategoryList` | TODO: 태그 세분화 확정 필요 |
| stockApi.getItemsByCategory | `StockItem:{categoryId}` | 카테고리별 부분 갱신 |
| stockApi.getStockInputDetail | `StockInput:{id}` | mutation 성공 시 updateQueryData |
| stockApi.getSupplierInfo | `Supplier:{id}` | 거래처 선택 시 캐시 |

### 5.3 UseCase 흐름

**InputStockUseCase (P0)**
1. requestId + idempotencyKey 검사 (RequestLedgerStore)
2. 작업 단위 락 획득
3. StockMgr.createStockInput() - 업무 데이터 생성
4. 트랜잭션 내: 업무 데이터 + Ledger(SUCCEEDED) + Outbox(PENDING) 기록
5. 커밋 후: PosRealTimeSender로 UI 갱신 이벤트 방송
6. 커밋 후: 중앙 서버 sync (비동기, Outbox 경유)

### 5.4 Domain/Manager

| Manager | 메서드 | 책임 |
|---|---|---|
| StockMgr | CreateStockInput() | 입고 데이터 row 생성, 금액 계산, 재고 수량 갱신 |
| StockMgr | RemoveStockItem() | 입고 항목 삭제, 재고 수량 롤백 |

### 5.5 Infrastructure

| 모듈 | 파일 | 책임 |
|---|---|---|
| Tables/Stock/StockInputCrud | StockInputCrud.h/cpp | 입고 데이터 CRUD |
| Tables/Purchase/SupplierCrud | SupplierCrud.h/cpp | 거래처 조회 |
| Tables/Purchase/PurchaseCrud | PurchaseCrud.h/cpp | 발주 목록 조회 |
| OutboxStore | OutboxStore.h/cpp | 중앙 서버 동기화 큐 |
| RequestLedgerStore | RequestLedgerStore.h/cpp | 멱등성 기록 |

### 5.6 PosRealTime 이벤트

| 이벤트 | 발행 시점 | 수신 UI 처리 |
|---|---|---|
| STOCK:INPUT_COMPLETED | InputStockUseCase 커밋 후 | 입고 상세 DataGrid 갱신 (외부 변경만, 자기 요청 무시) |

### 5.7 Permission

| 대상 기능 | 권한 | 비고 |
|---|---|---|
| 재고 입고 저장 (STOCK:INPUT) | 관리자 또는 재고 권한 직원 | TODO: 재고 권한 코드(STOCK_WRITE 등) 확정 필요 |
| 거래처 선택 / 발주 불러오기 | 관리자 또는 재고 권한 직원 | 입고 화면 진입 자체에 권한 필요 |
| 항목 삭제 (STOCK:MODIFY) | 관리자 또는 재고 권한 직원 | 입고 저장과 동일 권한 |

## 6. 테스트

| ID | 시나리오 | 검증 항목 |
|---|---|---|
| SI-T01 | 거래처 선택 후 입고 저장 | DB 저장 확인, Outbox 레코드 생성 확인 |
| SI-T02 | 발주 불러오기 후 입고 저장 | 발주 데이터 반영 확인 |
| SI-T03 | 동일 idempotencyKey 중복 요청 | 멱등성 보장 확인 (1회만 처리) |
| SI-T04 | 입고 항목 삭제 | 재고 수량 롤백 확인 |
| SI-T05 | 오프라인 상태 입고 저장 | 로컬 SQLite 저장 성공, Outbox PENDING 상태 |

## 7. 완료기준

- [ ] InputStockUseCase 트랜잭션/멱등성/Outbox 일괄 처리 구현
- [ ] StockMgr.CreateStockInput() 도메인 로직 구현
- [ ] screens/StockScreen/Input 화면 구현 (shared/ui 컴포넌트 활용)
- [ ] RTK Query stockApi endpoint 구현 및 캐시 갱신 전략 적용
- [ ] PosRequestActions thin router 구현 (STOCK:INPUT -> InputStockUseCase)
- [ ] PosRealTime 이벤트 수신 시 자기 요청 무시 로직 적용
- [ ] 숫자패드 NumPad 공용 컴포넌트 구현 (shared/ui/organisms/NumPad)

## 8. 작업명단

| 계층 | 파일 경로 |
|------|-----------|
| Screen | BrandPosApp/PosUi/src/screens/StockScreen/Input/index.tsx |
| Screen hooks | BrandPosApp/PosUi/src/screens/StockScreen/Input/hooks/useStockInput.ts |
| shared/ui | BrandPosApp/PosUi/src/shared/ui/organisms/NumPad.tsx |
| shared/ui | BrandPosApp/PosUi/src/shared/ui/organisms/DataGrid.tsx |
| shared/ui | BrandPosApp/PosUi/src/shared/ui/molecules/DatePicker.tsx |
| shared/ui | BrandPosApp/PosUi/src/shared/ui/molecules/TimePicker.tsx |
| shared/ui | BrandPosApp/PosUi/src/shared/ui/atoms/RadioGroup.tsx |
| RTK Query | BrandPosApp/PosUi/src/store/api/stockApi.ts |
| Bridge Command | BrandPosApp/PosUi/src/bridge/commands/stockCommands.ts |
| PosRequestActions | BrandPosApp/Presentation/CEF/InternalBridge/PosRequestActions/Stock/StockActions.cpp |
| PosRequestActions | BrandPosApp/Presentation/CEF/InternalBridge/PosRequestActions/Stock/StockActions.h |
| UseCase | BrandPosApp/UseCases/Stock/InputStockUseCase.cpp |
| UseCase | BrandPosApp/UseCases/Stock/InputStockUseCase.h |
| UseCase | BrandPosApp/UseCases/Stock/ModifyStockUseCase.cpp |
| UseCase | BrandPosApp/UseCases/Stock/ModifyStockUseCase.h |
| UseCase | BrandPosApp/UseCases/Stock/ViewStockUseCase.cpp |
| UseCase | BrandPosApp/UseCases/Stock/ViewStockUseCase.h |
| Domain | BrandPosApp/Domain/Stock/StockMgr.cpp |
| Domain | BrandPosApp/Domain/Stock/StockMgr.h |
| Infrastructure | BrandPosApp/Infrastructure/Persistence/SQLite/Tables/Stock/StockInputCrud.cpp |
| Infrastructure | BrandPosApp/Infrastructure/Persistence/SQLite/Tables/Stock/StockInputCrud.h |
| Infrastructure | BrandPosApp/Infrastructure/Persistence/SQLite/Tables/Purchase/SupplierCrud.cpp |
| Infrastructure | BrandPosApp/Infrastructure/Persistence/SQLite/Tables/Purchase/SupplierCrud.h |
| Infrastructure | BrandPosApp/Infrastructure/Persistence/SQLite/Tables/Purchase/PurchaseCrud.cpp |
| Infrastructure | BrandPosApp/Infrastructure/Persistence/SQLite/Tables/Purchase/PurchaseCrud.h |

---

## Appendix: 레거시 참조

### 레거시 다이얼로그 정보

| 항목 | 값 |
|------|---|
| 다이얼로그 ID | IDD_STOCK_INPUT |
| 리소스 값 | 105 |
| 크기 (DLU) | 512 x 384 |
| 다이얼로그 타입 | DIALOGEX |
| 스타일 | DS_SETFONT \| WS_POPUP |
| 폰트 | 10, "System", 0, 0, 0x0 |
| 소스 파일 | Restaurant.rc |
| 총 UI 요소 수 | 38 (버튼 26, 텍스트/라벨 4, 입력 필드 5, 그리드/리스트 3) |

### 레거시 UI 요소 → 신규 매핑

| 레거시 ID | 레거시 용도 | 신규 대응 |
|---|---|---|
| IDC_SAVE | 저장 버튼 | screens/StockScreen/Input > 저장 버튼 |
| IDCANCEL | 닫기 버튼 | React 라우팅으로 대체 |
| IDC_SUPPLY | 거래처 선택 버튼 | 거래처 선택 모달 |
| IDC_SELDEL | 행 삭제 버튼 | 행 삭제 버튼 |
| IDC_PURCALL | 발주 불러오기 버튼 | 발주 불러오기 버튼 |
| IDC_N_NUM0~9, IDC_N_NUM00, IDC_N_NUM000 | 숫자패드 | shared/ui/organisms/NumPad |
| IDC_N_NUMBS, IDC_N_NUMCLR | 백스페이스/클리어 | shared/ui/organisms/NumPad |
| IDC_DATE | 날짜 선택 (SysDateTimePick32) | shared/ui/molecules/DatePicker |
| IDC_TIME | 시간 선택 (SysDateTimePick32) | shared/ui/molecules/TimePicker |
| IDC_RAD_PUR, IDC_RAD_PUR2, IDC_RAD_PUR3 | 입고 유형 라디오 | shared/ui/atoms/RadioGroup |
| IDC_GRID | 카테고리 그리드 (MFCGridCtrl) | shared/ui/organisms/DataGrid |
| IDC_GRID2 | 품목 그리드 (MFCGridCtrl) | shared/ui/organisms/DataGrid |
| IDC_GRID4 | 입고 상세 그리드 (MFCGridCtrl) | shared/ui/organisms/DataGrid |
| IDC_SUPPLYNAME | 거래처명 표시 | 텍스트 컴포넌트 |
| IDC_SUPPLYPHONE | 거래처 연락처 표시 | 텍스트 컴포넌트 |
| IDC_SUPPLYVAR | 거래처 부가 정보 (숨김) | 조건부 렌더링 |
| IDC_STA_TOTPUR | 총 입고금액 합계 | 합계 금액 표시 |
| IDC_UP/DOWN 시리즈 | 스크롤 버튼 (6개) | 가상 스크롤로 대체 |
| IDC_ORDERITEM | 주문 품목 (숨김) | 조건부 렌더링 |

---

## Progress

| 날짜 | 작업 | 상태 |
|------|------|------|
| 2026-04-05 | UI Shell 구현: `BrandPosApp/PosUi/src/screens/StockScreen/components/StockInputDialog.tsx` | DONE |
