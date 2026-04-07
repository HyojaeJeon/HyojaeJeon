# SET-EVENTSET: 행사 설정 화면

## 0. 문서 정보

| 항목 | 값 |
|---|---|
| 문서 ID | SCR-SET-EVENTSET |
| 화면 ID | SetupScreen/EventConfig |
| 레거시 다이얼로그 | IDD_EVENTSET (리소스 134) |
| 작성일 | 2026-04-05 |
| 상태 | 초안 |

---

## 1. 화면 개요

행사(이벤트/프로모션) 규칙을 관리하는 설정 화면이다. 행사 목록 CRUD와 함께, 선택상품/그룹상품/전체상품 단위로 행사를 적용하는 기능을 제공한다. 좌측 행사 목록 그리드 + 우측 적용 그룹/상품 그리드의 3패널 구조로 구성된다.

---

## 2. 상위 기준 연결

| 기준 문서 | 관련 섹션 | 비고 |
|---|---|---|
| 04-Edge-POS-아키텍처-설계서 | 2.3 통합 목표 디렉토리 구조 | screens/SetupScreen/EventConfig/* |
| CLAUDE.md | PosUi 개발 규칙 | shared/ui import, RTK Query 사용 |
| CLAUDE.md | RTK Query 캐시 갱신 전략 | mutation 성공 시 updateQueryData |

---

## 3. 기능 목록

| ID | 기능명 | 설명 | 우선순위 |
|---|---|---|---|
| F-EVNT-001 | 행사 추가 | 새 행사 규칙 생성 | P0 |
| F-EVNT-002 | 행사 저장 | 행사 일괄 저장 | P0 |
| F-EVNT-003 | 행사 삭제 | 선택 행사 삭제 | P0 |
| F-EVNT-004 | 선택삭제 | 행사 그리드 내 선택 행 삭제 | P1 |
| F-EVNT-005 | 전체초기화 | 행사 전체 초기화 | P2 |
| F-EVNT-006 | 선택상품 행사적용 | 선택된 개별 상품에 행사 적용 | P0 |
| F-EVNT-007 | 그룹상품 행사적용 | 그룹 전체 상품에 행사 적용 | P1 |
| F-EVNT-008 | 전체상품 행사적용 | 전체 상품에 행사 적용 | P1 |
| F-EVNT-009 | 닫기 | SetupScreen/index.tsx로 복귀 | P0 |

---

## 4. UI 구조

### 4.1 화면 레이아웃

```
+--------------------------------------------------------------+
|  [추가] [저장] [삭제]               [선택삭제] [전체초기화]   |
|                                                    [닫기]    |
+--------------------------------------------------------------+
|                          |        |                          |
|  행사 목록 그리드        | 적용   |  적용 상품 목록 그리드    |
|  (행사정보: 이름, 기간,  | 버튼   |  - 그룹 목록             |
|   할인율/금액 등)        | 영역   |  - 상품 목록             |
|                          |        |                          |
|                          |[선택]  |                          |
|                          |[상품]  |                          |
|                          |[적용]  |                          |
|                          |        |                          |
|                          |[그룹]  |                          |
|                          |[상품]  |                          |
|                          |[적용]  |                          |
|                          |        |                          |
|                          |[전체]  |                          |
|                          |[상품]  |                          |
|                          |[적용]  |                          |
+--------------------------------------------------------------+
```

### 4.2 공용 UI 컴포넌트 매핑

| 컴포넌트 | 위치 | 용도 |
|---|---|---|
| shared/ui/organisms/DataGrid | 행사 목록, 적용 그룹, 적용 상품 | D-EVNT-001~003 |
| shared/ui/atoms/Button | CRUD 버튼, 적용 버튼 | 전체 액션 |

---

## 5. 구현 명세

### 5.1 Bridge Commands

| Command | 방향 | Payload | 응답 | 비고 |
|---|---|---|---|---|
| SETUP:EVENT:SAVE | UI → C++ | `{ action: "add" \| "batch", data: {...} }` | `{ success, events }` | 행사 추가/저장 |
| SETUP:EVENT:DELETE | UI → C++ | `{ selected?: boolean, ids?: string[] }` | `{ success }` | 행사 삭제 |
| SETUP:EVENT:RESET_ALL | UI → C++ | `{}` | `{ success }` | 전체 초기화 |
| SETUP:EVENT:APPLY | UI → C++ | `{ scope: "selected" \| "group" \| "all", eventId, targetIds? }` | `{ success, appliedCount }` | 적용 범위 통합 |

#### Bridge Error 규칙

| Command | Error Code | 조건 |
|---|---|---|
| SETUP:EVENT:SAVE | VALIDATION_FAILED | 필수 필드(행사명, 기간, 할인율/금액) 누락 |
| SETUP:EVENT:SAVE | DUPLICATE_KEY | 동일 행사명 중복 |
| SETUP:EVENT:DELETE | NOT_FOUND | 존재하지 않는 행사 |
| SETUP:EVENT:DELETE | IN_USE | TODO: 적용 중인 행사 삭제 시 정책 결정 필요 (적용 해제 후 삭제 vs 삭제 차단) |
| SETUP:EVENT:APPLY | NOT_FOUND | 존재하지 않는 eventId 또는 대상 상품/그룹 |

### 5.2 RTK Query Endpoints

| Endpoint | 메서드 | 태그 | 비고 |
|---|---|---|---|
| setupEventApi.getEventList | GET | `EventList` | 행사 목록 조회 |
| setupEventApi.getEventGroups | GET | `EventGroups:{eventId}` | 적용 그룹 조회 |
| setupEventApi.getEventItems | GET | `EventItems:{eventId}` | 적용 상품 조회 |
| setupEventApi.saveEvent | MUTATION | invalidates `EventList` | 행사 저장 |
| setupEventApi.applyEvent | MUTATION | invalidates `EventItems` | 행사 적용 |

### 5.3 UseCase 매핑

| UseCase | 트리거 | Domain/Manager | Infrastructure |
|---|---|---|---|
| SaveEventUseCase | 행사 추가/저장/삭제/초기화/적용 | ItemMgr | Tables/Item/ItemCrud |

#### UseCase 실패 규칙

- **멱등성**: 행사 저장은 마지막 값 덮어쓰기 (idempotencyKey 불필요)
- **트랜잭션**: SQLite TX 내에서 행사 CRUD + 적용 원자적. 전체초기화는 단일 TX로 처리
- **참조 무결성**: TODO: 적용 중인 행사 삭제 시 상품 측 행사 연결 해제 정책 결정 필요
- **Outbox**: 행사 변경은 중앙 동기화 대상 (매장 행사 → CentralApi)
- **오프라인**: 로컬 DB만 사용, 오프라인 동작 가능

### 5.7 Permission

- 설정 화면은 관리자 전용 (Setup mode 자체가 관리자 접근)
- TODO: 전체초기화(RESET_ALL) 시 추가 확인 절차(관리자 재인증 또는 2단계 확인) 필요 여부 검토

### 5.4 데이터 표시 요소

| ID | 표시 항목 | 신규 UI 컴포넌트 | 데이터 소스 |
|---|---|---|---|
| D-EVNT-001 | 행사 목록 | shared/ui/organisms/DataGrid | setupEventApi.getEventList |
| D-EVNT-002 | 적용 그룹 목록 | shared/ui/organisms/DataGrid | setupEventApi.getEventGroups |
| D-EVNT-003 | 적용 상품 목록 | shared/ui/organisms/DataGrid | setupEventApi.getEventItems |

### 5.5 상태 관리

- 선택된 행사: UI slice (setupEventUiSlice.selectedEventId)
- 행사/그룹/상품 목록: RTK Query 캐시

### 5.6 i18n

- 버튼 라벨, 그리드 컬럼 헤더: SharedAssets/i18n/locales/ 기반 msgKey

---

## 6. 테스트

| ID | 시나리오 | 기대 결과 |
|---|---|---|
| T-EVNT-001 | 행사 추가 → 저장 | 행사 목록에 반영 |
| T-EVNT-002 | 선택상품 적용 | 해당 상품에 행사 적용 반영 |
| T-EVNT-003 | 그룹상품 적용 | 그룹 전체 상품에 행사 적용 |
| T-EVNT-004 | 전체초기화 | 모든 행사 제거 확인 |
| T-EVNT-005 | mockTransport 환경 | C++ 없이 독립 동작 |

---

## 7. 완료 기준

- [ ] screens/SetupScreen/EventConfig 화면 구현 완료
- [ ] 행사 CRUD (추가/저장/삭제/전체초기화)
- [ ] 적용 범위별(선택/그룹/전체) 행사 적용 동작
- [ ] 3패널 그리드 레이아웃 구현
- [ ] mockTransport 독립 개발 가능
- [ ] 1024x768 해상도 + 터치 사용성 검증

---

## 8. 작업 명단

| 파일 경로 | 역할 | 상태 |
|---|---|---|
| BrandPosApp/PosUi/src/screens/SettingsScreen/components/EventSettingsDialog.tsx | 행사설정 메인 화면 (shell) | SHELL 완료 (2026-04-05) |
| BrandPosApp/PosUi/src/screens/SetupScreen/EventConfig/ApplyPanel.tsx | 행사 적용 버튼 패널 | TODO |
| BrandPosApp/PosUi/src/shared/ui/organisms/DataGrid.tsx | 공용 데이터 그리드 | TODO |
| BrandPosApp/PosUi/src/store/api/setupEventApi.ts | 행사 설정 RTK Query API | TODO |
| BrandPosApp/PosUi/src/store/slices/setupEventUiSlice.ts | 행사 설정 UI 상태 | TODO |
| BrandPosApp/PosUi/src/bridge/commands/setupEventCommands.ts | 행사 설정 Bridge Command | TODO |
| BrandPosApp/UseCases/System/SaveEventUseCase.cpp | 행사 저장 UseCase | TODO |
| BrandPosApp/Domain/Item/ItemMgr.cpp | 상품 Manager (행사 포함) | TODO |
| BrandPosApp/Infrastructure/Persistence/SQLite/Tables/Item/ItemCrud.cpp | 상품/행사 CRUD | TODO |

---

## Appendix: 레거시 참조

### 레거시 다이얼로그 정보

| 항목 | 값 |
|---|---|
| 다이얼로그 ID | IDD_EVENTSET |
| 리소스 값 | 134 |
| 크기 (DLU) | 512 x 384 |
| 스타일 | DS_SETFONT \| WS_POPUP |
| 소스 파일 | RestaurantSet.rc |
| 총 UI 요소 수 | 13 (버튼 10, 그리드 3) |

### 레거시 주요 컨트롤

| 레거시 ID | 용도 | 비고 |
|---|---|---|
| IDC_GRID3 | 행사 목록 그리드 | 좌측 |
| IDC_GRID2 | 적용 그룹 그리드 | 중앙-우측 |
| IDC_GRID | 적용 상품 그리드 | 우측 |
| ID_SET_ADD / ID_SET_ALLSAVE / ID_SET_DEL | 행사 CRUD | |
| ID_SET_SELDEL | 선택삭제 | |
| ID_SET_INIT | 전체초기화 | |
| IDC_SELITEM_APPLY | 선택상품 적용 | |
| IDC_LISTITEM_APPLY | 그룹상품 적용 | |
| IDC_ALLITEM_APPLY | 전체상품 적용 | |
| IDC_GRP_SEL | 상품조회 (NOT WS_VISIBLE) | 제외 |

### 마이그레이션 노트

- "선택상품/그룹상품/전체상품 적용" 3종 버튼은 적용 범위를 scope 파라미터로 통합하여 단일 Bridge Command로 처리한다.
- 행사 CRUD + 적용 로직은 모두 `SaveEventUseCase`가 트랜잭션 범위 내에서 처리한다.
