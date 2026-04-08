# ITEM_GRPOS 화면 문서

## 0. 문서 정보

| 항목 | 값 |
|---|---|
| 화면명 | `ITEM_GRPOS` |
| 화면 ID | `IDD_ITEM_GRPOS` |
| 원본 파일 | `set-item-grpos.md` |
| 전환 우선순위 | `P1` |
| 담당 계층 | `PosUi / Presentation / UseCases / Domain / Infrastructure` |
| 상태 | `TODO` |

## 1. 화면 개요

- **화면 목적**: 상품 그룹별로 주문 화면에서의 표시/숨김 여부를 설정하는 화면이다. 그리드에서 그룹별 토글로 간단하게 관리한다.
- **해결하는 사용자 문제**: 매장 관리자가 특정 상품 그룹을 주문 화면에서 안 보이도록 설정하여 불필요한 메뉴를 숨길 수 있다.
- **화면 진입 경로**: SetupScreen(설정 메인) → 상품그룹 POS 표시 선택
- **화면 종료 경로**: 저장(IDC_BTN_SAVE) → 설정 반영, 닫기(IDCANCEL) → SetupScreen 복귀
- **관련 운영 주체**: 매장 관리자
- **운영 모드**: Setup/Maintenance mode

## 2. 상위 기준 연결

| 기준 | 연결 문서 | 비고 |
|---|---|---|
| 전체 아키텍처 | `00-Platform-최종-아키텍처-기준서.md` | 필수 |
| Edge POS 설계 | `04-Edge-POS-아키텍처-설계서.md` | 필수 |
| DB 설계 | `DB설계/` | 해당 |
| 화면 인벤토리 | `_index.md` | 필수 |

## 3. 화면 기능 목록

| ID | 기능명 | 설명 | 사용자 액션 | 우선순위 |
|---|---|---|---|---|
| F-001 | 상품그룹 POS 표시 목록 조회 | 화면 진입 시 모든 상품 그룹과 표시 여부를 로드 | 화면 진입 | P1 |
| F-002 | 상품그룹 POS 표시 저장 | 그리드 편집 결과를 일괄 저장 | 저장 버튼 클릭 | P1 |
| F-003 | 닫기 | 설정 화면을 종료한다 | 닫기 버튼 클릭 | P2 |

## 4. UI 구조

### 4.1 화면 구성

- **상단 영역**: 저장/닫기 버튼, 안내 텍스트 ("그룹별로 해당상품을 주문창에서 안 보이도록 설정할 수 있습니다")
- **본문 영역**: 편집 가능 데이터 그리드(체크박스/토글 컬럼 포함)

### 4.2 재사용 UI

| 컴포넌트 | 위치 | props로 바뀌는 값 | 비고 |
|---|---|---|---|
| DataGrid | shared/ui/organisms/DataGrid | columns, rows, editable, onRowChange | 토글 컬럼 포함 편집 그리드 |
| HelpText | shared/ui/atoms/HelpText | text | 안내 텍스트 |

## 5. 구현 명세

### 5.1 상태 소유권

| 상태 | 소유 계층 | 원본 | 비고 |
|---|---|---|---|
| 상품그룹 POS 표시 목록 | RTK Query 캐시 | setupApi.getItemGroupPosList | 서버 상태 |

### 5.2 Bridge 계약

| Command | Request | Response | Error | Idempotency | 비고 |
|---|---|---|---|---|---|
| SETUP:ITEM_GROUP_POS:GET_LIST | `{}` | `{ groups: [...] }` | `CONFIG_NOT_FOUND` | -- (조회) | P1 |
| SETUP:ITEM_GROUP_POS:SAVE | `{ groups: [...] }` | `{ success: true }` | `SAVE_FAILED` | `SETUP:ITEM_GROUP_POS:SAVE:{timestamp}` | P1 |

### 5.3 UseCase 계약

| UseCase | Trigger | Input | Transaction | Lock | Output | 실패 규칙 |
|---|---|---|---|---|---|---|
| SaveItemGroupPosUseCase | SETUP:ITEM_GROUP_POS:SAVE | groups[] | SQLite TX | -- | ItemRow[] | TODO |

### 5.4 Domain / Manager / Store

| 항목 | 책임 | 파일 / 모듈 | 비고 |
|---|---|---|---|
| ItemManager | 상품그룹 POS 표시 규칙 | Domain/Item/ItemManager | |

### 5.5 DB / CentralApi / Sync / Realtime

| 연동 대상 | 역할 | 데이터 흐름 | 비고 |
|---|---|---|---|
| SQLite Tables/Item/ItemCrud | 상품그룹 표시 여부 CRUD | UseCase -> ItemManager -> ItemCrud -> SQLite | 로컬 원본 |
| Outbox | 설정 변경 동기화 | 커밋 후 Outbox 적재 -> Sync Worker -> CentralApi | |

### 5.6 i18n / Error / Permission

| 항목 | 규칙 | 비고 |
|---|---|---|
| i18n | `BrandPosApp/PosUi/src/i18n/locales/{ko,vi,en}/setup.json` | msgKey: setup.itemGroupPos.* |
| Error | 코드 기반 (type, device, code, msgKey) | 완성 문장 금지 |
| Permission | TODO: 관리자 권한 레벨 확인 필요 | |

## 6. 테스트

| 테스트 항목 | 범위 | 기대 결과 | 유형 |
|---|---|---|---|
| 그리드 로드 | SetupScreen/ItemGroupPos + setupApi | 모든 상품 그룹 표시 | integration |
| 토글 변경 후 저장 | SetupScreen/ItemGroupPos + setupApi | DB에 반영 | integration |

## 7. 완료 기준

- [ ] UI 구현 완료 (screens/SetupScreen/ItemGroupPos)
- [ ] Bridge 계약 구현 완료 (SETUP:ITEM_GROUP_POS:*)
- [ ] UseCase 연동 완료 (SaveItemGroupPosUseCase)
- [ ] RTK Query 엔드포인트 구현 완료 (setupApi.getItemGroupPosList)
- [ ] i18n 적용 완료
- [ ] 테스트 완료
- [ ] 문서 상태 `DONE`

## 8. 작업 명단

| 작업 | 파일 | 상태 |
|---|---|---|
| Screen 구현 | `BrandPosApp/PosUi/src/screens/SettingsScreen/components/ItemGroupPosDialog.tsx` | SHELL 완료 (2026-04-05) |
| RTK Query endpoint | `BrandPosApp/PosUi/src/store/api/setupApi.ts` (getItemGroupPosList) | TODO |
| Bridge command | `BrandPosApp/PosUi/src/bridge/commands/setup.ts` | TODO |
| DataGrid 컴포넌트 | `BrandPosApp/PosUi/src/shared/ui/organisms/DataGrid.tsx` | TODO |
| C++ SaveItemGroupPosUseCase | `BrandPosApp/UseCases/Setup/SaveItemGroupPosUseCase.cpp` | TODO |
| C++ ItemManager | `BrandPosApp/Domain/Item/ItemManager.cpp` | TODO |
| SQLite Tables/Item/ItemCrud | `BrandPosApp/Infrastructure/Persistence/SQLite/Tables/Item/ItemCrud.cpp` | TODO |

---

## Appendix: 레거시 UI 요소 참조

### 기본 정보

| 항목 | 값 |
|------|---|
| 다이얼로그 ID | IDD_ITEM_GRPOS |
| 리소스 값 | 245 |
| 크기 (DLU) | 472 x 346 |
| 다이얼로그 타입 | DIALOGEX |
| 스타일 | DS_SETFONT \| DS_MODALFRAME \| WS_POPUP |
| 소스 파일 | RestaurantSet.rc |
| 총 UI 요소 수 | 5 |

### 요소 통계

| 유형 | 개수 |
|------|------|
| 버튼 | 3 |
| 텍스트/라벨 | 1 |
| 그리드/리스트 | 1 |
| **합계** | **5** |

### 마이그레이션 노트 (원본)

- 단순한 그리드 편집 화면으로, 그룹별로 주문 화면에서 표시/숨김 여부를 설정하는 기능이다.
- MFCGridCtrl은 체크박스 또는 토글 컬럼이 포함된 편집 가능 DataGrid로 전환한다.
- IDOK 숨김 버튼은 레거시 호환용이므로 신규 UI에서 제거한다.
