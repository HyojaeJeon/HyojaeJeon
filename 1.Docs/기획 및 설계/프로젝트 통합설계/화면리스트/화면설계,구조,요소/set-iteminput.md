# SET-ITEMINPUT: 상품 입력 화면

## 0. 문서 정보

| 항목 | 값 |
|---|---|
| 문서 ID | SCR-SET-ITEMINPUT |
| 화면 ID | SetupScreen/ItemInput |
| 레거시 다이얼로그 | IDD_ITEMINPUT (리소스 129) |
| 작성일 | 2026-04-05 |
| 상태 | 초안 |

---

## 1. 화면 개요

상품 그룹 및 개별 상품의 CRUD를 수행하는 설정 화면이다. 좌측 그룹 트리 패널과 우측 상품 목록 패널의 2패널 마스터-디테일 구조로 구성된다. 상품 검색, 바코드 설정, 그룹 이동, 상세설정/세트설정 하위 화면 진입 기능을 포함한다.

- **운영 모드**: Setup mode

---

## 2. 상위 기준 연결

| 기준 문서 | 관련 섹션 | 비고 |
|---|---|---|
| 04-Edge-POS-아키텍처-설계서 | 2.3 통합 목표 디렉토리 구조 | screens/SetupScreen/ItemInput/* |
| CLAUDE.md | PosUi 개발 규칙 / Screen 규칙 | shared/ui import, RTK Query 사용 |
| CLAUDE.md | Bridge 규칙 | PosRequestSender 경유, mockTransport 지원 |
| CLAUDE.md | RTK Query 캐시 갱신 전략 | mutation 성공 시 updateQueryData 직접 패치 |

---

## 3. 기능 목록

| ID | 기능명 | 설명 | 우선순위 |
|---|---|---|---|
| F-ITEM-001 | 그룹 추가 | 새 상품 그룹 생성 | P0 |
| F-ITEM-002 | 그룹 저장 | 그룹 일괄 저장 | P0 |
| F-ITEM-003 | 그룹 삭제 | 선택 그룹 삭제 | P0 |
| F-ITEM-004 | 상품 추가 | 새 상품 생성 | P0 |
| F-ITEM-005 | 상품 저장 | 상품 일괄 저장 | P0 |
| F-ITEM-006 | 상품 삭제 | 선택 상품 삭제 | P0 |
| F-ITEM-007 | 상세설정 진입 | ItemDetail 화면으로 라우팅 | P0 |
| F-ITEM-008 | 세트설정 진입 | ItemConfig(세트) 화면으로 라우팅 | P1 |
| F-ITEM-009 | 바코드 설정 | 상품 바코드 등록/수정 다이얼로그 | P1 |
| F-ITEM-010 | 상품조회 (검색) | 검색어 기반 상품 필터링 | P0 |
| F-ITEM-011 | 그룹변경 | 상품의 소속 그룹 이동 | P1 |
| F-ITEM-012 | 미리보기 | 상품 화면 미리보기 | P2 |
| F-ITEM-013 | 그리드 스크롤 | React 가상화 리스트로 대체 (별도 버튼 불필요) | P2 |
| F-ITEM-014 | 상품백업 | 상품 데이터 백업 | P2 |
| F-ITEM-015 | 그룹별순서 | 그룹 내 상품 표시 순서 변경 | P2 |
| F-ITEM-016 | 그룹별 표시/숨김 | 그룹 단위 키오스크/테이블오더 표시 설정 | P2 |
| F-ITEM-017 | 중량 바코드 도움말 | 중량 바코드 규격 안내 (UI only) | P2 |
| F-ITEM-018 | 닫기 | SetupScreen/index.tsx로 복귀 | P0 |

---

## 4. UI 구조

### 4.1 화면 레이아웃

```
+--------------------------------------------------------------+
|  [상품백업]  [검색: __________ ] [상품조회]     [닫기]        |
+--------------------------------------------------------------+
|  [그룹추가] [그룹저장] [그룹삭제] | [상품추가] [저장] [삭제]  |
+-------------------------------+------------------------------+
|                               |                              |
|  그룹 목록 (좌측 패널)         |  상품 목록 (우측 패널)        |
|  - DataGrid                   |  - DataGrid                  |
|  - 그룹 트리 또는 리스트       |  - 인라인 편집 가능           |
|                               |                              |
|                               |  [상세설정] [세트설정]        |
|                               |  [바코드] [그룹변경]          |
|                               |  [그룹별순서]                 |
|                               |  [그룹별 표시/숨김]           |
|                               |  [중량바코드 도움말]          |
+-------------------------------+------------------------------+
```

### 4.2 공용 UI 컴포넌트 매핑

| 컴포넌트 | 위치 | 용도 |
|---|---|---|
| shared/ui/organisms/DataGrid | 그룹 목록, 상품 목록 | D-ITEM-001, D-ITEM-002 |
| shared/ui/atoms/TextInput | 검색 입력 필드 | D-ITEM-003 |
| shared/ui/atoms/Button | CRUD 버튼, 기능 버튼 | 전체 액션 |

---

## 5. 구현 명세

### 5.1 Bridge Commands

| Command | 방향 | Payload | 응답 | 비고 |
|---|---|---|---|---|
| SETUP:ITEM:SAVE | UI → C++ | `{ type: "group" \| "item" \| "groupBatch" \| "itemBatch", data: {...} }` | `{ success, savedItems }` | 그룹/상품 저장 |
| SETUP:ITEM:DELETE | UI → C++ | `{ type: "group" \| "item", ids: string[] }` | `{ success }` | 그룹/상품 삭제 |
| SETUP:ITEM:GET_LIST | UI → C++ | `{ filter?: string, preview?: boolean }` | `{ groups, items }` | 상품 목록 조회 |
| SETUP:ITEM:GET_DETAIL | UI → C++ | `{ itemCode: string }` | `{ itemDetail }` | 상품 상세 조회 |
| SETUP:ITEM:BARCODE | UI → C++ | `{ itemCode, barcode }` | `{ success }` | 바코드 설정 |
| SETUP:ITEM:MOVE_GROUP | UI → C++ | `{ itemCodes: string[], targetGroupCode: string }` | `{ success }` | 그룹 이동 |
| SETUP:ITEM:REORDER | UI → C++ | `{ groupCode, orderedItemCodes: string[] }` | `{ success }` | 순서 변경 |
| SETUP:ITEM:BACKUP | UI → C++ | `{}` | `{ success, filePath }` | 상품 백업 |

#### Bridge Error 규칙

| Command | Error Code | 조건 |
|---|---|---|
| SETUP:ITEM:SAVE | VALIDATION_FAILED | 필수 필드 누락, 상품코드 형식 오류 |
| SETUP:ITEM:SAVE | DUPLICATE_KEY | 동일 상품코드/그룹코드 중복 |
| SETUP:ITEM:DELETE | NOT_FOUND | 존재하지 않는 상품/그룹 |
| SETUP:ITEM:DELETE | IN_USE | 주문/세트에서 참조 중인 상품 삭제 시 |
| SETUP:ITEM:MOVE_GROUP | NOT_FOUND | 대상 그룹 미존재 |
| SETUP:ITEM:BARCODE | DUPLICATE_KEY | 동일 바코드 중복 등록 |

### 5.2 RTK Query Endpoints

| Endpoint | 메서드 | 태그 | 비고 |
|---|---|---|---|
| setupItemApi.getGroupList | GET | `ItemGroupList` | 그룹 목록 조회 |
| setupItemApi.getItemList | GET | `ItemList`, `ItemList:{groupCode}` | 상품 목록 조회 (그룹 필터) |
| setupItemApi.saveItem | MUTATION | invalidates `ItemList` | onQueryStarted + updateQueryData |
| setupItemApi.deleteItem | MUTATION | invalidates `ItemList` | 삭제 후 캐시 직접 패치 |

### 5.3 UseCase 매핑

| UseCase | 트리거 | Domain/Manager | Infrastructure |
|---|---|---|---|
| SaveItemUseCase | 그룹/상품 추가, 저장 | ItemMgr | Tables/Item/ItemCrud |
| DeleteItemUseCase | 그룹/상품 삭제 | ItemMgr | Tables/Item/ItemCrud |
| GetItemListUseCase | 상품 조회, 검색 | ItemMgr | Tables/Item/ItemCrud |
| GetItemDetailUseCase | 상세설정 진입 | ItemMgr | Tables/Item/ItemCrud |
| UpdateItemDetailUseCase | 바코드, 그룹변경 | ItemMgr | Tables/Item/ItemCrud |

#### UseCase 실패 규칙

- **멱등성**: 상품 저장은 마지막 값 덮어쓰기 (idempotencyKey 불필요)
- **트랜잭션**: SQLite TX 내에서 그룹/상품 INSERT/UPDATE/DELETE 원자적. 일괄 저장 시 전체 batch를 단일 TX로 처리
- **참조 무결성**: 주문/세트에서 참조 중인 상품 삭제 시 IN_USE 에러. 그룹 삭제 시 하위 상품 존재 여부 확인
- **Outbox**: 상품 마스터 변경은 중앙 동기화 대상 (매장 상품 → CentralApi)
- **오프라인**: 로컬 DB만 사용, 오프라인 동작 가능

### 5.7 Permission

- 설정 화면은 관리자 전용 (Setup mode 자체가 관리자 접근)
- TODO: 상품 일괄 삭제 시 추가 확인 절차(관리자 재인증) 필요 여부 검토

### 5.4 데이터 표시 요소

| ID | 표시 항목 | 신규 UI 컴포넌트 | 데이터 소스 |
|---|---|---|---|
| D-ITEM-001 | 그룹 목록 | shared/ui/organisms/DataGrid | setupItemApi.getGroupList |
| D-ITEM-002 | 상품 목록 | shared/ui/organisms/DataGrid | setupItemApi.getItemList |
| D-ITEM-003 | 검색 입력 | shared/ui/atoms/TextInput | 로컬 UI 상태 (filter param) |

### 5.5 상태 관리

- 선택된 그룹: UI slice (setupItemUiSlice.selectedGroupCode)
- 검색어: UI slice (setupItemUiSlice.searchFilter)
- 그룹/상품 목록: RTK Query 캐시

### 5.6 i18n

- 버튼 라벨, 그리드 컬럼 헤더: BrandPosApp/PosUi/src/i18n/locales/ 기반 msgKey

---

## 6. 테스트

| ID | 시나리오 | 기대 결과 |
|---|---|---|
| T-ITEM-001 | 그룹 추가 → 저장 | 그룹 목록에 새 그룹 반영 |
| T-ITEM-002 | 상품 추가 → 저장 | 상품 목록에 새 상품 반영 |
| T-ITEM-003 | 상품 검색 | 검색어에 맞는 상품만 필터링 |
| T-ITEM-004 | 상품 삭제 | 목록에서 제거, DB 반영 확인 |
| T-ITEM-005 | 그룹 변경 | 상품의 소속 그룹 변경 반영 |
| T-ITEM-006 | 상세설정 진입 | ItemDetail 화면으로 정상 라우팅 |
| T-ITEM-007 | mockTransport 환경 | C++ 없이 독립 동작 |

---

## 7. 완료 기준

- [ ] screens/SetupScreen/ItemInput 화면 구현 완료
- [ ] 그룹/상품 CRUD 동작 (추가, 저장, 삭제)
- [ ] 상품 검색 필터링 동작
- [ ] 상세설정/세트설정 하위 화면 라우팅 동작
- [ ] DataGrid 가상화 스크롤 적용
- [ ] mockTransport 독립 개발 가능
- [ ] 1024x768 해상도 + 터치 사용성 검증

---

## 8. 작업 명단

| 파일 경로 | 역할 | 상태 |
|---|---|---|
| BrandPosApp/PosUi/src/screens/SettingsScreen/components/ItemInputDialog.tsx | 상품 입력 메인 화면 (shell) | SHELL 완료 (2026-04-05) |
| BrandPosApp/PosUi/src/screens/SetupScreen/ItemInput/GroupPanel.tsx | 좌측 그룹 패널 | TODO |
| BrandPosApp/PosUi/src/screens/SetupScreen/ItemInput/ItemPanel.tsx | 우측 상품 패널 | TODO |
| BrandPosApp/PosUi/src/screens/SetupScreen/ItemInput/SearchBar.tsx | 검색 바 | TODO |
| BrandPosApp/PosUi/src/screens/SetupScreen/ItemInput/BarcodeDialog.tsx | 바코드 설정 다이얼로그 | TODO |
| BrandPosApp/PosUi/src/screens/SetupScreen/ItemInput/GroupMoveDialog.tsx | 그룹 이동 다이얼로그 | TODO |
| BrandPosApp/PosUi/src/screens/SetupScreen/ItemInput/GroupOrderDialog.tsx | 그룹별 순서 다이얼로그 | TODO |
| BrandPosApp/PosUi/src/screens/SetupScreen/ItemInput/GroupVisibilityDialog.tsx | 그룹별 표시/숨김 다이얼로그 | TODO |
| BrandPosApp/PosUi/src/shared/ui/organisms/DataGrid.tsx | 공용 데이터 그리드 | TODO |
| BrandPosApp/PosUi/src/store/api/setupItemApi.ts | 상품 설정 RTK Query API | TODO |
| BrandPosApp/PosUi/src/store/slices/setupItemUiSlice.ts | 상품 설정 UI 상태 | TODO |
| BrandPosApp/PosUi/src/bridge/commands/setupItemCommands.ts | 상품 설정 Bridge Command | TODO |
| BrandPosApp/Presentation/CEF/InternalBridge/PosRequestActions/System/SystemActions.cpp | SETUP:ITEM:* thin router | TODO |
| BrandPosApp/UseCases/System/SaveItemUseCase.cpp | 상품 저장 UseCase | TODO |
| BrandPosApp/UseCases/System/DeleteItemUseCase.cpp | 상품 삭제 UseCase | TODO |
| BrandPosApp/UseCases/System/GetItemListUseCase.cpp | 상품 조회 UseCase | TODO |
| BrandPosApp/Domain/Item/ItemMgr.cpp | 상품 Manager | TODO |
| BrandPosApp/Infrastructure/Persistence/SQLite/Tables/Item/ItemCrud.cpp | 상품 CRUD | TODO |

---

## Appendix: 레거시 참조

### 레거시 다이얼로그 정보

| 항목 | 값 |
|---|---|
| 다이얼로그 ID | IDD_ITEMINPUT |
| 리소스 값 | 129 |
| 크기 (DLU) | 510 x 378 |
| 스타일 | DS_SETFONT \| WS_POPUP |
| 소스 파일 | RestaurantSet.rc |
| 총 UI 요소 수 | 27 (버튼 24, 입력 1, 그리드 2) |

### 레거시 주요 컨트롤

| 레거시 ID | 용도 | 비고 |
|---|---|---|
| IDC_GRID2 | 그룹 목록 (MFCGridCtrl) | 좌측 패널 |
| IDC_GRID | 상품 목록 (MFCGridCtrl) | 우측 패널 |
| IDC_EDITSEARCH | 검색 입력 | 상품 필터 |
| IDC_GRP_ADD / IDC_GRP_ALLSAVE / IDC_GRP_DEL | 그룹 CRUD | |
| IDC_ITEM_ADD / IDC_ITEM_ALLSAVE / IDC_ITEM_SELDEL | 상품 CRUD | |
| IDC_ITEM_DETAIL | 상세설정 진입 | |
| IDC_ITEM_SET | 세트설정 진입 | |

### 제외 대상 (숨김 버튼)

- IDC_ITEM_PRINTSET: 주문인쇄설정 (NOT WS_VISIBLE)
- IDC_ITEM_OBCASS: 주류관리 (NOT WS_VISIBLE)
- IDC_ITEM_CHAINMASTER: 체인마스터상품 (NOT WS_VISIBLE)
- IDC_ITEM_MEMUDC: 메뉴할인 (NOT WS_VISIBLE)
- IDC_ITEM_GRTYPE: 그룹별상품 (NOT WS_VISIBLE)

### 마이그레이션 노트

- 그리드 스크롤 버튼(위/아래)은 React 가상화 리스트로 대체하여 별도 버튼 불필요.
- 상품 CRUD는 모두 `SETUP:ITEM:*` Bridge Command를 경유하며, `PosRequestActions/System/` thin router -> `UseCases/System/` 트랜잭션 패턴을 따른다.
