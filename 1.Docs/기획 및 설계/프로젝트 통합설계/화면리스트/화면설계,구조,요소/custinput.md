# CUSTINPUT — 고객 관리 메인 화면

## 0. 문서 정보

| 항목 | 값 |
|---|---|
| 문서 ID | CUSTINPUT |
| 레거시 다이얼로그 | IDD_CUSTINPUT (138) |
| 신규 위치 | screens/CustomerScreen/CustomerListPanel |
| 작성일 | 2026-04-05 |
| 상태 | 초안 |

---

## 1. 화면 개요

고객 관리의 메인 리스트 화면이다.
고객 목록 조회, 검색, 추가, 수정, 삭제를 수행하며, 상세 설정/포인트 이력/상품권/킵 상품 등 하위 모달을 호출하는 허브 역할을 한다.
레거시 IDD_CUSTINPUT 다이얼로그를 대체한다.

---

## 2. 상위 기준 연결

| 기준 문서 | 관련 섹션 | 비고 |
|---|---|---|
| 04-Edge-POS-아키텍처-설계서 | UseCases, Domain 계층 | CRUD 작업은 UseCases 경유 |
| 05-Edge-POS-전체-흐름-AZ-가이드 | 고객 관리 플로우 | 수정/삭제는 idempotencyKey 필수 |
| 06-P0-P1-설계-보완-체크리스트 | Customer 도메인 | P0~P2 혼합 |

---

## 3. 기능 목록

| ID | 기능명 | 우선순위 | Bridge Command | UseCase | Domain/Manager | Infrastructure |
|---|---|---|---|---|---|---|
| CUSTINPUT-F01 | 고객 검색 (전화번호) | P0 | CUSTOMER:SEARCH | SearchCustomerUseCase | CustMgr | Tables/Customer/CustomerCrud |
| CUSTINPUT-F02 | 고객 신규 추가 | P0 | CUSTOMER:REGISTER | RegisterCustomerUseCase | CustMgr | Tables/Customer/CustomerCrud |
| CUSTINPUT-F03 | 고객 정보 저장 | P0 | CUSTOMER:UPDATE | UpdateCustomerUseCase | CustMgr | Tables/Customer/CustomerCrud |
| CUSTINPUT-F04 | 선택 고객 삭제 | P1 | CUSTOMER:UPDATE | UpdateCustomerUseCase | CustMgr | Tables/Customer/CustomerCrud |
| CUSTINPUT-F05 | 주소 보기 토글 | P2 | N/A (UI 로컬) | N/A | N/A | N/A |
| CUSTINPUT-F06 | 고객 상세 설정 | P0 | CUSTOMER:GET_DETAIL | GetCustomerDetailUseCase | CustMgr | Tables/Customer/CustomerCrud |
| CUSTINPUT-F07 | 포인트 이력 조회 | P1 | CUSTOMER:GET_DETAIL | GetCustomerDetailUseCase | CustMgr | Tables/Customer/CustomerCrud |
| CUSTINPUT-F08 | 상품권 관리 | P1 | CUSTOMER:GET_DETAIL | GetCustomerDetailUseCase | CustMgr | Tables/Customer/CustomerCrud |
| CUSTINPUT-F09 | 킵 상품 관리 | P1 | CUSTOMER:GET_KEEP_ITEMS | GetCustomerKeepItemsUseCase | CustMgr | Tables/Customer/KeepItemCrud |
| CUSTINPUT-F10 | SMS 전송 | P2 | N/A (외부 연동) | N/A | N/A | N/A |
| CUSTINPUT-F11 | 담당자 관리 | P2 | N/A | N/A | StaffMgr | N/A |
| CUSTINPUT-F12 | 매장별 상품권 조회 | P2 | CUSTOMER:GET_DETAIL | GetCustomerDetailUseCase | CustMgr | Tables/Customer/CustomerCrud |
| CUSTINPUT-F13 | 닫기/취소 | P0 | N/A (UI 로컬) | N/A | N/A | N/A |
| CUSTINPUT-F14 | 일괄 적용 | P2 | CUSTOMER:UPDATE | UpdateCustomerUseCase | CustMgr | Tables/Customer/CustomerCrud |
| CUSTINPUT-F15 | 선택 저장 | P2 | CUSTOMER:UPDATE | UpdateCustomerUseCase | CustMgr | Tables/Customer/CustomerCrud |
| CUSTINPUT-F16 | 전체 삭제 | P2 | CUSTOMER:UPDATE | UpdateCustomerUseCase | CustMgr | Tables/Customer/CustomerCrud |
| CUSTINPUT-F17 | 킵 일괄 적용 | P2 | CUSTOMER:ADD_KEEP | AddKeepItemUseCase | CustMgr | Tables/Customer/KeepItemCrud |
| CUSTINPUT-F18 | 키패드 입력 | P0 | N/A (UI 로컬) | N/A | N/A | N/A |

---

## 4. UI 구조

### 4.1 화면 레이아웃

```
+--------------------------------------------------------------+
| [추가] [저장] [선택삭제]  [검색입력] [검색] [주소보기]  [닫기]   |
+--------------------------------------------------------------+
| 고객 목록 DataGrid (inline edit)                               |
| (코드, 이름, 전화번호, 휴대폰, 주소, 포인트 등)                  |
|                                                                |
|                                                                |
+--------------------------------------------------------------+
|  [상세설정] [포인트이력] [상품권] [킵상품]                        |
|  [SMS전송*] [매장상품권*] [담당자*] [킵일괄*]                    |
+--------------------------------------------------------------+
* = 권한/설정 기반 조건부 표시
```

- 풀스크린(512x384 DLU 기반) 형태
- 우측에 기능 버튼 세로 배치
- 숨김 버튼들은 feature flag / 권한 기반 조건부 렌더링

### 4.2 사용 컴포넌트 (shared/ui)

| 컴포넌트 | 경로 | 용도 |
|---|---|---|
| TextInput | shared/ui/atoms/TextInput | 검색 입력 |
| DataGrid | shared/ui/organisms/DataGrid | 고객 목록 (inline edit 지원) |
| NumericKeypad | shared/ui/organisms/NumericKeypad | 터치 환경 숫자 입력 |

---

## 5. 구현 명세

### 5.1 Bridge Command

**CUSTOMER:SEARCH** — custsel.md 참조

**CUSTOMER:UPDATE**

```jsonc
// Request
{
  "v": 1,
  "requestId": "<uuid>",
  "timestamp": "<ISO8601>",
  "idempotencyKey": "CUSTOMER:UPDATE:<uuid>",
  "command": "CUSTOMER:UPDATE",
  "params": {
    "customerId": "string",
    "fields": {
      "name": "string",
      "phone": "string",
      "address": "string",
      "memo": "string"
      // ... 변경된 필드만
    }
  }
}

// Response (성공)
{
  "v": 1,
  "requestId": "<echo>",
  "timestamp": "<ISO8601>",
  "status": "OK",
  "data": {
    "customer": { /* 업데이트된 고객 정보 */ }
  }
}

// Response (실패)
{
  "v": 1,
  "requestId": "<echo>",
  "timestamp": "<ISO8601>",
  "status": "ERROR",
  "error": {
    "code": "CUSTOMER_NOT_FOUND",
    "msgKey": "error.customer.notFound"
  }
}
```

> idempotencyKey 필수 (상태 변경 mutation)

#### UseCase 실패 규칙

| 실패 조건 | 에러 코드 | Ledger 상태 | UI 처리 |
|---|---|---|---|
| customerId에 해당하는 고객 없음 | CUSTOMER_NOT_FOUND | FAILED | 에러 메시지 표시 |
| 동일 idempotencyKey 재전송 | N/A (기존 결과 반환) | 기존 상태 유지 | 성공 응답 그대로 처리 |

#### Permission

| 기능 | 권한 |
|---|---|
| 고객 검색/조회 | 로그인 직원 전원 |
| 고객 등록/수정 | 로그인 직원 전원 |
| 킵 등록/사용 | 로그인 직원 전원 |

**CUSTOMER:GET_KEEP_ITEMS**

```jsonc
// Request
{
  "v": 1,
  "requestId": "<uuid>",
  "timestamp": "<ISO8601>",
  "command": "CUSTOMER:GET_KEEP_ITEMS",
  "params": {
    "customerId": "string"
  }
}

// Response (성공)
{
  "v": 1,
  "requestId": "<echo>",
  "timestamp": "<ISO8601>",
  "status": "OK",
  "data": {
    "keepItems": [ /* cust-keep.md 참조 */ ]
  }
}

// Response (실패)
{
  "v": 1,
  "requestId": "<echo>",
  "timestamp": "<ISO8601>",
  "status": "ERROR",
  "error": {
    "code": "CUSTOMER_NOT_FOUND",
    "msgKey": "error.customer.notFound"
  }
}
```

### 5.2 RTK Query Endpoint

| Endpoint | 파일 | 메서드 | Tags |
|---|---|---|---|
| useSearchCustomersQuery | store/api/customerApi.tsx | CUSTOMER:SEARCH | `CustomerList` |
| useUpdateCustomerMutation | store/api/customerApi.tsx | CUSTOMER:UPDATE | invalidates `Customer:{custCode}` |
| useGetCustomerKeepItemsQuery | store/api/customerApi.tsx | CUSTOMER:GET_KEEP_ITEMS | `KeepItems:{custCode}` |

### 5.3 UseCases

| UseCase | 역할 | 멱등성 |
|---|---|---|
| SearchCustomerUseCase | 키워드 기반 고객 검색 | 조회 전용 |
| RegisterCustomerUseCase | 고객 신규 등록 | idempotencyKey 필수 |
| UpdateCustomerUseCase | 고객 정보 수정/삭제 | idempotencyKey 필수 |
| GetCustomerDetailUseCase | 고객 상세 조회 | 조회 전용 |
| GetCustomerKeepItemsUseCase | 킵 상품 목록 조회 | 조회 전용 |
| AddKeepItemUseCase | 킵 상품 일괄 등록 | idempotencyKey 필수 |

### 5.4 Domain / Manager

| Manager | 메서드 | 역할 |
|---|---|---|
| CustMgr | SearchCustomers() | 검색 |
| CustMgr | UpdateCustomer() | 고객 정보 수정 |
| CustMgr | DeleteCustomer() | 고객 삭제 (논리 삭제) |
| StaffMgr | GetStaffList() | 담당자 목록 (P2) |

### 5.5 Infrastructure

| 모듈 | 파일 | 역할 |
|---|---|---|
| Tables/Customer/CustomerCrud | Infrastructure/Persistence/SQLite/Tables/Customer/CustomerCrud.cpp | 고객 CRUD |
| Tables/Customer/KeepItemCrud | Infrastructure/Persistence/SQLite/Tables/Customer/KeepItemCrud.cpp | 킵 상품 CRUD |
| RequestLedgerStore | Infrastructure/Persistence/SQLite/Stores/RequestLedgerStore.cpp | Ledger |

### 5.6 PosRealTime 이벤트

| 이벤트 | 조건 | 수신 측 |
|---|---|---|
| CUSTOMER:UPDATED | 수정 성공 후 | 다른 POS에서 고객 목록 갱신 |

---

## 6. 테스트

| ID | 시나리오 | 예상 결과 |
|---|---|---|
| CUSTINPUT-T01 | 전화번호로 검색 | 매칭 고객 목록 표시 |
| CUSTINPUT-T02 | 고객 추가 버튼 클릭 | CustomerRegisterModal 열림 |
| CUSTINPUT-T03 | 그리드 inline 수정 후 저장 | 변경사항 DB 반영 |
| CUSTINPUT-T04 | 선택 삭제 | 선택 고객 논리 삭제 |
| CUSTINPUT-T05 | 상세 설정 버튼 | CustomerDetailModal 열림 |
| CUSTINPUT-T06 | 킵 상품 버튼 | KeepItemModal 열림 |
| CUSTINPUT-T07 | 숨김 기능 버튼 (권한 없음) | 버튼 미표시 |
| CUSTINPUT-T08 | 숨김 기능 버튼 (권한 있음) | 버튼 표시 및 동작 |

---

## 7. 완료 기준

- [ ] CUSTOMER:SEARCH, CUSTOMER:UPDATE Bridge Command 왕복 동작
- [ ] DataGrid inline edit + 저장 동작
- [ ] 하위 모달(상세, 포인트, 상품권, 킵) 호출 및 데이터 연동
- [ ] 권한/설정 기반 조건부 기능 버튼 표시
- [ ] idempotencyKey 기반 중복 수정 방지
- [ ] 1024x768 해상도, 터치 사용성 검증

---

## 8. 작업 명단

| 계층 | 파일 경로 | 작업 내용 |
|---|---|---|
| PosUi Screen | BrandPosApp/PosUi/src/screens/CustomerScreen/CustomerListPanel.tsx | 고객 관리 메인 화면 |
| PosUi Screen | BrandPosApp/PosUi/src/screens/CustomerScreen/CustomerRegisterModal.tsx | 등록 모달 (custregi.md) |
| PosUi Screen | BrandPosApp/PosUi/src/screens/CustomerScreen/CustomerDetailModal.tsx | 상세 모달 (cust-detail.md) |
| PosUi Screen | BrandPosApp/PosUi/src/screens/CustomerScreen/PointHistoryModal.tsx | 포인트 이력 모달 |
| PosUi Screen | BrandPosApp/PosUi/src/screens/CustomerScreen/TicketModal.tsx | 상품권 모달 |
| PosUi Screen | BrandPosApp/PosUi/src/screens/CustomerScreen/KeepItemModal.tsx | 킵 상품 모달 (cust-keep.md) |
| PosUi Store | BrandPosApp/PosUi/src/store/api/customerApi.ts | 고객 관련 전체 endpoints |
| PosUi Shared | BrandPosApp/PosUi/src/shared/ui/organisms/DataGrid.tsx | 공용 DataGrid |
| PosUi Shared | BrandPosApp/PosUi/src/shared/ui/organisms/NumericKeypad.tsx | 공용 키패드 |
| Bridge Command | BrandPosApp/PosUi/src/bridge/commands/customerCommands.ts | 고객 커맨드 전체 |
| C++ Actions | BrandPosApp/Presentation/CEF/InternalBridge/PosRequestActions/Customer/CustomerActions.cpp | thin router |
| C++ UseCase | BrandPosApp/UseCases/Customer/SearchCustomerUseCase.cpp | 검색 |
| C++ UseCase | BrandPosApp/UseCases/Customer/UpdateCustomerUseCase.cpp | 수정/삭제 |
| C++ UseCase | BrandPosApp/UseCases/Customer/GetCustomerKeepItemsUseCase.cpp | 킵 조회 |
| C++ Manager | BrandPosApp/Domain/Customer/CustMgr.cpp | 고객 매니저 |
| C++ Persistence | BrandPosApp/Infrastructure/Persistence/SQLite/Tables/Customer/CustomerCrud.cpp | 고객 CRUD |
| C++ Persistence | BrandPosApp/Infrastructure/Persistence/SQLite/Tables/Customer/KeepItemCrud.cpp | 킵 CRUD |

---

## Appendix: 레거시 UI 참조

### A.1 기본 정보

| 항목 | 값 |
|---|---|
| 다이얼로그 ID | IDD_CUSTINPUT |
| 리소스 값 | 138 |
| 크기 (DLU) | 512 x 384 |
| 다이얼로그 타입 | DIALOGEX |
| 스타일 | DS_SETFONT \| WS_POPUP |
| 소스 파일 | Restaurant.rc |
| 총 UI 요소 수 | 35 |

### A.2 레거시 UI 요소 목록

**버튼 (32개)**: ID_CUST_SERCH(검색), ID_CUST_ADD(추가), ID_CUST_ALLSAVE(저장), ID_CUST_SELDEL(선택삭제), IDC_ADDRVIEW(주소보기), ID_CUST_DETAIL(상세), ID_CUST_POINT(포인트이력), ID_CUST_TICK(상품권), ID_CUST_KEEP(킵상품), IDCANCEL(닫기), 키패드(IDC_N_NUM*, 숨김), 숨김 기능 버튼(ID_CUST_ALLAPPLY, ID_CUST_SELSAVE, ID_CUST_ALLDEL, ID_CUST_SMS, ID_CUST_EMP, ID_CUST_STORETICK, ID_CUST_KEEPALL)

**입력 필드 (1개)**: ID_CUST_PHONE (전화번호 검색)

**그리드 (1개)**: IDC_GRID (고객 목록)

### A.3 마이그레이션 노트

- 숨김 상태 버튼은 설정/권한에 따라 조건부 표시되는 기능. 신규에서는 feature flag 또는 권한 기반 조건부 렌더링
- 키패드(IDC_N_NUM*)는 터치 모드 전환 시 표시. shared/ui/organisms/NumericKeypad로 통합
- 그리드 편집(inline edit) + 저장 패턴은 DataGrid 편집 모드 + mutation으로 전환
- 이 화면은 여러 하위 모달(상세, 포인트, 상품권, 킵)을 호출하는 허브 역할

---

## Progress Record

| 날짜 | 작업 | 상태 |
|---|---|---|
| 2026-04-05 | UI Shell 구현: `BrandPosApp/PosUi/src/screens/CustomerScreen/components/CustomerInputDialog.tsx` | Shell 완료 (layout, local state, stub handlers, inline edit grid). Backend 미연결. |
