# INPUTANDCUST — 빠른 입력 + 고객 연결 모달

## 0. 문서 정보

| 항목 | 값 |
|---|---|
| 문서 ID | INPUTANDCUST |
| 레거시 다이얼로그 | IDD_INPUTANDCUST (430) |
| 신규 위치 | screens/OrderScreen/QuickInputModal |
| 작성일 | 2026-04-05 |
| 상태 | 초안 |

---

## 1. 화면 개요

주문 화면에서 빠른 입력을 위한 복합 모달 화면이다.
하나의 숫자 키패드로 3가지 모드를 처리한다:
1. **상품코드 입력** — 바코드/상품코드로 주문 추가
2. **고객번호 입력** — 회원번호로 고객 검색/연결
3. **고객 검색** — CustomerSearchModal 호출

추가로 고객 등록 해제와 신규 등록 기능을 제공한다.

---

## 2. 상위 기준 연결

| 기준 문서 | 관련 섹션 | 비고 |
|---|---|---|
| 04-Edge-POS-아키텍처-설계서 | InternalBridge, UseCases | 상품/고객 검색은 PosRequest 경유 |
| 05-Edge-POS-전체-흐름-AZ-가이드 | 주문 플로우 | 주문 화면 컨텍스트에서 동작 |

---

## 3. 기능 목록

| ID | 기능명 | 우선순위 | Bridge Command | UseCase | Domain/Manager | Infrastructure |
|---|---|---|---|---|---|---|
| INPUTCUST-F01 | 상품코드 입력 | P0 | N/A (UI 로컬, 주문 추가) | N/A | ItemMgr | N/A |
| INPUTCUST-F02 | 고객번호 입력 | P0 | CUSTOMER:SEARCH | SearchCustomerUseCase | CustMgr | Tables/Customer/CustomerCrud |
| INPUTCUST-F03 | 고객 검색 | P0 | CUSTOMER:SEARCH | SearchCustomerUseCase | CustMgr | Tables/Customer/CustomerCrud |
| INPUTCUST-F04 | 고객 등록 해제 | P0 | N/A (UI 로컬) | N/A | N/A | N/A |
| INPUTCUST-F05 | 고객 신규 등록 | P1 | CUSTOMER:REGISTER | RegisterCustomerUseCase | CustMgr | Tables/Customer/CustomerCrud |
| INPUTCUST-F06 | 키패드 입력 | P0 | N/A (UI 로컬) | N/A | N/A | N/A |
| INPUTCUST-F07 | 닫기/취소 | P0 | N/A (UI 로컬) | N/A | N/A | N/A |

---

## 4. UI 구조

### 4.1 화면 레이아웃

```
+--------------------------------------+
|                           [닫기]      |
+------------------+-------------------+
| [상품코드입력]    |  [숫자입력 TextInput] |
| [고객번호입력]    |                     |
| [고객찾기]        | NumericKeypad       |
|                   | [7][8][9][BS]       |
| [고객등록해제]    | [4][5][6][CLR]      |
| [고객등록]        | [1][2][3][0]        |
|                   | [만][천][확인]       |
+------------------+---------------------+
```

- 소형 모달 (320x239 DLU 기준)
- 좌측: 모드 전환 버튼 (상품/고객/검색/해제/등록)
- 우측: 숫자 입력 필드 + NumericKeypad (항상 표시)
- 키패드 항상 표시 — 터치 POS 전용 빠른 입력 패턴

### 4.2 사용 컴포넌트 (shared/ui)

| 컴포넌트 | 경로 | 용도 |
|---|---|---|
| TextInput | shared/ui/atoms/TextInput | 숫자 입력 필드 |
| NumericKeypad | shared/ui/organisms/NumericKeypad | 키패드 (항상 표시) |

---

## 5. 구현 명세

### 5.1 Bridge Command

**CUSTOMER:SEARCH** — custsel.md 참조 (고객번호 입력 시 1건 자동 적용, 복수 건이면 CustomerSearchModal 전환)

**CUSTOMER:REGISTER** — custregi.md 참조 (고객 신규 등록 → CustomerRegisterModal 호출)

> 상품코드 입력은 Bridge를 거치지 않고 주문 화면의 로컬 상태(또는 store/api/orderApi)에 직접 아이템을 추가하는 패턴이다. 상품 조회 시 ItemMgr 경유.

> TODO: 상품코드 입력 시 Bridge Command (ORDER:ADD_ITEM 등) 경유 여부 확정 필요 — 확인 필요: 로컬 캐시된 메뉴 데이터에서 즉시 매칭하는 경우 Bridge 불필요

#### UseCase 실패 규칙

| 실패 조건 | 에러 코드 | Ledger 상태 | UI 처리 |
|---|---|---|---|
| 고객번호 검색 결과 없음 | N/A (빈 배열) | N/A | 검색 결과 없음 안내 |
| 고객 등록 시 중복 전화번호 | DUPLICATE_PHONE | FAILED | 에러 메시지 표시 (custregi.md 참조) |

#### Permission

| 기능 | 권한 |
|---|---|
| 고객 검색/조회 | 로그인 직원 전원 |
| 고객 등록 | 로그인 직원 전원 |

### 5.2 RTK Query Endpoint

| Endpoint | 파일 | 메서드 | Tags |
|---|---|---|---|
| useSearchCustomersQuery | store/api/customerApi.tsx | CUSTOMER:SEARCH | `CustomerList` |

### 5.3 UseCases

| UseCase | 역할 | 멱등성 |
|---|---|---|
| SearchCustomerUseCase | 고객번호 기반 검색 | 조회 전용 |
| RegisterCustomerUseCase | 신규 고객 등록 (모달 호출) | idempotencyKey 필수 |

### 5.4 Domain / Manager

| Manager | 메서드 | 역할 |
|---|---|---|
| ItemMgr | FindItemByCode() | 상품코드로 메뉴 아이템 검색 |
| CustMgr | SearchCustomers() | 고객번호로 검색 |

### 5.5 Infrastructure

| 모듈 | 파일 | 역할 |
|---|---|---|
| Tables/Customer/CustomerCrud | Infrastructure/Persistence/SQLite/Tables/Customer/CustomerCrud.cpp | 고객 조회 |

### 5.6 PosRealTime 이벤트

해당 없음 (입력 전용 모달).

---

## 6. 테스트

| ID | 시나리오 | 예상 결과 |
|---|---|---|
| INPUTCUST-T01 | 상품코드 입력 모드 + 코드 입력 | 주문 목록에 아이템 추가 |
| INPUTCUST-T02 | 고객번호 입력 + 1건 매칭 | 자동 고객 연결 |
| INPUTCUST-T03 | 고객번호 입력 + 복수 매칭 | CustomerSearchModal 전환 |
| INPUTCUST-T04 | 고객번호 입력 + 0건 매칭 | 검색 결과 없음 안내 |
| INPUTCUST-T05 | 고객찾기 | CustomerSearchModal 열림 |
| INPUTCUST-T06 | 고객등록해제 | 현재 주문에서 고객 해제 |
| INPUTCUST-T07 | 고객등록 | CustomerRegisterModal 열림 |
| INPUTCUST-T08 | 닫기 | 모달 닫힘 |

---

## 7. 완료 기준

- [ ] 3가지 모드 전환 동작 (상품코드/고객번호/고객검색)
- [ ] 상품코드 입력 → 주문 추가 연동
- [ ] 고객번호 입력 → 자동 적용/검색 모달 분기
- [ ] 고객 등록 해제 동작
- [ ] CustomerSearchModal, CustomerRegisterModal 호출 연동
- [ ] NumericKeypad 항상 표시, 입력 정상
- [ ] 1024x768 해상도, 터치 사용성 검증

---

## 8. 작업 명단

| 계층 | 파일 경로 | 작업 내용 |
|---|---|---|
| PosUi Screen | BrandPosApp/PosUi/src/screens/OrderScreen/QuickInputModal.tsx | 빠른 입력 모달 |
| PosUi Screen | BrandPosApp/PosUi/src/screens/CustomerScreen/CustomerSearchModal.tsx | 고객 검색 모달 (custsel.md) |
| PosUi Screen | BrandPosApp/PosUi/src/screens/CustomerScreen/CustomerRegisterModal.tsx | 고객 등록 모달 (custregi.md) |
| PosUi Store | BrandPosApp/PosUi/src/store/api/customerApi.ts | useSearchCustomersQuery |
| PosUi Store | BrandPosApp/PosUi/src/store/api/orderApi.ts | 주문 아이템 추가 연동 |
| PosUi Shared | BrandPosApp/PosUi/src/shared/ui/atoms/TextInput.tsx | 숫자 입력 |
| PosUi Shared | BrandPosApp/PosUi/src/shared/ui/organisms/NumericKeypad.tsx | 키패드 |
| Bridge Command | BrandPosApp/PosUi/src/bridge/commands/customerCommands.ts | CUSTOMER:SEARCH |
| C++ Actions | BrandPosApp/Presentation/CEF/InternalBridge/PosRequestActions/Customer/CustomerActions.cpp | thin router |
| C++ UseCase | BrandPosApp/UseCases/Customer/SearchCustomerUseCase.cpp | 고객 검색 |
| C++ Manager | BrandPosApp/Domain/Customer/CustMgr.cpp | 고객 검색 |
| C++ Manager | BrandPosApp/Domain/Item/ItemMgr.cpp | 상품코드 검색 |
| C++ Persistence | BrandPosApp/Infrastructure/Persistence/SQLite/Tables/Customer/CustomerCrud.cpp | 고객 CRUD |

---

## 9. 작업 진행 기록
| 날짜 | 범위 | 상태 | 완료 범위 | 남은 범위 | 내용 |
|---|---|---|---|---|---|
| 2026-04-05 | Shell 구현 | 완료 | 레이아웃+로컬상태+stub | Bridge/UseCase 연동 | InputAndCustomerDialog.tsx shell 구현 완료. Modal, Button 사용. 3가지 모드(상품코드/고객번호/고객검색) 전환 + 내장 넘패드(항상 표시) + 고객등록해제/등록 버튼 stub. |

---

## Appendix: 레거시 UI 참조

### A.1 기본 정보

| 항목 | 값 |
|---|---|
| 다이얼로그 ID | IDD_INPUTANDCUST |
| 리소스 값 | 430 |
| 크기 (DLU) | 320 x 239 |
| 다이얼로그 타입 | DIALOGEX |
| 스타일 | DS_SETFONT \| DS_MODALFRAME \| WS_POPUP |
| 소스 파일 | Restaurant.rc |
| 총 UI 요소 수 | 22 |

### A.2 레거시 UI 요소 목록

**버튼 (21개)**: IDC_ITEMINPUT(상품코드입력), IDC_CUSTNUMINPUT(고객번호입력), IDC_CUSTSERCH(고객찾기), IDC_CUSTCANCEL(고객등록해제), IDC_CUSTREG(고객등록), IDCANCEL(닫기), IDC_N_NUM0~9/BS/CLR/000/0000/00(키패드, 항상 표시)

**입력 필드 (1개)**: IDC_NUM_NUM (숫자 입력, ES_NUMBER, ES_RIGHT)

### A.3 마이그레이션 노트

- 주문 화면에서 빠른 입력을 위한 복합 모달. 상품코드/고객번호/고객검색 3가지 모드를 하나의 키패드로 처리
- IDC_ITEMINPUT은 상품 바코드/코드를 입력하여 주문에 추가. 주문 화면 컨텍스트에서 동작
- IDC_CUSTNUMINPUT은 회원번호 직접 입력. 1건이면 자동 적용, 복수면 검색 모달 전환
- IDC_CUSTCANCEL은 현재 주문에 연결된 고객을 해제
- 키패드 항상 표시 — 터치 POS 전용 빠른 입력 UI 패턴
