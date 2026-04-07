# SET-INOUTSET: 입출력 설정 화면

---

## 0. 문서 정보

| 항목 | 값 |
|---|---|
| 문서 ID | SET-INOUTSET |
| 화면명 | 입출력 설정 |
| 레거시 다이얼로그 | IDD_INOUTSET (리소스 165) |
| 신규 라우트 | `/pos/setup/inout-config` |
| 신규 Screen 경로 | `screens/SetupScreen/InOutConfig` |
| 모드 | Setup mode |
| 작성일 | 2026-04-05 |
| 상태 | Shell 구현 완료 |

---

## 1. 화면 개요

입출력 항목을 그리드 기반으로 관리하는 CRUD 설정 화면이다. 항목 추가, 인라인 편집, 선택 삭제, 전체 저장 기능을 제공한다. set-tablemsg, set-simplereceipt, set-custinfoset과 동일한 그리드 CRUD 패턴을 공유하며, 공통 레이아웃 템플릿(GridCrudScreen) 추출이 권장된다.

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
| INOUT-F01 | 입출력 설정 조회 | P1 | `SETUP:INOUT:GET_CONFIG` | `SaveInOutConfigUseCase` (조회 경로) | `SystemMgr` | SQLite `Tables/System/ConfigCrud` |
| INOUT-F02 | 입출력 항목 추가 | P1 | `SETUP:INOUT:SAVE` | `SaveInOutConfigUseCase` | `SystemMgr` | SQLite `Tables/System/ConfigCrud` |
| INOUT-F03 | 전체 저장 | P0 | `SETUP:INOUT:SAVE` | `SaveInOutConfigUseCase` | `SystemMgr` | SQLite `Tables/System/ConfigCrud` |
| INOUT-F04 | 선택 삭제 | P1 | `SETUP:INOUT:SAVE` | `SaveInOutConfigUseCase` | `SystemMgr` | SQLite `Tables/System/ConfigCrud` |
| INOUT-F05 | 닫기 (React 라우팅) | P1 | - | - | - | - |
| INOUT-F06 | 그리드 데이터 인라인 편집 | P1 | - | - | - | - |

---

## 4. UI 구조

### 4.1 화면 레이아웃

```
+---------------------------------------------------------------+
| [추가]  [저장]  [선택삭제]                [닫기]    헤더 영역   |
+---------------------------------------------------------------+
|                                                               |
|  +-----------------------------------------------------------+|
|  |  입출력 설정 그리드 (EditableDataGrid)                     ||
|  |  - 인라인 셀 편집 지원                                     ||
|  |  - 행 선택 + 삭제 지원                                     ||
|  +-----------------------------------------------------------+|
|                                                               |
+---------------------------------------------------------------+
```

### 4.2 사용 컴포넌트 (shared/ui)

| 컴포넌트 | 경로 | 용도 |
|---|---|---|
| `EditableDataGrid` | `shared/ui/organisms/EditableDataGrid` | 입출력 설정 인라인 편집 그리드 |
| `Button` | `shared/ui/atoms/Button` | 추가, 저장, 선택삭제, 닫기 |

---

## 5. 구현 명세

### 5.1 RTK Query Endpoints

| Endpoint | 메서드 | 설명 |
|---|---|---|
| `setupApi.useGetInOutConfigQuery` | GET | 입출력 설정 조회 |
| `setupApi.useSaveInOutConfigMutation` | POST | 입출력 설정 저장 (추가/수정/삭제 통합) |

### 5.2 Bridge Commands

> **설정 Bridge 패턴**: `SETUP:{DOMAIN}:GET_CONFIG` / `SETUP:{DOMAIN}:SAVE` 형태를 따른다.

| Command | 방향 | Payload | 비고 |
|---|---|---|---|
| `SETUP:INOUT:GET_CONFIG` | UI -> C++ | `{ v, requestId, timestamp }` | 입출력 설정 조회 |
| `SETUP:INOUT:SAVE` | UI -> C++ | `{ v, requestId, timestamp, idempotencyKey, data: { items: [...] } }` | 변경된 전체 목록 저장 |

### 5.3 UseCase 흐름

**SaveInOutConfigUseCase (저장)**
1. **Permission 검사**: 관리자 권한 확인 <!-- TODO: 관리자 권한 체계(역할/토큰) 확정 후 구체적인 검사 방식 결정 -->
2. `idempotencyKey` 검사 (Ledger)
3. `SystemMgr.validateInOutConfig()` 호출
4. SQLite 트랜잭션 (원자적): `ConfigCrud.saveInOutConfig()` (마지막 값 덮어쓰기 — 전체 목록을 한 번에 교체) + Ledger 갱신 + Outbox 레코드 적재 (중앙 서버 동기화용) <!-- TODO: 입출력 설정 변경이 중앙 서버 동기화 대상인지 확정 필요 -->
5. 커밋 후 `PosRealTimeSender` -> UI 갱신 이벤트

> **설정 UseCase 공통 패턴**: 설정 저장은 마지막 값 덮어쓰기(upsert) 방식이다. 단일 TX로 원자적 커밋하며, 참조 무결성 위반 시 롤백한다. Outbox에 동기화 레코드를 함께 적재한다.

#### UseCase 실패 규칙

- **멱등성**: 입출력 설정 저장은 마지막 값 덮어쓰기 (idempotencyKey 불필요)
- **트랜잭션**: SQLite TX 내에서 Config UPDATE 원자적 (전체 목록 한 번에 교체)
- **참조 무결성**: 사용 중인 항목 삭제 시 IN_USE 에러 반환
- **Outbox**: 입출력 설정 변경 → 중앙 동기화 대상 (매장 설정 → CentralApi)
- **오프라인**: 로컬 DB만 사용, 오프라인 동작 가능

### 5.4 Domain/Manager

| Manager | 메서드 | 설명 |
|---|---|---|
| `SystemMgr` | `validateInOutConfig()` | 입출력 설정 유효성 검증 |
| `SystemMgr` | `getInOutConfig()` | 입출력 설정 조회 |

### 5.5 Infrastructure

| 모듈 | 파일 | 설명 |
|---|---|---|
| SQLite | `Tables/System/ConfigCrud` | 입출력 설정 CRUD |

### 5.6 Permission

- **관리자 전용 화면**. 일반 직원은 접근 불가. <!-- TODO: 관리자 권한 체계(역할/토큰) 확정 후 UI 진입 차단 + UseCase 검사 이중 적용 -->

### 5.7 주의사항

- 추가/저장/삭제 3개 액션은 모두 동일한 `SETUP:INOUT:SAVE` 커맨드로 통합 가능 (변경된 전체 목록을 한 번에 저장).
- MFCGridCtrl은 셀 직접 편집 지원하므로, 신규에서는 `EditableDataGrid` (인라인 편집 지원) 컴포넌트 필요.
- 4개 유사 화면(InOutConfig, TableMessage, SimpleReceipt, CustomerInfoConfig)은 동일한 `EditableDataGrid` 패턴. 공통 레이아웃 템플릿(`GridCrudScreen`) 추출 권장. <!-- TODO: GridCrudScreen 공통 템플릿 설계 -->

---

## 6. 테스트

| ID | 시나리오 | 기대 결과 | 우선순위 |
|---|---|---|---|
| INOUT-T01 | 화면 진입 시 입출력 설정 로드 | 그리드에 현재 설정 항목 표시 | P1 |
| INOUT-T02 | 항목 추가 후 저장 | 새 행 추가, 저장 후 DB 반영 | P0 |
| INOUT-T03 | 셀 인라인 편집 후 저장 | 변경된 값 DB에 반영 | P1 |
| INOUT-T04 | 선택 삭제 후 저장 | 선택된 행 삭제, DB 반영 | P1 |
| INOUT-T05 | 저장 멱등성 확인 | 동일 idempotencyKey로 중복 저장 시 1회만 반영 | P0 |

---

## 7. 완료 기준

- [ ] P0: 전체 저장 정상 동작 (INOUT-F03)
- [ ] P1: 조회, 추가, 삭제, 인라인 편집 동작
- [ ] P1: 닫기 시 React 라우팅 정상 동작
- [ ] 멱등성 테스트 통과
- [ ] `EditableDataGrid` 공용 컴포넌트 구현 확인

---

## 8. 작업 명단

| 계층 | 파일 경로 | 작업 내용 |
|---|---|---|
| Screen | `BrandPosApp/PosUi/src/screens/SetupScreen/InOutConfig/index.tsx` | 입출력 설정 화면 구현 |
| Screen Hook | `BrandPosApp/PosUi/src/screens/SetupScreen/InOutConfig/hooks/useInOutConfig.ts` | UI 전용 훅 |
| RTK Query | `BrandPosApp/PosUi/src/store/api/setupApi.ts` | `getInOutConfig`, `saveInOutConfig` endpoint |
| shared/ui | `BrandPosApp/PosUi/src/shared/ui/organisms/EditableDataGrid` | 인라인 편집 그리드 (공용) |
| shared/ui | `BrandPosApp/PosUi/src/shared/ui/atoms/Button` | 버튼 (공용) |
| Bridge | `BrandPosApp/PosUi/src/bridge/commands/setupCommands.ts` | `SETUP:INOUT:*` 커맨드 정의 |
| PosRequestActions | `BrandPosApp/Presentation/CEF/InternalBridge/PosRequestActions/System/SetupActions.cpp` | 입출력 설정 thin router |
| UseCase | `BrandPosApp/UseCases/System/SaveInOutConfigUseCase.cpp` | 입출력 설정 저장 UseCase |
| Domain | `BrandPosApp/Domain/System/SystemMgr.cpp` | 입출력 설정 검증/조회 |
| Infrastructure | `BrandPosApp/Infrastructure/Persistence/SQLite/Tables/System/ConfigCrud.cpp` | 입출력 설정 CRUD |

---

## Appendix: 레거시 참조

### A.1 레거시 기본 정보

| 항목 | 값 |
|---|---|
| 다이얼로그 ID | IDD_INOUTSET |
| 리소스 값 | 165 |
| 크기 (DLU) | 450 x 337 |
| 다이얼로그 타입 | DIALOGEX |
| 스타일 | DS_SETFONT \| DS_MODALFRAME \| WS_POPUP |
| 폰트 | 10, "System", 0, 0, 0x0 |
| 소스 파일 | RestaurantSet.rc |
| 총 UI 요소 수 | 5 (버튼 4, 그리드 1) |

### A.2 레거시 UI 요소

**버튼 (4개):** IDCANCEL (닫기), ID_INOUT_ALLSAVE (저장), ID_INOUT_ADD (추가), ID_INOUT_SELDEL (선택삭제)

**그리드 (1개):** IDC_GRID (MFCGridCtrl) - 입출력 설정 그리드 (셀 직접 편집 지원)

### A.3 마이그레이션 노트

- 5개 UI 요소로 비교적 단순한 CRUD 화면. 그리드 기반 편집이 핵심.
- MFCGridCtrl은 셀 직접 편집 지원하므로, 신규에서는 EditableDataGrid 컴포넌트 필요.
- 추가/저장/삭제 3개 액션은 동일한 커맨드로 통합 가능.
