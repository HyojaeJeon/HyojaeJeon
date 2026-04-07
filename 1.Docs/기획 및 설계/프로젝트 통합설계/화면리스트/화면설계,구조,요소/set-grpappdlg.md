# SET-GRPAPPDLG: 그룹 선택 모달

---

## 0. 문서 정보

| 항목 | 값 |
|---|---|
| 문서 ID | SET-GRPAPPDLG |
| 화면명 | 그룹 선택/적용 모달 |
| 레거시 다이얼로그 | IDD_GRPAPPDLG (리소스 166) |
| 신규 라우트 | - (모달 컴포넌트, 독립 라우트 없음) |
| 신규 컴포넌트 경로 | `shared/ui/organisms/GroupSelectModal` |
| 모드 | Setup mode (모달) |
| 작성일 | 2026-04-05 |
| 상태 | Shell 구현 완료 |

---

## 1. 화면 개요

그룹 목록을 표시하고 선택/적용하는 모달 다이얼로그이다. 독립 Screen이 아니라 다른 설정 화면에서 호출되는 공용 모달이다. "그룹적용"과 "선택" 두 가지 모드로 동작하며, 레거시에서는 동일 위치에 두 버튼이 배치되어 모드에 따라 하나만 표시된다. 신규에서는 props로 모드를 구분한다.

---

## 2. 상위 기준 연결

| 기준 문서 | 관련 섹션 | 비고 |
|---|---|---|
| 04-Edge-POS-아키텍처-설계서 | 2.3 통합 목표 디렉토리 구조 | `shared/ui/organisms/` 배치 (공용 모달) |
| CLAUDE.md | PosUi 개발 규칙 | `shared/ui/` 공용 컴포넌트 원본 |

---

## 3. 기능 목록

| ID | 기능명 | 우선순위 | Bridge Command | UseCase | Domain/Manager | Infrastructure |
|---|---|---|---|---|---|---|
| GRP-F01 | 그룹 목록 조회 | P1 | `SETUP:GROUP:GET_LIST` | `SaveGroupConfigUseCase` (조회 경로) | `SystemMgr` | SQLite `Tables/System/ConfigCrud` |
| GRP-F02 | 그룹 적용 저장 | P1 | `SETUP:GROUP:SAVE` | `SaveGroupConfigUseCase` | `SystemMgr` | SQLite `Tables/System/ConfigCrud` |
| GRP-F03 | 그룹 선택 (콜백 반환) | P1 | - (모달 콜백) | - | - | - |
| GRP-F04 | 닫기 | P1 | - (모달 닫기) | - | - | - |
| GRP-F05 | 그리드 행 선택 | P1 | - | - | - | - |

---

## 4. UI 구조

### 4.1 화면 레이아웃

```
+-------------------------------------------+
| [그룹적용 / 선택]  [닫기]     모달 헤더    |
+-------------------------------------------+
|                                           |
|  +---------------------------------------+|
|  |  그룹 목록 (SelectableList)            ||
|  |  - 행 클릭으로 선택                    ||
|  |  - 읽기 전용 (편집 불가)               ||
|  +---------------------------------------+|
|                                           |
+-------------------------------------------+
```

### 4.2 사용 컴포넌트 (shared/ui)

| 컴포넌트 | 경로 | 용도 |
|---|---|---|
| `SelectableList` | `shared/ui/organisms/SelectableList` | 그룹 목록 선택 (읽기 전용) |
| `Button` | `shared/ui/atoms/Button` | 그룹적용/선택, 닫기 |
| `Modal` | `shared/ui/organisms/Modal` | 모달 컨테이너 <!-- TODO: Modal 기본 컴포넌트 존재 여부 확인 --> |

---

## 5. 구현 명세

### 5.1 RTK Query Endpoints

| Endpoint | 메서드 | 설명 |
|---|---|---|
| `setupApi.useGetGroupListQuery` | GET | 그룹 목록 조회 |
| `setupApi.useSaveGroupConfigMutation` | POST | 그룹 적용 저장 |

### 5.2 Bridge Commands

> **설정 Bridge 패턴**: `SETUP:{DOMAIN}:GET_LIST` / `SETUP:{DOMAIN}:SAVE` 형태를 따른다.

| Command | 방향 | Payload | 비고 |
|---|---|---|---|
| `SETUP:GROUP:GET_LIST` | UI -> C++ | `{ v, requestId, timestamp }` | 그룹 목록 조회 |
| `SETUP:GROUP:SAVE` | UI -> C++ | `{ v, requestId, timestamp, idempotencyKey, data: { groupId } }` | 그룹 적용 저장 |

### 5.3 UseCase 흐름

**SaveGroupConfigUseCase (적용)**
1. **Permission 검사**: 관리자 권한 확인 <!-- TODO: 관리자 권한 체계(역할/토큰) 확정 후 구체적인 검사 방식 결정 -->
2. `idempotencyKey` 검사 (Ledger)
3. `SystemMgr.validateGroupConfig()` 호출 — 선택된 groupId의 존재 여부 및 참조 무결성 체크
4. SQLite 트랜잭션 (원자적): `ConfigCrud.saveGroupConfig()` (마지막 값 덮어쓰기) + Ledger 갱신 + Outbox 레코드 적재 (중앙 서버 동기화용) <!-- TODO: 그룹 설정 변경이 중앙 서버 동기화 대상인지 확정 필요 -->
5. 커밋 후 `PosRealTimeSender` -> UI 갱신 이벤트

> **설정 UseCase 공통 패턴**: 설정 저장은 마지막 값 덮어쓰기(upsert) 방식이다. 단일 TX로 원자적 커밋하며, 참조 무결성 위반 시 롤백한다. Outbox에 동기화 레코드를 함께 적재한다.

### 5.4 Domain/Manager

| Manager | 메서드 | 설명 |
|---|---|---|
| `SystemMgr` | `validateGroupConfig()` | 그룹 설정 유효성 검증 |
| `SystemMgr` | `getGroupList()` | 그룹 목록 조회 |

### 5.5 Infrastructure

| 모듈 | 파일 | 설명 |
|---|---|---|
| SQLite | `Tables/System/ConfigCrud` | 그룹 설정 CRUD |

### 5.6 주의사항

- 이 화면은 독립 Screen이 아니라 모달 다이얼로그. `shared/ui/organisms/GroupSelectModal`로 배치.
- IDC_SAVE("그룹적용")와 IDC_SELECT("선택") 버튼이 레거시에서 같은 위치(92,8)에 배치. 모드에 따라 하나만 표시되는 것으로 추정. 신규에서는 `mode` props로 구분. <!-- TODO: 모드별 동작 상세 확인 -->
- 그리드는 선택 전용(읽기)이므로 `EditableDataGrid`가 아닌 `SelectableList`로 충분.

### 5.7 UseCase 실패 규칙

- **멱등성**: 그룹 설정 저장은 마지막 값 덮어쓰기 (idempotencyKey 불필요)
- **트랜잭션**: SQLite TX 내에서 Config UPDATE 원자적
- **참조 무결성**: 선택된 groupId의 존재 여부 검증 (NOT_FOUND 에러)
- **Outbox**: 그룹 설정 변경 → 중앙 동기화 대상 (매장 설정 → CentralApi)
- **오프라인**: 로컬 DB만 사용, 오프라인 동작 가능

### 5.8 Permission

- 설정 화면은 관리자 전용 (Setup/Maintenance mode 접근 권한 필요)
- TODO: Setup mode 진입 시 관리자 인증 절차 상세 정의 필요

---

## 6. 테스트

| ID | 시나리오 | 기대 결과 | 우선순위 |
|---|---|---|---|
| GRP-T01 | 모달 열기 시 그룹 목록 로드 | 리스트에 그룹 목록 표시 | P1 |
| GRP-T02 | 그룹 행 선택 후 "그룹적용" 클릭 | DB에 그룹 설정 반영, 모달 닫힘 | P1 |
| GRP-T03 | 그룹 행 선택 후 "선택" 클릭 | 선택된 그룹 정보를 콜백으로 반환, 모달 닫힘 | P1 |
| GRP-T04 | 닫기 클릭 | 모달 닫힘, 변경 없음 | P1 |

---

## 7. 완료 기준

- [ ] P1: 그룹 목록 조회 정상 동작 (GRP-F01)
- [ ] P1: 그룹 적용 저장 정상 동작 (GRP-F02)
- [ ] P1: 선택 콜백 정상 동작 (GRP-F03)
- [ ] P1: 모드(적용/선택) props 분기 동작
- [ ] `SelectableList` 공용 컴포넌트 구현 확인

---

## 8. 작업 명단

| 계층 | 파일 경로 | 작업 내용 |
|---|---|---|
| shared/ui | `BrandPosApp/PosUi/src/shared/ui/organisms/GroupSelectModal/index.tsx` | 그룹 선택 모달 구현 |
| shared/ui | `BrandPosApp/PosUi/src/shared/ui/organisms/SelectableList/index.tsx` | 선택 가능 리스트 (공용) |
| shared/ui | `BrandPosApp/PosUi/src/shared/ui/organisms/Modal/index.tsx` | 기본 모달 컨테이너 (공용) |
| RTK Query | `BrandPosApp/PosUi/src/store/api/setupApi.ts` | `getGroupList`, `saveGroupConfig` endpoint |
| Bridge | `BrandPosApp/PosUi/src/bridge/commands/setupCommands.ts` | `SETUP:GROUP:*` 커맨드 정의 |
| PosRequestActions | `BrandPosApp/Presentation/CEF/InternalBridge/PosRequestActions/System/SetupActions.cpp` | 그룹 설정 thin router |
| UseCase | `BrandPosApp/UseCases/System/SaveGroupConfigUseCase.cpp` | 그룹 설정 저장 UseCase |
| Domain | `BrandPosApp/Domain/System/SystemMgr.cpp` | 그룹 설정 검증/조회 |
| Infrastructure | `BrandPosApp/Infrastructure/Persistence/SQLite/Tables/System/ConfigCrud.cpp` | 그룹 설정 CRUD |

---

## Appendix: 레거시 참조

### A.1 레거시 기본 정보

| 항목 | 값 |
|---|---|
| 다이얼로그 ID | IDD_GRPAPPDLG |
| 리소스 값 | 166 |
| 크기 (DLU) | 200 x 337 |
| 다이얼로그 타입 | DIALOGEX |
| 스타일 | DS_SETFONT \| DS_MODALFRAME \| WS_POPUP |
| 폰트 | 10, "System", 0, 0, 0x0 |
| 소스 파일 | RestaurantSet.rc |
| 총 UI 요소 수 | 4 (버튼 3, 그리드 1) |

### A.2 레거시 UI 요소

**버튼 (3개):** IDCANCEL (닫기), IDC_SAVE (그룹적용), IDC_SELECT (선택) -- IDC_SAVE와 IDC_SELECT는 같은 위치(92,8), 모드에 따라 하나만 표시

**그리드 (1개):** IDC_GRID (MFCGridCtrl) - 그룹 목록 (선택 전용)

### A.3 마이그레이션 노트

- 독립 Screen이 아닌 모달 다이얼로그. shared/ui/organisms/GroupSelectModal로 배치.
- 그리드는 선택 전용이므로 EditableDataGrid가 아닌 SelectableList로 충분.
