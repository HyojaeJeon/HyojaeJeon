# LOGIN 화면 설계서

---

## 0. 문서 정보

| 항목 | 값 |
|---|---|
| 화면명 | `LOGIN` |
| 화면 ID | `IDD_LOGIN` |
| 원본 파일 | `login.md` |
| 전환 우선순위 | `P0` |
| 담당 계층 | `PosUi / Presentation / UseCases / Domain / Infrastructure` |
| 상태 | `TODO` |

---

## 1. 화면 개요

LOGIN은 POS 부팅 시 최초 진입점이 되는 직원 로그인 화면이다. 직원 ID/비밀번호를 입력하여 인증하고, 시작 금액을 설정한 뒤 영업을 개시한다. Offline-First 원칙에 따라 로그인 검증은 로컬 SQLite의 Staff 테이블 기준이며, 서버 인증이 아니다.

- 신규 UI 위치: `screens/LoginScreen`
- 화면 유형: 전체 화면 (Screen)
- 우선순위: **P0**

---

## 2. 상위 기준 연결

| 기준 문서 | 관련 섹션 | 비고 |
|---|---|---|
| 04-Edge-POS-아키텍처-설계서 | 계층 흐름: UI/Bridge -> UseCases -> Domain/Manager -> Infrastructure | 로그인 흐름 |
| 05-Edge-POS-전체-흐름-AZ-가이드 | POS 부팅 -> 로그인 -> 영업 개시 | 최초 진입점 |
| 06-Edge-POS-P0-P1-설계-보완-체크리스트 | P0 화면 목록 | LOGIN 포함 |

---

## 3. 기능 목록

| ID | 기능명 | 우선순위 | Bridge Command | UseCase | Domain/Manager | Infrastructure |
|---|---|---|---|---|---|---|
| LOGIN-F01 | 직원 로그인 (비밀번호 입력) | P0 | STAFF:LOGIN | LoginUseCase | StaffMgr | Tables/Staff/StaffCrud, Tables/System/ConfigCrud (SQLite) |
| LOGIN-F02 | 주문용 로그인 (Order Login) | P0 | STAFF:LOGIN | LoginUseCase | StaffMgr | Tables/Staff/StaffCrud (SQLite) |
| LOGIN-F03 | 숫자패드 비밀번호 입력 (0~9) | P0 | 없음 (UI 로컬 상태) | - | - | - |
| LOGIN-F04 | 비밀번호 클리어 | P0 | 없음 (UI 로컬 상태) | - | - | - |
| LOGIN-F05 | 비밀번호 백스페이스 | P0 | 없음 (UI 로컬 상태) | - | - | - |
| LOGIN-F06 | 닫기/취소 | P0 | SYSTEM:MINIMIZE | - | - | - |
| LOGIN-F07 | 로그인 확인 (숨김) | P1 | STAFF:LOGIN | LoginUseCase | StaffMgr | Tables/Staff/StaffCrud (SQLite) |
| LOGIN-F08 | 비밀번호 변경 (숨김) | P2 | STAFF:LOGIN | LoginUseCase | StaffMgr | Tables/Staff/StaffCrud (SQLite) |
| LOGIN-F09 | 직원 선택 (ComboBox, 숨김) | P1 | STAFF:SELECT | LoginUseCase | StaffMgr | Tables/Staff/StaffCrud (SQLite) |

---

## 4. UI 구조

### 4.1 화면 레이아웃

```
+----------------------------------------------------------+
|  [직원ID 입력]  [비밀번호 입력(마스킹)]                    |
|  [시작 금액 입력]  [거스름돈 입력]                          |
|  [영업일 날짜 (ReadOnly)]                                 |
|                                                          |
|  +--Numpad--+    [Login 버튼]  [Order Login 버튼]         |
|  | 7  8  9  |                                            |
|  | 4  5  6  |    [닫기 버튼]                               |
|  | 1  2  3  |                                            |
|  | CLR 0 BS |                                            |
|  +----------+                                            |
+----------------------------------------------------------+
```

### 4.2 컴포넌트 매핑 (shared/ui 기준)

| 영역 | 컴포넌트 경로 | 비고 |
|---|---|---|
| 숫자패드 | screens/LoginScreen 내장 Numpad | 로그인 전용, 재사용 불필요 |
| 텍스트 입력 | shared/ui/atoms/TextInput | 직원ID, 금액 입력 |
| 비밀번호 입력 | shared/ui/atoms/PasswordInput | 마스킹 처리 |
| 날짜 표시 | shared/ui/atoms/DateLabel | ReadOnly 영업일 |
| 버튼 | shared/ui/atoms/Button | Login, Order Login, 닫기 |

### 4.3 데이터 바인딩

| ID | 표시 항목 | 신규 UI 컴포넌트 | 데이터 소스 |
|---|---|---|---|
| LOGIN-D01 | 직원 ID 입력 | TextInput | UI 로컬 상태 |
| LOGIN-D02 | 비밀번호 입력 | PasswordInput | UI 로컬 상태 |
| LOGIN-D03 | 시작 금액 | AmountInput | UI 로컬 상태 -> LoginUseCase 전달 |
| LOGIN-D04 | 거스름돈 | AmountInput | UI 로컬 상태 |
| LOGIN-D05 | 영업일 날짜 | DateLabel (ReadOnly) | systemApi.getConfig -> configCache |
| LOGIN-D06 | 금액 표시 (숨김) | 조건부 표시 | UI 로컬 상태 |

---

## 5. 구현 명세

### 5.1 상태 소유권

| 상태 | 소유 계층 | 원본 | 비고 |
|---|---|---|---|
| 직원 ID / 비밀번호 입력값 | UI 로컬 (useState) | 컴포넌트 내부 | 서버 상태 아님 |
| 시작 금액 / 거스름돈 | UI 로컬 (useState) | 컴포넌트 내부 | LoginUseCase에 전달 후 DB 저장 |
| 영업일 날짜 | RTK Query 캐시 | systemApi.getConfig | 서버 상태 |
| 로그인 세션 | RTK Query 캐시 | staffApi.getSession | 로그인 성공 후 캐시 |

### 5.2 Bridge 계약

| Command | Request | Response | Error | Idempotency | 비고 |
|---|---|---|---|---|---|
| STAFF:LOGIN | `{ staffId, password, loginMode: "normal"\|"order", beginAmount }` | `{ success, staffName, sessionId }` | `INVALID_PASSWORD`, `STAFF_NOT_FOUND`, `ALREADY_LOGGED_IN` | `STAFF:LOGIN:{staffId}` | loginMode: `normal` / `order` |
| STAFF:SELECT | `{ page? }` | `{ staffList: [{ staffId, staffName, ... }] }` | (없음) | - | 직원 선택 콤보박스 (LOGIN-F09) |
| SYSTEM:MINIMIZE | `{}` | `{}` | - | - | 앱 최소화 |

### 5.3 UseCase 계약

| UseCase | Trigger | Input | Transaction | Lock | Output | 실패 규칙 |
|---|---|---|---|---|---|---|
| LoginUseCase | STAFF:LOGIN | staffId, password, loginMode, beginAmount | SQLite TX (원자적) | STAFF:{staffId} | sessionId, staffName | 비밀번호 불일치 → FAILED, 이미 로그인 → TODO: 중복 로그인 정책 확정 필요 |

> **UseCase 실패 규칙**: 멱등성 Ledger 기록 (requestId + idempotencyKey). SQLite TX 원자적 — 실패 시 전체 롤백. 오프라인 동작 가능 (로컬 SQLite Staff 테이블 기준 검증, 서버 인증 아님).

> PosRequestActions/Staff/StaffActions는 **thin router** — 파라미터 검증 후 LoginUseCase에 위임만 한다.

### 5.4 Domain / Manager / Store

| 항목 | 책임 | 파일 / 모듈 | 비고 |
|---|---|---|---|
| StaffMgr | 비밀번호 해시 비교 (VerifyPassword), 세션 생성 (CreateSession) | Domain/Staff/StaffMgr | 순수 업무 규칙 |
| RequestLedgerStore | 로그인 요청 멱등성 기록 | Infrastructure/Persistence/SQLite/Stores/RequestLedgerStore | |

### 5.5 DB / CentralApi / Sync / Realtime

| 연동 대상 | 역할 | 데이터 흐름 | 비고 |
|---|---|---|---|
| SQLite Tables/Staff/StaffCrud | 직원 정보 조회/검증 | UseCase → StaffMgr → StaffCrud → SQLite | 로컬 원본 |
| SQLite Tables/System/ConfigCrud | 영업일, 시스템 설정 조회 | RTK Query → Bridge → ConfigCrud | |
| Outbox | 로그인 이력 동기화 | 커밋 후 Outbox 적재 → Sync Worker → CentralApi | |
| PosRealTimeSender | 메인 화면 전환 트리거 | UseCase 커밋 후 → STAFF:SESSION_STARTED 이벤트 → UI | |
| CentralApi | TODO | TODO | TODO: 로그인 이력 Sync 상세 미정 |

### 5.6 i18n / Error / Permission

| 항목 | 규칙 | 비고 |
|---|---|---|
| i18n | `BrandPosApp/PosUi/src/i18n/locales/{ko,vi,en}/login.json` | msgKey 기반, 완성 문장 하드코딩 금지 |
| Error | 코드 기반: `{ type, code, msgKey, severity, recoverable }` | `INVALID_PASSWORD` → msgKey: `login.error.invalidPassword` |
| Permission | **미로그인 접근**. 로그인 전 유일하게 허용되는 화면이다. 인증 불필요. | |

---

## 6. 테스트

| ID | 시나리오 | 기대 결과 |
|---|---|---|
| LOGIN-T01 | 올바른 직원ID/비밀번호로 로그인 | 테이블 화면으로 전환 |
| LOGIN-T02 | 잘못된 비밀번호 입력 | 에러 메시지 표시, 입력 초기화 |
| LOGIN-T03 | 시작 금액 0원으로 로그인 | 정상 로그인 (금액 0 허용 여부 TODO) |
| LOGIN-T04 | Order Login 모드로 로그인 | 주문 화면으로 직접 전환 |
| LOGIN-T05 | 숫자패드 CLR/BS 동작 | 각각 전체 초기화 / 마지막 문자 삭제 |

---

## 7. 완료 기준

- [ ] LoginUseCase가 로컬 SQLite에서 직원 검증을 수행한다
- [ ] 숫자패드가 UI 로컬 상태로 동작한다 (Bridge 호출 없음)
- [ ] Login / Order Login 두 모드가 동일 UseCase를 호출하되 파라미터로 구분한다
- [ ] 시작 금액이 LoginUseCase에서 DB 기록 후 PosRealTimeSender로 메인 화면에 전달된다
- [ ] Offline 상태에서도 로그인이 가능하다

---

## 8. 작업 명단

| 작업 | 대상 파일 경로 | 상태 |
|---|---|---|
| Screen 구현 | `BrandPosApp/PosUi/src/screens/LoginScreen/index.tsx` | TODO |
| Bridge Command | `BrandPosApp/Presentation/CEF/InternalBridge/PosRequestActions/Staff/StaffActions.cpp` | TODO |
| UseCase | `BrandPosApp/UseCases/Staff/LoginUseCase.cpp` | TODO |
| Domain | `BrandPosApp/Domain/Staff/StaffMgr.cpp` | TODO |
| Persistence | `BrandPosApp/Infrastructure/Persistence/SQLite/Tables/Staff/StaffCrud.cpp` | TODO |
| Persistence | `BrandPosApp/Infrastructure/Persistence/SQLite/Tables/System/ConfigCrud.cpp` | TODO |
| RTK Query | `BrandPosApp/PosUi/src/store/api/systemApi.ts` | TODO |
| i18n | `BrandPosApp/PosUi/src/i18n/locales/ko/login.json` | TODO |
| i18n | `BrandPosApp/PosUi/src/i18n/locales/vi/login.json` | TODO |

---

## Appendix: 레거시 참조

### 레거시 다이얼로그 정보

| 항목 | 값 |
|---|---|
| 다이얼로그 ID | IDD_LOGIN |
| 리소스 값 | 379 |
| 크기 (DLU) | 511 x 380 |
| 소스 파일 | Restaurant.rc |
| 총 UI 요소 수 | 25 (버튼 18, 라벨 1, 입력 6) |

### 레거시 컨트롤 -> 신규 매핑

| 레거시 컨트롤 | 신규 대응 |
|---|---|
| IDC_SELLSTART (Login 버튼) | screens/LoginScreen Login 버튼 -> STAFF:LOGIN |
| IDC_CONNECT (Order Login 버튼) | screens/LoginScreen Order Login 버튼 -> STAFF:LOGIN (orderMode) |
| IDC_LOGIN_0~9, CLR, BACK | screens/LoginScreen 내장 Numpad (UI 로컬) |
| IDC_LOGIN_ID2 (EditText) | TextInput (직원 ID) |
| IDC_LOGIN_PASS (EditText, ES_PASSWORD) | PasswordInput |
| IDC_LOGIN_BEGINAMT (EditText) | AmountInput (시작 금액) |
| IDC_LOGIN_CHANGEAMT (EditText) | AmountInput (거스름돈) |
| IDC_LOGIN_DATE (ReadOnly) | DateLabel (영업일) |
| IDC_LOGIN_ID1 (ComboBox, 숨김) | 드롭다운 또는 StaffSelectModal (멀티 직원 환경) |
| IDC_LOGIN / IDOK (숨김) | 내부 처리 |
| IDC_CHANGE (숨김) | 비밀번호 변경 모드 |
| IDCANCEL | 닫기 버튼 |

## 9. 작업 진행 기록

| 날짜 | 범위 | 상태 | 완료 범위 | 남은 범위 | 내용 |
|---|---|---|---|---|---|
| 2026-04-05 | Shell 구현 | 완료 | 레이아웃+로컬상태+stub | Bridge/UseCase 연동, RTK Query 연동, i18n | LoginScreen shell 구현 완료. 숫자패드(CLR/BS), 직원ID/비밀번호/시작금액/거스름돈 입력, 영업일 날짜(ReadOnly), Login/Order Login 두 모드 버튼, 최소화 stub handler 구현. |
| 2026-04-08 | Reference 리팩터 (6단계 워크플로우 적용) | 완료 | 계약/fixture/endpoint/컴포넌트/문서 5단계 | SYSTEM:MINIMIZE bridge endpoint, i18n 문구 정리, 영업일 systemApi 연동 | PosUi 화면 작업 6단계 워크플로우 reference 구현. (1) `src/contracts/auth/login.types.ts` 신설 — `LoginRequest`/`AuthSession`/`LoginErrorPayload`, `LoginMode` enum 은 `UPPER_SNAKE_CASE`. (2) `src/mocks/fixtures/auth/login.fixture.ts` — default/empty/error 3종 시나리오 강제. (3) `store/api/authApi.ts` — `queryFn` switch (mock/bridge/rest) reference 패턴, `NEXT_PUBLIC_DATA_SOURCE` 빌드 타임 분기. (4) 화면 컴포넌트 — 인라인 `InputRow` 제거, 신규 공용 `shared/ui/molecules/IconLabelField` 로 이전. 화면 인라인 키패드 제거, `shared/ui/molecules/NumPad` 에 `variant: 'compact'` (4x3 / no confirm) 추가하여 사용. 화면 전용 컴포넌트(`LoginBrandPanel`, `LoginIcons`)는 `screens/LoginScreen` 폴더 내부에만 분리. (5) `tsconfig` 에 `@contracts/*` path alias 추가. (6) 백엔드 연동 시 변경 지점: `.env.local` 의 `NEXT_PUBLIC_DATA_SOURCE=bridge` 한 줄. 화면/타입/fixture 코드 수정 0. |
