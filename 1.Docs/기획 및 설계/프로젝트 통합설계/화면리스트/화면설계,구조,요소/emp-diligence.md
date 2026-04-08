# EMP_DILIGENCE 화면 설계서

---

## 0. 문서 정보

| 항목 | 값 |
|---|---|
| 문서 ID | SCR-EMP-DILIGENCE |
| 화면 ID (레거시) | IDD_EMP_DILIGENCE |
| 작성일 | 2026-04-05 |
| 상태 | 초안 |

---

## 1. 화면 개요

EMP_DILIGENCE는 직원 근태관리 전용 화면이다. 출퇴근 처리, 근태 기간 조회, 근태 수정, 급여 지급, 인쇄/엑셀 내보내기 기능을 제공한다.

- 신규 UI 위치: `screens/StaffScreen/ClockHistory`
- 화면 유형: 전체 화면 (Screen)
- 우선순위: **P1**

---

## 2. 상위 기준 연결

| 기준 문서 | 관련 섹션 | 비고 |
|---|---|---|
| 04-Edge-POS-아키텍처-설계서 | 계층 흐름 | 직원/회계 연동 |
| CLAUDE.md | UseCase 규칙 | 급여 지급은 CashInOutUseCase 재사용 |

---

## 3. 기능 목록

| ID | 기능명 | 우선순위 | Bridge Command | UseCase | Domain/Manager | Infrastructure |
|---|---|---|---|---|---|---|
| EMPD-F01 | 출근 처리 | P1 | STAFF:CLOCK_IN_OUT | ClockInOutUseCase | StaffMgr | Tables/Staff/StaffCrud, Tables/Staff/ClockHistoryCrud (SQLite) |
| EMPD-F02 | 퇴근 처리 | P1 | STAFF:CLOCK_IN_OUT | ClockInOutUseCase | StaffMgr | Tables/Staff/StaffCrud, Tables/Staff/ClockHistoryCrud (SQLite) |
| EMPD-F03 | 근태 기간 조회 | P1 | STAFF:GET_HISTORY | GetClockHistoryUseCase | StaffMgr | Tables/Staff/ClockHistoryCrud (SQLite) |
| EMPD-F04 | 근태 수정 | P2 | STAFF:CLOCK_IN_OUT | ClockInOutUseCase | StaffMgr | Tables/Staff/ClockHistoryCrud (SQLite) |
| EMPD-F05 | 급여 지급 | P2 | ACCOUNTING:CASH_OUT | CashInOutUseCase | AccountingMgr, StaffMgr | Tables/Accounting/CashInOutCrud (SQLite) |
| EMPD-F06 | 인쇄 | P2 | SYSTEM:GET_CONTENT | - | - | Device/Printer |
| EMPD-F07 | 엑셀 내보내기 (상단) | P2 | SYSTEM:GET_CONTENT | - | - | Support/Excel |
| EMPD-F08 | 엑셀 내보내기 (하단) | P2 | SYSTEM:GET_CONTENT | - | - | Support/Excel |
| EMPD-F09 | 그리드 확대 | P2 | 없음 (UI 로컬) | - | - | - |
| EMPD-F10 | 닫기 | P1 | 없음 (라우팅) | - | - | - |
| EMPD-F11 | 직원 그리드 스크롤 | P1 | 없음 (UI 로컬) | - | - | - |
| EMPD-F12 | 근태 상세 그리드 스크롤 | P1 | 없음 (UI 로컬) | - | - | - |

---

## 4. UI 구조

### 4.1 화면 레이아웃

```
+-----------------------------------------------------------+
| [급여지급] [시작일 ~ 종료일] [조회] [수정] [인쇄] [Excel]  [닫기] |
|                                                           |
| +--직원 목록--+  +--근태 상세 그리드------------------+      |
| | 직원 리스트  |  | 날짜 | 출근 | 퇴근 | 근무시간 |...|      |
| |             |  |                                  |      |
| +-------------+  +----------------------------------+      |
|                  [확대] [Excel]                             |
+-----------------------------------------------------------+
```

### 4.2 컴포넌트 매핑 (shared/ui 기준)

| 영역 | 컴포넌트 경로 | 비고 |
|---|---|---|
| 직원 목록 | shared/ui/molecules/DataTable | 왼쪽 패널 |
| 근태 상세 | shared/ui/molecules/DataTable | 오른쪽 패널 |
| 날짜 선택 | shared/ui/atoms/DatePicker | 조회 기간 |
| 버튼 | shared/ui/atoms/Button | 조회/수정/인쇄 등 |

### 4.3 데이터 바인딩

| ID | 표시 항목 | 신규 UI 컴포넌트 | 데이터 소스 |
|---|---|---|---|
| EMPD-D01 | 직원 목록 그리드 | DataTable | staffApi.getStaffList |
| EMPD-D02 | 근태 상세 그리드 | DataTable | staffApi.getClockHistory |
| EMPD-D03 | 조회 시작일 | DatePicker | UI 로컬 상태 |
| EMPD-D04 | 조회 종료일 | DatePicker | UI 로컬 상태 |

---

## 5. 구현 명세

### 5.1 Bridge Command

| Command | 요청 payload | 응답 payload | Error | 비고 |
|---|---|---|---|---|
| STAFF:CLOCK_IN_OUT | `{ staffId, type: "IN"\|"OUT" }` | `{ record: { staffId, type, timestamp } }` | `ALREADY_CLOCKED_IN`, `ALREADY_CLOCKED_OUT` | 출퇴근 처리 |
| STAFF:GET_HISTORY | `{ staffId?, startDate, endDate }` | `{ records: [...] }` | (없음) | 기간별 조회 |
| ACCOUNTING:CASH_OUT | `{ amount, reason, staffId }` | `{ record }` | `INVALID_AMOUNT`, `INSUFFICIENT_CASH` | 급여 지급 |

### 5.2 UseCase

| UseCase | 책임 | 트랜잭션 | Ledger | Outbox |
|---|---|---|---|---|
| ClockInOutUseCase | 출퇴근 기록, 수정 | O | - | 근태 이력 동기화 |
| GetClockHistoryUseCase | 근태 기간 조회 | X (읽기 전용) | - | - |
| CashInOutUseCase | 급여 지급 (현금 출금 재사용) | O (SQLite TX 원자적) | RECEIVED -> SUCCEEDED | 급여 지급 이력 동기화 |

> **UseCase 실패 규칙**: 멱등성 Ledger 기록 (requestId + idempotencyKey). SQLite TX 원자적 — 실패 시 전체 롤백. 오프라인 동작 가능 (로컬 SQLite 기준).

### 5.3 Domain/Manager

| Manager | 메서드 | 책임 |
|---|---|---|
| StaffMgr | ClockIn() / ClockOut() | 출퇴근 기록 |
| StaffMgr | GetClockHistory() | 근태 이력 조회 |
| AccountingMgr | RecordCashOut() | 현금 출금 기록 |

### 5.4 Infrastructure

| 모듈 | 파일 | 책임 |
|---|---|---|
| Tables/Staff/StaffCrud | SQLite | 직원 정보 |
| Tables/Staff/ClockHistoryCrud | SQLite | 출퇴근 이력 |
| Tables/Accounting/CashInOutCrud | SQLite | 현금 입출금 |
| Device/Printer | - | 인쇄 |
| Support/Excel | - | 엑셀 내보내기 |

### 5.5 RTK Query 연동

| Endpoint | 태그 | 비고 |
|---|---|---|
| staffApi.getStaffList | `StaffList` | 직원 목록 |
| staffApi.getClockHistory | `ClockHistory:{staffId}` | 근태 상세 |

### 5.6 PosRealTime 이벤트

해당 없음.

### 5.7 i18n / Error / Permission

| 항목 | 규칙 | 비고 |
|---|---|---|
| i18n | `BrandPosApp/PosUi/src/i18n/locales/{ko,vi,en}/staff.json` | msgKey 기반 |
| Error | 코드 기반: `{ type, code, msgKey, severity, recoverable }` | `ALREADY_CLOCKED_IN` 등 |
| Permission | **로그인 직원 (자기 기록)**, **관리자 (전체 직원 기록)**. 급여 지급은 관리자 전용. | |

---

## 6. 테스트

| ID | 시나리오 | 기대 결과 |
|---|---|---|
| EMPD-T01 | 직원 선택 후 기간 조회 | 해당 직원의 근태 이력 표시 |
| EMPD-T02 | 출근/퇴근 처리 | ClockHistory에 기록 추가 |
| EMPD-T03 | 급여 지급 | CashInOut 기록 생성 |
| EMPD-T04 | 엑셀 내보내기 | 파일 생성 확인 |

---

## 7. 완료 기준

- [ ] 출퇴근 버튼이 명시적으로 표시된다 (레거시 숨김 해제)
- [ ] 2개의 MFCGridCtrl이 React 테이블로 대체된다
- [ ] 레거시 스크롤 버튼 4개가 네이티브 스크롤로 대체된다
- [ ] 급여 지급이 CashInOutUseCase를 재사용한다
- [ ] 엑셀 내보내기가 Bridge Command를 통해 C++ 처리된다

---

## 8. 작업 명단

| 작업 | 대상 파일 경로 | 상태 |
|---|---|---|
| Screen 구현 | `BrandPosApp/PosUi/src/screens/StaffScreen/ClockHistory/index.tsx` | TODO |
| Bridge Command | `BrandPosApp/Presentation/CEF/InternalBridge/PosRequestActions/Staff/StaffActions.cpp` | TODO |
| UseCase | `BrandPosApp/UseCases/Staff/ClockInOutUseCase.cpp` | TODO |
| UseCase | `BrandPosApp/UseCases/Staff/GetClockHistoryUseCase.cpp` | TODO |
| Domain | `BrandPosApp/Domain/Staff/StaffMgr.cpp` | TODO |
| Persistence | `BrandPosApp/Infrastructure/Persistence/SQLite/Tables/Staff/ClockHistoryCrud.cpp` | TODO |
| RTK Query | `BrandPosApp/PosUi/src/store/api/staffApi.ts` | TODO |
| Screen Shell | `BrandPosApp/PosUi/src/screens/EmployeeScreen/components/AttendanceDialog.tsx` | DONE (shell) |

---

## Appendix: 레거시 참조

### 레거시 다이얼로그 정보

| 항목 | 값 |
|---|---|
| 다이얼로그 ID | IDD_EMP_DILIGENCE |
| 리소스 값 | 122 |
| 크기 (DLU) | 512 x 384 |
| 소스 파일 | Restaurant.rc |
| 총 UI 요소 수 | 19 (버튼 15, 입력 2, 그리드 2) |

### 레거시 컨트롤 -> 신규 매핑

| 레거시 컨트롤 | 신규 대응 |
|---|---|
| IDC_EMP_WORKIN (숨김) | 출근 버튼 (명시적 표시) |
| IDC_WORKOUT (숨김) | 퇴근 버튼 (명시적 표시) |
| IDC_EMP_SERCH | 조회 버튼 |
| IDC_EMP_MOD | 수정 버튼 |
| IDC_EMP_GIVE | 급여지급 버튼 |
| IDC_EMP_PRINT | 인쇄 버튼 |
| IDC_EMP_EXCEL / IDC_EMP_EXCEL2 | 엑셀 버튼 |
| IDC_GRID (MFCGridCtrl) | DataTable (직원 목록) |
| IDC_GRID2 (MFCGridCtrl) | DataTable (근태 상세) |
| IDC_UP/DOWN, IDC_UP2/DOWN2 | 네이티브 스크롤 |
| IDC_EMP_START / IDC_EMP_END | DatePicker |
