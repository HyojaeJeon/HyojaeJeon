# CUST_DETAIL — 고객 상세 정보 모달

## 0. 문서 정보

| 항목 | 값 |
|---|---|
| 문서 ID | CUST_DETAIL |
| 레거시 다이얼로그 | IDD_CUST_DETAIL (139) |
| 신규 위치 | screens/CustomerScreen/CustomerDetailModal |
| 작성일 | 2026-04-05 |
| 상태 | 초안 |

---

## 1. 화면 개요

고객의 상세 정보를 조회하고 수정하는 모달 화면이다.
개인정보(이름, 번호, 주소, 생년월일, 이메일 등)와 통계 데이터(매출, 상품권, 포인트, 방문횟수)를 한 화면에 표시한다.
CUSTINPUT(고객 관리 메인)에서 호출된다.

---

## 2. 상위 기준 연결

| 기준 문서 | 관련 섹션 | 비고 |
|---|---|---|
| 04-Edge-POS-아키텍처-설계서 | UseCases, Domain 계층 | 수정은 idempotencyKey 필수 |
| 05-Edge-POS-전체-흐름-AZ-가이드 | 고객 상세 조회/수정 플로우 | DB 먼저, UI 다음 |

---

## 3. 기능 목록

| ID | 기능명 | 우선순위 | Bridge Command | UseCase | Domain/Manager | Infrastructure |
|---|---|---|---|---|---|---|
| CUSTDETAIL-F01 | 고객 상세정보 저장 | P0 | CUSTOMER:UPDATE | UpdateCustomerUseCase | CustMgr | Tables/Customer/CustomerCrud |
| CUSTDETAIL-F02 | 닫기/취소 | P0 | N/A (UI 로컬) | N/A | N/A | N/A |
| CUSTDETAIL-F03 | 고객명 수정 | P0 | N/A (UI 로컬) | N/A | N/A | N/A |
| CUSTDETAIL-F04 | 회원번호 수정 | P0 | N/A (UI 로컬) | N/A | N/A | N/A |
| CUSTDETAIL-F05 | 휴대폰번호 수정 | P0 | N/A (UI 로컬) | N/A | N/A | N/A |
| CUSTDETAIL-F06 | 고객 유형 변경 | P0 | N/A (UI 로컬) | N/A | N/A | N/A |
| CUSTDETAIL-F07 | SMS 수신 설정 | P1 | N/A (UI 로컬) | N/A | N/A | N/A |
| CUSTDETAIL-F08 | 성별 변경 | P1 | N/A (UI 로컬) | N/A | N/A | N/A |
| CUSTDETAIL-F09 | 전화번호 수정 | P1 | N/A (UI 로컬) | N/A | N/A | N/A |
| CUSTDETAIL-F10 | 주소 수정 | P1 | N/A (UI 로컬) | N/A | N/A | N/A |
| CUSTDETAIL-F11 | 생년월일 입력 (양력/음력) | P1 | N/A (UI 로컬) | N/A | N/A | N/A |
| CUSTDETAIL-F12 | 이메일 수정 | P2 | N/A (UI 로컬) | N/A | N/A | N/A |
| CUSTDETAIL-F13 | 이메일 도메인 선택 | P2 | N/A (UI 로컬) | N/A | N/A | N/A |
| CUSTDETAIL-F14 | 담당자 선택 | P2 | N/A (UI 로컬) | N/A | StaffMgr | N/A |
| CUSTDETAIL-F15 | 메모 수정 | P2 | N/A (UI 로컬) | N/A | N/A | N/A |
| CUSTDETAIL-F16 | 주민번호 수정 | P2 | N/A (UI 로컬) | N/A | N/A | N/A |

---

## 4. UI 구조

### 4.1 화면 레이아웃

```
+--------------------------------------------------------------+
| 고객 상세 정보                              [저장]  [닫기]     |
+-------------------------------+------------------------------+
| 개인정보 섹션                  | 추가정보 섹션                 |
| 고객코드   [읽기전용]          | 주민번호   [TextInput]        |
| 고객명     [TextInput]         | 성별      [Select]           |
| 회원번호   [TextInput]         | 전화번호   [TextInput]        |
| 휴대폰     [TextInput]         | 주소      [TextInput]        |
| 고객유형   [Select]            | 생년월일   (○양력 ○음력) [입력]|
| SMS수신    [Select]            | 이메일    [TextInput][Select] |
| 등록일     [읽기전용]          | 담당자    [Select]           |
| 최근방문일 [읽기전용]          | 메모      [TextInput]        |
+-------------------------------+------------------------------+
| 통계 섹션                                                     |
| 총매출액 | 총상품권 | 수령상품권 | 잔여상품권                   |
| 방문횟수 | 총포인트 | 사용포인트 | 잔여포인트                   |
+--------------------------------------------------------------+
```

- 모달 형태 (450x337 DLU 기준)
- 2컬럼 레이아웃 + 하단 통계 섹션
- 통계 데이터는 읽기전용

### 4.2 사용 컴포넌트 (shared/ui)

| 컴포넌트 | 경로 | 용도 |
|---|---|---|
| TextInput | shared/ui/atoms/TextInput | 각 입력/표시 필드 |
| Select | shared/ui/atoms/Select | 고객유형, SMS수신, 성별, 이메일도메인, 담당자 |
| RadioGroup | shared/ui/atoms/RadioGroup | 생년월일 양력/음력 |

---

## 5. 구현 명세

### 5.1 Bridge Command

**CUSTOMER:GET_DETAIL** — 모달 진입 시 상세 조회

```jsonc
// Response
{
  "v": 1,
  "requestId": "<echo>",
  "timestamp": "<ISO8601>",
  "status": "OK",
  "data": {
    "custCode": "string",
    "custName": "string",
    "cardNo": "string",
    "hphone": "string",
    "custType": "number",
    "smsReceive": "number",
    "inDate": "string",       // 등록일 (읽기전용)
    "lastVisit": "string",    // 최근방문일 (읽기전용)
    "jumin": "string",
    "sex": "number",
    "phone": "string",
    "addr": "string",
    "birthType": "number",    // 1: 양력, 2: 음력
    "birth": "string",
    "email": "string",
    "emailDomain": "string",
    "empCode": "string",
    "memo": "string",
    "totalSale": "number",
    "totalTick": "number",
    "recvTick": "number",
    "remainTick": "number",
    "visitCnt": "number",
    "totalPoint": "number",
    "usePoint": "number",
    "remainPoint": "number"
  }
}
```

**CUSTOMER:UPDATE** — custinput.md 참조 (동일 커맨드, 상세 필드 포함)

#### UseCase 실패 규칙

| 실패 조건 | 에러 코드 | Ledger 상태 | UI 처리 |
|---|---|---|---|
| customerId에 해당하는 고객 없음 | CUSTOMER_NOT_FOUND | FAILED | 에러 메시지 표시, 모달 닫힘 |
| 수정 시 동일 idempotencyKey 재전송 | N/A (기존 결과 반환) | 기존 상태 유지 | 성공 응답 그대로 처리 |

#### Permission

| 기능 | 권한 |
|---|---|
| 고객 상세 조회 | 로그인 직원 전원 |
| 고객 수정 | 로그인 직원 전원 |

### 5.2 RTK Query Endpoint

| Endpoint | 파일 | 메서드 | Tags |
|---|---|---|---|
| useGetCustomerDetailQuery | store/api/customerApi.tsx | CUSTOMER:GET_DETAIL | `Customer:{custCode}` |
| useUpdateCustomerMutation | store/api/customerApi.tsx | CUSTOMER:UPDATE | invalidates `Customer:{custCode}` |

### 5.3 UseCases

| UseCase | 역할 | 멱등성 |
|---|---|---|
| GetCustomerDetailUseCase | 고객 상세 정보 + 통계 조회 | 조회 전용 |
| UpdateCustomerUseCase | 고객 상세 정보 수정 | idempotencyKey 필수 |

### 5.4 Domain / Manager

| Manager | 메서드 | 역할 |
|---|---|---|
| CustMgr | GetCustomerDetail() | 상세 조회 (통계 포함) |
| CustMgr | UpdateCustomer() | 상세 정보 수정 |
| StaffMgr | GetStaffList() | 담당자 콤보박스 데이터 (P2) |

### 5.5 Infrastructure

| 모듈 | 파일 | 역할 |
|---|---|---|
| Tables/Customer/CustomerCrud | Infrastructure/Persistence/SQLite/Tables/Customer/CustomerCrud.cpp | 고객 CRUD + 통계 집계 |
| RequestLedgerStore | Infrastructure/Persistence/SQLite/Stores/RequestLedgerStore.cpp | Ledger |

### 5.6 PosRealTime 이벤트

| 이벤트 | 조건 | 수신 측 |
|---|---|---|
| CUSTOMER:UPDATED | 수정 성공 후 | 다른 POS에서 고객 정보 갱신 |

---

## 6. 테스트

| ID | 시나리오 | 예상 결과 |
|---|---|---|
| CUSTDETAIL-T01 | 모달 진입 | 고객 상세 정보 + 통계 표시 |
| CUSTDETAIL-T02 | 고객명 수정 후 저장 | DB 반영, 모달 닫힘 |
| CUSTDETAIL-T03 | 읽기전용 필드 수정 시도 | 수정 불가 |
| CUSTDETAIL-T04 | 생년월일 양력/음력 전환 | 라디오 상태 변경 |
| CUSTDETAIL-T05 | 닫기 (변경 미저장) | 확인 다이얼로그 또는 즉시 닫힘 |
| CUSTDETAIL-T06 | 통계 데이터 표시 | 숫자 포맷 (천 단위 콤마) 정상 |

---

## 7. 완료 기준

- [ ] CUSTOMER:GET_DETAIL 응답으로 전체 필드 표시
- [ ] CUSTOMER:UPDATE로 수정 사항 저장
- [ ] 읽기전용 필드(코드, 등록일, 최근방문일, 통계) 정상 표시
- [ ] 통계 섹션 시각적 분리
- [ ] idempotencyKey 기반 중복 수정 방지
- [ ] 1024x768 해상도, 터치 사용성 검증

---

## 8. 작업 명단

| 계층 | 파일 경로 | 작업 내용 |
|---|---|---|
| PosUi Screen | BrandPosApp/PosUi/src/screens/CustomerScreen/CustomerDetailModal.tsx | 상세 모달 구현 |
| PosUi Store | BrandPosApp/PosUi/src/store/api/customerApi.ts | useGetCustomerDetailQuery, useUpdateCustomerMutation |
| PosUi Shared | BrandPosApp/PosUi/src/shared/ui/atoms/TextInput.tsx | 공용 텍스트 입력 |
| PosUi Shared | BrandPosApp/PosUi/src/shared/ui/atoms/Select.tsx | 공용 셀렉트 |
| PosUi Shared | BrandPosApp/PosUi/src/shared/ui/atoms/RadioGroup.tsx | 공용 라디오 그룹 |
| Bridge Command | BrandPosApp/PosUi/src/bridge/commands/customerCommands.ts | CUSTOMER:GET_DETAIL, CUSTOMER:UPDATE |
| C++ Actions | BrandPosApp/Presentation/CEF/InternalBridge/PosRequestActions/Customer/CustomerActions.cpp | thin router |
| C++ UseCase | BrandPosApp/UseCases/Customer/GetCustomerDetailUseCase.cpp | 상세 조회 |
| C++ UseCase | BrandPosApp/UseCases/Customer/UpdateCustomerUseCase.cpp | 수정 |
| C++ Manager | BrandPosApp/Domain/Customer/CustMgr.cpp | 고객 매니저 |
| C++ Persistence | BrandPosApp/Infrastructure/Persistence/SQLite/Tables/Customer/CustomerCrud.cpp | 고객 CRUD |

---

## Appendix: 레거시 UI 참조

### A.1 기본 정보

| 항목 | 값 |
|---|---|
| 다이얼로그 ID | IDD_CUST_DETAIL |
| 리소스 값 | 139 |
| 크기 (DLU) | 450 x 337 |
| 다이얼로그 타입 | DIALOGEX |
| 스타일 | DS_SETFONT \| DS_MODALFRAME \| WS_POPUP |
| 소스 파일 | Restaurant.rc |
| 총 UI 요소 수 | 29 |

### A.2 레거시 UI 요소 목록

**버튼 (2개)**: IDC_DETAIL_SAVE(저장), IDCANCEL(닫기)

**입력 필드 (27개)**

| ID | 타입 | 용도 |
|---|---|---|
| IDC_DETAIL_CODE | EditText (READONLY) | 고객코드 |
| IDC_DETAIL_NAME | EditText | 고객명 |
| IDC_DETAIL_CARDNO | EditText | 회원번호 |
| IDC_DETAIL_HPHONE | EditText | 휴대폰번호 |
| IDC_DETAIL_TYPE | ComboBox | 고객유형 |
| IDC_DETAIL_BSMS | ComboBox | SMS수신여부 |
| IDC_DETAIL_INDATE | EditText (READONLY) | 등록일 |
| IDC_DETAIL_LASTVISIT | EditText (READONLY) | 최근방문일 |
| IDC_DETAIL_JUMIN | EditText | 주민번호 |
| IDC_DETAIL_SEX | ComboBox | 성별 |
| IDC_DETAIL_PHONE | EditText | 전화번호 |
| IDC_DETAIL_ADDR | EditText | 주소 |
| IDC_MONTH1/2 | RadioButton | 양력/음력 |
| IDC_DETAIL_BIRTH | EditText | 생년월일 |
| IDC_DETAIL_EMAIL | EditText | 이메일 |
| IDC_DETAIL_BEMAIL | ComboBox | 이메일 도메인 |
| IDC_DETAIL_EMP | ComboBox | 담당자 |
| IDC_DETAIL_MEMO | EditText | 메모 |
| IDC_DETAIL_TOTALSALE~REMAINP | EditText (NUMBER, 8개) | 통계 (매출/상품권/포인트) |

### A.3 마이그레이션 노트

- 27개 입력 필드 중 통계성 데이터(매출, 상품권, 포인트 등)는 읽기전용. 신규에서는 별도 통계 섹션으로 시각적 분리
- 생년월일의 양력/음력 라디오(IDC_MONTH1/2)는 RadioGroup + TextInput 조합으로 통합
- 이메일 입력은 IDC_DETAIL_EMAIL + IDC_DETAIL_BEMAIL(도메인 선택 콤보) 조합. 신규에서는 단일 이메일 입력 또는 도메인 자동완성으로 간소화 고려

---

## Progress Record

| 날짜 | 작업 | 상태 |
|---|---|---|
| 2026-04-05 | UI Shell 구현: `BrandPosApp/PosUi/src/screens/CustomerScreen/components/CustomerDetailDialog.tsx` | Shell 완료 (2-column form, stats section, stub handlers). Backend 미연결. |
