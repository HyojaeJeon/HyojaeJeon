# CUSTSEL — 고객 검색 모달

## 0. 문서 정보

| 항목 | 값 |
|---|---|
| 문서 ID | CUSTSEL |
| 레거시 다이얼로그 | IDD_CUSTSEL (378) |
| 신규 위치 | screens/CustomerScreen/CustomerSearchModal |
| 작성일 | 2026-04-05 |
| 상태 | 초안 |

---

## 1. 화면 개요

고객을 이름, 전화번호, 주소 등으로 검색하고 선택하는 모달 화면이다.
주문/결제/배달 등 고객 연결이 필요한 모든 흐름에서 공통으로 호출된다.
레거시 IDD_CUSTSEL 다이얼로그를 대체한다.

---

## 2. 상위 기준 연결

| 기준 문서 | 관련 섹션 | 비고 |
|---|---|---|
| 04-Edge-POS-아키텍처-설계서 | InternalBridge, UseCases 계층 | 검색은 PosRequest 경유 |
| 05-Edge-POS-전체-흐름-AZ-가이드 | 고객 검색 플로우 | DB 먼저, UI 다음 원칙 적용 |
| 06-P0-P1-설계-보완-체크리스트 | Customer 도메인 | P0 우선 구현 대상 |

---

## 3. 기능 목록

| ID | 기능명 | 우선순위 | Bridge Command | UseCase | Domain/Manager | Infrastructure |
|---|---|---|---|---|---|---|
| CUSTSEL-F01 | 고객 검색 (이름/번호) | P0 | CUSTOMER:SEARCH | SearchCustomerUseCase | CustMgr | Tables/Customer/CustomerCrud |
| CUSTSEL-F02 | 고객 주소 검색 | P1 | CUSTOMER:SEARCH | SearchCustomerUseCase | CustMgr | Tables/Customer/CustomerCrud |
| CUSTSEL-F03 | 키패드 입력 | P0 | N/A (UI 로컬) | N/A | N/A | N/A |
| CUSTSEL-F04 | 고객 선택 확정 | P0 | CUSTOMER:GET_DETAIL | GetCustomerDetailUseCase | CustMgr | Tables/Customer/CustomerCrud |
| CUSTSEL-F05 | 검색 결과 스크롤 | P2 | N/A (UI 로컬) | N/A | N/A | N/A |
| CUSTSEL-F06 | 닫기/취소 | P0 | N/A (UI 로컬) | N/A | N/A | N/A |
| CUSTSEL-F07 | 키보드 전환 | P2 | N/A (UI 로컬) | N/A | N/A | N/A |
| CUSTSEL-F08 | 휴대폰번호 입력받기 | P1 | CUSTOMER:SEARCH | SearchCustomerUseCase | CustMgr | Tables/Customer/CustomerCrud |
| CUSTSEL-F09 | 휴대폰번호 체크박스 토글 | P1 | N/A (UI 로컬) | N/A | N/A | N/A |

---

## 4. UI 구조

### 4.1 화면 레이아웃

```
+--------------------------------------------------+
| [검색입력(TextInput)] [검색] [주소검색] [전화번호입력받기] |
| [ ] 휴대폰번호 검색                                  |
+--------------------------------------------------+
| 검색 결과 DataGrid                                  |
| (고객코드, 고객명, 전화번호, 주소 등)                   |
|                                                    |
|                                                    |
+--------------------------------------------------+
| [저장/선택]  [닫기]                                  |
+--------------------------------------------------+
```

- 모달 형태로 표시 (1024x768 기준, 화면 중앙)
- 터치 환경 시 NumericKeypad 조건부 표시

### 4.2 사용 컴포넌트 (shared/ui)

| 컴포넌트 | 경로 | 용도 |
|---|---|---|
| TextInput | shared/ui/atoms/TextInput | 검색 입력 필드 |
| Checkbox | shared/ui/atoms/Checkbox | 휴대폰번호 검색 필터 토글 |
| DataGrid | shared/ui/organisms/DataGrid | 검색 결과 목록 표시 |
| NumericKeypad | shared/ui/organisms/NumericKeypad | 터치 환경 숫자 입력 |
| VirtualKeyboard | shared/ui/organisms/VirtualKeyboard | 터치 환경 문자 입력 (P2) |

---

## 5. 구현 명세

### 5.1 Bridge Command

**CUSTOMER:SEARCH**

```jsonc
// Request
{
  "v": 1,
  "requestId": "<uuid>",
  "timestamp": "<ISO8601>",
  "command": "CUSTOMER:SEARCH",
  "params": {
    "keyword": "string",                        // 이름 또는 번호
    "searchType": "name" | "phone" | "barcode", // 검색 유형
    "phoneOnly": "boolean"                      // 휴대폰번호 검색 여부
  }
}

// Response (성공)
{
  "v": 1,
  "requestId": "<echo>",
  "timestamp": "<ISO8601>",
  "status": "OK",
  "data": {
    "customers": [
      {
        "id": "string",
        "name": "string",
        "phone": "string",
        "point": "number"
      }
    ]
  }
}
```

> Error: 정의된 에러 코드 없음. 검색 결과가 없으면 빈 배열 반환.

**CUSTOMER:GET_DETAIL** — 고객 선택 확정 시 상세 조회

```jsonc
// Request
{
  "v": 1,
  "requestId": "<uuid>",
  "timestamp": "<ISO8601>",
  "command": "CUSTOMER:GET_DETAIL",
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
    "customer": { /* full detail — cust-detail.md 참조 */ }
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

#### UseCase 실패 규칙

| 실패 조건 | 에러 코드 | UI 처리 |
|---|---|---|
| customerId에 해당하는 고객 없음 | CUSTOMER_NOT_FOUND | 안내 메시지 표시, 모달 닫힘 없음 |

#### Permission

| 기능 | 권한 |
|---|---|
| 고객 검색/조회 | 로그인 직원 전원 |

### 5.2 RTK Query Endpoint

| Endpoint | 파일 | 메서드 | Tags |
|---|---|---|---|
| useSearchCustomersQuery | store/api/customerApi.tsx | CUSTOMER:SEARCH | `CustomerList` |
| useGetCustomerDetailQuery | store/api/customerApi.tsx | CUSTOMER:GET_DETAIL | `Customer:{custCode}` |

### 5.3 UseCases

| UseCase | 역할 | 멱등성 |
|---|---|---|
| SearchCustomerUseCase | 키워드 기반 고객 검색, DB 조회 후 결과 반환 | 조회 전용, idempotencyKey 불필요 |
| GetCustomerDetailUseCase | 고객 상세 정보 조회 | 조회 전용, idempotencyKey 불필요 |

### 5.4 Domain / Manager

| Manager | 메서드 | 역할 |
|---|---|---|
| CustMgr | SearchCustomers() | 검색 조건 파싱, DB 조회 위임 |
| CustMgr | GetCustomerDetail() | 단일 고객 상세 조회 |

### 5.5 Infrastructure

| 모듈 | 파일 | 역할 |
|---|---|---|
| Tables/Customer/CustomerCrud | Infrastructure/Persistence/SQLite/Tables/Customer/CustomerCrud.cpp | 고객 테이블 CRUD |

### 5.6 PosRealTime 이벤트

해당 없음 (조회 전용 화면).

---

## 6. 테스트

| ID | 시나리오 | 예상 결과 |
|---|---|---|
| CUSTSEL-T01 | 이름으로 검색 | 매칭 고객 목록 DataGrid에 표시 |
| CUSTSEL-T02 | 전화번호로 검색 | 매칭 고객 목록 표시 |
| CUSTSEL-T03 | 주소로 검색 | 매칭 고객 목록 표시 |
| CUSTSEL-T04 | 검색 결과 없음 | 빈 목록 + 안내 메시지 |
| CUSTSEL-T05 | 고객 선택 후 확인 | 선택 고객 정보가 호출 화면에 반환 |
| CUSTSEL-T06 | 닫기 | 모달 닫힘, 호출 화면 상태 변경 없음 |
| CUSTSEL-T07 | 휴대폰번호 체크 후 검색 | 휴대폰번호 필드 기준 검색 |

---

## 7. 완료 기준

- [ ] CUSTOMER:SEARCH Bridge Command 왕복 동작
- [ ] CUSTOMER:GET_DETAIL Bridge Command 왕복 동작
- [ ] DataGrid에 검색 결과 표시
- [ ] 고객 선택 시 부모 화면에 결과 반환
- [ ] 검색 결과 없음 상태 처리
- [ ] 모달 열기/닫기 정상 동작
- [ ] 1024x768 해상도, 터치 사용성 검증

---

## 8. 작업 명단

| 계층 | 파일 경로 | 작업 내용 |
|---|---|---|
| PosUi Screen | BrandPosApp/PosUi/src/screens/CustomerScreen/CustomerSearchModal.tsx | 모달 화면 구현 |
| PosUi Store | BrandPosApp/PosUi/src/store/api/customerApi.ts | useSearchCustomersQuery, useGetCustomerDetailQuery |
| PosUi Shared | BrandPosApp/PosUi/src/shared/ui/organisms/DataGrid.tsx | 공용 DataGrid (기존 또는 신규) |
| PosUi Shared | BrandPosApp/PosUi/src/shared/ui/organisms/NumericKeypad.tsx | 공용 키패드 (기존 또는 신규) |
| PosUi Shared | BrandPosApp/PosUi/src/shared/ui/atoms/TextInput.tsx | 공용 텍스트 입력 (기존 또는 신규) |
| PosUi Shared | BrandPosApp/PosUi/src/shared/ui/atoms/Checkbox.tsx | 공용 체크박스 (기존 또는 신규) |
| Bridge Command | BrandPosApp/PosUi/src/bridge/commands/customerCommands.ts | CUSTOMER:SEARCH, CUSTOMER:GET_DETAIL 커맨드 |
| C++ Actions | BrandPosApp/Presentation/CEF/InternalBridge/PosRequestActions/Customer/CustomerActions.cpp | thin router |
| C++ UseCase | BrandPosApp/UseCases/Customer/SearchCustomerUseCase.cpp | 검색 유스케이스 |
| C++ UseCase | BrandPosApp/UseCases/Customer/GetCustomerDetailUseCase.cpp | 상세 조회 유스케이스 |
| C++ Manager | BrandPosApp/Domain/Customer/CustMgr.cpp | 고객 매니저 |
| C++ Persistence | BrandPosApp/Infrastructure/Persistence/SQLite/Tables/Customer/CustomerCrud.cpp | 고객 CRUD |

---

## Appendix: 레거시 UI 참조

### A.1 기본 정보

| 항목 | 값 |
|---|---|
| 다이얼로그 ID | IDD_CUSTSEL |
| 리소스 값 | 378 |
| 크기 (DLU) | 450 x 337 |
| 다이얼로그 타입 | DIALOGEX |
| 스타일 | DS_SETFONT \| DS_MODALFRAME \| WS_POPUP |
| 폰트 | 10, "System", 0, 0, 0x0 |
| 소스 파일 | Restaurant.rc |
| 총 UI 요소 수 | 26 |

### A.2 레거시 UI 요소 목록

**버튼 (23개)**

| ID | 라벨 | 위치 (x,y) | 크기 (w x h) | 숨김 | 용도 추정 |
|---|---|---|---|---|---|
| IDC_CUSTSEL_SERCH | 검색 | (221,44) | 50 x 24 | FALSE | 검색 버튼 |
| IDC_CUSTSEL_KEY | 키보드 | (230,7) | 35 x 13 | TRUE | 키보드 전환 |
| IDC_CUST_SAVE | 저장 | (335,8) | 50 x 24 | FALSE | 저장/선택 버튼 |
| IDCANCEL | 닫기 | (387,8) | 50 x 24 | FALSE | 닫기/취소 |
| IDC_CUSTGRID_UP | (상) | (424,71) | 15 x 47 | FALSE | 위로 스크롤 |
| IDC_CUSTGRID_DOWN | (하) | (424,277) | 15 x 47 | FALSE | 아래로 스크롤 |
| IDC_N_NUM0~9, BS, CLR, 000, 0000, 00 | 키패드 | 다수 | 다수 | TRUE | 숫자 키패드 (숨김, 조건부 표시) |
| IDC_CUSTSEL_SERCH2 | 주소검색 | (277,44) | 50 x 24 | FALSE | 주소 검색 |
| IDC_BTN_GETHPHONE | 전화번호입력받기 | (341,44) | 50 x 24 | FALSE | 전화번호 입력 |

**입력 필드 (2개)**

| ID | 타입 | 용도 |
|---|---|---|
| IDC_CUSTSEL_NAME_NO | EditText | 검색 입력 (이름/번호) |
| IDC_CHK_HPHONE | CheckBox | 휴대폰번호 검색 토글 |

**그리드 (1개)**

| ID | 타입 | 용도 |
|---|---|---|
| IDC_GRID | MFCGridCtrl | 검색 결과 그리드 |

### A.3 마이그레이션 노트

- 레거시 숫자 키패드(IDC_N_NUM*)는 숨김 상태(NOT WS_VISIBLE)로 조건부 표시됨. 신규에서는 터치 키패드가 필요한 경우 shared/ui/organisms/NumericKeypad를 조건부 렌더링
- 검색 결과 그리드의 위/아래 스크롤 버튼(IDC_CUSTGRID_UP/DOWN)은 웹 네이티브 스크롤로 대체
- IDC_CUSTSEL_KEY(키보드 전환)는 터치 환경에서 가상 키보드 토글로 재해석
- 고객 선택 후 반환값은 Bridge 응답 payload로 전달 (레거시는 다이얼로그 반환값)

---

## Progress Record

| 날짜 | 작업 | 상태 |
|---|---|---|
| 2026-04-05 | UI Shell 구현: `BrandPosApp/PosUi/src/screens/CustomerScreen/components/CustomerSearchDialog.tsx` | Shell 완료 (layout, local state, stub handlers). Backend 미연결. |
