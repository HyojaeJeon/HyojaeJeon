# FAVORITES 화면 문서

## 0. 문서 정보

| 항목 | 값 |
|---|---|
| 화면명 | `FAVORITES` |
| 화면 ID | `IDD_FAVORITES` |
| 원본 파일 | `set-favorites.md` |
| 전환 우선순위 | `P1` |
| 담당 계층 | `PosUi / Presentation / UseCases / Domain / Infrastructure` |
| 상태 | `TODO` |

## 1. 화면 개요

- **화면 목적**: 주문 화면에서 자주 사용하는 메뉴 항목을 즐겨찾기 그룹에 등록/관리하여 빠른 주문을 가능하게 하는 설정 화면이다.
- **해결하는 사용자 문제**: 매장 관리자가 메뉴 그룹별로 즐겨찾기 항목을 배치하고 순서를 변경하여, 직원이 주문 시 자주 쓰는 메뉴에 빠르게 접근할 수 있도록 한다.
- **화면 진입 경로**: SetupScreen(설정 메인) → 즐겨찾기 설정 선택
- **화면 종료 경로**: 저장(IDC_SAVE) → 설정 반영, 닫기(IDCANCEL) → SetupScreen 복귀
- **관련 운영 주체**: 매장 관리자
- **운영 모드**: Setup/Maintenance mode

## 2. 상위 기준 연결

| 기준 | 연결 문서 | 비고 |
|---|---|---|
| 전체 아키텍처 | `00-Platform-최종-아키텍처-기준서.md` | 필수 |
| Edge POS 설계 | `04-Edge-POS-아키텍처-설계서.md` | 필수 |
| 전체 흐름 | `05-Edge-POS-전체-흐름-AZ-가이드.md` | 필수 |
| DB 설계 | `DB설계/` | 해당 |
| 화면 인벤토리 | `_index.md` | 필수 |

## 3. 화면 기능 목록

| ID | 기능명 | 설명 | 사용자 액션 | 우선순위 |
|---|---|---|---|---|
| F-001 | 즐겨찾기 목록 조회 | 화면 진입 시 즐겨찾기 그리드와 메뉴 버튼 매트릭스를 로드한다 | 화면 진입 | P1 |
| F-002 | 즐겨찾기 저장 | 현재 편집 상태를 저장한다 | 저장 버튼 클릭 | P1 |
| F-003 | 메뉴 그룹 탭 전환 | 5개 그룹 탭으로 해당 그룹의 메뉴 항목을 전환 표시한다 | 그룹 탭 클릭 | P1 |
| F-004 | 메뉴 항목 선택/배치 | 메뉴 버튼 매트릭스에서 항목을 선택하여 즐겨찾기에 배치한다 | 메뉴 버튼 클릭 | P1 |
| F-005 | 그룹 삭제 | 선택된 그룹의 즐겨찾기 설정을 삭제한다 | 그룹삭제 버튼 클릭 | P2 |
| F-006 | 메뉴 삭제 | 선택된 메뉴 항목을 즐겨찾기에서 제거한다 | 메뉴삭제 버튼 클릭 | P2 |
| F-007 | 그리드 스크롤 | 즐겨찾기 목록을 위/아래로 스크롤한다 | 위/아래 버튼 클릭 | P2 |
| F-008 | 닫기 | 설정 화면을 종료하고 이전 화면으로 복귀한다 | 닫기 버튼 클릭 | P2 |

## 4. UI 구조

### 4.1 화면 구성

- **상단 영역**: 타이틀(메뉴 즐겨찾기), 저장 버튼, 닫기 버튼
- **좌측 영역**: 즐겨찾기 데이터 그리드(IDC_GRID) + 위/아래 스크롤 버튼 — 등록된 즐겨찾기 목록
- **우측 상단**: 메뉴 그룹 탭 버튼(5개) — 그룹별 메뉴 필터
- **우측 본문**: 메뉴 버튼 매트릭스(5x5) — 해당 그룹의 메뉴 항목 배치
- **하단 영역**: 그룹삭제/메뉴삭제 버튼

### 4.2 재사용 UI

| 컴포넌트 | 위치 | props로 바뀌는 값 | 비고 |
|---|---|---|---|
| DataGrid | shared/ui/organisms/DataGrid | columns, rows, onRowSelect | 즐겨찾기 목록 그리드 |
| TabGroup | shared/ui/molecules/TabGroup | tabs, selectedTab, onSelect | 메뉴 그룹 탭 (동적 데이터 기반) |
| MenuButtonGrid | shared/ui/organisms/MenuButtonGrid | items, columns, rows, onItemClick | 메뉴 항목 선택 매트릭스 (고정 개수 제한 제거) |
| PageTitle | shared/ui/atoms/PageTitle | title | 화면 타이틀 |

## 5. 구현 명세

### 5.1 상태 소유권

| 상태 | 소유 계층 | 원본 | 비고 |
|---|---|---|---|
| 즐겨찾기 목록 | RTK Query 캐시 | setupApi.getFavoritesList | 서버 상태 |
| 메뉴 그룹 목록 | RTK Query 캐시 | setupApi.getFavoritesList (그룹 필터) | 서버 상태 |
| 선택된 그룹 탭 | 로컬 컴포넌트 상태 | useState | UI 상태 |
| 편집 중인 배치 상태 | 로컬 컴포넌트 상태 | useState | UI 상태 (저장 전 임시) |

### 5.2 Bridge 계약

| Command | Request | Response | Error | Idempotency | 비고 |
|---|---|---|---|---|---|
| SETUP:FAVORITES:GET_LIST | `{ groupId? }` | `{ favorites: [...], groups: [...] }` | `CONFIG_NOT_FOUND` | -- (조회) | P1 |
| SETUP:FAVORITES:SAVE | `{ favorites: [...] }` | `{ success: true }` | `SAVE_FAILED` | `SETUP:FAVORITES:SAVE:{timestamp}` | P1 |
| SETUP:FAVORITES:REORDER | `{ groupId, items: [...] }` | `{ success: true }` | `SAVE_FAILED` | `SETUP:FAVORITES:REORDER:{timestamp}` | P1 |

### 5.3 UseCase 계약

| UseCase | Trigger | Input | Transaction | Lock | Output | 실패 규칙 |
|---|---|---|---|---|---|---|
| SaveFavoritesUseCase | SETUP:FAVORITES:SAVE / REORDER | favorites[], groupId | SQLite TX | -- | ConfigRow[] | 덮어쓰기 저장. TX 원자적 커밋. 실패 시 롤백, UI 에러 코드 반환. 커밋 후 Outbox 적재. |

### 5.4 Domain / Manager / Store

| 항목 | 책임 | 파일 / 모듈 | 비고 |
|---|---|---|---|
| ConfigManager | 즐겨찾기 설정 읽기/쓰기 | Domain/System/ConfigManager | |
| ItemManager | 메뉴 항목 조회 | Domain/Item/ItemManager | |

### 5.5 DB / CentralApi / Sync / Realtime

| 연동 대상 | 역할 | 데이터 흐름 | 비고 |
|---|---|---|---|
| SQLite Tables/System/ConfigCrud | 즐겨찾기 설정 CRUD | UseCase -> ConfigManager -> ConfigCrud -> SQLite | 로컬 원본 |
| SQLite Tables/Item/ItemCrud | 메뉴 항목 조회 | UseCase -> ItemManager -> ItemCrud -> SQLite | 로컬 원본 |
| Outbox | 설정 변경 동기화 | 커밋 후 Outbox 적재 -> Sync Worker -> CentralApi | |

### 5.6 i18n / Error / Permission

| 항목 | 규칙 | 비고 |
|---|---|---|
| i18n | `BrandPosApp/PosUi/src/i18n/locales/{ko,vi,en}/setup.json` | msgKey: setup.favorites.* |
| Error | 코드 기반 (type, device, code, msgKey) | 완성 문장 금지 |
| Permission | 관리자 전용 — Setup/Maintenance 모드 접근 권한 필요 | |

## 6. 테스트

| 테스트 항목 | 범위 | 기대 결과 | 유형 |
|---|---|---|---|
| 화면 진입 시 즐겨찾기 목록 로드 | SetupScreen/Favorites + setupApi | 등록된 즐겨찾기 목록 표시 | integration |
| 그룹 탭 전환 시 메뉴 필터링 | SetupScreen/Favorites | 선택 그룹의 메뉴만 표시 | unit |
| 즐겨찾기 저장 | SetupScreen/Favorites + setupApi | DB에 설정 반영 | integration |
| 메뉴 삭제 후 그리드 갱신 | SetupScreen/Favorites | 삭제된 항목 제거 | unit |
| 드래그 앤 드롭 순서 변경 | SetupScreen/Favorites | 순서 변경 후 저장 반영 | TODO |

## 7. 완료 기준

- [ ] UI 구현 완료 (screens/SetupScreen/Favorites)
- [ ] Bridge 계약 구현 완료 (SETUP:FAVORITES:*)
- [ ] UseCase 연동 완료 (SaveFavoritesUseCase)
- [ ] RTK Query 엔드포인트 구현 완료 (setupApi.getFavoritesList)
- [ ] i18n 적용 완료
- [ ] 테스트 완료
- [ ] 문서 상태 `DONE`

## 8. 작업 명단

| 작업 | 파일 | 상태 |
|---|---|---|
| Screen 구현 | `BrandPosApp/PosUi/src/screens/SettingsScreen/components/FavoritesDialog.tsx` | SHELL 완료 (2026-04-05) |
| RTK Query endpoint | `BrandPosApp/PosUi/src/store/api/setupApi.ts` (getFavoritesList) | TODO |
| Bridge command | `BrandPosApp/PosUi/src/bridge/commands/setup.ts` | TODO |
| DataGrid 컴포넌트 | `BrandPosApp/PosUi/src/shared/ui/organisms/DataGrid.tsx` | TODO |
| TabGroup 컴포넌트 | `BrandPosApp/PosUi/src/shared/ui/molecules/TabGroup.tsx` | TODO |
| MenuButtonGrid 컴포넌트 | `BrandPosApp/PosUi/src/shared/ui/organisms/MenuButtonGrid.tsx` | TODO |
| PageTitle 컴포넌트 | `BrandPosApp/PosUi/src/shared/ui/atoms/PageTitle.tsx` | TODO |
| C++ PosRequestActions/Setup | `BrandPosApp/Presentation/CEF/InternalBridge/PosRequestActions/Setup/SetupActions.cpp` | TODO |
| C++ SaveFavoritesUseCase | `BrandPosApp/UseCases/Setup/SaveFavoritesUseCase.cpp` | TODO |
| C++ ConfigManager | `BrandPosApp/Domain/System/ConfigManager.cpp` | TODO |
| SQLite Tables/System/ConfigCrud | `BrandPosApp/Infrastructure/Persistence/SQLite/Tables/System/ConfigCrud.cpp` | TODO |

---

## Appendix: 레거시 UI 요소 참조

### 기본 정보

| 항목 | 값 |
|------|---|
| 다이얼로그 ID | IDD_FAVORITES |
| 리소스 값 | 193 |
| 크기 (DLU) | 510 x 378 |
| 다이얼로그 타입 | DIALOGEX |
| 스타일 | DS_SETFONT \| WS_POPUP |
| 폰트 | 10, "System", 0, 0, 0x0 |
| 소스 파일 | RestaurantSet.rc |
| 총 UI 요소 수 | 39 |

### 버튼 (37개)

| ID | 라벨 | 위치 (x,y) | 크기 (w x h) | 숨김 | 스타일 | 용도 추정 |
|---|---|---|---|---|---|---|
| IDOK | OK | (7,7) | 50 x 14 | **TRUE** | NOT WS_VISIBLE \| WS_DISABLED | 확인/완료 버튼 |
| IDCANCEL | 닫기 | (452,10) | 50 x 24 | FALSE | BS_OWNERDRAW \| WS_TABSTOP | 닫기/취소 버튼 |
| IDC_O_MENU00~44 | 00~44 | 매트릭스 배치 | 51 x 29 | **TRUE** | BS_OWNERDRAW \| BS_MULTILINE \| NOT WS_VISIBLE \| WS_DISABLED | 메뉴 버튼 (5x5=25개) |
| IDC_O_TOPMENU1~5 | GRP01~05 | (233,78)~(445,78) | 43 x 30 | **TRUE** | BS_OWNERDRAW \| NOT WS_VISIBLE \| WS_DISABLED | 메뉴 그룹 탭 버튼 |
| IDC_SAVE | 저장 | (393,8) | 50 x 25 | FALSE | BS_OWNERDRAW \| WS_TABSTOP | 저장 버튼 |
| IDC_DEL | 그룹삭제 | (298,345) | 55 x 25 | FALSE | BS_OWNERDRAW \| WS_TABSTOP | 그룹삭제 버튼 |
| IDC_MENUDEL | 메뉴삭제 | (233,345) | 55 x 25 | FALSE | BS_OWNERDRAW \| WS_TABSTOP | 메뉴삭제 버튼 |
| IDC_BTN_GRIDUP | 위 | (202,43) | 19 x 33 | FALSE | BS_OWNERDRAW \| WS_TABSTOP | 위로 스크롤 버튼 |
| IDC_BTN_GRIDDOWN | 아래 | (202,78) | 19 x 33 | FALSE | BS_OWNERDRAW \| WS_TABSTOP | 아래로 스크롤 버튼 |

### 텍스트/라벨 (1개)

| ID | 텍스트 | 위치 (x,y) | 크기 (w x h) | 용도 추정 |
|---|---|---|---|---|
| IDC_STA_TITLE | 메뉴 즐겨찾기 | (54,17) | 90 x 16 | 화면 타이틀 |

### 그리드/리스트 (1개)

| ID | 타입 | 위치 (x,y) | 크기 (w x h) | 용도 추정 |
|---|---|---|---|---|
| IDC_GRID | MFCGridCtrl | (9,113) | 210 x 258 | 즐겨찾기 데이터 그리드 |

### 요소 통계

| 유형 | 개수 |
|------|------|
| 버튼 | 37 |
| 텍스트/라벨 | 1 |
| 그리드/리스트 | 1 |
| **합계** | **39** |

### 마이그레이션 노트 (원본)

- 레거시 메뉴 버튼 매트릭스(5x5=25개)는 동적 그리드 컴포넌트로 전환하여 고정 개수 제한을 제거한다.
- IDC_O_TOPMENU1~5 그룹 탭은 데이터 기반 동적 탭으로 전환한다.
- IDOK 버튼은 숨김 상태로 레거시 호환용이므로 신규 UI에서 제거한다.
- 그리드 스크롤 버튼(IDC_BTN_GRIDUP/DOWN)은 React 가상 스크롤로 대체한다.
- 즐겨찾기 순서 변경은 드래그 앤 드롭 UX로 개선 가능하다.
