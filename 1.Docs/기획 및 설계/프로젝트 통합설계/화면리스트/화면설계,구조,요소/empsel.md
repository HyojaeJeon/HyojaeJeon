# EMPSEL 화면 설계서

---

## 0. 문서 정보

| 항목 | 값 |
|---|---|
| 문서 ID | SCR-EMPSEL |
| 화면 ID (레거시) | IDD_EMPSEL |
| 작성일 | 2026-04-05 |
| 상태 | 초안 |

---

## 1. 화면 개요

EMPSEL은 직원 선택/관리 모달이다. 다른 화면(주문/결제/테이블)에서 직원 전환 시 호출되며, 직원 목록 조회, 추가/삭제/저장, 메뉴 권한 토글 기능을 제공한다.

- 신규 UI 위치: `shared/ui/organisms/StaffSelectModal`
- 화면 유형: 모달 (Organism)
- 우선순위: **P0**

---

## 2. 상위 기준 연결

| 기준 문서 | 관련 섹션 | 비고 |
|---|---|---|
| 04-Edge-POS-아키텍처-설계서 | 계층 흐름 | 직원 관리 |
| CLAUDE.md | shared/ui 규칙 | 모달은 shared/ui/organisms 배치 |

---

## 3. 기능 목록

| ID | 기능명 | 우선순위 | Bridge Command | UseCase | Domain/Manager | Infrastructure |
|---|---|---|---|---|---|---|
| EMPSEL-F01 | 직원 선택 (그리드에서 클릭) | P0 | STAFF:SELECT | VerifyPermissionUseCase | StaffMgr | Tables/Staff/StaffCrud (SQLite) |
| EMPSEL-F02 | 직원 추가 | P1 | STAFF:SELECT | - | StaffMgr | Tables/Staff/StaffCrud (SQLite) |
| EMPSEL-F03 | 직원 삭제 | P1 | STAFF:SELECT | - | StaffMgr | Tables/Staff/StaffCrud (SQLite) |
| EMPSEL-F04 | 직원 저장 | P1 | STAFF:SELECT | - | StaffMgr | Tables/Staff/StaffCrud (SQLite) |
| EMPSEL-F05 | 닫기 | P0 | 없음 (모달 닫기) | - | - | - |
| EMPSEL-F06 | 메뉴 권한 토글 (24개 버튼 그리드) | P1 | STAFF:SELECT | - | StaffMgr | Tables/Staff/StaffCrud (SQLite) |
| EMPSEL-F07 | 그리드 스크롤 | P0 | 없음 (UI 로컬) | - | - | - |
| EMPSEL-F08 | 직원 검색 입력 | P1 | 없음 (UI 로컬 필터) | - | - | - |
| EMPSEL-F09 | 메뉴 권한 보기 (숨김) | P2 | 없음 (UI 로컬) | - | - | - |

---

## 4. UI 구조

### 4.1 화면 레이아웃

```
+---------------------------------------------+
| [저장] [닫기]                                |
| [직원 검색 입력]  [추가] [삭제] [메뉴>>]       |
|                                             |
| +--권한 체크 그리드--+  +--직원 목록 그리드--+  |
| | 4열 x 6행         |  | 이름/코드/상태   |  |
| | 체크박스 매트릭스   |  |                  |  |
| +-------------------+  +--[UP]--[DOWN]---+  |
+---------------------------------------------+
```

### 4.2 컴포넌트 매핑 (shared/ui 기준)

| 영역 | 컴포넌트 경로 | 비고 |
|---|---|---|
| 모달 전체 | shared/ui/organisms/StaffSelectModal | 재사용 모달 |
| 직원 목록 | shared/ui/molecules/DataTable | React 테이블, 네이티브 스크롤 |
| 권한 그리드 | shared/ui/molecules/CheckboxMatrix | 4x6 체크박스 매트릭스 |
| 검색 입력 | shared/ui/atoms/SearchInput | 로컬 필터링 |

### 4.3 데이터 바인딩

| ID | 표시 항목 | 신규 UI 컴포넌트 | 데이터 소스 |
|---|---|---|---|
| EMPSEL-D01 | 직원 목록 그리드 | DataTable | staffApi.getStaffList |
| EMPSEL-D02 | 직원 검색 입력 | SearchInput | UI 로컬 상태 (필터링) |
| EMPSEL-D03 | 메뉴 권한 버튼 그리드 (24개) | CheckboxMatrix | staffApi.getStaffPermissions |

---

## 5. 구현 명세

### 5.1 Bridge Command

| Command | 요청 payload | 응답 payload | Error | 비고 |
|---|---|---|---|---|
| STAFF:SELECT | `{ page? }` | `{ staffList: [{ staffId, staffName, ... }] }` | (없음) | 직원 목록 조회 |
| STAFF:VERIFY_PERMISSION | `{ staffId, password, requiredPermission }` | `{ granted: boolean }` | `INVALID_PASSWORD` | 직원 전환 시 권한 검증 |

### 5.2 UseCase

| UseCase | 책임 | 트랜잭션 | Ledger | Outbox |
|---|---|---|---|---|
| VerifyPermissionUseCase | 권한 검증 후 직원 전환 | O (SQLite TX 원자적) | - | 직원 변경 이력 동기화 |

> **UseCase 실패 규칙**: 멱등성 Ledger 기록. SQLite TX 원자적 — 실패 시 전체 롤백. 오프라인 동작 가능 (로컬 SQLite 기준 검증).

### 5.3 Domain/Manager

| Manager | 메서드 | 책임 |
|---|---|---|
| StaffMgr | GetStaffList() | 직원 목록 조회 |
| StaffMgr | AddStaff() / DeleteStaff() / SaveStaff() | 직원 CRUD |
| StaffMgr | UpdatePermissions() | 메뉴 권한 토글 |

### 5.4 Infrastructure

| 모듈 | 파일 | 책임 |
|---|---|---|
| Tables/Staff/StaffCrud | SQLite | 직원 정보 CRUD |

### 5.5 RTK Query 연동

| Endpoint | 태그 | 비고 |
|---|---|---|
| staffApi.getStaffList | `StaffList` | 직원 목록 |
| staffApi.getStaffPermissions | `StaffPermission:{staffId}` | 권한 조회 |

### 5.6 PosRealTime 이벤트

| 이벤트 | 방향 | 비고 |
|---|---|---|
| STAFF:CHANGED | C++ -> UI | 직원 전환 완료 알림 |

### 5.7 i18n / Error / Permission

| 항목 | 규칙 | 비고 |
|---|---|---|
| i18n | `SharedAssets/i18n/locales/{ko,vi,en}/staff.json` | msgKey 기반 |
| Error | 코드 기반: `{ type, code, msgKey, severity, recoverable }` | `INVALID_PASSWORD` → msgKey: `staff.error.invalidPassword` |
| Permission | **로그인 직원 전원** (목록 조회/선택). 직원 추가/삭제/저장/권한 변경은 TODO: 관리자 전용인지 확인 필요 | |

---

## 6. 테스트

| ID | 시나리오 | 기대 결과 |
|---|---|---|
| EMPSEL-T01 | 직원 목록에서 직원 선택 | 선택된 직원으로 전환 |
| EMPSEL-T02 | 직원 추가 후 저장 | 목록에 새 직원 표시 |
| EMPSEL-T03 | 권한 체크박스 토글 후 저장 | 권한 변경 반영 |
| EMPSEL-T04 | 검색 입력 필터링 | 일치하는 직원만 표시 |

---

## 7. 완료 기준

- [ ] StaffSelectModal이 shared/ui/organisms에 배치된다
- [ ] 직원 추가/삭제/저장이 StaffMgr를 통해 로컬 SQLite에 반영된다
- [ ] Outbox를 통해 중앙 서버로 직원 변경 동기화된다
- [ ] 레거시 MFCGridCtrl이 React 테이블로 대체된다
- [ ] 스크롤 버튼이 네이티브 스크롤로 대체된다

---

## 8. 작업 명단

| 작업 | 대상 파일 경로 | 상태 |
|---|---|---|
| Organism 구현 | `BrandPosApp/PosUi/src/shared/ui/organisms/StaffSelectModal.tsx` | TODO |
| Bridge Command | `BrandPosApp/Presentation/CEF/InternalBridge/PosRequestActions/Staff/StaffActions.cpp` | TODO |
| UseCase | `BrandPosApp/UseCases/Staff/VerifyPermissionUseCase.cpp` | TODO |
| Domain | `BrandPosApp/Domain/Staff/StaffMgr.cpp` | TODO |
| Persistence | `BrandPosApp/Infrastructure/Persistence/SQLite/Tables/Staff/StaffCrud.cpp` | TODO |
| RTK Query | `BrandPosApp/PosUi/src/store/api/staffApi.ts` | TODO |
| Screen Shell | `BrandPosApp/PosUi/src/screens/EmployeeScreen/components/EmployeeSelectDialog.tsx` | DONE (shell) |

---

## Appendix: 레거시 참조

### 레거시 다이얼로그 정보

| 항목 | 값 |
|---|---|
| 다이얼로그 ID | IDD_EMPSEL |
| 리소스 값 | 412 |
| 크기 (DLU) | 450 x 337 |
| 소스 파일 | Restaurant.rc |
| 총 UI 요소 수 | 33 (버튼 31, 입력 1, 그리드 1) |

### 레거시 컨트롤 -> 신규 매핑

| 레거시 컨트롤 | 신규 대응 |
|---|---|
| IDC_EMPGRID (MFCGridCtrl) | DataTable (직원 목록) |
| IDC_E_MENU00~53 (24개 버튼) | CheckboxMatrix (4x6 권한 그리드) |
| IDC_EMP_ADD / IDC_EMP_DEL / IDC_EMP_SAVE | 추가/삭제/저장 버튼 |
| IDC_E_EMP (EditText) | SearchInput (검색) |
| IDC_GRID_UP / IDC_GRID_DOWN | 네이티브 스크롤로 대체 |
| IDC_EMP_MENU (숨김) | 권한 패널 토글 |
| IDCANCEL | 닫기 |
