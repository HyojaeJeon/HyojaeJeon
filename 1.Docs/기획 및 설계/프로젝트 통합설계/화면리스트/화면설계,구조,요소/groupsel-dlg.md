# GROUPSEL_DLG 화면 문서

## 0. 문서 정보
| 항목 | 값 |
|---|---|
| 화면명 | `GROUPSEL_DLG` |
| 화면 ID | `IDD_GROUPSEL_DLG` |
| 원본 파일 | `groupsel-dlg.md` |
| 전환 우선순위 | `P1` |
| 담당 계층 | `PosUi / Domain / Infrastructure` |
| 상태 | `TODO` |

## 1. 화면 개요
- **화면 목적**: 상품 분류(대분류/중분류) 선택 다이얼로그이다. 상품 등록(ITEMREGI), 상품 검색(ITEM_SEARCH) 등 여러 화면에서 공통으로 호출되는 범용 분류 선택 모달이다.
- **해결하는 사용자 문제**: 대분류/중분류 계층 구조에서 원하는 분류를 선택하여 부모 화면에 결과를 전달한다. 설정 모드에서는 분류를 추가/삭제할 수 있다.
- **진입 경로**: ItemRegistrationForm, ItemSearchModal 등 분류 선택이 필요한 화면에서 모달로 호출한다.
- **종료 경로**: 선택(IDC_BTN_SELECT) 시 선택 결과를 콜백으로 전달하고 모달 닫힘, 닫기(IDCANCEL) 시 모달 닫힘한다.
- **관련 운영 주체**: 매장 직원/관리자

## 2. 상위 기준 연결
| 기준 | 연결 문서 | 비고 |
|---|---|---|
| 전체 아키텍처 | `00-Platform-최종-아키텍처-기준서.md` | 필수 |
| Edge POS 설계 | `04-Edge-POS-아키텍처-설계서.md` | 필수 |
| 전체 흐름 | `05-Edge-POS-전체-흐름-AZ-가이드.md` | 필수 |
| DB 설계 | `DB설계/` | Item 분류 테이블 |
| 화면 인벤토리 | `_index.md` | 필수 |

## 3. 화면 기능 목록
| ID | 기능명 | 설명 | 사용자 액션 | 우선순위 |
|---|---|---|---|---|
| FN-001 | 분류 선택 확정 | 대분류/중분류에서 원하는 분류를 선택하고 확정 | 선택 버튼 터치 | P1 |
| FN-002 | 닫기 | 모달 닫기 | 닫기 버튼 터치 | P1 |
| FN-003 | 분류 저장 (숨김) | 새 분류 저장 (설정 모드에서만 활성) | 저장 버튼 터치 | P2 |
| FN-004 | 분류 삭제 (숨김) | 분류 삭제 (설정 모드에서만 활성) | 삭제 버튼 터치 | P2 |
| FN-005 | 하위 분류 저장 (숨김) | 중분류 저장 (설정 모드에서만 활성) | 저장 버튼 터치 | P2 |
| FN-006 | 하위 분류 삭제 (숨김) | 중분류 삭제 (설정 모드에서만 활성) | 삭제 버튼 터치 | P2 |
| FN-007 | 확인 (숨김) | 레거시 확인 버튼, 모달 닫기 흐름에 통합 | - | P2 |

## 4. UI 구조
### 4.1 화면 구성
- **상단**: 선택 버튼, 닫기 버튼
- **숨김 영역**: 저장 버튼, 삭제 버튼, 하위 저장/삭제 버튼 (설정 모드에서만 활성)
- **본문 좌측**: 대분류/중분류 목록 그리드 (MFCGridCtrl -> 트리/리스트 컴포넌트)
- **본문 우측**: 하위 분류 목록 그리드 (MFCGridCtrl -> 서브 리스트)
- **모달**: 없음 (자체가 모달)

### 4.2 재사용 UI
| 컴포넌트 | 위치 | props로 바뀌는 값 | 비고 |
|---|---|---|---|
| GroupSelectModal | `shared/ui/organisms/GroupSelectModal` | groups, onSelect, mode(select/manage) | 여러 화면에서 재사용하는 공용 모달 |

## 5. 구현 명세
### 5.1 상태 소유권
| 상태 | 소유 계층 | 원본 | 비고 |
|---|---|---|---|
| 분류 목록 (대분류/중분류) | RTK Query 캐시 | itemApi.getItemGroups | 서버 상태 |
| 선택된 분류 | UI 로컬 상태 | - | 모달 내 선택 상태 |

### 5.2 Bridge 계약
| Command | Request | Response | Error | Idempotency | 비고 |
|---|---|---|---|---|---|
| GROUP:GET_LIST | `{ parentId? }` | `{ groups: [...] }` | (없음 — 읽기 전용) | - | 분류 목록 조회. 조회 전용이므로 멱등성/락/Outbox 불필요 |
| ITEM:REGISTER (분류) | `{ groupName, parentGroupCode }` | `{ success, groupCode }` | `DUPLICATE_GROUP_NAME` | - | 분류 저장 (설정 모드). 마스터 CRUD이므로 UseCase 분리 불필요 |

### 5.3 UseCase 계약
| UseCase | Trigger | Input | Transaction | Lock | Output | 실패 규칙 |
|---|---|---|---|---|---|---|
| - | GROUP:GET_LIST | parentId? | 없음 (읽기 전용) | - | groups[] | 조회 전용: 멱등성/락/Outbox 불필요 |
| - | ITEM:REGISTER (분류) | groupName, parentCode | SQLite 단일 트랜잭션 | - | success | 단순 CRUD, UseCase 분리 불필요. 동일 이름 분류 존재 → DUPLICATE_GROUP_NAME. 하위 항목 있는 분류 삭제 시도 → GROUP_HAS_CHILDREN. 오프라인: 로컬 DB만 사용하므로 오프라인에서도 동작 |

### 5.4 Domain / Manager / Store
| 항목 | 책임 | 파일 / 모듈 | 비고 |
|---|---|---|---|
| ItemMgr | 분류 조회/저장/삭제 | `Domain/Item/ItemMgr` | 핵심 |

### 5.5 DB / CentralApi / Sync / Realtime
| 연동 대상 | 역할 | 데이터 흐름 | 비고 |
|---|---|---|---|
| SQLite (Item 분류) | 분류 데이터 조회/영속화 | ItemMgr → ItemCrud → SQLite | 마스터 데이터 |

### 5.6 i18n / Error / Permission
| 항목 | 규칙 | 비고 |
|---|---|---|
| i18n | `BrandPosApp/PosUi/src/i18n/locales/` 기반 msgKey | 버튼 라벨, 분류명 표시 |
| Error | 코드 기반 (type, device, code, msgKey). `DUPLICATE_GROUP_NAME`: 동일 이름 분류 존재. `GROUP_HAS_CHILDREN`: 하위 항목 존재 시 삭제 불가 | 완성 문장 금지 |
| Permission | 분류 관리(저장/삭제)는 관리자 권한 | 선택은 일반 직원도 가능 |

## 6. 테스트
| 테스트 항목 | 범위 | 기대 결과 | 유형 |
|---|---|---|---|
| 분류 목록 표시 | GroupSelectModal + itemApi.getItemGroups | 대분류/중분류 계층 목록 표시 | UI |
| 분류 선택 후 부모 콜백 | GroupSelectModal onSelect | 선택된 분류 코드가 부모에 전달 | UI |
| 대분류 선택 시 중분류 갱신 | GroupSelectModal 내부 | 대분류 선택 시 하위 분류 목록 갱신 | UI |
| 분류 저장 (설정 모드) | GroupManagePanel + ItemMgr | 새 분류 DB 저장 | 통합 |
| 분류 삭제 (설정 모드) | GroupManagePanel + ItemMgr | 하위 항목 없는 분류 삭제 가능 | 통합 |
| 여러 화면에서 재사용 | ItemSearchModal, ItemRegistrationForm | 동일 GroupSelectModal 인스턴스 동작 | UI |

## 7. 완료 기준
- [ ] UI: shared/ui/organisms/GroupSelectModal 구현
- [ ] UI: screens/SetupScreen/components/GroupManagePanel 구현 (P2)
- [ ] Bridge: ITEM:GET_LIST (분류), ITEM:REGISTER (분류) 구현
- [ ] RTK Query: itemApi.getItemGroups endpoint 구현
- [ ] i18n: 분류 선택 관련 키 등록
- [ ] 테스트: 선택/관리 통합 테스트
- [ ] 문서 DONE

## 8. 작업 명단
| 작업 | 파일 | 상태 |
|---|---|---|
| GroupSelectModal | `BrandPosApp/PosUi/src/shared/ui/organisms/GroupSelectModal.tsx` | TODO |
| GroupManagePanel | `BrandPosApp/PosUi/src/screens/SetupScreen/components/GroupManagePanel.tsx` | TODO |
| itemApi (getItemGroups) | `BrandPosApp/PosUi/src/store/api/itemApi.ts` | TODO |
| ItemMgr (분류 CRUD) | `BrandPosApp/Domain/Item/ItemMgr.cpp/.h` | TODO |
| ItemCrud (분류 쿼리) | `BrandPosApp/Infrastructure/Persistence/SQLite/Tables/Item/ItemCrud.cpp/.h` | TODO |

---
## Appendix: 레거시 UI 요소 참조

### 기본 정보

| 항목 | 값 |
|------|---|
| 다이얼로그 ID | IDD_GROUPSEL_DLG |
| 리소스 값 | 179 |
| 크기 (DLU) | 285 x 337 |
| 다이얼로그 타입 | DIALOGEX |
| 스타일 | DS_SETFONT \| DS_MODALFRAME \| WS_POPUP |
| 폰트 | 10, "System", 0, 0, 0x0 |
| 소스 파일 | Restaurant.rc |
| 총 UI 요소 수 | 9 |

### UI 요소 목록

#### 버튼 (7개)

| ID | 라벨 | 위치 (x,y) | 크기 (w x h) | 숨김 | 스타일 | 용도 추정 |
|---|---|---|---|---|---|---|
| IDCANCEL | 닫기 | (227,8) | 50 x 20 | FALSE | BS_OWNERDRAW \| WS_TABSTOP | 닫기/취소 버튼 |
| IDC_BTN_SAVE | 저장 | (90,46) | 55 x 20 | **TRUE** | BS_OWNERDRAW \| NOT WS_VISIBLE \| WS_DISABLED \| WS_TABSTOP | 저장 버튼 (숨김) |
| IDC_BTN_DEL | 삭제 | (151,46) | 55 x 20 | **TRUE** | BS_OWNERDRAW \| NOT WS_VISIBLE \| WS_DISABLED \| WS_TABSTOP | 삭제 버튼 (숨김) |
| IDC_BTN_SAVE2 | 저장 | (229,46) | 19 x 20 | **TRUE** | BS_OWNERDRAW \| NOT WS_VISIBLE \| WS_DISABLED \| WS_TABSTOP | 하위 저장 버튼 (숨김) |
| IDC_BTN_DEL2 | 삭제 | (251,46) | 19 x 20 | **TRUE** | BS_OWNERDRAW \| NOT WS_VISIBLE \| WS_DISABLED \| WS_TABSTOP | 하위 삭제 버튼 (숨김) |
| IDOK | OK | (7,7) | 50 x 14 | **TRUE** | NOT WS_VISIBLE \| WS_DISABLED | 확인 버튼 (숨김) |
| IDC_BTN_SELECT | 선택 | (146,8) | 55 x 25 | FALSE | BS_OWNERDRAW \| WS_TABSTOP | 선택 버튼 |

#### 그리드/리스트 (2개)

| ID | 타입 | 위치 (x,y) | 크기 (w x h) | 숨김 | 용도 추정 |
|---|---|---|---|---|---|
| IDC_GRID | MFCGridCtrl | (48,71) | 170 x 255 | FALSE | 대분류/중분류 목록 그리드 |
| IDC_GRID3 | MFCGridCtrl | (233,71) | 45 x 255 | FALSE | 하위 분류 목록 그리드 |

### 요소 통계

| 유형 | 개수 |
|------|------|
| 버튼 | 7 |
| 텍스트/라벨 | 0 |
| 입력 필드 | 0 |
| 그리드/리스트 | 2 |
| 기타 | 0 |
| **합계** | **9** |

---

## Progress

| 날짜 | 작업 | 상태 |
|------|------|------|
| 2026-04-05 | UI Shell 구현: `BrandPosApp/PosUi/src/screens/StockScreen/components/GroupSelectDialog.tsx` | DONE |
