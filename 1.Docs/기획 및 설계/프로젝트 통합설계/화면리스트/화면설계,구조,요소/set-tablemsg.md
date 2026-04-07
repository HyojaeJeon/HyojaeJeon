# SET-TABLEMSG: 테이블 메시지 설정 화면

---

## 0. 문서 정보

| 항목 | 값 |
|---|---|
| 문서 ID | SET-TABLEMSG |
| 화면명 | 테이블 메시지 설정 |
| 레거시 다이얼로그 | IDD_TABLEMSG (리소스 174) |
| 신규 라우트 | `/pos/setup/table-message` |
| 신규 Screen 경로 | `screens/SetupScreen/TableMessage` |
| 모드 | Setup mode |
| 작성일 | 2026-04-05 |
| 상태 | 초안 |

---

## 1. 화면 개요

테이블 화면에 표시되는 안내 문구를 그리드 기반으로 관리하는 CRUD 설정 화면이다. set-inoutset과 거의 동일한 구조(추가/저장/삭제 + 그리드)이며, 항목 추가, 인라인 편집, 선택 삭제, 전체 저장 기능을 제공한다. 4개 유사 화면(InOutConfig, TableMessage, SimpleReceipt, CustomerInfoConfig)과 동일한 EditableDataGrid 패턴을 공유한다.

---

## 2. 상위 기준 연결

| 기준 문서 | 관련 섹션 | 비고 |
|---|---|---|
| 04-Edge-POS-아키텍처-설계서 | 2.3 통합 목표 디렉토리 구조 | `screens/SetupScreen/*` 배치 |
| 04-Edge-POS-아키텍처-설계서 | 4.x InternalBridge | `PosRequestActions/System/` thin router |
| CLAUDE.md | PosUi 개발 규칙 | `shared/ui/` 공용 컴포넌트 원본 |

---

## 3. 기능 목록

| ID | 기능명 | 우선순위 | Bridge Command | UseCase | Domain/Manager | Infrastructure |
|---|---|---|---|---|---|---|
| TMSG-F01 | 테이블 메시지 목록 조회 | P1 | `SETUP:TABLE_MSG:GET_LIST` | `SaveTableMessageConfigUseCase` (조회 경로) | `SystemMgr` | SQLite `Tables/System/ConfigCrud` |
| TMSG-F02 | 메시지 추가 | P1 | `SETUP:TABLE_MSG:SAVE` | `SaveTableMessageConfigUseCase` | `SystemMgr` | SQLite `Tables/System/ConfigCrud` |
| TMSG-F03 | 전체 저장 | P0 | `SETUP:TABLE_MSG:SAVE` | `SaveTableMessageConfigUseCase` | `SystemMgr` | SQLite `Tables/System/ConfigCrud` |
| TMSG-F04 | 선택 삭제 | P1 | `SETUP:TABLE_MSG:SAVE` | `SaveTableMessageConfigUseCase` | `SystemMgr` | SQLite `Tables/System/ConfigCrud` |
| TMSG-F05 | 닫기 (React 라우팅) | P1 | - | - | - | - |
| TMSG-F06 | 그리드 데이터 인라인 편집 | P1 | - | - | - | - |

---

## 4. UI 구조

### 4.1 화면 레이아웃

```
+---------------------------------------------------------------+
| [추가]  [저장]  [선택삭제]                [닫기]    헤더 영역   |
+---------------------------------------------------------------+
|                                                               |
|  +-----------------------------------------------------------+|
|  |  테이블 메시지 그리드 (EditableDataGrid)                   ||
|  |  - 인라인 셀 편집 지원                                     ||
|  |  - 행 선택 + 삭제 지원                                     ||
|  +-----------------------------------------------------------+|
|                                                               |
+---------------------------------------------------------------+
```

### 4.2 사용 컴포넌트 (shared/ui)

| 컴포넌트 | 경로 | 용도 |
|---|---|---|
| `EditableDataGrid` | `shared/ui/organisms/EditableDataGrid` | 테이블 메시지 인라인 편집 그리드 |
| `Button` | `shared/ui/atoms/Button` | 추가, 저장, 선택삭제, 닫기 |

---

## 5. 구현 명세

### 5.1 RTK Query Endpoints

| Endpoint | 메서드 | 설명 |
|---|---|---|
| `setupApi.useGetTableMessageListQuery` | GET | 테이블 메시지 목록 조회 |
| `setupApi.useSaveTableMessageConfigMutation` | POST | 테이블 메시지 저장 (추가/수정/삭제 통합) |

### 5.2 Bridge Commands

| Command | 방향 | Payload | 비고 |
|---|---|---|---|
| `SETUP:TABLE_MSG:GET_LIST` | UI -> C++ | `{ v, requestId, timestamp }` | 메시지 목록 조회 |
| `SETUP:TABLE_MSG:SAVE` | UI -> C++ | `{ v, requestId, timestamp, idempotencyKey, data: { items: [...] } }` | 변경된 전체 목록 저장 |

### 5.3 UseCase 흐름

**SaveTableMessageConfigUseCase (저장)**
1. `idempotencyKey` 검사 (Ledger)
2. `SystemMgr.validateTableMessageConfig()` 호출
3. SQLite 트랜잭션: `ConfigCrud.saveTableMessageConfig()` + Ledger 갱신
4. 커밋 후 `PosRealTimeSender` -> UI 갱신 이벤트

### 5.4 Domain/Manager

| Manager | 메서드 | 설명 |
|---|---|---|
| `SystemMgr` | `validateTableMessageConfig()` | 테이블 메시지 유효성 검증 |
| `SystemMgr` | `getTableMessageList()` | 테이블 메시지 목록 조회 |

### 5.5 Infrastructure

| 모듈 | 파일 | 설명 |
|---|---|---|
| SQLite | `Tables/System/ConfigCrud` | 테이블 메시지 CRUD |

### 5.6 주의사항

- 레거시 IDOK 버튼은 숨김 상태(NOT WS_VISIBLE). 키보드 Enter 처리용으로 추정. 신규에서는 불필요.
- 테이블 메시지는 테이블 화면에 표시되는 안내 문구 설정이므로 테이블 화면과 연관.
- 4개 유사 화면 공통 레이아웃 템플릿(`GridCrudScreen`) 추출 권장. <!-- TODO: GridCrudScreen 공통 템플릿 설계 -->

### 5.7 UseCase 실패 규칙

- **멱등성**: 테이블 메시지 설정 저장은 마지막 값 덮어쓰기 (idempotencyKey 불필요)
- **트랜잭션**: SQLite TX 내에서 Config INSERT/UPDATE/DELETE 원자적
- **참조 무결성**: 사용 중인 메시지 항목 삭제 시 IN_USE 에러 반환
- **Outbox**: 테이블 메시지 변경 → 중앙 동기화 대상 (매장 설정 → CentralApi)
- **오프라인**: 로컬 DB만 사용, 오프라인 동작 가능

### 5.8 Permission

- 설정 화면은 관리자 전용 (Setup/Maintenance mode 접근 권한 필요)
- TODO: Setup mode 진입 시 관리자 인증 절차 상세 정의 필요

---

## 6. 테스트

| ID | 시나리오 | 기대 결과 | 우선순위 |
|---|---|---|---|
| TMSG-T01 | 화면 진입 시 메시지 목록 로드 | 그리드에 현재 메시지 항목 표시 | P1 |
| TMSG-T02 | 메시지 추가 후 저장 | 새 행 추가, 저장 후 DB 반영 | P0 |
| TMSG-T03 | 셀 인라인 편집 후 저장 | 변경된 값 DB에 반영 | P1 |
| TMSG-T04 | 선택 삭제 후 저장 | 선택된 행 삭제, DB 반영 | P1 |
| TMSG-T05 | 저장 멱등성 확인 | 동일 idempotencyKey로 중복 저장 시 1회만 반영 | P0 |

---

## 7. 완료 기준

- [ ] P0: 전체 저장 정상 동작 (TMSG-F03)
- [ ] P1: 조회, 추가, 삭제, 인라인 편집 동작
- [ ] P1: 닫기 시 React 라우팅 정상 동작
- [ ] 멱등성 테스트 통과
- [ ] `EditableDataGrid` 공용 컴포넌트 재사용 확인

---

## 8. 작업 명단

| 계층 | 파일 경로 | 작업 내용 |
|---|---|---|
| Screen | `BrandPosApp/PosUi/src/screens/SettingsScreen/components/TableMessageSettingsDialog.tsx` | 테이블 메시지 화면 구현 (SHELL 완료 2026-04-05) |
| Screen Hook | `BrandPosApp/PosUi/src/screens/SetupScreen/TableMessage/hooks/useTableMessage.ts` | UI 전용 훅 |
| RTK Query | `BrandPosApp/PosUi/src/store/api/setupApi.ts` | `getTableMessageList`, `saveTableMessageConfig` endpoint |
| shared/ui | `BrandPosApp/PosUi/src/shared/ui/organisms/EditableDataGrid` | 인라인 편집 그리드 (공용) |
| shared/ui | `BrandPosApp/PosUi/src/shared/ui/atoms/Button` | 버튼 (공용) |
| Bridge | `BrandPosApp/PosUi/src/bridge/commands/setupCommands.ts` | `SETUP:TABLE_MSG:*` 커맨드 정의 |
| PosRequestActions | `BrandPosApp/Presentation/CEF/InternalBridge/PosRequestActions/System/SetupActions.cpp` | 테이블 메시지 thin router |
| UseCase | `BrandPosApp/UseCases/System/SaveTableMessageConfigUseCase.cpp` | 테이블 메시지 저장 UseCase |
| Domain | `BrandPosApp/Domain/System/SystemMgr.cpp` | 테이블 메시지 검증/조회 |
| Infrastructure | `BrandPosApp/Infrastructure/Persistence/SQLite/Tables/System/ConfigCrud.cpp` | 테이블 메시지 CRUD |

---

## Appendix: 레거시 참조

### A.1 레거시 기본 정보

| 항목 | 값 |
|---|---|
| 다이얼로그 ID | IDD_TABLEMSG |
| 리소스 값 | 174 |
| 크기 (DLU) | 450 x 337 |
| 다이얼로그 타입 | DIALOGEX |
| 스타일 | DS_SETFONT \| DS_MODALFRAME \| WS_POPUP |
| 폰트 | 10, "System", 0, 0, 0x0 |
| 소스 파일 | RestaurantSet.rc |
| 총 UI 요소 수 | 6 (버튼 5, 그리드 1) |

### A.2 레거시 UI 요소

**버튼 (5개):** IDOK (숨김), IDCANCEL (닫기), IDC_TAMSG_ALLSAVE (저장), IDC_TAMSG_ADD (추가), IDC_TAMSG_SELDEL (선택삭제)

**그리드 (1개):** IDC_GRID (MFCGridCtrl) - 테이블 메시지 그리드 (셀 직접 편집 지원)

### A.3 마이그레이션 노트

- set-inoutset과 거의 동일한 구조. 그리드 기반 CRUD 화면.
- IDOK 버튼은 숨김 상태. 키보드 Enter 처리용으로 추정. 신규에서는 불필요.
- 테이블 메시지는 테이블 화면에 표시되는 안내 문구 설정. 테이블 화면과 연관.
