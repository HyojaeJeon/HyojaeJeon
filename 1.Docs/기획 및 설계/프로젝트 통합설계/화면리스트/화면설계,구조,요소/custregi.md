# CUSTREGI — 고객 신규 등록 모달

## 0. 문서 정보

| 항목 | 값 |
|---|---|
| 문서 ID | CUSTREGI |
| 레거시 다이얼로그 | IDD_CUSTREGI (409) |
| 신규 위치 | screens/CustomerScreen/CustomerRegisterModal |
| 작성일 | 2026-04-05 |
| 상태 | 초안 |

---

## 1. 화면 개요

신규 고객을 등록하는 모달 화면이다.
회원번호, 고객명, 휴대폰번호, 전화번호, 주소, 메모, 고객 유형을 입력받아 저장한다.
고객 검색(CUSTSEL), 고객 관리(CUSTINPUT), 배달(CUSTDELI/CUSTDELI2) 등 다양한 화면에서 호출된다.

---

## 2. 상위 기준 연결

| 기준 문서 | 관련 섹션 | 비고 |
|---|---|---|
| 04-Edge-POS-아키텍처-설계서 | UseCases 계층, 멱등성 규칙 | 등록은 idempotencyKey 필수 |
| 05-Edge-POS-전체-흐름-AZ-가이드 | 고객 등록 플로우 | DB 먼저, UI 다음 |
| 06-P0-P1-설계-보완-체크리스트 | Customer 도메인 | P0 대상 |

---

## 3. 기능 목록

| ID | 기능명 | 우선순위 | Bridge Command | UseCase | Domain/Manager | Infrastructure |
|---|---|---|---|---|---|---|
| CUSTREGI-F01 | 고객 신규 등록 저장 | P0 | CUSTOMER:REGISTER | RegisterCustomerUseCase | CustMgr | Tables/Customer/CustomerCrud |
| CUSTREGI-F02 | 닫기/취소 | P0 | N/A (UI 로컬) | N/A | N/A | N/A |
| CUSTREGI-F03 | 키보드 전환 | P2 | N/A (UI 로컬) | N/A | N/A | N/A |
| CUSTREGI-F04 | 휴대폰번호 자동입력 | P1 | N/A (UI 로컬) | N/A | N/A | N/A |
| CUSTREGI-F05 | 고객 유형 선택 | P0 | N/A (UI 로컬) | N/A | N/A | N/A |
| CUSTREGI-F06 | 회원번호 입력 | P0 | N/A (UI 로컬) | N/A | N/A | N/A |
| CUSTREGI-F07 | 고객명 입력 | P0 | N/A (UI 로컬) | N/A | N/A | N/A |
| CUSTREGI-F08 | 휴대폰번호 입력 | P0 | N/A (UI 로컬) | N/A | N/A | N/A |
| CUSTREGI-F09 | 전화번호 입력 | P1 | N/A (UI 로컬) | N/A | N/A | N/A |
| CUSTREGI-F10 | 주소 입력 | P1 | N/A (UI 로컬) | N/A | N/A | N/A |
| CUSTREGI-F11 | 메모 입력 | P2 | N/A (UI 로컬) | N/A | N/A | N/A |

---

## 4. UI 구조

### 4.1 화면 레이아웃

```
+--------------------------------------------------+
| 회원등록                    [키보드] [전화번호입력받기] |
+--------------------------------------------------+
| 회원번호  [TextInput]   (○일반 ○VIP ○직원)          |
| 고객명    [TextInput]                              |
| 휴대폰    [TextInput]                              |
| 전화번호  [TextInput]                              |
| 주소      [TextInput]                              |
| 메모      [TextInput]                              |
+--------------------------------------------------+
| [저장]  [닫기]                                     |
+--------------------------------------------------+
```

- 모달 형태, 폼 레이아웃
- 고객 유형은 RadioGroup으로 통합

### 4.2 사용 컴포넌트 (shared/ui)

| 컴포넌트 | 경로 | 용도 |
|---|---|---|
| TextInput | shared/ui/atoms/TextInput | 각 입력 필드 |
| RadioGroup | shared/ui/atoms/RadioGroup | 고객 유형 선택 (일반/VIP/직원) |
| VirtualKeyboard | shared/ui/organisms/VirtualKeyboard | 터치 환경 문자 입력 (P2) |

---

## 5. 구현 명세

### 5.1 Bridge Command

**CUSTOMER:REGISTER**

```jsonc
// Request
{
  "v": 1,
  "requestId": "<uuid>",
  "timestamp": "<ISO8601>",
  "idempotencyKey": "CUSTOMER:REGISTER:<uuid>",
  "command": "CUSTOMER:REGISTER",
  "params": {
    "name": "string",
    "phone": "string",
    "address": "string",      // optional
    "memo": "string"          // optional
  }
}

// Response (성공)
{
  "v": 1,
  "requestId": "<echo>",
  "timestamp": "<ISO8601>",
  "status": "OK",
  "data": {
    "customer": {
      "id": "string",
      "name": "string",
      "phone": "string"
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
    "code": "DUPLICATE_PHONE",
    "msgKey": "error.customer.duplicatePhone"
  }
}
```

> idempotencyKey 필수 (상태 변경 mutation)

#### UseCase 실패 규칙

| 실패 조건 | 에러 코드 | Ledger 상태 | UI 처리 |
|---|---|---|---|
| 동일 전화번호 고객 존재 | DUPLICATE_PHONE | FAILED | 에러 메시지 표시, 폼 유지 |
| 필수 항목 미입력 | 클라이언트 유효성 검증 (Bridge 미전송) | N/A | 필드별 에러 표시 |
| 동일 idempotencyKey 재전송 | N/A (기존 결과 반환) | 기존 상태 유지 | 성공 응답 그대로 처리 |

#### Permission

| 기능 | 권한 |
|---|---|
| 고객 등록 | 로그인 직원 전원 |

### 5.2 RTK Query Endpoint

| Endpoint | 파일 | 메서드 | Tags |
|---|---|---|---|
| useRegisterCustomerMutation | store/api/customerApi.tsx | CUSTOMER:REGISTER | invalidates `CustomerList` |

캐시 갱신: `onQueryStarted` + `updateQueryData`로 CustomerList에 신규 고객 직접 패치.

### 5.3 UseCases

| UseCase | 역할 | 멱등성 |
|---|---|---|
| RegisterCustomerUseCase | 고객 등록, DB 저장, Ledger 기록 | idempotencyKey 기반 중복 등록 방지 |

### 5.4 Domain / Manager

| Manager | 메서드 | 역할 |
|---|---|---|
| CustMgr | RegisterCustomer() | 입력값 검증, 고객 row 생성, DB 저장 위임 |

### 5.5 Infrastructure

| 모듈 | 파일 | 역할 |
|---|---|---|
| Tables/Customer/CustomerCrud | Infrastructure/Persistence/SQLite/Tables/Customer/CustomerCrud.cpp | INSERT 고객 |
| RequestLedgerStore | Infrastructure/Persistence/SQLite/Stores/RequestLedgerStore.cpp | 멱등성 Ledger |

### 5.6 PosRealTime 이벤트

| 이벤트 | 조건 | 수신 측 |
|---|---|---|
| CUSTOMER:REGISTERED | 등록 성공 후 | PosRealTimeReceiver → 다른 POS에서 고객 목록 갱신 |

> 자기 요청 응답은 RTK Query mutation 결과로 처리. PosRealTime은 외부 변경만.

---

## 6. 테스트

| ID | 시나리오 | 예상 결과 |
|---|---|---|
| CUSTREGI-T01 | 필수 항목(고객명) 입력 후 저장 | 고객 등록 성공, 모달 닫힘 |
| CUSTREGI-T02 | 필수 항목 미입력 후 저장 | 유효성 검증 에러 표시 |
| CUSTREGI-T03 | 중복 회원번호 등록 시도 | 에러 메시지 표시 |
| CUSTREGI-T04 | 동일 idempotencyKey 재전송 | 중복 등록 방지, 기존 결과 반환 |
| CUSTREGI-T05 | 닫기 | 모달 닫힘, 데이터 미저장 |
| CUSTREGI-T06 | 고객 유형 선택 후 저장 | 선택 유형이 DB에 반영 |

---

## 7. 완료 기준

- [ ] CUSTOMER:REGISTER Bridge Command 왕복 동작
- [ ] 폼 유효성 검증 (필수 항목)
- [ ] 등록 성공 시 모달 닫기 + 호출 화면 갱신
- [ ] idempotencyKey 기반 중복 등록 방지
- [ ] Ledger 상태 기록 (RECEIVED → SUCCEEDED / FAILED)
- [ ] 1024x768 해상도, 터치 사용성 검증

---

## 8. 작업 명단

| 계층 | 파일 경로 | 작업 내용 |
|---|---|---|
| PosUi Screen | BrandPosApp/PosUi/src/screens/CustomerScreen/CustomerRegisterModal.tsx | 등록 모달 구현 |
| PosUi Store | BrandPosApp/PosUi/src/store/api/customerApi.ts | useRegisterCustomerMutation |
| PosUi Shared | BrandPosApp/PosUi/src/shared/ui/atoms/TextInput.tsx | 공용 텍스트 입력 |
| PosUi Shared | BrandPosApp/PosUi/src/shared/ui/atoms/RadioGroup.tsx | 공용 라디오 그룹 |
| Bridge Command | BrandPosApp/PosUi/src/bridge/commands/customerCommands.ts | CUSTOMER:REGISTER 커맨드 |
| C++ Actions | BrandPosApp/Presentation/CEF/InternalBridge/PosRequestActions/Customer/CustomerActions.cpp | thin router |
| C++ UseCase | BrandPosApp/UseCases/Customer/RegisterCustomerUseCase.cpp | 등록 유스케이스 |
| C++ Manager | BrandPosApp/Domain/Customer/CustMgr.cpp | RegisterCustomer() |
| C++ Persistence | BrandPosApp/Infrastructure/Persistence/SQLite/Tables/Customer/CustomerCrud.cpp | INSERT 고객 |
| C++ Store | BrandPosApp/Infrastructure/Persistence/SQLite/Stores/RequestLedgerStore.cpp | Ledger 기록 |

---

## Appendix: 레거시 UI 참조

### A.1 기본 정보

| 항목 | 값 |
|---|---|
| 다이얼로그 ID | IDD_CUSTREGI |
| 리소스 값 | 409 |
| 크기 (DLU) | 400 x 298 |
| 다이얼로그 타입 | DIALOGEX |
| 스타일 | DS_SETFONT \| DS_MODALFRAME \| WS_POPUP |
| 폰트 | 10, "System", 0, 0, 0x0 |
| 소스 파일 | Restaurant.rc |
| 총 UI 요소 수 | 20 |

### A.2 레거시 UI 요소 목록

**버튼 (4개)**

| ID | 용도 |
|---|---|
| IDC_CUST_SAVE | 저장 |
| IDCANCEL | 닫기/취소 |
| IDC_CUST_KEY | 키보드 전환 |
| IDC_CUST_DUAL | 휴대폰번호 입력받기 |

**텍스트/라벨 (6개)**: 휴대폰번호, 전화번호, 이름, 회원번호, 주소, 타이틀(회원등록) — 대부분 숨김 상태

**입력 필드 (9개)**

| ID | 타입 | 용도 |
|---|---|---|
| IDC_CUST_CARDNO | EditText | 회원번호 |
| IDC_CUST_NAME | EditText | 고객명 |
| IDC_CUST_HPNUM | EditText (NUMBER) | 휴대폰번호 |
| IDC_CUST_PNUM | EditText (NUMBER) | 전화번호 |
| IDC_CUST_ADDR | EditText | 주소 |
| IDC_CUST_MEMO | EditText | 메모 |
| IDC_CUSTTYPE / 2 / 3 | RadioButton | 고객 유형 (GroupBox 내) |

### A.3 마이그레이션 노트

- 레거시에서 라벨(IDC_STATIC)이 숨김 상태인 것은 동적으로 표시/숨김 처리됨. 신규에서는 폼 필드 label로 항상 표시
- IDC_CUST_DUAL(휴대폰번호 입력받기)은 외부 장치 연동 가능성 확인 필요. 단순 클립보드/자동채움이면 UI 로컬 처리
- 고객 유형(IDC_CUSTTYPE 1/2/3) GroupBox로 묶여 있음. 신규에서는 RadioGroup 컴포넌트 하나로 통합

---

## Progress Record

| 날짜 | 작업 | 상태 |
|---|---|---|
| 2026-04-05 | UI Shell 구현: `BrandPosApp/PosUi/src/screens/CustomerScreen/components/CustomerRegistrationDialog.tsx` | Shell 완료 (layout, local state, stub handlers). Backend 미연결. |
