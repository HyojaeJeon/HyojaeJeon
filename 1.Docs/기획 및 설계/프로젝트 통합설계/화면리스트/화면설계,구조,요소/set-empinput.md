# SET-EMPINPUT: 직원 입력 화면

## 0. 문서 정보

| 항목 | 값 |
|---|---|
| 문서 ID | SCR-SET-EMPINPUT |
| 화면 ID | SetupScreen/EmployeeInput |
| 레거시 다이얼로그 | IDD_EMPINPUT (리소스 137) |
| 작성일 | 2026-04-05 |
| 상태 | 초안 |

---

## 1. 화면 개요

직원 정보(이름, 직급, 비밀번호 등)를 관리하는 설정 화면이다. 단일 그리드 기반 CRUD 구조에 퇴직자 포함/미포함 필터와 퇴직자 비밀번호 초기화 기능이 추가되어 있다. 그리드 인라인 편집으로 직원 정보를 직접 수정할 수 있다.

- **운영 모드**: Setup mode

---

## 2. 상위 기준 연결

| 기준 문서 | 관련 섹션 | 비고 |
|---|---|---|
| 04-Edge-POS-아키텍처-설계서 | 2.3 통합 목표 디렉토리 구조 | screens/SetupScreen/EmployeeInput/* |
| CLAUDE.md | PosUi 개발 규칙 | shared/ui import, RTK Query 사용 |
| CLAUDE.md | RTK Query 캐시 갱신 전략 | 태그 세분화: EmployeeList:active, EmployeeList:all |

---

## 3. 기능 목록

| ID | 기능명 | 설명 | 우선순위 |
|---|---|---|---|
| F-EMP-001 | 직원 추가 | 새 직원 생성 | P0 |
| F-EMP-002 | 직원 저장 | 직원 일괄 저장 | P0 |
| F-EMP-003 | 선택삭제 | 선택된 직원 삭제 | P0 |
| F-EMP-004 | 퇴직자 비밀번호 초기화 | 관리자 인증 후 비밀번호 초기화 | P1 |
| F-EMP-005 | 퇴직자 포함 표시 | 체크박스로 퇴직자 포함/미포함 필터 | P1 |
| F-EMP-006 | 닫기 | SetupScreen/index.tsx로 복귀 | P0 |

---

## 4. UI 구조

### 4.1 화면 레이아웃

```
+--------------------------------------------------------------+
|  [추가] [저장] [선택삭제]                            [닫기]   |
+--------------------------------------------------------------+
|                                                              |
|  직원 목록 그리드 (인라인 편집)                               |
|  - 직원코드, 이름, 직급, 비밀번호, 퇴직여부 등              |
|                                                              |
+--------------------------------------------------------------+
|  [v] 퇴직자 포함 표시    [퇴직자 비밀번호 초기화]            |
+--------------------------------------------------------------+
```

### 4.2 공용 UI 컴포넌트 매핑

| 컴포넌트 | 위치 | 용도 |
|---|---|---|
| shared/ui/organisms/DataGrid | 직원 목록 (인라인 편집) | D-EMP-001 |
| shared/ui/atoms/Checkbox | 퇴직자 포함 필터 | D-EMP-002 |
| shared/ui/atoms/Button | CRUD 버튼, 비밀번호 초기화 | 전체 액션 |

---

## 5. 구현 명세

### 5.1 Bridge Commands

| Command | 방향 | Payload | 응답 | 비고 |
|---|---|---|---|---|
| SETUP:EMPLOYEE:SAVE | UI → C++ | `{ action: "add" \| "batch", data: {...} }` | `{ success, employees }` | 직원 추가/저장 |
| SETUP:EMPLOYEE:DELETE | UI → C++ | `{ selected: true, ids: string[] }` | `{ success }` | 선택삭제 |
| SETUP:EMPLOYEE:GET_LIST | UI → C++ | `{ includeResigned?: boolean }` | `{ employees }` | 목록 조회 (필터) |
| SETUP:EMPLOYEE:RESET_PASSWORD | UI → C++ | `{ employeeId: string, adminAuth: {...} }` | `{ success }` | 비밀번호 초기화 |

#### Bridge Error 규칙

| Command | Error Code | 조건 |
|---|---|---|
| SETUP:EMPLOYEE:SAVE | VALIDATION_FAILED | 필수 필드(이름, 직급) 누락, 비밀번호 형식 오류 |
| SETUP:EMPLOYEE:SAVE | DUPLICATE_KEY | 동일 직원코드 중복 |
| SETUP:EMPLOYEE:DELETE | NOT_FOUND | 존재하지 않는 직원 |
| SETUP:EMPLOYEE:DELETE | IN_USE | TODO: 현재 로그인 중인 직원 삭제 시 정책 결정 필요 |
| SETUP:EMPLOYEE:RESET_PASSWORD | NOT_FOUND | 존재하지 않는 직원 |
| SETUP:EMPLOYEE:RESET_PASSWORD | AUTH_FAILED | 관리자 인증 실패 |

### 5.2 RTK Query Endpoints

| Endpoint | 메서드 | 태그 | 비고 |
|---|---|---|---|
| setupEmployeeApi.getEmployeeList | GET | `EmployeeList:active`, `EmployeeList:all` | 퇴직자 필터별 분리 |
| setupEmployeeApi.saveEmployee | MUTATION | invalidates `EmployeeList:*` | 직원 저장 |
| setupEmployeeApi.deleteEmployee | MUTATION | invalidates `EmployeeList:*` | 직원 삭제 |
| setupEmployeeApi.resetPassword | MUTATION | - | 비밀번호 초기화 |

### 5.3 UseCase 매핑

| UseCase | 트리거 | Domain/Manager | Infrastructure |
|---|---|---|---|
| SaveEmployeeUseCase | 직원 추가/저장/삭제/비밀번호 초기화 | StaffMgr | Tables/Staff/StaffCrud |
| GetEmployeeListUseCase | 직원 목록 조회 | StaffMgr | Tables/Staff/StaffCrud |

#### UseCase 실패 규칙

- **멱등성**: 직원 저장은 마지막 값 덮어쓰기 (idempotencyKey 불필요)
- **트랜잭션**: SQLite TX 내에서 직원 INSERT/UPDATE/DELETE 원자적. 일괄 저장 시 전체 batch를 단일 TX로 처리
- **참조 무결성**: TODO: 주문/결제 이력에서 직원코드를 참조하므로, 삭제 대신 퇴직 처리(soft delete) 여부 확정 필요
- **Outbox**: 직원 변경은 중앙 동기화 대상 (매장 직원 → CentralApi)
- **오프라인**: 로컬 DB만 사용, 오프라인 동작 가능
- **비밀번호 초기화**: 관리자 인증(adminAuth) 검증 후에만 실행. 초기화 이력 로깅 필요

### 5.7 Permission

- 설정 화면은 관리자 전용 (Setup mode 자체가 관리자 접근)
- 비밀번호 초기화(RESET_PASSWORD)는 관리자 인증(adminAuth) 필수

### 5.4 데이터 표시 요소

| ID | 표시 항목 | 신규 UI 컴포넌트 | 데이터 소스 |
|---|---|---|---|
| D-EMP-001 | 직원 목록 | shared/ui/organisms/DataGrid | setupEmployeeApi.getEmployeeList |
| D-EMP-002 | 퇴직자 포함 필터 | shared/ui/atoms/Checkbox | 로컬 UI 상태 (필터 파라미터) |

### 5.5 상태 관리

- 퇴직자 포함 필터: UI slice (setupEmployeeUiSlice.includeResigned)
- 직원 목록: RTK Query 캐시 (EmployeeList:active / EmployeeList:all)
- 그리드 편집 상태: 로컬 컴포넌트 상태

### 5.6 i18n

- 버튼 라벨, 그리드 컬럼 헤더: BrandPosApp/PosUi/src/i18n/locales/ 기반 msgKey

---

## 6. 테스트

| ID | 시나리오 | 기대 결과 |
|---|---|---|
| T-EMP-001 | 직원 추가 → 저장 | 그리드에 새 직원 반영 |
| T-EMP-002 | 인라인 편집 → 저장 | 수정된 정보 DB 반영 |
| T-EMP-003 | 선택삭제 | 선택 행 제거, DB 반영 |
| T-EMP-004 | 퇴직자 포함 체크 | 퇴직자 포함/미포함 목록 전환 |
| T-EMP-005 | 비밀번호 초기화 | 관리자 인증 후 초기화 완료 |
| T-EMP-006 | mockTransport 환경 | C++ 없이 독립 동작 |

---

## 7. 완료 기준

- [ ] screens/SetupScreen/EmployeeInput 화면 구현 완료
- [ ] 직원 CRUD (추가/저장/삭제)
- [ ] 그리드 인라인 편집 지원
- [ ] 퇴직자 포함/미포함 필터 동작
- [ ] 비밀번호 초기화 (관리자 인증 절차 포함)
- [ ] mockTransport 독립 개발 가능
- [ ] 1024x768 해상도 + 터치 사용성 검증

---

## 8. 작업 명단

| 파일 경로 | 역할 | 상태 |
|---|---|---|
| BrandPosApp/PosUi/src/screens/SettingsScreen/components/EmployeeInputDialog.tsx | 직원 입력 메인 화면 (shell) | SHELL 완료 (2026-04-05) |
| BrandPosApp/PosUi/src/shared/ui/organisms/DataGrid.tsx | 공용 데이터 그리드 | TODO |
| BrandPosApp/PosUi/src/shared/ui/atoms/Checkbox.tsx | 공용 체크박스 | TODO |
| BrandPosApp/PosUi/src/store/api/setupEmployeeApi.ts | 직원 설정 RTK Query API | TODO |
| BrandPosApp/PosUi/src/store/slices/setupEmployeeUiSlice.ts | 직원 설정 UI 상태 | TODO |
| BrandPosApp/PosUi/src/bridge/commands/setupEmployeeCommands.ts | 직원 설정 Bridge Command | TODO |
| BrandPosApp/UseCases/System/SaveEmployeeUseCase.cpp | 직원 저장 UseCase | TODO |
| BrandPosApp/UseCases/System/GetEmployeeListUseCase.cpp | 직원 조회 UseCase | TODO |
| BrandPosApp/Domain/Staff/StaffMgr.cpp | 직원 Manager | TODO |
| BrandPosApp/Infrastructure/Persistence/SQLite/Tables/Staff/StaffCrud.cpp | 직원 CRUD | TODO |

---

## Appendix: 레거시 참조

### 레거시 다이얼로그 정보

| 항목 | 값 |
|---|---|
| 다이얼로그 ID | IDD_EMPINPUT |
| 리소스 값 | 137 |
| 크기 (DLU) | 512 x 384 |
| 스타일 | DS_SETFONT \| WS_POPUP |
| 소스 파일 | RestaurantSet.rc |
| 총 UI 요소 수 | 15 (버튼 12, 입력 1, 그리드 1, 기타 1) |

### 레거시 주요 컨트롤

| 레거시 ID | 용도 | 비고 |
|---|---|---|
| IDC_GRID | 직원 목록 그리드 | 단일 그리드 |
| ID_EMP_ADD | 추가 | |
| ID_EMP_ALLSAVE | 저장 | |
| ID_EMP_SELDEL | 선택삭제 | |
| IDC_BTN_RESTORE | 퇴직자 비밀번호 초기화 | |
| IDC_CHK_DELEMP | 퇴직자 포함 체크박스 | |

### 제외 대상 (숨김 버튼)

- ID_EMP_DETAIL: 상세설정 (NOT WS_VISIBLE)
- ID_EMP_INOUT: 근태관리 (NOT WS_VISIBLE)
- ID_EMP_PAY: 급여설정 (NOT WS_VISIBLE)
- ID_EMP_GRP: 그룹설정 (NOT WS_VISIBLE)
- ID_EMP_ALLAPPLY: 일괄적용 (NOT WS_VISIBLE)
- ID_EMP_SELSAVE: 선택저장 (NOT WS_VISIBLE)
- ID_EMP_ALLDEL: 전체삭제 (NOT WS_VISIBLE)

### 마이그레이션 노트

- 숨김 버튼 7종은 마이그레이션 대상에서 제외한다. 향후 확장 시 별도 탭으로 추가 가능.
- 직원 비밀번호 초기화 기능은 보안 확인 절차(관리자 인증)를 추가하여 구현한다.
- 퇴직자 포함/미포함 필터는 RTK Query의 쿼리 파라미터로 처리한다.
