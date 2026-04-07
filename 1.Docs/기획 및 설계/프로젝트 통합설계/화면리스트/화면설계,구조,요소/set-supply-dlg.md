# SET-SUPPLY-DLG: 공급처 설정 화면

---

## 0. 문서 정보

| 항목 | 값 |
|---|---|
| 문서 ID | SET-SUPPLY-DLG |
| 화면명 | 공급처 관리 |
| 레거시 다이얼로그 | IDD_SUPPLY_DLG (리소스 168) |
| 신규 라우트 | `/pos/setup/supply-info` |
| 신규 Screen 경로 | `screens/SetupScreen/SupplyInfo` |
| 모드 | Setup mode |
| 작성일 | 2026-04-05 |
| 상태 | Shell 구현 완료 |

---

## 1. 화면 개요

공급처(거래처) 목록을 그리드 기반으로 관리하는 CRUD 설정 화면이다. 항목 추가, 인라인 편집, 선택 삭제, 전체 저장 기능을 제공한다. 또한 다른 화면에서 공급처를 선택하는 모달 모드로도 호출 가능하며, 이때는 "선택" 버튼으로 공급처를 반환한다. 숨김 상태의 "상세설정" 버튼은 현재 미사용(P2).

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
| SUP-F01 | 공급처 목록 조회 | P1 | `SETUP:SUPPLY:GET_LIST` | `SaveSupplyInfoUseCase` (조회 경로) | `SystemMgr` | SQLite `Tables/System/ConfigCrud` |
| SUP-F02 | 공급처 추가 | P1 | `SETUP:SUPPLY:SAVE` | `SaveSupplyInfoUseCase` | `SystemMgr` | SQLite `Tables/System/ConfigCrud` |
| SUP-F03 | 전체 저장 | P0 | `SETUP:SUPPLY:SAVE` | `SaveSupplyInfoUseCase` | `SystemMgr` | SQLite `Tables/System/ConfigCrud` |
| SUP-F04 | 선택 삭제 | P1 | `SETUP:SUPPLY:SAVE` | `SaveSupplyInfoUseCase` | `SystemMgr` | SQLite `Tables/System/ConfigCrud` |
| SUP-F05 | 상세설정 | P2 | `SETUP:SUPPLY:GET_LIST` | `SaveSupplyInfoUseCase` | `SystemMgr` | SQLite `Tables/System/ConfigCrud` |
| SUP-F06 | 공급처 선택 (콜백 반환) | P1 | - (콜백/선택 반환) | - | - | - |
| SUP-F07 | 닫기 (React 라우팅) | P1 | - | - | - | - |
| SUP-F08 | 그리드 데이터 인라인 편집 | P1 | - | - | - | - |

---

## 4. UI 구조

### 4.1 화면 레이아웃

```
+---------------------------------------------------------------+
| [추가]  [저장]  [선택삭제]  [선택]      [닫기]     헤더 영역   |
+---------------------------------------------------------------+
|                                                               |
|  +-----------------------------------------------------------+|
|  |  공급처 목록 그리드 (EditableDataGrid)                     ||
|  |  - 인라인 셀 편집 지원                                     ||
|  |  - 대형 그리드 (화면 대부분 차지)                          ||
|  |  - 행 선택 + 삭제 지원                                     ||
|  +-----------------------------------------------------------+|
|                                                               |
+---------------------------------------------------------------+
```

### 4.2 사용 컴포넌트 (shared/ui)

| 컴포넌트 | 경로 | 용도 |
|---|---|---|
| `EditableDataGrid` | `shared/ui/organisms/EditableDataGrid` | 공급처 목록 인라인 편집 그리드 |
| `Button` | `shared/ui/atoms/Button` | 추가, 저장, 선택삭제, 선택, 닫기 |

---

## 5. 구현 명세

### 5.1 RTK Query Endpoints

| Endpoint | 메서드 | 설명 |
|---|---|---|
| `setupApi.useGetSupplyListQuery` | GET | 공급처 목록 조회 |
| `setupApi.useSaveSupplyInfoMutation` | POST | 공급처 정보 저장 (추가/수정/삭제 통합) |

### 5.2 Bridge Commands

| Command | 방향 | Payload | 비고 |
|---|---|---|---|
| `SETUP:SUPPLY:GET_LIST` | UI -> C++ | `{ v, requestId, timestamp }` | 공급처 목록 조회 |
| `SETUP:SUPPLY:SAVE` | UI -> C++ | `{ v, requestId, timestamp, idempotencyKey, data: { items: [...] } }` | 변경된 전체 목록 저장 |

### 5.3 UseCase 흐름

**SaveSupplyInfoUseCase (저장)**
1. `idempotencyKey` 검사 (Ledger)
2. `SystemMgr.validateSupplyInfo()` 호출
3. SQLite 트랜잭션: `ConfigCrud.saveSupplyInfo()` + Ledger 갱신
4. 커밋 후 `PosRealTimeSender` -> UI 갱신 이벤트

### 5.4 Domain/Manager

| Manager | 메서드 | 설명 |
|---|---|---|
| `SystemMgr` | `validateSupplyInfo()` | 공급처 정보 유효성 검증 |
| `SystemMgr` | `getSupplyList()` | 공급처 목록 조회 |

### 5.5 Infrastructure

| 모듈 | 파일 | 설명 |
|---|---|---|
| SQLite | `Tables/System/ConfigCrud` | 공급처 정보 CRUD |

### 5.6 주의사항

- IDC_SUPPLY_DETAIL("상세설정") 버튼은 레거시에서 숨김 상태이며 P2. 현재 미사용으로 추정. <!-- TODO: 상세설정 기능 필요성 확인 -->
- IDC_SUPPLY_SELECT("선택") 버튼은 다른 화면에서 공급처를 선택하는 모달 모드로 호출될 때 사용. 신규에서는 `mode` props로 편집/선택 모드 구분. <!-- TODO: 모달 모드 호출 시나리오 상세 확인 -->
- 그리드(443x300 DLU)는 전체 화면의 대부분을 차지하는 대형 그리드. 인라인 편집 지원 필요.

### 5.7 UseCase 실패 규칙

- **멱등성**: 공급처 설정 저장은 마지막 값 덮어쓰기 (idempotencyKey 불필요)
- **트랜잭션**: SQLite TX 내에서 공급처 INSERT/UPDATE/DELETE 원자적
- **참조 무결성**: 사용 중인 공급처 삭제 시 IN_USE 에러 반환
- **Outbox**: 공급처 변경 → 중앙 동기화 대상 (매장 설정 → CentralApi)
- **오프라인**: 로컬 DB만 사용, 오프라인 동작 가능

### 5.8 Permission

- 설정 화면은 관리자 전용 (Setup/Maintenance mode 접근 권한 필요)
- TODO: Setup mode 진입 시 관리자 인증 절차 상세 정의 필요

---

## 6. 테스트

| ID | 시나리오 | 기대 결과 | 우선순위 |
|---|---|---|---|
| SUP-T01 | 화면 진입 시 공급처 목록 로드 | 그리드에 공급처 목록 표시 | P1 |
| SUP-T02 | 공급처 추가 후 저장 | 새 행 추가, 저장 후 DB 반영 | P0 |
| SUP-T03 | 셀 인라인 편집 후 저장 | 변경된 값 DB에 반영 | P1 |
| SUP-T04 | 선택 삭제 후 저장 | 선택된 행 삭제, DB 반영 | P1 |
| SUP-T05 | 선택 모드에서 행 선택 후 "선택" 클릭 | 선택된 공급처 콜백 반환 | P1 |
| SUP-T06 | 저장 멱등성 확인 | 동일 idempotencyKey로 중복 저장 시 1회만 반영 | P0 |

---

## 7. 완료 기준

- [ ] P0: 전체 저장 정상 동작 (SUP-F03)
- [ ] P1: 조회, 추가, 삭제, 인라인 편집, 선택 모드 동작
- [ ] P1: 닫기 시 React 라우팅 정상 동작
- [ ] P2: 상세설정 기능 구현 여부 결정 <!-- TODO -->
- [ ] 멱등성 테스트 통과

---

## 8. 작업 명단

| 계층 | 파일 경로 | 작업 내용 |
|---|---|---|
| Screen | `BrandPosApp/PosUi/src/screens/SetupScreen/SupplyInfo/index.tsx` | 공급처 관리 화면 구현 |
| Screen Hook | `BrandPosApp/PosUi/src/screens/SetupScreen/SupplyInfo/hooks/useSupplyInfo.ts` | UI 전용 훅 |
| RTK Query | `BrandPosApp/PosUi/src/store/api/setupApi.ts` | `getSupplyList`, `saveSupplyInfo` endpoint |
| shared/ui | `BrandPosApp/PosUi/src/shared/ui/organisms/EditableDataGrid` | 인라인 편집 그리드 (공용) |
| shared/ui | `BrandPosApp/PosUi/src/shared/ui/atoms/Button` | 버튼 (공용) |
| Bridge | `BrandPosApp/PosUi/src/bridge/commands/setupCommands.ts` | `SETUP:SUPPLY:*` 커맨드 정의 |
| PosRequestActions | `BrandPosApp/Presentation/CEF/InternalBridge/PosRequestActions/System/SetupActions.cpp` | 공급처 설정 thin router |
| UseCase | `BrandPosApp/UseCases/System/SaveSupplyInfoUseCase.cpp` | 공급처 정보 저장 UseCase |
| Domain | `BrandPosApp/Domain/System/SystemMgr.cpp` | 공급처 정보 검증/조회 |
| Infrastructure | `BrandPosApp/Infrastructure/Persistence/SQLite/Tables/System/ConfigCrud.cpp` | 공급처 정보 CRUD |

---

## Appendix: 레거시 참조

### A.1 레거시 기본 정보

| 항목 | 값 |
|---|---|
| 다이얼로그 ID | IDD_SUPPLY_DLG |
| 리소스 값 | 168 |
| 크기 (DLU) | 512 x 384 |
| 다이얼로그 타입 | DIALOGEX |
| 스타일 | DS_SETFONT \| WS_POPUP |
| 폰트 | 10, "System", 0, 0, 0x0 |
| 소스 파일 | RestaurantSet.rc |
| 총 UI 요소 수 | 7 (버튼 6, 그리드 1) |

### A.2 레거시 UI 요소

**버튼 (6개):** IDCANCEL (닫기), IDC_SUPPLY_ALLSAVE (저장), IDC_SUPPLY_ADD (추가), IDC_SUPPLY_SELDEL (선택삭제), IDC_SUPPLY_DETAIL (상세설정, 숨김), IDC_SUPPLY_SELECT (선택)

**그리드 (1개):** IDC_GRID (MFCGridCtrl, 443x300 DLU) - 공급처 목록 (인라인 편집 지원)

### A.3 마이그레이션 노트

- IDC_SUPPLY_DETAIL("상세설정") 버튼은 숨김 상태이며 P2. 현재 미사용으로 추정.
- IDC_SUPPLY_SELECT("선택") 버튼은 다른 화면에서 공급처를 선택하는 모달 모드로 호출될 때 사용. 신규에서는 props로 모드 구분.
- 그리드는 전체 화면의 대부분을 차지하는 대형 그리드. 인라인 편집 지원 필요.
