# SET-ITEMSET: 상품 세트설정 화면

## 0. 문서 정보

| 항목 | 값 |
|---|---|
| 문서 ID | SCR-SET-ITEMSET |
| 화면 ID | SetupScreen/ItemConfig |
| 레거시 다이얼로그 | IDD_ITEMSET (리소스 133) |
| 작성일 | 2026-04-05 |
| 상태 | 초안 |

---

## 1. 화면 개요

세트 메뉴 구성을 설정하는 화면이다. 좌측에 메뉴 그룹 탭(10+2 페이징)과 5x5 메뉴 버튼 그리드를 배치하여 세트 구성 상품을 선택하고, 우측에 선택된 세트 구성 목록 그리드를 표시한다. 세트 타입(라디오 5종 중 4종 활성), 세트 수량 등을 설정할 수 있다.

---

## 2. 상위 기준 연결

| 기준 문서 | 관련 섹션 | 비고 |
|---|---|---|
| 04-Edge-POS-아키텍처-설계서 | 2.3 통합 목표 디렉토리 구조 | screens/SetupScreen/ItemConfig/* |
| CLAUDE.md | PosUi 개발 규칙 | shared/ui import, 공용 컴포넌트 재사용 |
| CLAUDE.md | RTK Query 캐시 갱신 전략 | mutation 성공 시 updateQueryData |

---

## 3. 기능 목록

| ID | 기능명 | 설명 | 우선순위 |
|---|---|---|---|
| F-ISET-001 | 세트 저장 | 세트 구성 저장 | P0 |
| F-ISET-002 | 선택삭제 | 세트 구성 항목 삭제 | P0 |
| F-ISET-003 | 빈자리추가 | 세트 그리드에 빈 행 추가 | P2 |
| F-ISET-004 | 세트타입 선택 | 라디오 4종 (1종 숨김) 중 선택 | P0 |
| F-ISET-005 | 메뉴 그룹 탭 선택 | 상단 그룹 탭 1~10 선택 | P0 |
| F-ISET-006 | 메뉴 그룹 탭 페이징 | 그룹 탭 앞/뒤 페이징 | P1 |
| F-ISET-007 | 메뉴 버튼 선택 (5x5) | 세트에 상품 추가 | P0 |
| F-ISET-008 | 이전/다음 메뉴 그룹 | 메뉴 그리드 페이징 | P1 |
| F-ISET-009 | 닫기 | ItemInput 화면으로 복귀 | P0 |

---

## 4. UI 구조

### 4.1 화면 레이아웃

```
+--------------------------------------------------------------+
|  상품코드:{code} 상품명:{name} 판매가:{saleAmt}              |
|  그룹:{group}   원가:{orgAmt}  이익금:{profit}               |
|  세트타입: (O)A (O)B (O)C (O)D     [저장] [닫기]            |
+--------------------------------------------------------------+
|                               |                              |
|  [그룹탭1][그룹탭2]...[<<][>>]|  세트 구성 그리드            |
|  +-------------------------+  |  - 선택상품 목록             |
|  | [메뉴00][메뉴01]...[04] |  |  - 수량 입력                |
|  | [메뉴10][메뉴11]...[14] |  |                              |
|  | [메뉴20][메뉴21]...[24] |  |  세트수량: [___]            |
|  | [메뉴30][메뉴31]...[34] |  |                              |
|  | [메뉴40][메뉴41]..[<<][>>]|  [선택삭제] [빈자리추가]     |
|  +-------------------------+  |                              |
+-------------------------------+------------------------------+
```

### 4.2 공용 UI 컴포넌트 매핑

| 컴포넌트 | 위치 | 용도 |
|---|---|---|
| shared/ui/atoms/Text | 상품코드, 상품명, 판매가, 그룹, 원가, 이익금 | D-ISET-001~006 |
| shared/ui/atoms/NumberInput | 세트수량 입력 | D-ISET-007 |
| shared/ui/atoms/RadioGroup | 세트타입 라디오 4종 | F-ISET-004 |
| shared/ui/organisms/DataGrid | 세트 구성 목록 | D-ISET-008 |
| shared/ui/molecules/TabGroup | 메뉴 그룹 탭 (주문 화면과 재사용) | D-ISET-009 |
| shared/ui/organisms/MenuGrid | 5x5 메뉴 버튼 그리드 (주문 화면과 재사용) | D-ISET-010 |

---

## 5. 구현 명세

### 5.1 Bridge Commands

| Command | 방향 | Payload | 응답 | 비고 |
|---|---|---|---|---|
| SETUP:ITEM:SET_CONFIG | UI → C++ | `{ action: "save" \| "delete" \| "addEmpty" \| "changeType" \| "selectItem", itemCode, data }` | `{ success, setConfig }` | 세트 CRUD 통합 |
| SETUP:ITEM:GET_LIST | UI → C++ | `{ groupFilter?, groupPage?, menuPage? }` | `{ groups, items }` | 메뉴 그룹/상품 조회 |

#### Bridge Error 규칙

| Command | Error Code | 조건 |
|---|---|---|
| SETUP:ITEM:SET_CONFIG (save) | VALIDATION_FAILED | 세트 구성 상품 미선택, 세트수량 0 이하 |
| SETUP:ITEM:SET_CONFIG (save) | NOT_FOUND | 존재하지 않는 itemCode |
| SETUP:ITEM:SET_CONFIG (delete) | NOT_FOUND | 존재하지 않는 세트 구성 항목 |
| SETUP:ITEM:SET_CONFIG (selectItem) | IN_USE | TODO: 동일 상품 중복 추가 허용 여부 결정 필요 |

### 5.2 RTK Query Endpoints

| Endpoint | 메서드 | 태그 | 비고 |
|---|---|---|---|
| setupItemApi.getItemDetail | GET | `ItemDetail:{itemCode}` | 상품 기본 정보 |
| setupItemApi.getItemSetConfig | GET | `ItemSetConfig:{itemCode}` | 세트 구성 정보 |
| setupItemApi.getGroupList | GET | `ItemGroupList` | 메뉴 그룹 탭 |
| setupItemApi.getItemList | GET | `ItemList:{groupCode}` | 메뉴 버튼 그리드 |
| setupItemApi.saveItemSetConfig | MUTATION | invalidates `ItemSetConfig:{itemCode}` | 세트 저장 |

### 5.3 UseCase 매핑

| UseCase | 트리거 | Domain/Manager | Infrastructure |
|---|---|---|---|
| SaveItemSetUseCase | 세트 저장/삭제/추가/타입변경/상품선택 | ItemMgr | Tables/Item/ItemCrud |
| GetItemListUseCase | 그룹/메뉴 목록 조회 | ItemMgr | Tables/Item/ItemCrud |

#### UseCase 실패 규칙

- **멱등성**: 세트 저장은 마지막 값 덮어쓰기 (idempotencyKey 불필요)
- **트랜잭션**: SQLite TX 내에서 세트 구성 INSERT/UPDATE/DELETE 원자적
- **참조 무결성**: 세트 구성에 포함된 상품이 삭제된 경우 세트 저장 시 NOT_FOUND 에러
- **Outbox**: 세트 구성 변경은 중앙 동기화 대상 (매장 상품 → CentralApi)
- **오프라인**: 로컬 DB만 사용, 오프라인 동작 가능

### 5.7 Permission

- 설정 화면은 관리자 전용 (Setup mode 자체가 관리자 접근)

### 5.4 데이터 표시 요소

| ID | 표시 항목 | 신규 UI 컴포넌트 | 데이터 소스 |
|---|---|---|---|
| D-ISET-001 | 상품코드 | shared/ui/atoms/Text | setupItemApi.getItemDetail → code |
| D-ISET-002 | 상품명 | shared/ui/atoms/Text | setupItemApi.getItemDetail → name |
| D-ISET-003 | 판매가 | shared/ui/atoms/Text | setupItemApi.getItemDetail → saleAmt |
| D-ISET-004 | 그룹 | shared/ui/atoms/Text | setupItemApi.getItemDetail → groupName |
| D-ISET-005 | 원가 | shared/ui/atoms/Text | setupItemApi.getItemDetail → originalAmt |
| D-ISET-006 | 이익금 | shared/ui/atoms/Text | setupItemApi.getItemDetail → profit |
| D-ISET-007 | 세트수량 | shared/ui/atoms/NumberInput | setupItemApi.getItemSetConfig → count |
| D-ISET-008 | 세트 구성 목록 | shared/ui/organisms/DataGrid | setupItemApi.getItemSetConfig → items |
| D-ISET-009 | 메뉴 그룹 탭 | shared/ui/molecules/TabGroup | setupItemApi.getGroupList |
| D-ISET-010 | 메뉴 5x5 버튼 그리드 | shared/ui/organisms/MenuGrid | setupItemApi.getItemList |

### 5.5 상태 관리

- 선택된 그룹 탭: UI slice (setupItemUiSlice.selectedGroupTab)
- 현재 메뉴 페이지: UI slice (setupItemUiSlice.menuPage)
- 세트 구성 편집 상태: 로컬 컴포넌트 상태 (저장 전까지)

### 5.6 i18n

- 섹션 타이틀, 라벨, 버튼: BrandPosApp/PosUi/src/i18n/locales/ 기반 msgKey

---

## 6. 테스트

| ID | 시나리오 | 기대 결과 |
|---|---|---|
| T-ISET-001 | 세트 화면 진입 | 상품 기본 정보 + 세트 구성 로딩 |
| T-ISET-002 | 메뉴 그룹 탭 선택 | 해당 그룹 메뉴 버튼 표시 |
| T-ISET-003 | 메뉴 버튼 클릭 | 세트 구성 그리드에 추가 |
| T-ISET-004 | 세트타입 변경 | 타입 변경 반영 |
| T-ISET-005 | 저장 | 세트 구성 DB 반영 |
| T-ISET-006 | mockTransport 환경 | C++ 없이 독립 동작 |

---

## 7. 완료 기준

- [ ] screens/SetupScreen/ItemConfig 화면 구현 완료
- [ ] 메뉴 그룹 탭 + 5x5 그리드 동작 (주문 화면 컴포넌트 재사용)
- [ ] 세트 구성 CRUD (추가/삭제/저장)
- [ ] 세트타입 라디오 4종 동작
- [ ] mockTransport 독립 개발 가능
- [ ] 1024x768 해상도 + 터치 사용성 검증

---

## 8. 작업 명단

| 파일 경로 | 역할 | 상태 |
|---|---|---|
| BrandPosApp/PosUi/src/screens/SettingsScreen/components/ItemSettingsDialog.tsx | 세트설정 메인 화면 (shell) | SHELL 완료 (2026-04-05) |
| BrandPosApp/PosUi/src/screens/SetupScreen/ItemConfig/SetTypeSelector.tsx | 세트타입 라디오 선택 | TODO |
| BrandPosApp/PosUi/src/screens/SetupScreen/ItemConfig/MenuGroupTabs.tsx | 메뉴 그룹 탭 | TODO |
| BrandPosApp/PosUi/src/screens/SetupScreen/ItemConfig/MenuGrid.tsx | 5x5 메뉴 버튼 그리드 | TODO |
| BrandPosApp/PosUi/src/shared/ui/molecules/TabGroup.tsx | 공용 탭 그룹 | TODO |
| BrandPosApp/PosUi/src/shared/ui/organisms/MenuGrid.tsx | 공용 메뉴 그리드 | TODO |
| BrandPosApp/PosUi/src/shared/ui/organisms/DataGrid.tsx | 공용 데이터 그리드 | TODO |
| BrandPosApp/PosUi/src/store/api/setupItemApi.ts | getItemSetConfig, saveItemSetConfig | TODO |
| BrandPosApp/UseCases/System/SaveItemSetUseCase.cpp | 세트 저장 UseCase | TODO |
| BrandPosApp/Domain/Item/ItemMgr.cpp | 상품 Manager | TODO |
| BrandPosApp/Infrastructure/Persistence/SQLite/Tables/Item/ItemCrud.cpp | 상품 CRUD | TODO |

---

## Appendix: 레거시 참조

### 레거시 다이얼로그 정보

| 항목 | 값 |
|---|---|
| 다이얼로그 ID | IDD_ITEMSET |
| 리소스 값 | 133 |
| 크기 (DLU) | 512 x 384 |
| 스타일 | DS_SETFONT \| WS_POPUP |
| 소스 파일 | RestaurantSet.rc |
| 총 UI 요소 수 | 61 (버튼 43, 라벨 1, 입력 16, 그리드 1) |

### 레거시 주요 컨트롤

| 레거시 ID | 용도 | 비고 |
|---|---|---|
| IDC_O_MENU00~IDC_O_MENU44 | 5x5 메뉴 버튼 그리드 (25개, IDC_O_MENU44 숨김) | 주문 화면과 동일 패턴 |
| IDC_O_TOPMENU1~10 | 메뉴 그룹 탭 10개 | 주문 화면과 동일 패턴 |
| IDC_O_TOPMENU14, IDC_O_TOPMENU15 | 그룹 탭 페이징 (앞/뒤) | |
| IDC_O_BACK, IDC_O_NEXT | 메뉴 그리드 페이징 | |
| IDC_GRID3 | 세트 구성 그리드 | |
| IDC_SETTYPE~IDC_SETTYPE5 | 세트타입 라디오 5종 (IDC_SETTYPE4 숨김) | |
| IDC_SET_CODE~IDC_SET_PROFIT | 상품 기본 정보 (readonly) | |
| IDC_SET_CNT | 세트수량 입력 | |

### 숨김/제외 대상

- IDC_O_MENU44: 5x5 그리드 중 숨김
- IDC_SETTYPE4: 세트타입 라디오 중 숨김
- IDC_CHK_DYNAMIC, IDC_CHK_QTYMGR, IDC_CHK_ESSENTIAL, IDC_CHK_STEPBY: 숨김 체크박스 (향후 확장용, 데이터 모델에는 포함)

### 마이그레이션 노트

- 5x5 메뉴 버튼 그리드와 상단 그룹 탭은 POS 주문 화면과 동일한 패턴으로, shared/ui/organisms/MenuGrid, shared/ui/molecules/TabGroup 공용 컴포넌트를 재사용한다.
- 좌측 메뉴 선택 영역 + 우측 세트 구성 그리드 2패널 구조를 유지한다.
