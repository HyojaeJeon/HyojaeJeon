# CUST_KEEP — 킵 상품 관리 모달

## 0. 문서 정보

| 항목 | 값 |
|---|---|
| 문서 ID | CUST_KEEP |
| 레거시 다이얼로그 | IDD_CUST_KEEP (153) |
| 신규 위치 | screens/CustomerScreen/KeepItemModal |
| 작성일 | 2026-04-05 |
| 상태 | 초안 |

---

## 1. 화면 개요

고객의 킵(보관) 상품을 관리하는 모달 화면이다.
현금/카드 결제로 킵 상품을 등록하고, 사용/취소/환불을 처리하며, 보유 목록과 이력을 조회한다.
CUSTINPUT(고객 관리 메인)에서 호출된다.

---

## 2. 상위 기준 연결

| 기준 문서 | 관련 섹션 | 비고 |
|---|---|---|
| 04-Edge-POS-아키텍처-설계서 | UseCases, 트랜잭션 규칙 | 금액 변경은 트랜잭션/멱등성 필수 |
| 05-Edge-POS-전체-흐름-AZ-가이드 | 결제 관련 플로우 | 카드 결제는 외부 동기 대기 |
| 06-P0-P1-설계-보완-체크리스트 | Customer 도메인 | 킵 등록 P0, 취소/환불 P1 |

---

## 3. 기능 목록

| ID | 기능명 | 우선순위 | Bridge Command | UseCase | Domain/Manager | Infrastructure |
|---|---|---|---|---|---|---|
| CUSTKEEP-F01 | 킵 상품 현금 등록 | P0 | CUSTOMER:ADD_KEEP | AddKeepItemUseCase | CustMgr | Tables/Customer/KeepItemCrud |
| CUSTKEEP-F02 | 킵 상품 카드 등록 | P0 | CUSTOMER:ADD_KEEP | AddKeepItemUseCase | CustMgr | Tables/Customer/KeepItemCrud |
| CUSTKEEP-F03 | 킵 금액 입력 (키패드) | P0 | N/A (UI 로컬) | N/A | N/A | N/A |
| CUSTKEEP-F04 | 킵 일괄 등록 | P2 | CUSTOMER:ADD_KEEP | AddKeepItemUseCase | CustMgr | Tables/Customer/KeepItemCrud |
| CUSTKEEP-F05 | 킵 상품 사용 취소 (매출취소) | P1 | CUSTOMER:USE_KEEP | UseKeepItemUseCase | CustMgr | Tables/Customer/KeepItemCrud |
| CUSTKEEP-F06 | 영수증 재인쇄 | P1 | N/A (장치) | N/A | N/A | Device/Printer |
| CUSTKEEP-F07 | 현금 환불 | P1 | CUSTOMER:USE_KEEP | UseKeepItemUseCase | CustMgr | Tables/Customer/KeepItemCrud |
| CUSTKEEP-F08 | 현금영수증 처리 | P2 | N/A (외부 연동) | N/A | N/A | N/A |
| CUSTKEEP-F09 | 미수금 처리 | P2 | N/A | N/A | CustMgr | Tables/Customer/CustomerCrud |
| CUSTKEEP-F10 | 닫기/취소 | P0 | N/A (UI 로컬) | N/A | N/A | N/A |
| CUSTKEEP-F11 | 키패드 입력 | P0 | N/A (UI 로컬) | N/A | N/A | N/A |

---

## 4. UI 구조

### 4.1 화면 레이아웃

```
+--------------------------------------------------------------+
| [현금영수증*] [미수금*]                               [닫기]   |
+----------------------------+---------------------------------+
| 보유 킵 목록 DataGrid       | 킵 금액 [TextInput]             |
| (상품명, 수량, 금액 등)      | [현금등록] [카드등록]            |
|                             | [현금환불]  [일괄등록*]          |
|                             |                                |
|                             | NumericKeypad                  |
|                             | [7][8][9][BS]                  |
|                             | [4][5][6][CLR]                 |
|                             | [1][2][3][0]                   |
|                             | [만][천][확인]                  |
+----------------------------+---------------------------------+
| 킵 등록/사용 이력 DataGrid  | 킵 결제 이력 DataGrid           |
| [매출취소] [재인쇄]          |                                |
+----------------------------+---------------------------------+
* = 설정 기반 조건부 표시
```

- 풀스크린(512x384 DLU 기반)
- 3개 DataGrid: 보유 목록, 등록/사용 이력, 결제 이력
- 키패드는 항상 표시 (터치 POS 환경)

### 4.2 사용 컴포넌트 (shared/ui)

| 컴포넌트 | 경로 | 용도 |
|---|---|---|
| TextInput | shared/ui/atoms/TextInput | 킵 금액 입력 |
| DataGrid | shared/ui/organisms/DataGrid | 보유 목록, 이력, 결제 이력 (3개) |
| NumericKeypad | shared/ui/organisms/NumericKeypad | 금액 입력 키패드 |

---

## 5. 구현 명세

### 5.1 Bridge Command

**CUSTOMER:ADD_KEEP**

```jsonc
// Request
{
  "v": 1,
  "requestId": "<uuid>",
  "timestamp": "<ISO8601>",
  "idempotencyKey": "CUSTOMER:ADD_KEEP:<uuid>",
  "command": "CUSTOMER:ADD_KEEP",
  "params": {
    "customerId": "string",
    "amount": "number",
    "payType": "CASH | CARD"
  }
}

// Response (성공)
{
  "v": 1,
  "requestId": "<echo>",
  "timestamp": "<ISO8601>",
  "status": "OK",
  "data": {
    "keepItem": {
      "keepId": "string",
      "balance": "number"
    }
  }
}

// Response (실패)
{
  "v": 1,
  "requestId": "<echo>",
  "timestamp": "<ISO8601>",
  "status": "ERROR",
  "error": {
    "code": "INVALID_AMOUNT",
    "msgKey": "error.keep.invalidAmount"
  }
}
```

**CUSTOMER:USE_KEEP**

```jsonc
// Request
{
  "v": 1,
  "requestId": "<uuid>",
  "timestamp": "<ISO8601>",
  "idempotencyKey": "CUSTOMER:USE_KEEP:<uuid>",
  "command": "CUSTOMER:USE_KEEP",
  "params": {
    "customerId": "string",
    "keepItemId": "string",
    "useAmount": "number"
  }
}

// Response (성공)
{
  "v": 1,
  "requestId": "<echo>",
  "timestamp": "<ISO8601>",
  "status": "OK",
  "data": {
    "keepItem": {
      "keepId": "string",
      "balance": "number"
    }
  }
}

// Response (실패)
{
  "v": 1,
  "requestId": "<echo>",
  "timestamp": "<ISO8601>",
  "status": "ERROR",
  "error": {
    "code": "INSUFFICIENT_BALANCE",
    "msgKey": "error.keep.insufficientBalance"
  }
}
```

> TODO: 카드 결제 연동 시 외부 동기 대기 처리 상세 확정 필요

#### UseCase 실패 규칙

| 실패 조건 | 에러 코드 | Ledger 상태 | UI 처리 |
|---|---|---|---|
| 금액이 0 이하 또는 음수 | INVALID_AMOUNT | FAILED | 에러 메시지 표시 |
| 잔액 부족 (사용 시) | INSUFFICIENT_BALANCE | FAILED | 에러 메시지 표시, 잔액 안내 |
| customerId에 해당하는 고객 없음 | CUSTOMER_NOT_FOUND | FAILED | 에러 메시지 표시 |
| 동일 idempotencyKey 재전송 | N/A (기존 결과 반환) | 기존 상태 유지 | 성공 응답 그대로 처리 |

#### Permission

| 기능 | 권한 |
|---|---|
| 킵 등록/사용 | 로그인 직원 전원 |
| 킵 환불 | 관리자 또는 권한 직원 |

### 5.2 RTK Query Endpoint

| Endpoint | 파일 | 메서드 | Tags |
|---|---|---|---|
| useGetCustomerKeepItemsQuery | store/api/customerApi.tsx | CUSTOMER:GET_KEEP_ITEMS | `KeepItems:{custCode}` |
| useAddKeepItemMutation | store/api/customerApi.tsx | CUSTOMER:ADD_KEEP | invalidates `KeepItems:{custCode}` |
| useUseKeepItemMutation | store/api/customerApi.tsx | CUSTOMER:USE_KEEP | invalidates `KeepItems:{custCode}` |

캐시 갱신: mutation 성공 시 `onQueryStarted` + `updateQueryData`로 KeepItems 직접 패치.

### 5.3 UseCases

| UseCase | 역할 | 멱등성 |
|---|---|---|
| GetCustomerKeepItemsUseCase | 킵 보유 목록 + 이력 조회 | 조회 전용 |
| AddKeepItemUseCase | 킵 등록 (현금/카드), DB + Ledger + Outbox | idempotencyKey 필수 |
| UseKeepItemUseCase | 킵 사용 취소/환불, DB + Ledger + Outbox | idempotencyKey 필수 |

### 5.4 Domain / Manager

| Manager | 메서드 | 역할 |
|---|---|---|
| CustMgr | GetKeepItems() | 킵 보유/이력 조회 |
| CustMgr | AddKeepItem() | 킵 등록, 금액 검증, row 생성 |
| CustMgr | VoidKeepItem() | 매출취소 처리 |
| CustMgr | RefundKeepItem() | 현금환불 처리 |

### 5.5 Infrastructure

| 모듈 | 파일 | 역할 |
|---|---|---|
| Tables/Customer/KeepItemCrud | Infrastructure/Persistence/SQLite/Tables/Customer/KeepItemCrud.cpp | 킵 CRUD |
| RequestLedgerStore | Infrastructure/Persistence/SQLite/Stores/RequestLedgerStore.cpp | Ledger |
| OutboxStore | Infrastructure/Persistence/SQLite/Stores/OutboxStore.cpp | 동기화 대상 |
| Device/Printer | Infrastructure/Device/Printer/ | 영수증 인쇄 (비동기 후처리) |

### 5.6 PosRealTime 이벤트

| 이벤트 | 조건 | 수신 측 |
|---|---|---|
| CUSTOMER:KEEP_UPDATED | 등록/취소/환불 성공 후 | 다른 POS에서 킵 목록 갱신 |

---

## 6. 테스트

| ID | 시나리오 | 예상 결과 |
|---|---|---|
| CUSTKEEP-T01 | 금액 입력 + 현금 등록 | 킵 등록 성공, 보유 목록 갱신 |
| CUSTKEEP-T02 | 금액 입력 + 카드 등록 | 카드 승인 후 킵 등록 |
| CUSTKEEP-T03 | 매출취소 | 선택 킵 취소, 이력 갱신 |
| CUSTKEEP-T04 | 현금환불 | 환불 처리, 잔액 갱신 |
| CUSTKEEP-T05 | 영수증 재인쇄 | 프린터 출력 (비동기) |
| CUSTKEEP-T06 | 동일 idempotencyKey 재전송 | 중복 등록 방지 |
| CUSTKEEP-T07 | 키패드 입력 | 금액 필드 정상 반영 |

---

## 7. 완료 기준

- [ ] CUSTOMER:ADD_KEEP, CUSTOMER:USE_KEEP Bridge Command 왕복 동작
- [ ] 3개 DataGrid(보유, 이력, 결제이력) 정상 표시
- [ ] 현금/카드 등록 트랜잭션 완료
- [ ] 매출취소/환불 트랜잭션 완료
- [ ] idempotencyKey 기반 중복 방지
- [ ] Ledger/Outbox 상태 기록
- [ ] 영수증 인쇄 비동기 후처리
- [ ] 1024x768 해상도, 터치 사용성 검증

---

## 8. 작업 명단

| 계층 | 파일 경로 | 작업 내용 |
|---|---|---|
| PosUi Screen | BrandPosApp/PosUi/src/screens/CustomerScreen/KeepItemModal.tsx | 킵 관리 모달 구현 |
| PosUi Store | BrandPosApp/PosUi/src/store/api/customerApi.ts | useGetCustomerKeepItemsQuery, useAddKeepItemMutation, useUseKeepItemMutation |
| PosUi Shared | BrandPosApp/PosUi/src/shared/ui/atoms/TextInput.tsx | 금액 입력 |
| PosUi Shared | BrandPosApp/PosUi/src/shared/ui/organisms/DataGrid.tsx | 3개 그리드 |
| PosUi Shared | BrandPosApp/PosUi/src/shared/ui/organisms/NumericKeypad.tsx | 키패드 |
| Bridge Command | BrandPosApp/PosUi/src/bridge/commands/customerCommands.ts | CUSTOMER:ADD_KEEP, CUSTOMER:USE_KEEP, CUSTOMER:GET_KEEP_ITEMS |
| C++ Actions | BrandPosApp/Presentation/CEF/InternalBridge/PosRequestActions/Customer/CustomerActions.cpp | thin router |
| C++ UseCase | BrandPosApp/UseCases/Customer/AddKeepItemUseCase.cpp | 킵 등록 |
| C++ UseCase | BrandPosApp/UseCases/Customer/UseKeepItemUseCase.cpp | 킵 사용/취소/환불 |
| C++ UseCase | BrandPosApp/UseCases/Customer/GetCustomerKeepItemsUseCase.cpp | 킵 조회 |
| C++ Manager | BrandPosApp/Domain/Customer/CustMgr.cpp | 킵 관련 메서드 |
| C++ Persistence | BrandPosApp/Infrastructure/Persistence/SQLite/Tables/Customer/KeepItemCrud.cpp | 킵 CRUD |
| C++ Store | BrandPosApp/Infrastructure/Persistence/SQLite/Stores/RequestLedgerStore.cpp | Ledger |
| C++ Store | BrandPosApp/Infrastructure/Persistence/SQLite/Stores/OutboxStore.cpp | Outbox |

---

## Appendix: 레거시 UI 참조

### A.1 기본 정보

| 항목 | 값 |
|---|---|
| 다이얼로그 ID | IDD_CUST_KEEP |
| 리소스 값 | 153 |
| 크기 (DLU) | 512 x 384 |
| 다이얼로그 타입 | DIALOGEX |
| 스타일 | DS_SETFONT \| WS_POPUP |
| 소스 파일 | Restaurant.rc |
| 총 UI 요소 수 | 29 |

### A.2 레거시 UI 요소 목록

**버튼 (25개)**: IDC_CASH(현금), IDC_CARD(카드), IDC_BTN_ALLREG(일괄등록, 숨김), IDCANCEL(닫기), IDC_N_NUM0~9/BS/CLR/000/0000/00(키패드, 표시), IDC_CASHRECE(현금영수증, 숨김), IDC_UNPER(미수금, 숨김), IDC_SELLVOID(매출취소), IDC_BTN_REPRINT(재인쇄), IDC_CASHRETURN(현금환불)

**입력 필드 (1개)**: IDC_KEEPAMT (킵 금액)

**그리드 (3개)**: IDC_GRID(보유 목록), IDC_GRID2(등록/사용 이력), IDC_GRID4(결제 이력)

### A.3 마이그레이션 노트

- 3개 그리드는 각각 보유 킵 목록, 등록/사용 이력, 결제 이력. 신규에서는 탭 또는 섹션 분리로 구현
- 키패드가 항상 표시 상태. 터치 POS에서 금액 직접 입력용
- IDC_CASHRECE(현금영수증), IDC_UNPER(미수금)는 숨김 상태로 설정 기반 조건부 표시
- 매출취소, 현금환불은 금액 변경 트랜잭션이므로 UseCases에서 트랜잭션/멱등성 보장 필수

---

## Progress Record

| 날짜 | 작업 | 상태 |
|---|---|---|
| 2026-04-05 | UI Shell 구현: `BrandPosApp/PosUi/src/screens/CustomerScreen/components/CustomerCreditDialog.tsx` | Shell 완료 (3 grids, keypad, stub handlers). Backend 미연결. |
