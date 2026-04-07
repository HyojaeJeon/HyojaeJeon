# SET-COMPANYINFO: 업체정보 설정 화면

---

## 0. 문서 정보

| 항목 | 값 |
|---|---|
| 문서 ID | SET-COMPANYINFO |
| 화면명 | 업체정보 설정 |
| 레거시 다이얼로그 | IDD_COMPANYINFO (리소스 161) |
| 신규 라우트 | `/pos/setup/company-info` |
| 신규 Screen 경로 | `screens/SetupScreen/CompanyInfo` |
| 모드 | Setup mode |
| 작성일 | 2026-04-05 |
| 상태 | 초안 |

---

## 1. 화면 개요

매장 업체정보(사업자번호, 회사명, 전화번호, 주소, 대표자, 핸드폰번호)를 조회하고 편집/저장하는 화면이다. 업체정보는 영수증 출력, 사업자 신고 등에 직접 연관되는 P0 핵심 설정이다. 사업자번호는 읽기 전용으로 표시되며, 잠금 관련 기능은 신규 플랫폼에서 중앙 서버 기반으로 재설계 예정(P2).

---

## 2. 상위 기준 연결

| 기준 문서 | 관련 섹션 | 비고 |
|---|---|---|
| 04-Edge-POS-아키텍처-설계서 | 2.3 통합 목표 디렉토리 구조 | `screens/SetupScreen/*` 배치 |
| 04-Edge-POS-아키텍처-설계서 | 4.x InternalBridge | `PosRequestActions/System/` thin router |
| CLAUDE.md | DB 엔진 전환 | SQLite `Tables/System/StoreInfoCrud` |

---

## 3. 기능 목록

| ID | 기능명 | 우선순위 | Bridge Command | UseCase | Domain/Manager | Infrastructure |
|---|---|---|---|---|---|---|
| COMP-F01 | 업체정보 조회 | P0 | `SETUP:COMPANY:GET_INFO` | `SaveCompanyInfoUseCase` (조회 경로) | `SystemMgr` | SQLite `Tables/System/StoreInfoCrud` |
| COMP-F02 | 사업자번호 표시 (읽기 전용) | P0 | `SETUP:COMPANY:GET_INFO` | `SaveCompanyInfoUseCase` (조회 경로) | `SystemMgr` | SQLite `Tables/System/StoreInfoCrud` |
| COMP-F03 | 사업자번호 조회 (외부) | P2 | `SETUP:COMPANY:GET_INFO` | `SaveCompanyInfoUseCase` | `SystemMgr` | SQLite `Tables/System/StoreInfoCrud` |
| COMP-F04 | 회사명 입력 | P0 | - | - | - | - |
| COMP-F05 | 전화번호 입력 | P0 | - | - | - | - |
| COMP-F06 | 주소 입력 | P0 | - | - | - | - |
| COMP-F07 | 대표자 입력 | P0 | - | - | - | - |
| COMP-F08 | 핸드폰번호 입력 | P1 | - | - | - | - |
| COMP-F09 | 잠금 해제 라디오 | P2 | - | - | - | - |
| COMP-F10 | 잠금 라디오 | P2 | - | - | - | - |
| COMP-F11 | 잠금 날짜 선택 | P2 | - | - | - | - |
| COMP-F12 | 업체정보 저장 | P0 | `SETUP:COMPANY:SAVE` | `SaveCompanyInfoUseCase` | `SystemMgr` | SQLite `Tables/System/StoreInfoCrud` |
| COMP-F13 | 닫기 (React 라우팅) | P1 | - | - | - | - |

---

## 4. UI 구조

### 4.1 화면 레이아웃

```
+---------------------------------------------------------------+
| [저장]  [닫기]                                     헤더 영역   |
+---------------------------------------------------------------+
|                                                               |
|  사업자번호:  [readOnly TextField]  [조회 (P2, 숨김)]          |
|  회사명:      [TextField]                                     |
|  전화번호:    [TextField]                                     |
|  주소:        [TextField]                                     |
|  대표자:      [TextField]                                     |
|  핸드폰번호:  [TextField]                                     |
|                                                               |
|  ------ P2 잠금 설정 (숨김) ------                             |
|  [○ 잠금 해제]  [○ 잠금]                                     |
|  잠금 날짜:  [DatePicker]                                     |
+---------------------------------------------------------------+
```

### 4.2 사용 컴포넌트 (shared/ui)

| 컴포넌트 | 경로 | 용도 |
|---|---|---|
| `TextField` | `shared/ui/atoms/TextField` | 회사명, 전화번호, 주소, 대표자, 핸드폰번호 입력 |
| `TextField` (readOnly) | `shared/ui/atoms/TextField` | 사업자번호 표시 |
| `Button` | `shared/ui/atoms/Button` | 저장, 닫기, 조회(P2) |
| `RadioGroup` | `shared/ui/atoms/RadioGroup` | 잠금 해제/잠금 선택 (P2) |
| `DatePicker` | `shared/ui/atoms/DatePicker` | 잠금 날짜 선택 (P2) |

---

## 5. 구현 명세

### 5.1 RTK Query Endpoints

| Endpoint | 메서드 | 설명 |
|---|---|---|
| `setupApi.useGetCompanyInfoQuery` | GET | 업체정보 조회 |
| `setupApi.useSaveCompanyInfoMutation` | POST | 업체정보 저장 |

### 5.2 Bridge Commands

> **설정 Bridge 패턴**: `SETUP:{DOMAIN}:GET_INFO` / `SETUP:{DOMAIN}:SAVE` 형태를 따른다.

| Command | 방향 | Payload | 비고 |
|---|---|---|---|
| `SETUP:COMPANY:GET_INFO` | UI -> C++ | `{ v, requestId, timestamp }` | 업체정보 조회 |
| `SETUP:COMPANY:SAVE` | UI -> C++ | `{ v, requestId, timestamp, idempotencyKey, data: { companyName, tel, addr, emp, hphone } }` | 업체정보 저장 |

### 5.3 UseCase 흐름

**SaveCompanyInfoUseCase (저장)**
1. **Permission 검사**: 관리자 권한 확인 <!-- TODO: 관리자 권한 체계(역할/토큰) 확정 후 구체적인 검사 방식 결정 -->
2. `idempotencyKey` 검사 (Ledger)
3. `SystemMgr.validateCompanyInfo()` 호출 — 사업자번호 형식, 필수 필드(회사명/전화번호/주소/대표자) 검증 <!-- TODO: 사업자번호 체크섬 검증 로직 포함 여부 확정 -->
4. SQLite 트랜잭션 (원자적): `StoreInfoCrud.saveCompanyInfo()` (마지막 값 덮어쓰기) + Ledger 갱신 + Outbox 레코드 적재 (중앙 서버 동기화용)
5. 커밋 후 `PosRealTimeSender` -> UI 갱신 이벤트

> **설정 UseCase 공통 패턴**: 설정 저장은 마지막 값 덮어쓰기(upsert) 방식이다. 단일 TX로 원자적 커밋하며, 참조 무결성 위반 시 롤백한다. Outbox에 동기화 레코드를 함께 적재한다.

#### UseCase 실패 규칙

- **멱등성**: 업체정보 저장은 마지막 값 덮어쓰기 (idempotencyKey 불필요)
- **트랜잭션**: SQLite TX 내에서 StoreInfo UPDATE 원자적
- **참조 무결성**: 해당 없음 (단일 레코드 설정)
- **Outbox**: 업체정보 변경 → 중앙 동기화 대상 (매장 정보 → CentralApi)
- **오프라인**: 로컬 DB만 사용, 오프라인 동작 가능

### 5.4 Domain/Manager

| Manager | 메서드 | 설명 |
|---|---|---|
| `SystemMgr` | `validateCompanyInfo()` | 업체정보 유효성 검증 |
| `SystemMgr` | `getCompanyInfo()` | 업체정보 조회 |

### 5.5 Infrastructure

| 모듈 | 파일 | 설명 |
|---|---|---|
| SQLite | `Tables/System/StoreInfoCrud` | 업체정보 CRUD |

### 5.6 Permission

- **관리자 전용 화면**. 일반 직원은 접근 불가. <!-- TODO: 관리자 권한 체계(역할/토큰) 확정 후 UI 진입 차단 + UseCase 검사 이중 적용 -->

### 5.7 주의사항

- 잠금 관련 컨트롤(COMP-F09~F11)은 모두 레거시에서 숨김 상태. 라이선스/잠금 정책은 신규 플랫폼에서 중앙 서버 기반으로 재설계 예정이므로 P2. <!-- TODO: 중앙 서버 기반 잠금 정책 재설계 -->
- 사업자번호 외부 조회(COMP-F03)는 레거시에서 숨김 상태이며 현재 미사용. P2. <!-- TODO: 사업자번호 외부 조회 필요성 확인 -->

---

## 6. 테스트

| ID | 시나리오 | 기대 결과 | 우선순위 |
|---|---|---|---|
| COMP-T01 | 화면 진입 시 업체정보 로드 | 모든 필드에 현재값 바인딩, 사업자번호 readOnly | P0 |
| COMP-T02 | 회사명 수정 후 저장 | DB에 변경된 회사명 반영, UI 갱신 | P0 |
| COMP-T03 | 전화번호/주소/대표자 수정 후 저장 | DB에 변경 내용 반영 | P0 |
| COMP-T04 | 저장 멱등성 확인 | 동일 idempotencyKey로 중복 저장 시 1회만 반영 | P0 |
| COMP-T05 | 닫기 버튼 클릭 | Setup 메인 화면으로 라우팅 | P1 |

---

## 7. 완료 기준

- [ ] P0: 업체정보 조회/저장 정상 동작 (COMP-F01, COMP-F12)
- [ ] P0: 사업자번호 readOnly 표시
- [ ] P0: 회사명/전화번호/주소/대표자 입력 및 저장
- [ ] P1: 핸드폰번호 입력 및 저장
- [ ] P2: 잠금 설정 재설계 및 구현 <!-- TODO -->
- [ ] 멱등성 테스트 통과

---

## 8. 작업 명단

| 계층 | 파일 경로 | 작업 내용 |
|---|---|---|
| Screen | `BrandPosApp/PosUi/src/screens/SettingsScreen/components/CompanyInfoDialog.tsx` | 업체정보 화면 구현 (SHELL 완료 2026-04-05) |
| Screen Hook | `BrandPosApp/PosUi/src/screens/SetupScreen/CompanyInfo/hooks/useCompanyInfo.ts` | UI 전용 훅 |
| RTK Query | `BrandPosApp/PosUi/src/store/api/setupApi.ts` | `getCompanyInfo`, `saveCompanyInfo` endpoint |
| shared/ui | `BrandPosApp/PosUi/src/shared/ui/atoms/TextField` | 텍스트 입력 (공용) |
| shared/ui | `BrandPosApp/PosUi/src/shared/ui/atoms/Button` | 버튼 (공용) |
| shared/ui | `BrandPosApp/PosUi/src/shared/ui/atoms/RadioGroup` | 라디오 그룹 (공용, P2) |
| shared/ui | `BrandPosApp/PosUi/src/shared/ui/atoms/DatePicker` | 날짜 선택 (공용, P2) |
| Bridge | `BrandPosApp/PosUi/src/bridge/commands/setupCommands.ts` | `SETUP:COMPANY:*` 커맨드 정의 |
| PosRequestActions | `BrandPosApp/Presentation/CEF/InternalBridge/PosRequestActions/System/SetupActions.cpp` | 업체정보 thin router |
| UseCase | `BrandPosApp/UseCases/System/SaveCompanyInfoUseCase.cpp` | 업체정보 저장 UseCase |
| Domain | `BrandPosApp/Domain/System/SystemMgr.cpp` | 업체정보 검증/조회 |
| Infrastructure | `BrandPosApp/Infrastructure/Persistence/SQLite/Tables/System/StoreInfoCrud.cpp` | 업체정보 CRUD |

---

## Appendix: 레거시 참조

### A.1 레거시 기본 정보

| 항목 | 값 |
|---|---|
| 다이얼로그 ID | IDD_COMPANYINFO |
| 리소스 값 | 161 |
| 크기 (DLU) | 400 x 300 |
| 다이얼로그 타입 | DIALOGEX |
| 스타일 | DS_SETFONT \| DS_MODALFRAME \| WS_POPUP |
| 폰트 | 10, "System", 0, 0, 0x0 |
| 소스 파일 | RestaurantSet.rc |
| 총 UI 요소 수 | 24 (버튼 3, 텍스트/라벨 11, 입력 필드 9, 기타 1) |

### A.2 레거시 UI 요소

**버튼 (3개):** IDC_COMPANY_SERCH (조회, 숨김), IDOK (저장), IDCANCEL (닫기)

**텍스트/라벨 (11개):** 모두 숨김 상태. 회사명, 전화번호, 주소, 대표자, 핸드폰번호, 잠금 관련 라벨.

**입력 필드 (9개):**
- IDC_COMPANY_BIZNO (EditText, Disabled) - 사업자번호
- IDC_COMPANY_NAME (EditText) - 회사명
- IDC_COMPANY_TEL (EditText) - 전화번호
- IDC_COMPANY_ADDR (EditText) - 주소
- IDC_COMPANY_EMP (EditText) - 대표자
- IDC_COMPANY_HPHONE (EditText) - 핸드폰번호
- IDC_COMPANY_UNLOCK (RadioButton, 숨김) - 잠금 해제
- IDC_COMPANY_LOCK (RadioButton, 숨김) - 잠금
- IDC_COMPANY_LOCKDATE (DateTimePicker, 숨김) - 잠금 날짜

**기타 (1개):** GroupBox (잠금 관련 UI 그룹핑, 숨김)

### A.3 마이그레이션 노트

- 사업자번호(IDC_COMPANY_BIZNO)는 Disabled 상태로 표시 전용. 신규에서도 readOnly로 유지.
- 조회 버튼(IDC_COMPANY_SERCH)은 숨김 상태이며, 사업자번호 외부 조회 기능은 현재 미사용. P2.
- 잠금 관련 컨트롤(F09~F11)은 모두 숨김 상태. 라이선스/잠금 정책은 신규 플랫폼에서 중앙 서버 기반으로 재설계될 예정이므로 P2.
- GroupBox는 잠금 관련 UI 그룹핑용이며, 신규에서는 CSS 레이아웃으로 대체.
- 업체정보는 영수증 출력, 사업자 신고 등에 직접 연관되므로 P0 핵심 기능.
