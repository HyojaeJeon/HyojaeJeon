# CUSTDELI — 배달 관리 메인 화면

## 0. 문서 정보

| 항목 | 값 |
|---|---|
| 문서 ID | CUSTDELI |
| 레거시 다이얼로그 | IDD_CUSTDELI (123) |
| 신규 위치 | screens/DeliveryScreen/DeliveryPanel |
| 작성일 | 2026-04-05 |
| 상태 | 초안 |

---

## 1. 화면 개요

배달 관리의 메인 화면이다.
고객 검색/등록, 배달 주문/결제, 배달원 지정, 배달 시작/완료, 그릇 회수, 전표 인쇄 등 배달 업무의 전체 라이프사이클을 관리한다.
고객 정보 + 주문 + 배달 상태 관리가 복합된 핵심 화면이다.

---

## 2. 상위 기준 연결

| 기준 문서 | 관련 섹션 | 비고 |
|---|---|---|
| 04-Edge-POS-아키텍처-설계서 | UseCases, 트랜잭션, 외부 연동 | 배달 상태 전이마다 idempotencyKey 필수 |
| 05-Edge-POS-전체-흐름-AZ-가이드 | 배달 주문/결제 플로우 | DB 먼저, UI 다음 |
| 06-P0-P1-설계-보완-체크리스트 | Delivery 도메인 | P0 핵심 |

---

## 3. 기능 목록

| ID | 기능명 | 우선순위 | Bridge Command | UseCase | Domain/Manager | Infrastructure |
|---|---|---|---|---|---|---|
| CUSTDELI-F01 | 고객 검색 (배달) | P0 | CUSTOMER:SEARCH | SearchCustomerUseCase | CustMgr | Tables/Customer/CustomerCrud |
| CUSTDELI-F02 | 고객 등록/수정 | P0 | CUSTOMER:REGISTER / UPDATE | RegisterCustomerUseCase / UpdateCustomerUseCase | CustMgr | Tables/Customer/CustomerCrud |
| CUSTDELI-F03 | 주문/결제 | P0 | DELIVERY:RECEIVE | ReceiveDeliveryOrderUseCase | OrderMgr, SaleMgr | Tables/Customer/DeliveryCrud |
| CUSTDELI-F04 | 배달원 지정 | P0 | DELIVERY:ASSIGN | AssignDeliveryUseCase | CustMgr | Tables/Customer/DeliveryCrud |
| CUSTDELI-F05 | 배달 시작 | P0 | DELIVERY:START | StartDeliveryUseCase | CustMgr | Tables/Customer/DeliveryCrud |
| CUSTDELI-F06 | 배달 완료 (배달미수) | P0 | DELIVERY:COMPLETE | CompleteDeliveryUseCase | CustMgr | Tables/Customer/DeliveryCrud |
| CUSTDELI-F07 | 그릇 회수/배달완료 | P1 | DELIVERY:COMPLETE | CompleteDeliveryUseCase | CustMgr | Tables/Customer/DeliveryCrud |
| CUSTDELI-F08 | 배달 주소 검색 | P0 | DELIVERY:SEARCH_ADDRESS | SearchDeliveryAddressUseCase | CustMgr | Tables/Customer/DeliveryCrud |
| CUSTDELI-F09 | 배달 일괄 완료 | P1 | DELIVERY:COMPLETE | CompleteDeliveryUseCase | CustMgr | Tables/Customer/DeliveryCrud |
| CUSTDELI-F10 | 배달 전표 인쇄 | P1 | DELIVERY:PRINT_SLIP | PrintDeliverySlipUseCase | N/A | Device/Printer |
| CUSTDELI-F11 | 고객 정보 초기화 | P1 | N/A (UI 로컬) | N/A | N/A | N/A |
| CUSTDELI-F12 | 지도 보기 | P2 | N/A (외부 연동) | N/A | N/A | N/A |
| CUSTDELI-F13 | 닫기/취소 | P0 | N/A (UI 로컬) | N/A | N/A | N/A |
| CUSTDELI-F14 | 주문취소 | P1 | N/A | N/A | OrderMgr | N/A |
| CUSTDELI-F15 | 주문내역조회 | P2 | N/A | N/A | OrderMgr | N/A |

---

## 4. UI 구조

### 4.1 화면 레이아웃

```
+--------------------------------------------------------------+
| [고객찾기] [고객등록/수정]              주문건수 배달건수 합계   |
+-----------------------------+--------------------------------+
| 고객명  [TextInput]          | 오늘 주문 목록 DataGrid         |
| 전화    [TextInput]          | (주문번호, 고객, 금액, 상태)    |
| 휴대폰  [TextInput]          |                                |
| 주소    [TextInput] [주소][지도]|                              |
| 메모    [TextInput] [초기화]  |                                |
| 코드/포인트                   |                                |
+-----------------------------+--------------------------------+
| 주문 메뉴 DataGrid            | 총액     [읽기전용]            |
| (메뉴, 수량, 금액)            | 할인합계 [읽기전용]            |
|                               | 수금금액 [읽기전용]            |
+-------------------------------+ 배달원   [읽기전용]            |
| 배달 이력 DataGrid             | 배달시간 [읽기전용]            |
| (일시, 주문, 금액, 상태)       | 상태     [Badge]              |
|                               +------------------------------+
|                               | [주문/결제]                    |
| [리스트인쇄]                   | [배달원지정] [배달시작]         |
| [그릇회수] [일괄완료]          | [배달미수]                     |
+-------------------------------+------------------------------+
```

- 풀스크린(512x384 DLU 기반)
- 좌측: 고객 정보 + 주문 메뉴 + 배달 이력
- 우측: 오늘 주문 목록 + 배달 상태 + 금액 요약 + 액션 버튼

### 4.2 사용 컴포넌트 (shared/ui)

| 컴포넌트 | 경로 | 용도 |
|---|---|---|
| TextInput | shared/ui/atoms/TextInput | 고객 정보 입력, 금액 표시 |
| Text | shared/ui/atoms/Text | 고객코드, 포인트, 합계 |
| Badge | shared/ui/atoms/Badge | 배달 상태 표시 |
| DataGrid | shared/ui/organisms/DataGrid | 주문 메뉴, 배달 이력, 오늘 주문 목록 (3개) |

---

## 5. 구현 명세

### 5.1 Bridge Command

**DELIVERY:RECEIVE**

```jsonc
// Request
{
  "v": 1,
  "requestId": "<uuid>",
  "timestamp": "<ISO8601>",
  "idempotencyKey": "DELIVERY:RECEIVE:<uuid>",
  "command": "DELIVERY:RECEIVE",
  "params": {
    "custCode": "string",
    "items": [{ "itemCode": "string", "qty": "number", "price": "number" }],
    "totalAmt": "number",
    "dcAmt": "number"
  }
}
```

**DELIVERY:ASSIGN**

```jsonc
// Request
{
  "v": 1,
  "requestId": "<uuid>",
  "timestamp": "<ISO8601>",
  "idempotencyKey": "DELIVERY:ASSIGN:<uuid>",
  "command": "DELIVERY:ASSIGN",
  "params": {
    "orderId": "string",
    "driverId": "string"
  }
}

// Response (성공)
{
  "v": 1,
  "requestId": "<echo>",
  "timestamp": "<ISO8601>",
  "status": "OK",
  "data": {
    "delivery": { "orderId": "string", "driverId": "string", "status": "ASSIGNED" }
  }
}

// Response (실패)
{
  "v": 1,
  "requestId": "<echo>",
  "timestamp": "<ISO8601>",
  "status": "ERROR",
  "error": {
    "code": "ORDER_NOT_FOUND | DRIVER_NOT_FOUND",
    "msgKey": "error.delivery.orderNotFound | error.delivery.driverNotFound"
  }
}
```

**DELIVERY:START**

```jsonc
// Request
{
  "v": 1,
  "requestId": "<uuid>",
  "timestamp": "<ISO8601>",
  "idempotencyKey": "DELIVERY:START:<uuid>",
  "command": "DELIVERY:START",
  "params": {
    "orderId": "string"
  }
}

// Response (성공)
{
  "v": 1,
  "requestId": "<echo>",
  "timestamp": "<ISO8601>",
  "status": "OK",
  "data": {
    "delivery": { "status": "IN_PROGRESS" }
  }
}

// Response (실패)
{
  "v": 1,
  "requestId": "<echo>",
  "timestamp": "<ISO8601>",
  "status": "ERROR",
  "error": {
    "code": "ORDER_NOT_FOUND | ALREADY_STARTED",
    "msgKey": "error.delivery.orderNotFound | error.delivery.alreadyStarted"
  }
}
```

**DELIVERY:COMPLETE**

```jsonc
// Request
{
  "v": 1,
  "requestId": "<uuid>",
  "timestamp": "<ISO8601>",
  "idempotencyKey": "DELIVERY:COMPLETE:<uuid>",
  "command": "DELIVERY:COMPLETE",
  "params": {
    "orderId": "string",
    "completeType": "DELIVERED | DISH_RETURN | BATCH"
  }
}

// Response (성공)
{
  "v": 1,
  "requestId": "<echo>",
  "timestamp": "<ISO8601>",
  "status": "OK",
  "data": {
    "delivery": { "status": "COMPLETED" }
  }
}

// Response (실패)
{
  "v": 1,
  "requestId": "<echo>",
  "timestamp": "<ISO8601>",
  "status": "ERROR",
  "error": {
    "code": "NOT_STARTED",
    "msgKey": "error.delivery.notStarted"
  }
}
```

**DELIVERY:SEARCH_ADDRESS**

```jsonc
// Request
{
  "v": 1,
  "requestId": "<uuid>",
  "timestamp": "<ISO8601>",
  "command": "DELIVERY:SEARCH_ADDRESS",
  "params": {
    "keyword": "string"
  }
}

// Response (성공)
{
  "v": 1,
  "requestId": "<echo>",
  "timestamp": "<ISO8601>",
  "status": "OK",
  "data": {
    "addresses": [ /* custdeli-addr.md 참조 */ ]
  }
}
```

> Error: 정의된 에러 코드 없음. 검색 결과가 없으면 빈 배열 반환.

**DELIVERY:PRINT_SLIP**

```jsonc
// Request
{
  "v": 1,
  "requestId": "<uuid>",
  "timestamp": "<ISO8601>",
  "command": "DELIVERY:PRINT_SLIP",
  "params": {
    "orderId": "string"
  }
}

// Response (성공)
{
  "v": 1,
  "requestId": "<echo>",
  "timestamp": "<ISO8601>",
  "status": "OK",
  "data": { "success": true }
}

// Response (실패)
{
  "v": 1,
  "requestId": "<echo>",
  "timestamp": "<ISO8601>",
  "status": "ERROR",
  "error": {
    "code": "PRINTER_NOT_CONNECTED",
    "msgKey": "error.device.printerNotConnected"
  }
}
```

> 인쇄는 커밋 후 비동기 후처리. UI 블로킹 불필요.

#### UseCase 실패 규칙

| 실패 조건 | 에러 코드 | Ledger 상태 | UI 처리 |
|---|---|---|---|
| orderId에 해당하는 주문 없음 | ORDER_NOT_FOUND | FAILED | 에러 메시지 표시 |
| driverId에 해당하는 배달원 없음 | DRIVER_NOT_FOUND | FAILED | 에러 메시지 표시 |
| 이미 배달 시작된 주문에 START 재요청 | ALREADY_STARTED | FAILED | 에러 메시지 표시 |
| 배달 시작 전 COMPLETE 요청 | NOT_STARTED | FAILED | 에러 메시지 표시 |
| 프린터 미연결 상태에서 인쇄 | PRINTER_NOT_CONNECTED | N/A (후처리) | 장치 에러 안내 |
| 동일 idempotencyKey 재전송 | N/A (기존 결과 반환) | 기존 상태 유지 | 성공 응답 그대로 처리 |

#### Permission

| 기능 | 권한 |
|---|---|
| 배달 지정/시작/완료 | 로그인 직원 전원 |

### 5.2 RTK Query Endpoint

| Endpoint | 파일 | 메서드 | Tags |
|---|---|---|---|
| useGetDeliveryDetailQuery | store/api/deliveryApi.tsx | DELIVERY:GET_DETAIL | `Delivery:{deliveryId}` |
| useGetDeliveryListQuery | store/api/deliveryApi.tsx | DELIVERY:GET_LIST | `DeliveryList` |
| useReceiveDeliveryOrderMutation | store/api/deliveryApi.tsx | DELIVERY:RECEIVE | invalidates `DeliveryList` |
| useAssignDeliveryMutation | store/api/deliveryApi.tsx | DELIVERY:ASSIGN | invalidates `Delivery:{deliveryId}` |
| useStartDeliveryMutation | store/api/deliveryApi.tsx | DELIVERY:START | invalidates `Delivery:{deliveryId}` |
| useCompleteDeliveryMutation | store/api/deliveryApi.tsx | DELIVERY:COMPLETE | invalidates `Delivery:{deliveryId}`, `DeliveryList` |

### 5.3 UseCases

| UseCase | 역할 | 멱등성 |
|---|---|---|
| SearchCustomerUseCase | 고객 검색 | 조회 전용 |
| ReceiveDeliveryOrderUseCase | 배달 주문 생성 + 결제 | idempotencyKey 필수 |
| AssignDeliveryUseCase | 배달원 지정 | idempotencyKey 필수 |
| StartDeliveryUseCase | 배달 시작 상태 전이 | idempotencyKey 필수 |
| CompleteDeliveryUseCase | 배달 완료/그릇회수/일괄완료 | idempotencyKey 필수 |
| SearchDeliveryAddressUseCase | 배달 주소 검색 | 조회 전용 |
| PrintDeliverySlipUseCase | 전표 인쇄 (커밋 후 비동기) | N/A |

### 5.4 Domain / Manager

| Manager | 메서드 | 역할 |
|---|---|---|
| CustMgr | SearchCustomers() | 고객 검색 |
| OrderMgr | CreateDeliveryOrder() | 배달 주문 생성 |
| SaleMgr | ExecutePayment() | 결제 처리 |
| CustMgr | AssignDelivery() | 배달원 지정 |
| CustMgr | StartDelivery() | 배달 시작 |
| CustMgr | CompleteDelivery() | 배달 완료 |

### 5.5 Infrastructure

| 모듈 | 파일 | 역할 |
|---|---|---|
| Tables/Customer/DeliveryCrud | Infrastructure/Persistence/SQLite/Tables/Customer/DeliveryCrud.cpp | 배달 CRUD |
| Tables/Customer/CustomerCrud | Infrastructure/Persistence/SQLite/Tables/Customer/CustomerCrud.cpp | 고객 CRUD |
| RequestLedgerStore | Infrastructure/Persistence/SQLite/Stores/RequestLedgerStore.cpp | Ledger |
| OutboxStore | Infrastructure/Persistence/SQLite/Stores/OutboxStore.cpp | 동기화 |
| Device/Printer | Infrastructure/Device/Printer/ | 전표 인쇄 |

### 5.6 PosRealTime 이벤트

| 이벤트 | 조건 | 수신 측 |
|---|---|---|
| DELIVERY:ORDER_RECEIVED | 주문 생성 후 | 다른 POS 배달 목록 갱신 |
| DELIVERY:STATUS_CHANGED | 상태 전이 후 | 다른 POS 배달 상태 갱신 |

---

## 6. 테스트

| ID | 시나리오 | 예상 결과 |
|---|---|---|
| CUSTDELI-T01 | 고객 검색 + 선택 | 고객 정보 필드 채움 |
| CUSTDELI-T02 | 주문/결제 | 배달 주문 생성, 이력 갱신 |
| CUSTDELI-T03 | 배달원 지정 | 배달원명 표시 |
| CUSTDELI-T04 | 배달 시작 | 상태 변경, 시간 기록 |
| CUSTDELI-T05 | 배달 완료 | 상태 완료, 이력 갱신 |
| CUSTDELI-T06 | 그릇 회수 | 상태 완료 |
| CUSTDELI-T07 | 일괄 완료 | 다건 일괄 처리 |
| CUSTDELI-T08 | 전표 인쇄 | 프린터 출력 (비동기) |
| CUSTDELI-T09 | 지도 보기 (오프라인) | 비활성화 또는 안내 메시지 |

---

## 7. 완료 기준

- [ ] DELIVERY:RECEIVE, ASSIGN, START, COMPLETE Bridge Command 왕복 동작
- [ ] 배달 상태 전이(지정 -> 시작 -> 완료) 정상 동작
- [ ] 3개 DataGrid(주문메뉴, 배달이력, 오늘주문) 표시
- [ ] 고객 검색/등록 연동
- [ ] 배달 상태 전이마다 idempotencyKey 보장
- [ ] Ledger/Outbox 상태 기록
- [ ] 전표 인쇄 비동기 후처리
- [ ] 지도 보기 온라인 전용 (Offline-First 규칙)
- [ ] 1024x768 해상도, 터치 사용성 검증

---

## 8. 작업 명단

| 계층 | 파일 경로 | 작업 내용 |
|---|---|---|
| PosUi Screen | BrandPosApp/PosUi/src/screens/DeliveryScreen/DeliveryPanel.tsx | 배달 메인 화면 |
| PosUi Screen | BrandPosApp/PosUi/src/screens/DeliveryScreen/AddressSearchModal.tsx | 주소 검색 모달 |
| PosUi Screen | BrandPosApp/PosUi/src/screens/DeliveryScreen/MapModal.tsx | 지도 모달 (P2) |
| PosUi Store | BrandPosApp/PosUi/src/store/api/deliveryApi.ts | 배달 관련 전체 endpoints |
| PosUi Store | BrandPosApp/PosUi/src/store/api/customerApi.ts | 고객 검색 연동 |
| PosUi Shared | BrandPosApp/PosUi/src/shared/ui/atoms/TextInput.tsx | 입력 필드 |
| PosUi Shared | BrandPosApp/PosUi/src/shared/ui/atoms/Text.tsx | 텍스트 표시 |
| PosUi Shared | BrandPosApp/PosUi/src/shared/ui/atoms/Badge.tsx | 상태 뱃지 |
| PosUi Shared | BrandPosApp/PosUi/src/shared/ui/organisms/DataGrid.tsx | 3개 그리드 |
| Bridge Command | BrandPosApp/PosUi/src/bridge/commands/deliveryCommands.ts | 배달 커맨드 전체 |
| C++ Actions | BrandPosApp/Presentation/CEF/InternalBridge/PosRequestActions/Delivery/DeliveryActions.cpp | thin router |
| C++ UseCase | BrandPosApp/UseCases/Delivery/ReceiveDeliveryOrderUseCase.cpp | 배달 주문 |
| C++ UseCase | BrandPosApp/UseCases/Delivery/AssignDeliveryUseCase.cpp | 배달원 지정 |
| C++ UseCase | BrandPosApp/UseCases/Delivery/StartDeliveryUseCase.cpp | 배달 시작 |
| C++ UseCase | BrandPosApp/UseCases/Delivery/CompleteDeliveryUseCase.cpp | 배달 완료 |
| C++ UseCase | BrandPosApp/UseCases/Delivery/SearchDeliveryAddressUseCase.cpp | 주소 검색 |
| C++ UseCase | BrandPosApp/UseCases/Delivery/PrintDeliverySlipUseCase.cpp | 전표 인쇄 |
| C++ Manager | BrandPosApp/Domain/Customer/CustMgr.cpp | 배달 관련 메서드 |
| C++ Manager | BrandPosApp/Domain/Order/OrderMgr.cpp | 주문 생성 |
| C++ Persistence | BrandPosApp/Infrastructure/Persistence/SQLite/Tables/Customer/DeliveryCrud.cpp | 배달 CRUD |
| C++ Store | BrandPosApp/Infrastructure/Persistence/SQLite/Stores/RequestLedgerStore.cpp | Ledger |
| C++ Store | BrandPosApp/Infrastructure/Persistence/SQLite/Stores/OutboxStore.cpp | Outbox |

---

## Appendix: 레거시 UI 참조

### A.1 기본 정보

| 항목 | 값 |
|---|---|
| 다이얼로그 ID | IDD_CUSTDELI |
| 리소스 값 | 123 |
| 크기 (DLU) | 512 x 384 |
| 다이얼로그 타입 | DIALOGEX |
| 스타일 | DS_SETFONT \| WS_POPUP |
| 소스 파일 | Restaurant.rc |
| 총 UI 요소 수 | 54 |

### A.2 레거시 UI 요소 목록

**버튼 (16개)**: IDC_DELI_CUSTSERCH(고객찾기), IDC_DELI_CUSTREGI(고객등록/수정), IDC_DELI_ORDER(주문/결제), IDC_DELI_EMP(배달원지정), IDC_DELI_START(배달시작), IDC_DELI_COMP(배달미수), IDC_DELI_DISH(그릇회수/배달완료), IDC_DELI_ADDRESS(주소), IDC_DELI_ALLEND(일괄완료), IDC_DELI_PRINT(리스트인쇄), IDC_DELI_CLEAR(초기화), IDC_DELI_MAP(지도), IDCANCEL(닫기), IDC_BUTTON4(주문취소, 숨김), IDC_BUTTON6(주문내역, 숨김)

**텍스트/라벨 (23개)**: 고객정보 라벨, 합계/건수 표시 — 대부분 숨김(동적 레이아웃)

**입력 필드 (11개)**: IDC_DELI_CUSTNAME(고객명), IDC_DELI_PHONE(전화), IDC_DELI_HPHONE(휴대폰), IDC_DELI_ADDR(주소), IDC_DELI_MEMO(메모), IDC_DELI_TOTALAMT(총액), IDC_DELI_DCAMT(할인), IDC_DELI_RECEIVEAMT(수금), IDC_DELI_EMPNAME(배달원), IDC_DELI_DELITIME(배달시간), IDC_DELI_STATE(상태)

**그리드 (4개)**: IDC_GRID(주문메뉴), IDC_GRID2(배달이력), IDC_GRID4(오늘주문), IDC_GRID5(숨김-버퍼용, 제거 대상)

### A.3 마이그레이션 노트

- IDC_GRID5는 숨김 상태로 내부 데이터 버퍼용. RTK Query 캐시로 대체하여 제거
- 배달 상태 전이(지정->시작->완료)는 각각 별도 UseCase. 상태 전이마다 idempotencyKey 필수
- 레거시 라벨 대부분 숨김 상태는 동적 레이아웃 전환 때문. 신규에서는 항상 표시
- 지도 보기(IDC_DELI_MAP)는 외부 지도 API 연동. Offline-First 규칙상 온라인 상태에서만 활성화

---

## Progress Record

| 날짜 | 작업 | 상태 |
|---|---|---|
| 2026-04-05 | UI Shell 구현: `BrandPosApp/PosUi/src/screens/CustomerScreen/components/DeliveryManageDialog.tsx` | Shell 완료 (customer info, 3 grids, delivery actions, stub handlers). Backend 미연결. |
