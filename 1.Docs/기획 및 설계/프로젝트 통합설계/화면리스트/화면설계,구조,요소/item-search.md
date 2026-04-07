# ITEM_SEARCH 화면 문서

## 0. 문서 정보
| 항목 | 값 |
|---|---|
| 화면명 | `ITEM_SEARCH` |
| 화면 ID | `IDD_ITEM_SEARCH` |
| 원본 파일 | `item-search.md` |
| 전환 우선순위 | `P1` |
| 담당 계층 | `PosUi / UseCases / Domain / Infrastructure` |
| 상태 | `TODO` |

## 1. 화면 개요
- **화면 목적**: 주문 화면에서 호출되는 상품 검색 모달 다이얼로그이다. 상품명/바코드/분류 기반으로 상품을 검색하고 주문에 추가한다.
- **해결하는 사용자 문제**: PLU 메뉴 버튼에 없는 상품을 텍스트 검색이나 분류 필터로 빠르게 찾아 주문에 추가한다.
- **진입 경로**: OrderScreen에서 상품 검색 버튼으로 모달 호출한다.
- **종료 경로**: 상품 선택(IDC_BTN_SELECT) 시 선택 결과를 부모에 전달하고 모달 닫힘, 닫기(IDCANCEL) 시 모달 닫힘한다.
- **관련 운영 주체**: 매장 직원 (주문 담당)

## 2. 상위 기준 연결
| 기준 | 연결 문서 | 비고 |
|---|---|---|
| 전체 아키텍처 | `00-Platform-최종-아키텍처-기준서.md` | 필수 |
| Edge POS 설계 | `04-Edge-POS-아키텍처-설계서.md` | 필수 |
| 전체 흐름 | `05-Edge-POS-전체-흐름-AZ-가이드.md` | 필수 |
| DB 설계 | `DB설계/` | Item 테이블 |
| 화면 인벤토리 | `_index.md` | 필수 |

## 3. 화면 기능 목록
| ID | 기능명 | 설명 | 사용자 액션 | 우선순위 |
|---|---|---|---|---|
| FN-001 | 상품 검색 실행 | 입력된 검색어로 상품 검색 | 조회 버튼 터치 | P1 |
| FN-002 | 상품 선택 (주문에 추가) | 검색 결과에서 상품 선택 후 주문에 추가 | 선택 버튼 터치 | P1 |
| FN-003 | 닫기 | 모달 닫기 | 닫기 버튼 터치 | P1 |
| FN-004 | 확인 (숨김) | 레거시 확인 버튼, 모달 닫기 흐름에 통합 | - | P2 |
| FN-005 | 분류별 조회 | 분류 선택 모달(GroupSelectModal) 호출 후 분류별 필터링 | 분류별조회 버튼 터치 | P1 |
| FN-006 | 검색어 입력 | 상품명/바코드 검색어 텍스트 입력 | 텍스트 입력 | P1 |
| FN-007 | 그룹 필터 선택 | 드롭다운으로 상품 그룹 필터 선택 | 드롭다운 선택 | P1 |
| FN-008 | 용도 필터 선택 (숨김) | 용도별 필터 드롭다운 (숨김 상태) | 드롭다운 선택 | P2 |

## 4. UI 구조
### 4.1 화면 구성
- **상단**: 분류별조회 버튼, 선택 버튼, 닫기 버튼
- **필터 영역**: 용도 필터 (ComboBox, 숨김), 그룹 필터 (ComboBox), 검색어 입력 (EditText), 조회 버튼
- **본문**: 상품 검색 결과 그리드 (MFCGridCtrl -> React 테이블, 가상화 스크롤)
- **모달**: GroupSelectModal (분류별 조회 시)

### 4.2 재사용 UI
| 컴포넌트 | 위치 | props로 바뀌는 값 | 비고 |
|---|---|---|---|
| Select | `shared/ui/atoms/Select` | options, value, onChange | 그룹/용도 필터 드롭다운 |
| Input | `shared/ui/atoms/Input` | value, onChange, placeholder | 검색어 입력 |
| GroupSelectModal | `shared/ui/organisms/GroupSelectModal` | onSelect, selectedGroupCode | 분류별 조회 시 호출 |

## 5. 구현 명세
### 5.1 상태 소유권
| 상태 | 소유 계층 | 원본 | 비고 |
|---|---|---|---|
| 검색 결과 목록 | RTK Query 캐시 | itemApi.searchItems | 서버 상태 |
| 상품 그룹 목록 | RTK Query 캐시 | itemApi.getItemGroups | 서버 상태 |
| 검색어 | UI 로컬 상태 | - | 폼 입력 |
| 선택된 그룹 필터 | UI 로컬 상태 | - | 폼 입력 |
| 선택된 상품 | UI 로컬 상태 | - | 그리드 행 선택 |

### 5.2 Bridge 계약
| Command | Request | Response | Error | Idempotency | 비고 |
|---|---|---|---|---|---|
| ITEM:SEARCH | `{ keyword?, groupId?, purposeId? }` | `{ items: [...] }` | (없음 — 읽기 전용) | - | 읽기 전용 |
| ITEM:GET_LIST | `{ groupCode }` | `{ items[] }` | (없음 — 읽기 전용) | - | 분류별 조회 |
| ORDER:ADD_ITEM | `{ tableCode, itemCode, qty }` | `{ orderSlipId, orderItems }` | `ITEM_NOT_FOUND`, `TABLE_NOT_FOUND` | `ORDER:ADD_ITEM:{tableCode}:{itemCode}:{timestamp}` | 선택 시 주문 추가. → handoff: oracc-bselect.md |

### 5.3 UseCase 계약
| UseCase | Trigger | Input | Transaction | Lock | Output | 실패 규칙 |
|---|---|---|---|---|---|---|
| AddOrderItemUseCase | ORDER:ADD_ITEM (선택 시) | tableCode, itemCode, qty | SQLite 단일 트랜잭션 | tableCode 단위 | orderSlipId, orderItems | 멱등성: 동일 requestId → Ledger 이전 결과 반환. 상품 미존재 → ITEM_NOT_FOUND. 오프라인: 로컬 DB만 사용하므로 오프라인에서도 동작. 트랜잭션: SQLite TX 내에서 OrderItem INSERT + Ledger INSERT + Outbox INSERT 원자적 수행. 커밋 후: PosRealTimeSender로 ORDER_ITEM_CHANGED 이벤트 브로드캐스트. → handoff: oracc-bselect.md |

### 5.4 Domain / Manager / Store
| 항목 | 책임 | 파일 / 모듈 | 비고 |
|---|---|---|---|
| ItemMgr | 상품 검색, 그룹 조회 | `Domain/Item/ItemMgr` | 핵심 |
| OrderMgr | 주문 항목 추가 (선택 시) | `Domain/Order/OrderMgr` | 선택 확정 시 |

### 5.5 DB / CentralApi / Sync / Realtime
| 연동 대상 | 역할 | 데이터 흐름 | 비고 |
|---|---|---|---|
| SQLite (Item) | 상품 검색 | ItemMgr → SQLite (읽기 전용) | 마스터 데이터 |
| SQLite (OrderItem) | 선택 시 주문 추가 | AddOrderItemUseCase → SQLite | 선택 확정 시 |

### 5.6 i18n / Error / Permission
| 항목 | 규칙 | 비고 |
|---|---|---|
| i18n | `SharedAssets/i18n/locales/` 기반 msgKey | 검색 placeholder, 버튼 라벨 등 |
| Error | 코드 기반 (type, device, code, msgKey). 검색은 에러 없음 (빈 결과 반환). ORDER:ADD_ITEM 에러는 oracc-bselect.md 참조 | 완성 문장 금지 |
| Permission | 로그인된 직원 전원: 상품 검색 및 주문 추가 가능 | |

## 6. 테스트
| 테스트 항목 | 범위 | 기대 결과 | 유형 |
|---|---|---|---|
| 검색어 기반 검색 | ItemSearchModal + itemApi.searchItems | 검색어 일치 상품 목록 표시 | 통합 |
| 그룹 필터 검색 | ItemSearchModal + itemApi.getItemGroups | 선택 그룹의 상품만 표시 | 통합 |
| 상품 선택 후 주문 추가 | ItemSearchModal + AddOrderItemUseCase | 선택 상품이 주문 목록에 추가 | 통합 |
| 분류별 조회 | GroupSelectModal 연동 | 분류 선택 후 해당 분류 상품 표시 | UI |
| 빈 결과 | 검색 결과 없음 | 빈 상태 메시지 표시 | UI |

## 7. 완료 기준
- [ ] UI: screens/OrderScreen/components/ItemSearchModal 구현
- [ ] Bridge: ITEM:SEARCH, ITEM:GET_LIST 커맨드 구현
- [ ] RTK Query: itemApi.searchItems, itemApi.getItemGroups endpoint 구현
- [ ] i18n: 상품 검색 관련 키 등록
- [ ] 테스트: 검색/선택 통합 테스트
- [ ] 문서 DONE

## 8. 작업 명단
| 작업 | 파일 | 상태 |
|---|---|---|
| ItemSearchModal | `BrandPosApp/PosUi/src/screens/OrderScreen/components/ItemSearchModal.tsx` | TODO |
| itemApi (searchItems, getItemGroups) | `BrandPosApp/PosUi/src/store/api/itemApi.ts` | TODO |
| ItemMgr (검색) | `BrandPosApp/Domain/Item/ItemMgr.cpp/.h` | TODO |
| ItemCrud (검색 쿼리) | `BrandPosApp/Infrastructure/Persistence/SQLite/Tables/Item/ItemCrud.cpp/.h` | TODO |
| ItemActions (thin router) | `BrandPosApp/Presentation/CEF/InternalBridge/PosRequestActions/Item/ItemActions.cpp/.h` | TODO |

## 9. 작업 진행 기록
| 날짜 | 범위 | 상태 | 완료 범위 | 남은 범위 | 내용 |
|---|---|---|---|---|---|
| 2026-04-05 | Shell 구현 | 완료 | 레이아웃+로컬상태+stub | Bridge/UseCase 연동 | ItemSearchDialog.tsx shell 구현 완료. Modal, Button 사용. 그룹 필터 select + 검색어 input + 조회 버튼 + 결과 그리드(이름/가격/바코드/분류) + 선택/분류별조회 버튼 stub. |

---
## Appendix: 레거시 UI 요소 참조

### 기본 정보

| 항목 | 값 |
|------|---|
| 다이얼로그 ID | IDD_ITEM_SEARCH |
| 리소스 값 | 191 |
| 크기 (DLU) | 450 x 337 |
| 다이얼로그 타입 | DIALOGEX |
| 스타일 | DS_SETFONT \| DS_MODALFRAME \| WS_POPUP |
| 폰트 | 10, "System", 0, 0, 0x0 |
| 소스 파일 | Restaurant.rc |
| 총 UI 요소 수 | 9 |

### UI 요소 목록

#### 버튼 (5개)

| ID | 라벨 | 위치 (x,y) | 크기 (w x h) | 숨김 | 스타일 | 용도 추정 |
|---|---|---|---|---|---|---|
| IDC_BTN_SEARCH | 조회 | (377,47) | 53 x 20 | FALSE | BS_OWNERDRAW \| WS_TABSTOP | 조회 버튼 |
| IDOK | OK | (7,7) | 50 x 14 | **TRUE** | NOT WS_VISIBLE \| WS_DISABLED | 확인/완료 버튼 |
| IDCANCEL | 닫기 | (387,11) | 52 x 20 | FALSE | BS_OWNERDRAW \| WS_TABSTOP | 닫기/취소 버튼 |
| IDC_BTN_SELECT | 선택 | (327,11) | 53 x 20 | FALSE | BS_OWNERDRAW \| WS_TABSTOP | 선택 버튼 |
| IDC_BTN_GRPMID | 분류별조회 | (171,11) | 53 x 20 | FALSE | BS_OWNERDRAW \| WS_TABSTOP | 분류별조회 버튼 |

#### 입력 필드 (3개)

| ID | 타입 | 위치 (x,y) | 크기 (w x h) | 숨김 | 스타일 | 용도 추정 |
|---|---|---|---|---|---|---|
| IDC_EDT_SEARCH | EditText | (277,50) | 85 x 13 | FALSE | ES_AUTOHSCROLL | 검색어 입력 |
| IDC_CB_GRP | ComboBox | (118,50) | 110 x 306 | FALSE | CBS_DROPDOWNLIST \| WS_VSCROLL \| WS_TABSTOP | 그룹 필터 |
| IDC_CB_PUR | ComboBox | (8,50) | 105 x 306 | **TRUE** | CBS_DROPDOWNLIST \| NOT WS_VISIBLE \| WS_VSCROLL \| WS_TABSTOP | 용도 필터 (숨김) |

#### 그리드/리스트 (1개)

| ID | 타입 | 위치 (x,y) | 크기 (w x h) | 숨김 | 용도 추정 |
|---|---|---|---|---|---|
| IDC_GRID | MFCGridCtrl | (9,72) | 432 x 256 | FALSE | 검색 결과 그리드 |

### 요소 통계

| 유형 | 개수 |
|------|------|
| 버튼 | 5 |
| 텍스트/라벨 | 0 |
| 입력 필드 | 3 |
| 그리드/리스트 | 1 |
| 기타 | 0 |
| **합계** | **9** |
