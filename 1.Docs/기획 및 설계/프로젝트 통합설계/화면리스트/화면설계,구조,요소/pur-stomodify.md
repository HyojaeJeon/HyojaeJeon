# PUR_STOMODIFY - 재고 수정

## 0. 문서정보

| 항목 | 값 |
|------|---|
| 문서 ID | SCR-PUR-STOMODIFY |
| 레거시 다이얼로그 | IDD_PUR_STOMODIFY (194) |
| 신규 화면 경로 | screens/PurchaseScreen/Modify |
| 작성일 | 2026-04-05 |
| 상태 | 초안 |

## 1. 화면개요

재고 수정 화면이다. 발주 관리(purchasemgr-dlg)와 구조적으로 유사하며, 거래처 선택 대신 수정 유형 라디오(3종: 증가/감소/조정)를 사용한다. 기존 발주/입고 내역을 조회하여 재고 수량을 수정하고, 금액(세액/부가세/면세/총매입액)을 재계산한다.

## 2. 상위기준연결

| 기준 문서 | 관련 섹션 |
|-----------|-----------|
| 04-Edge-POS-아키텍처-설계서 | 계층 흐름: UI/Bridge -> UseCases -> Domain/Manager -> Infrastructure |
| 05-Edge-POS-전체-흐름-AZ-가이드 | 재고/발주 업무 흐름 |
| CLAUDE.md | Offline-First, Outbox 규칙, 멱등성/Ledger 규칙 |

## 3. 기능목록

| ID | 기능명 | 우선순위 | Bridge Command | UseCase | Domain/Manager | Infrastructure |
|---|---|---|---|---|---|---|
| PS-F01 | 재고 수정 신규 | P0 | STOCK:MODIFY | ModifyStockUseCase | StockMgr | Tables/Stock/StockModifyCrud, OutboxStore |
| PS-F02 | 재고 수정 저장 | P0 | STOCK:MODIFY | ModifyStockUseCase | StockMgr | Tables/Stock/StockModifyCrud, OutboxStore |
| PS-F03 | 재고 수정 삭제 | P0 | STOCK:MODIFY | ModifyStockUseCase | StockMgr | Tables/Stock/StockModifyCrud, OutboxStore |
| PS-F04 | 상품 검색 | P0 | PURCHASE:SEARCH | GetPurchaseHistoryUseCase | ItemMgr | Tables/Stock/ItemCrud |
| PS-F05 | 발주 조회 | P0 | PURCHASE:GET_LIST | GetPurchaseHistoryUseCase | StockMgr | Tables/Purchase/PurchaseCrud |
| PS-F06 | 상품 취소 (행 제거) | P1 | STOCK:MODIFY | ModifyStockUseCase | StockMgr | Tables/Stock/StockModifyCrud |
| PS-F07 | 시작일 선택 | P1 | - | - | - | - |
| PS-F08 | 종료일 선택 | P1 | - | - | - | - |
| PS-F09 | 수정일 선택 | P1 | - | - | - | - |
| PS-F10 | 바코드/상품명 입력 | P1 | - | - | - | - |
| PS-F11 | 수정 유형 라디오 선택 (3종) | P1 | - | - | - | - |
| PS-F12 | 메모 입력 | P2 | - | - | - | - |
| PS-F13 | F5 단축키 (바코드 조회) | P2 | PURCHASE:SEARCH | GetPurchaseHistoryUseCase | ItemMgr | Tables/Stock/ItemCrud |
| PS-F14 | 다이얼로그 닫기 | P2 | - (React 라우팅) | - | - | - |

## 4. UI 구조

### 4.1 화면 레이아웃

```
+---------------------------------------------------------------+
|                          [신규] [저장] [삭제] [닫기]           |
+---------------------------------------------------------------+
| [시작일]~[종료일]  [수정일]   [상태 배지]                      |
| 수정유형: (o)증가 (o)감소 (o)조정                [조회]        |
| 메모: [_________________]                                      |
|   세액: ₩0  부가세: ₩0  면세: ₩0  총매입액: ₩0               |
+---------------+-----------------------------------------------+
| 수정 목록     | [바코드/상품명 입력 (F5)] [상품조회] [상품취소] |
| DataGrid      | 수정 상세 DataGrid                             |
|               |                                                |
+---------------+-----------------------------------------------+
```

### 4.2 shared/ui 컴포넌트 매핑

| shared/ui 컴포넌트 | 용도 | 비고 |
|---|---|---|
| shared/ui/organisms/DataGrid | 수정 목록 그리드 | IDC_GRID 대체 |
| shared/ui/organisms/DataGrid | 수정 상세 그리드 | IDC_GRID2 대체 |
| shared/ui/molecules/DatePicker | 시작일/종료일/수정일 선택 | 3개 인스턴스 |
| shared/ui/atoms/TextInput | 바코드/상품명 입력 | IDC_EDT_BARCODE 대체 |
| shared/ui/atoms/TextInput | 메모 입력 | IDC_EDT_MEMO 대체 |
| shared/ui/atoms/RadioGroup | 수정 유형 선택 | 3개 옵션 (증가/감소/조정) |

## 5. 구현명세

### 5.1 PosRequest 명세

| Command | Payload | 응답 | 비고 |
|---|---|---|---|
| PURCHASE:MODIFY | `{ purchaseId, items: [{ itemId, qty, unitPrice }] }` | `{ purchase: { purchaseId, items, totalAmount, updatedAt } }` | 재고 수정 시 발주 항목 수정 경유. Error: `PURCHASE_NOT_FOUND` |
| PURCHASE:GET_LIST | `{ startDate, endDate }` | `{ purchases: [...] }` | 조회. Error: (없음) |
| PURCHASE:SEARCH | `{ type: "item", keyword }` | `{ results: [...] }` | 상품 검색 |

### 5.2 RTK Query endpoint

| endpoint | 태그 | 캐시 전략 |
|---|---|---|
| purchaseApi.getModifyList | `ModifyList:{startDate}-{endDate}` | 기간별 태그 |
| purchaseApi.getModifyDetail | `Modify:{id}` | mutation 성공 시 updateQueryData |

### 5.3 UseCase 흐름

**ModifyStockUseCase (P0)**
1. requestId + idempotencyKey 검사 (RequestLedgerStore)
2. 작업 단위 락 획득
3. StockMgr.CreateStockModify() / DeleteStockModify() / RemoveModifyItem() - 수정 유형에 따라 분기
4. 금액 재계산 검증 (세액/부가세/면세/총매입액)
5. 트랜잭션 내: 업무 데이터 + Ledger(SUCCEEDED) + Outbox(PENDING) 기록
6. 커밋 후: PosRealTimeSender로 UI 갱신 이벤트 방송

### 5.4 Domain/Manager

| Manager | 메서드 | 책임 |
|---|---|---|
| StockMgr | CreateStockModify() | 재고 수정 데이터 생성, 수정 유형별 재고 수량 변경 |
| StockMgr | DeleteStockModify() | 재고 수정 삭제, 수량 롤백 |
| StockMgr | RemoveModifyItem() | 수정 항목 제거 |
| ItemMgr | SearchItem() | 바코드/상품명 검색 |

### 5.5 Infrastructure

| 모듈 | 파일 | 책임 |
|---|---|---|
| Tables/Stock/StockModifyCrud | StockModifyCrud.h/cpp | 재고 수정 CRUD |
| Tables/Purchase/PurchaseCrud | PurchaseCrud.h/cpp | 발주 목록 조회 |
| Tables/Stock/ItemCrud | ItemCrud.h/cpp | 상품 검색 |
| OutboxStore | OutboxStore.h/cpp | 중앙 서버 동기화 큐 |
| RequestLedgerStore | RequestLedgerStore.h/cpp | 멱등성 기록 |

### 5.6 PosRealTime 이벤트

| 이벤트 | 발행 시점 | 수신 UI 처리 |
|---|---|---|
| STOCK:MODIFY_COMPLETED | ModifyStockUseCase 커밋 후 | 수정 목록/상세 갱신 (외부 변경만) |

### 5.7 Permission

| 대상 기능 | 권한 | 비고 |
|---|---|---|
| 재고 수정 (PURCHASE:MODIFY) | 관리자 전용 | TODO: 발주/재고 수정 권한 코드 통합 여부 확정 필요 |
| 발주 조회 (PURCHASE:GET_LIST) | 관리자 전용 | 수정 화면 진입 자체에 관리자 권한 필요 |
| 상품 검색 (PURCHASE:SEARCH) | 관리자 전용 | 수정 화면 내 기능 |

## 6. 테스트

| ID | 시나리오 | 검증 항목 |
|---|---|---|
| PS-T01 | 증가 유형 재고 수정 저장 | 재고 수량 증가 확인, DB/Outbox 기록 |
| PS-T02 | 감소 유형 재고 수정 저장 | 재고 수량 감소 확인 |
| PS-T03 | 조정 유형 재고 수정 저장 | 재고 수량 조정(덮어쓰기) 확인 |
| PS-T04 | 재고 수정 삭제 | 수량 롤백, DB 삭제 확인 |
| PS-T05 | 동일 idempotencyKey 중복 요청 | 멱등성 보장 확인 |
| PS-T06 | 금액 계산 검증 | 세액/부가세/면세/총매입액 정확성 |

## 7. 완료기준

- [ ] ModifyStockUseCase 트랜잭션/멱등성/Outbox 일괄 처리 구현
- [ ] StockMgr 재고 수정 관련 도메인 로직 구현 (3종 수정 유형)
- [ ] screens/PurchaseScreen/Modify 화면 구현 (shared/ui 컴포넌트 활용)
- [ ] purchasemgr-dlg와 공통 레이아웃 컴포넌트 공유
- [ ] 금액 계산 유틸 (`shared/utils/taxCalculator`) 재사용
- [ ] RTK Query endpoint 구현 및 캐시 갱신 전략 적용
- [ ] F5 단축키 React 키보드 이벤트 핸들러 구현

## 8. 작업명단

| 계층 | 파일 경로 |
|------|-----------|
| Screen | BrandPosApp/PosUi/src/screens/PurchaseScreen/Modify/index.tsx |
| Screen hooks | BrandPosApp/PosUi/src/screens/PurchaseScreen/Modify/hooks/useStockModify.ts |
| shared/ui | BrandPosApp/PosUi/src/shared/ui/organisms/DataGrid.tsx |
| shared/ui | BrandPosApp/PosUi/src/shared/ui/molecules/DatePicker.tsx |
| shared/ui | BrandPosApp/PosUi/src/shared/ui/atoms/TextInput.tsx |
| shared/ui | BrandPosApp/PosUi/src/shared/ui/atoms/RadioGroup.tsx |
| shared/utils | BrandPosApp/PosUi/src/shared/utils/taxCalculator.ts |
| RTK Query | BrandPosApp/PosUi/src/store/api/purchaseApi.ts |
| Bridge Command | BrandPosApp/PosUi/src/bridge/commands/purchaseCommands.ts |
| PosRequestActions | BrandPosApp/Presentation/CEF/InternalBridge/PosRequestActions/Stock/StockActions.cpp |
| PosRequestActions | BrandPosApp/Presentation/CEF/InternalBridge/PosRequestActions/Stock/StockActions.h |
| UseCase | BrandPosApp/UseCases/Stock/ModifyStockUseCase.cpp |
| UseCase | BrandPosApp/UseCases/Stock/ModifyStockUseCase.h |
| UseCase | BrandPosApp/UseCases/Purchase/GetPurchaseHistoryUseCase.cpp |
| UseCase | BrandPosApp/UseCases/Purchase/GetPurchaseHistoryUseCase.h |
| Domain | BrandPosApp/Domain/Stock/StockMgr.cpp |
| Domain | BrandPosApp/Domain/Stock/StockMgr.h |
| Domain | BrandPosApp/Domain/Item/ItemMgr.cpp |
| Domain | BrandPosApp/Domain/Item/ItemMgr.h |
| Infrastructure | BrandPosApp/Infrastructure/Persistence/SQLite/Tables/Stock/StockModifyCrud.cpp |
| Infrastructure | BrandPosApp/Infrastructure/Persistence/SQLite/Tables/Stock/StockModifyCrud.h |
| Infrastructure | BrandPosApp/Infrastructure/Persistence/SQLite/Tables/Stock/ItemCrud.cpp |
| Infrastructure | BrandPosApp/Infrastructure/Persistence/SQLite/Tables/Stock/ItemCrud.h |
| Infrastructure | BrandPosApp/Infrastructure/Persistence/SQLite/Tables/Purchase/PurchaseCrud.cpp |
| Infrastructure | BrandPosApp/Infrastructure/Persistence/SQLite/Tables/Purchase/PurchaseCrud.h |

---

## Appendix: 레거시 참조

### 레거시 다이얼로그 정보

| 항목 | 값 |
|------|---|
| 다이얼로그 ID | IDD_PUR_STOMODIFY |
| 리소스 값 | 194 |
| 크기 (DLU) | 512 x 384 |
| 다이얼로그 타입 | DIALOGEX |
| 스타일 | DS_SETFONT \| WS_POPUP |
| 폰트 | 10, "System", 0, 0, 0x1 |
| 소스 파일 | Restaurant.rc |
| 총 UI 요소 수 | 31 (버튼 8, 텍스트/라벨 13, 입력 필드 8, 그리드/리스트 2) |

### 레거시 UI 요소 → 신규 매핑

| 레거시 ID | 레거시 용도 | 신규 대응 |
|---|---|---|
| IDC_BTN_NEW | 신규 버튼 | screens/PurchaseScreen/Modify > 신규 버튼 |
| IDC_BTN_SAVE | 저장 버튼 | screens/PurchaseScreen/Modify > 저장 버튼 |
| IDC_BTN_DEL | 삭제 버튼 | screens/PurchaseScreen/Modify > 삭제 버튼 |
| IDCANCEL | 닫기 버튼 | React 라우팅으로 대체 |
| IDOK | 확인 (숨김) | 제거 |
| IDC_BTN_ITEMSEARCH | 상품 검색 버튼 | 상품 검색 버튼 |
| IDC_BTN_ITEMCAN | 상품 취소 버튼 | 행 삭제 버튼 |
| IDC_BTN_PURSEARCH | 조회 버튼 | 조회 버튼 |
| IDC_EDT_BARCODE | 바코드 입력 | shared/ui/atoms/TextInput |
| IDC_EDT_MEMO | 메모 입력 | shared/ui/atoms/TextInput |
| IDC_STARTDATE, IDC_ENDDATE, IDC_PURDATE | 날짜 선택 (SysDateTimePick32) | shared/ui/molecules/DatePicker |
| IDC_RAD_MOD, IDC_RAD_MOD2, IDC_RAD_MOD3 | 수정 유형 라디오 (3종) | shared/ui/atoms/RadioGroup |
| IDC_STA_STATE | 상태 표시 | 상태 배지 |
| IDC_STA_TAX, IDC_STA_VAT, IDC_STA_TAXFREE, IDC_STA_TOTPUR | 금액 표시 | 금액 표시 영역 |
| IDC_GRID | 수정 목록 그리드 (MFCGridCtrl) | shared/ui/organisms/DataGrid |
| IDC_GRID2 | 수정 상세 그리드 (MFCGridCtrl) | shared/ui/organisms/DataGrid |
| IDC_STATIC 시리즈 (숨김 라벨) | 폼 라벨 | React 폼 라벨로 전환 |

---

## Progress

| 날짜 | 작업 | 상태 |
|------|------|------|
| 2026-04-05 | UI Shell 구현: `BrandPosApp/PosUi/src/screens/StockScreen/components/PurchaseModifyDialog.tsx` | DONE |
