# CUSTDELI2 — 배달 주문+메뉴 선택 통합 화면

## 0. 문서 정보

| 항목 | 값 |
|---|---|
| 문서 ID | CUSTDELI2 |
| 레거시 다이얼로그 | IDD_CUSTDELI2 (169) |
| 신규 위치 | screens/DeliveryScreen/DeliveryOrderPanel |
| 작성일 | 2026-04-05 |
| 상태 | 초안 |

---

## 1. 화면 개요

배달 주문 시 메뉴 선택까지 통합된 확장 배달 화면이다.
CUSTDELI의 고객 정보 영역에 메뉴 그룹 탭(10개) + 메뉴 버튼 그리드(5x5) + 주문 수량 조작 + 할인/서비스 + 착석/포장/배달 3종 주문 확정 기능이 추가되어 있다.
80개 UI 요소를 가진 가장 복잡한 고객/배달 화면이다.

---

## 2. 상위 기준 연결

| 기준 문서 | 관련 섹션 | 비고 |
|---|---|---|
| 04-Edge-POS-아키텍처-설계서 | UseCases, 트랜잭션, 멱등성 | 주문 확정은 idempotencyKey 필수 |
| 05-Edge-POS-전체-흐름-AZ-가이드 | 배달 주문 + 결제 플로우 | DB 먼저, UI 다음 |
| 06-P0-P1-설계-보완-체크리스트 | Delivery, Order 도메인 | P0 핵심 |

---

## 3. 기능 목록

| ID | 기능명 | 우선순위 | Bridge Command | UseCase | Domain/Manager | Infrastructure |
|---|---|---|---|---|---|---|
| CUSTDELI2-F01 | 고객 검색 (배달주문) | P0 | CUSTOMER:SEARCH | SearchCustomerUseCase | CustMgr | Tables/Customer/CustomerCrud |
| CUSTDELI2-F02 | 고객 등록/수정 | P0 | CUSTOMER:REGISTER / UPDATE | RegisterCustomerUseCase / UpdateCustomerUseCase | CustMgr | Tables/Customer/CustomerCrud |
| CUSTDELI2-F03 | 배달 주소 검색 | P0 | DELIVERY:SEARCH_ADDRESS | SearchDeliveryAddressUseCase | CustMgr | Tables/Customer/DeliveryCrud |
| CUSTDELI2-F04 | 고객 정보 초기화 | P1 | N/A (UI 로컬) | N/A | N/A | N/A |
| CUSTDELI2-F05 | 지도 보기 | P2 | N/A (외부 연동) | N/A | N/A | N/A |
| CUSTDELI2-F06 | 메뉴 그룹 탭 전환 | P0 | N/A (UI 로컬) | N/A | N/A | N/A |
| CUSTDELI2-F07 | 메뉴 그룹 상/하 페이징 | P0 | N/A (UI 로컬) | N/A | N/A | N/A |
| CUSTDELI2-F08 | 메뉴 아이템 선택 | P0 | N/A (UI 로컬) | N/A | ItemMgr | N/A |
| CUSTDELI2-F09 | 메뉴 이전/다음 페이지 | P0 | N/A (UI 로컬) | N/A | N/A | N/A |
| CUSTDELI2-F10 | 수량 +1 | P0 | N/A (UI 로컬) | N/A | N/A | N/A |
| CUSTDELI2-F11 | 수량 -1 | P0 | N/A (UI 로컬) | N/A | N/A | N/A |
| CUSTDELI2-F12 | 전체 취소 | P0 | N/A (UI 로컬) | N/A | N/A | N/A |
| CUSTDELI2-F13 | 개별 취소 | P0 | N/A (UI 로컬) | N/A | N/A | N/A |
| CUSTDELI2-F14 | 할인 적용 | P1 | N/A (UI 로컬) | N/A | N/A | N/A |
| CUSTDELI2-F15 | 서비스 적용 | P1 | N/A (UI 로컬) | N/A | N/A | N/A |
| CUSTDELI2-F16 | 착석 주문 확정 | P0 | DELIVERY:RECEIVE | ReceiveDeliveryOrderUseCase | OrderMgr | Tables/Customer/DeliveryCrud |
| CUSTDELI2-F17 | 포장 주문 확정 | P0 | DELIVERY:RECEIVE | ReceiveDeliveryOrderUseCase | OrderMgr | Tables/Customer/DeliveryCrud |
| CUSTDELI2-F18 | 배달 주문 완료 | P0 | DELIVERY:RECEIVE | ReceiveDeliveryOrderUseCase | OrderMgr | Tables/Customer/DeliveryCrud |
| CUSTDELI2-F19 | 주문 인쇄 | P1 | DELIVERY:PRINT_SLIP | PrintDeliverySlipUseCase | N/A | Device/Printer |
| CUSTDELI2-F20 | 주문 메모 | P1 | N/A (UI 로컬) | N/A | N/A | N/A |
| CUSTDELI2-F21 | 상품교환 | P2 | N/A | N/A | ItemMgr | N/A |
| CUSTDELI2-F22 | 결제유형 선택 | P0 | N/A (UI 로컬) | N/A | N/A | N/A |
| CUSTDELI2-F23 | 닫기/취소 | P0 | N/A (UI 로컬) | N/A | N/A | N/A |
| CUSTDELI2-F24 | 최소화 | P2 | N/A | N/A | N/A | N/A |
| CUSTDELI2-F25 | 더블메뉴 (세트메뉴) | P1 | N/A (UI 로컬) | N/A | ItemMgr | N/A |
| CUSTDELI2-F26 | 부가세 전환 | P2 | N/A (UI 로컬) | N/A | N/A | N/A |
| CUSTDELI2-F27 | 배달 주소2 검색 | P2 | DELIVERY:SEARCH_ADDRESS | SearchDeliveryAddressUseCase | CustMgr | Tables/Customer/DeliveryCrud |

---

## 4. UI 구조

### 4.1 화면 레이아웃

```
+--------------------------------------------------------------+
| [고객찾기] [고객등록/수정]  [결제유형 Select] [주문인쇄] [닫기] |
+-----------------------------+--------------------------------+
| 고객명  [TextInput] 코드/포인트 | 메뉴 그룹 탭 (10개, 동적)    |
| 전화    [TextInput]           | [위][아래] 페이징             |
| 휴대폰  [TextInput]           +------------------------------+
| 주소    [TextInput] [주소][지도]| 메뉴 버튼 그리드 (5x5)       |
| 메모    [TextInput]           | [메뉴1][메뉴2]...[메뉴25]    |
| 비고    [TextArea]            |              [이전][다음]     |
+-----------------------------+------------------------------+
| 주문 아이템 DataGrid         | 총금액  [Text]                |
| (메뉴, 수량, 금액)          | 할인    [Text]                |
|                              | 주문액  [Text]                |
+------------------------------+------------------------------+
| 배달 이력 DataGrid            | [수량+1][수량-1][주문메모]    |
|                               | [전체취소][개별취소]          |
|                               | [할인][서비스][세트][부가세]   |
|                               | [착석주문][포장주문]          |
|                               | [배달주문완료]                |
+-------------------------------+------------------------------+
```

- 풀스크린(512x384 DLU 기반)
- CEF 단일 인스턴스 아키텍처에서 최소화 기능 불필요 (React 라우팅으로 대체)
- 메뉴 그룹 탭/메뉴 버튼은 React 상태 기반 동적 렌더링

### 4.2 사용 컴포넌트 (shared/ui)

| 컴포넌트 | 경로 | 용도 |
|---|---|---|
| TextInput | shared/ui/atoms/TextInput | 고객 정보 입력 |
| TextArea | shared/ui/atoms/TextArea | 주문비고 (멀티라인) |
| Text | shared/ui/atoms/Text | 금액 표시, 코드/포인트 |
| Select | shared/ui/atoms/Select | 결제유형 선택 |
| DataGrid | shared/ui/organisms/DataGrid | 주문 아이템, 배달 이력 |
| MenuGrid | shared/ui/organisms/MenuGrid | 메뉴 버튼 그리드 (5x5) |

> TODO: MenuGrid 컴포넌트 shared/ui 설계 확정 필요. 주문 화면(OrderScreen)과 공용 가능성 검토.

---

## 5. 구현 명세

### 5.1 Bridge Command

**DELIVERY:RECEIVE** — custdeli.md 참조 (동일 커맨드)

주문 유형 파라미터 추가:

```jsonc
// Request (확장)
{
  "v": 1,
  "requestId": "<uuid>",
  "timestamp": "<ISO8601>",
  "idempotencyKey": "DELIVERY:RECEIVE:<uuid>",
  "command": "DELIVERY:RECEIVE",
  "params": {
    "custCode": "string",
    "orderType": "TABLE | PACK | DELIVERY",
    "items": [{ "itemCode": "string", "qty": "number", "price": "number" }],
    "totalAmt": "number",
    "dcAmt": "number",
    "payType": "string",
    "memo": "string",
    "orderMemo": "string"
  }
}
```

**DELIVERY:PRINT_SLIP**, **DELIVERY:SEARCH_ADDRESS** — custdeli.md 참조

#### UseCase 실패 규칙

| 실패 조건 | 에러 코드 | Ledger 상태 | UI 처리 |
|---|---|---|---|
| orderId에 해당하는 주문 없음 (RECEIVE) | ORDER_NOT_FOUND | FAILED | 에러 메시지 표시 |
| 프린터 미연결 (인쇄) | PRINTER_NOT_CONNECTED | N/A (후처리) | 장치 에러 안내 |
| 동일 idempotencyKey 재전송 | N/A (기존 결과 반환) | 기존 상태 유지 | 성공 응답 그대로 처리 |

#### Permission

| 기능 | 권한 |
|---|---|
| 배달 주문 확정 (착석/포장/배달) | 로그인 직원 전원 |

### 5.2 RTK Query Endpoint

| Endpoint | 파일 | 메서드 | Tags |
|---|---|---|---|
| useGetDeliveryDetailQuery | store/api/deliveryApi.tsx | DELIVERY:GET_DETAIL | `Delivery:{deliveryId}` |
| useGetDeliveryListQuery | store/api/deliveryApi.tsx | DELIVERY:GET_LIST | `DeliveryList` |
| useReceiveDeliveryOrderMutation | store/api/deliveryApi.tsx | DELIVERY:RECEIVE | invalidates `DeliveryList` |

### 5.3 UseCases

| UseCase | 역할 | 멱등성 |
|---|---|---|
| SearchCustomerUseCase | 고객 검색 | 조회 전용 |
| ReceiveDeliveryOrderUseCase | 착석/포장/배달 주문 생성, 주문 유형별 분기 | idempotencyKey 필수 |
| SearchDeliveryAddressUseCase | 주소 검색 | 조회 전용 |
| PrintDeliverySlipUseCase | 주문 인쇄 (비동기 후처리) | N/A |

### 5.4 Domain / Manager

| Manager | 메서드 | 역할 |
|---|---|---|
| CustMgr | SearchCustomers() | 고객 검색 |
| OrderMgr | CreateDeliveryOrder() | 주문 생성 (유형별) |
| ItemMgr | GetMenuItems() | 메뉴 카테고리/아이템 조회 |

### 5.5 Infrastructure

| 모듈 | 파일 | 역할 |
|---|---|---|
| Tables/Customer/DeliveryCrud | Infrastructure/Persistence/SQLite/Tables/Customer/DeliveryCrud.cpp | 배달 CRUD |
| Tables/Customer/CustomerCrud | Infrastructure/Persistence/SQLite/Tables/Customer/CustomerCrud.cpp | 고객 CRUD |
| RequestLedgerStore | Infrastructure/Persistence/SQLite/Stores/RequestLedgerStore.cpp | Ledger |
| OutboxStore | Infrastructure/Persistence/SQLite/Stores/OutboxStore.cpp | 동기화 |
| Device/Printer | Infrastructure/Device/Printer/ | 주문 인쇄 |

### 5.6 PosRealTime 이벤트

| 이벤트 | 조건 | 수신 측 |
|---|---|---|
| DELIVERY:ORDER_RECEIVED | 주문 확정 후 | 다른 POS 배달 목록 갱신 |

---

## 6. 테스트

| ID | 시나리오 | 예상 결과 |
|---|---|---|
| CUSTDELI2-T01 | 메뉴 그룹 탭 전환 | 해당 카테고리 메뉴 표시 |
| CUSTDELI2-T02 | 메뉴 아이템 선택 | 주문 목록에 추가 |
| CUSTDELI2-T03 | 수량 +1/-1 | 주문 수량 변경 |
| CUSTDELI2-T04 | 전체 취소 | 주문 목록 초기화 |
| CUSTDELI2-T05 | 개별 취소 | 선택 아이템 제거 |
| CUSTDELI2-T06 | 착석 주문 확정 | 주문 생성 (TABLE 유형) |
| CUSTDELI2-T07 | 포장 주문 확정 | 주문 생성 (PACK 유형) |
| CUSTDELI2-T08 | 배달 주문 완료 | 주문 생성 (DELIVERY 유형) |
| CUSTDELI2-T09 | 할인/서비스 적용 | 금액 계산 반영 |
| CUSTDELI2-T10 | 주문 인쇄 | 프린터 출력 (비동기) |
| CUSTDELI2-T11 | 동일 idempotencyKey 재전송 | 중복 주문 방지 |

---

## 7. 완료 기준

- [ ] 메뉴 그룹 탭 + 메뉴 그리드 동적 렌더링
- [ ] 착석/포장/배달 3종 주문 확정 동작
- [ ] DELIVERY:RECEIVE Bridge Command 왕복 (orderType 분기)
- [ ] 주문 수량 조작 + 취소 + 할인/서비스 로컬 상태 관리
- [ ] idempotencyKey 기반 중복 주문 방지
- [ ] Ledger/Outbox 상태 기록
- [ ] 고객 검색/등록 연동
- [ ] 주문 인쇄 비동기 후처리
- [ ] 1024x768 해상도, 터치 사용성 검증

---

## 8. 작업 명단

| 계층 | 파일 경로 | 작업 내용 |
|---|---|---|
| PosUi Screen | BrandPosApp/PosUi/src/screens/DeliveryScreen/DeliveryOrderPanel.tsx | 배달 주문 통합 화면 |
| PosUi Screen | BrandPosApp/PosUi/src/screens/DeliveryScreen/AddressSearchModal.tsx | 주소 검색 모달 |
| PosUi Screen | BrandPosApp/PosUi/src/screens/DeliveryScreen/MapModal.tsx | 지도 모달 (P2) |
| PosUi Store | BrandPosApp/PosUi/src/store/api/deliveryApi.ts | 배달 endpoints |
| PosUi Store | BrandPosApp/PosUi/src/store/api/customerApi.ts | 고객 검색 연동 |
| PosUi Store | BrandPosApp/PosUi/src/store/slices/deliveryOrderSlice.ts | 로컬 주문 상태 (아이템, 수량, 할인) |
| PosUi Shared | BrandPosApp/PosUi/src/shared/ui/atoms/TextInput.tsx | 입력 필드 |
| PosUi Shared | BrandPosApp/PosUi/src/shared/ui/atoms/TextArea.tsx | 멀티라인 입력 |
| PosUi Shared | BrandPosApp/PosUi/src/shared/ui/atoms/Text.tsx | 텍스트 표시 |
| PosUi Shared | BrandPosApp/PosUi/src/shared/ui/atoms/Select.tsx | 결제유형 선택 |
| PosUi Shared | BrandPosApp/PosUi/src/shared/ui/organisms/DataGrid.tsx | 주문/이력 그리드 |
| PosUi Shared | BrandPosApp/PosUi/src/shared/ui/organisms/MenuGrid.tsx | 메뉴 버튼 그리드 |
| Bridge Command | BrandPosApp/PosUi/src/bridge/commands/deliveryCommands.ts | 배달 커맨드 |
| C++ Actions | BrandPosApp/Presentation/CEF/InternalBridge/PosRequestActions/Delivery/DeliveryActions.cpp | thin router |
| C++ UseCase | BrandPosApp/UseCases/Delivery/ReceiveDeliveryOrderUseCase.cpp | 주문 생성 (3종) |
| C++ UseCase | BrandPosApp/UseCases/Delivery/SearchDeliveryAddressUseCase.cpp | 주소 검색 |
| C++ UseCase | BrandPosApp/UseCases/Delivery/PrintDeliverySlipUseCase.cpp | 주문 인쇄 |
| C++ Manager | BrandPosApp/Domain/Customer/CustMgr.cpp | 고객/배달 관련 |
| C++ Manager | BrandPosApp/Domain/Order/OrderMgr.cpp | 주문 생성 |
| C++ Manager | BrandPosApp/Domain/Item/ItemMgr.cpp | 메뉴 조회 |
| C++ Persistence | BrandPosApp/Infrastructure/Persistence/SQLite/Tables/Customer/DeliveryCrud.cpp | 배달 CRUD |
| C++ Store | BrandPosApp/Infrastructure/Persistence/SQLite/Stores/RequestLedgerStore.cpp | Ledger |
| C++ Store | BrandPosApp/Infrastructure/Persistence/SQLite/Stores/OutboxStore.cpp | Outbox |

---

## Appendix: 레거시 UI 참조

### A.1 기본 정보

| 항목 | 값 |
|---|---|
| 다이얼로그 ID | IDD_CUSTDELI2 |
| 리소스 값 | 169 |
| 크기 (DLU) | 512 x 384 |
| 다이얼로그 타입 | DIALOGEX |
| 스타일 | DS_SETFONT \| WS_POPUP |
| 소스 파일 | Restaurant.rc |
| 총 UI 요소 수 | 80 |

### A.2 레거시 UI 요소 목록

**버튼 (61개)**: IDC_DELI_CUSTSERCH(고객찾기), IDC_DELI_CUSTREGI(고객등록/수정), IDC_DELI_ADDRESS(배달주소), IDC_DELI_CLEAR(초기화), IDC_DELI_MAP(지도), IDCANCEL(닫기), IDC_O_TOPMENU1~10(메뉴 그룹 탭, 숨김/동적), IDC_O_TOPMENU14/15(위/아래), IDC_O_MENU*(메뉴 버튼 25개, 숨김/동적), IDC_O_BACK/NEXT(이전/다음), IDC_O_NUMBERADD/BACK(수량 +1/-1), IDC_O_TOTALCALLBACK(전체취소), IDC_O_ONECALLBACK(개별취소), IDC_O_DISCOUNT(할인), IDC_O_SERVICE(서비스), IDC_O_OTABLEOK(착석주문), IDC_O_OPACKOK(포장주문), IDC_O_ODELOK(배달주문완료), IDC_O_ORDERPRINT2(주문인쇄), IDC_O_KITCHENMEMO1(주문메모), IDC_O_MINIMIZE(최소화), IDC_O_DOUBLEMENU(세트메뉴), IDC_O_VATCHANGE(부가세전환), IDC_O_DOUBLE(상품교환, 숨김), IDC_DELI_ADDRESS2(배달주소2, 숨김)

**텍스트/라벨 (9개)**: 고객정보 라벨(숨김), 금액 표시(주문/할인/총)

**입력 필드 (7개)**: IDC_DELI_CUSTNAME(고객명), IDC_DELI_PHONE(전화), IDC_DELI_HPHONE(휴대폰), IDC_DELI_ADDR(주소), IDC_DELI_MEMO(메모), IDC_DELI_ORMEMO(주문비고, MULTILINE), IDC_CB_PAYTYPE(결제유형 콤보)

**그리드 (3개)**: IDC_GRID(주문아이템), IDC_GRID3(배달이력), IDC_GRID5(숨김-버퍼용, 제거 대상)

### A.3 마이그레이션 노트

- CUSTDELI의 확장형. 메뉴 그룹 탭(10개) + 메뉴 버튼(5x5 그리드) + 주문 목록 + 고객 정보 통합
- 메뉴 그룹 탭/메뉴 버튼 모두 숨김 상태로 동적 생성/표시. React 상태 기반 동적 렌더링으로 전환
- IDC_O_MINIMIZE(최소화)는 CEF 단일 인스턴스에서 불필요. React 라우팅으로 대체
- 착석/포장/배달 3종 확정 버튼 모두 ReceiveDeliveryOrderUseCase를 타되 orderType 파라미터로 분기
- IDC_GRID5(숨김 그리드)는 RTK Query 캐시로 대체하여 제거
- 주문 수량 조작, 취소, 할인, 서비스는 로컬 주문 상태에서 처리 후 확정 시 Bridge 전송
- 부가세 전환은 Domain/Manager에서 처리될 수 있음

---

## Progress Record

| 날짜 | 작업 | 상태 |
|---|---|---|
| 2026-04-05 | UI Shell 구현: `BrandPosApp/PosUi/src/screens/CustomerScreen/components/DeliveryManageV2Dialog.tsx` | Shell 완료 (menu group tabs, 5x5 menu grid, order state, 3-type confirm, stub handlers). Backend 미연결. |
