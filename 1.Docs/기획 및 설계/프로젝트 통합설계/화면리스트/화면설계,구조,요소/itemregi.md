# ITEMREGI 화면 문서

## 0. 문서 정보
| 항목 | 값 |
|---|---|
| 화면명 | `ITEMREGI` |
| 화면 ID | `IDD_ITEMREGI` |
| 원본 파일 | `itemregi.md` |
| 전환 우선순위 | `P2` |
| 담당 계층 | `PosUi / Domain / Infrastructure` |
| 상태 | `TODO` |

## 1. 화면 개요
- **화면 목적**: 상품(메뉴) 등록/수정 다이얼로그이다. 바코드, 상품명, 판매가, 원가, 분류를 입력하여 새 상품을 등록하거나 기존 상품을 수정한다.
- **해결하는 사용자 문제**: 매장에서 신규 상품을 빠르게 등록하거나 기존 상품 정보를 수정한다.
- **진입 경로**: SetupScreen에서 상품 등록 메뉴로 진입한다.
- **종료 경로**: 저장(IDC_BTN_SAVE) 후 자동 닫힘 또는 닫기(IDCANCEL)로 설정 화면 복귀한다.
- **관련 운영 주체**: 매장 관리자 (상품 관리 담당)

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
| FN-001 | 상품 저장 | 입력된 상품 정보를 저장 | 저장 버튼 터치 | P1 |
| FN-002 | 닫기 | 다이얼로그 닫기 | 닫기 버튼 터치 | P1 |
| FN-003 | 확인 (숨김) | 레거시 확인 버튼, 모달 닫기 흐름에 통합 | - | P2 |
| FN-004 | 분류 선택 | 분류 선택 모달(GroupSelectModal) 호출 | 분류선택 버튼 터치 | P1 |
| FN-005 | 키보드 입력 | 가상 키보드 호출 | 키보드 버튼 터치 | P2 |
| FN-006 | 상품찾기 (F5, 숨김) | 기존 상품 검색 모달 호출 | 상품찾기 버튼 터치 | P2 |
| FN-007 | 선반표 (F6, 숨김) | 선반표 인쇄 | 선반표 버튼 터치 | P2 |
| FN-008 | 바코드 입력 | 바코드 텍스트 입력 또는 스캐너 자동 입력 | 텍스트 입력 / 스캐너 | P1 |
| FN-009 | 상품명 입력 | 상품명 텍스트 입력 | 텍스트 입력 | P1 |
| FN-010 | 판매가 입력 | 판매가 숫자 입력 | 숫자 입력 | P1 |
| FN-011 | 원가 입력 (숨김) | 원가 숫자 입력 (설정에 따라 표시) | 숫자 입력 | P2 |

## 4. UI 구조
### 4.1 화면 구성
- **상단**: 중분류 표시(숨김), 저장 버튼, 닫기 버튼
- **본문**: 바코드 입력 + 키보드 버튼, 상품명 입력, 판매가 입력, 원가 입력(숨김), 대분류 표시 + 분류선택 버튼
- **숨김 영역**: 상품찾기(F5), 선반표(F6) 버튼, 라벨 8개 (판매가, 매입가, 상품명, 바코드, 대분류, 중분류 등)
- **모달**: GroupSelectModal (분류 선택 시)

### 4.2 재사용 UI
| 컴포넌트 | 위치 | props로 바뀌는 값 | 비고 |
|---|---|---|---|
| Input | `shared/ui/atoms/Input` | value, onChange, type, placeholder | 바코드/상품명/판매가/원가 입력 |
| Label | `shared/ui/atoms/Label` | text | 필드 라벨 (i18n) |
| VirtualKeyboard | `shared/ui/molecules/VirtualKeyboard` | onInput | 가상 키보드 |
| GroupSelectModal | `shared/ui/organisms/GroupSelectModal` | onSelect, selectedGroupCode | 분류 선택 |

## 5. 구현 명세
### 5.1 상태 소유권
| 상태 | 소유 계층 | 원본 | 비고 |
|---|---|---|---|
| 상품 그룹 목록 | RTK Query 캐시 | itemApi.getItemGroups | 서버 상태 |
| 폼 입력값 (바코드, 상품명, 판매가, 원가) | UI 로컬 상태 | - | 저장 전까지 임시 |
| 선택된 분류 | UI 로컬 상태 | - | GroupSelectModal 결과 |

### 5.2 Bridge 계약
| Command | Request | Response | Error | Idempotency | 비고 |
|---|---|---|---|---|---|
| ITEM:REGISTER | `{ name, price, groupId, barcode?, taxType? }` | `{ item: { itemCode, name, price, groupId, barcode, taxType } }` | `DUPLICATE_BARCODE`, `INVALID_PRICE` | - | 단순 CRUD 저장. 상태 변경이지만 단순 마스터 CRUD이므로 UseCase 분리 불필요 |
| ITEM:GET_LIST | `{ groupCode }` | `{ items[] }` | (없음 — 읽기 전용) | - | 분류 선택 시. → handoff: groupsel-dlg.md |
| ITEM:SEARCH | `{ keyword?, groupId?, purposeId? }` | `{ items: [...] }` | (없음 — 읽기 전용) | - | 상품찾기(F5). → handoff: item-search.md |

### 5.3 UseCase 계약
| UseCase | Trigger | Input | Transaction | Lock | Output | 실패 규칙 |
|---|---|---|---|---|---|---|
| - | ITEM:REGISTER | 상품 정보 | SQLite 단일 트랜잭션 | - | success, itemCode | 단순 CRUD, UseCase 분리 불필요. thin action → ItemMgr 직접 호출. 바코드 중복 → DUPLICATE_BARCODE 에러. 판매가 0 이하 → INVALID_PRICE 에러. 오프라인: 로컬 DB만 사용하므로 오프라인에서도 동작. 멱등성/Ledger/Outbox: 마스터 CRUD이므로 불필요 |

### 5.4 Domain / Manager / Store
| 항목 | 책임 | 파일 / 모듈 | 비고 |
|---|---|---|---|
| ItemMgr | 상품 등록/수정/조회 | `Domain/Item/ItemMgr` | 핵심 |

### 5.5 DB / CentralApi / Sync / Realtime
| 연동 대상 | 역할 | 데이터 흐름 | 비고 |
|---|---|---|---|
| SQLite (Item) | 상품 영속화 | ItemMgr → ItemCrud → SQLite | Offline-First |
| Device/Scanner | 바코드 스캔 이벤트 | PosRealTimeReceiver → 폼 입력 | FN-008 |
| Device/Printer | 선반표 인쇄 | ItemMgr → Printer | FN-007 (P2) |

### 5.6 i18n / Error / Permission
| 항목 | 규칙 | 비고 |
|---|---|---|
| i18n | `BrandPosApp/PosUi/src/i18n/locales/` 기반 msgKey | 필드 라벨 (바코드, 상품명, 판매가, 매입가 등) |
| Error | 코드 기반 (type, device, code, msgKey). `DUPLICATE_BARCODE`: 동일 바코드 상품 존재. `INVALID_PRICE`: 판매가 0 이하 | 완성 문장 금지 |
| Permission | 관리자 전용: 상품 등록/수정은 관리자 권한 필요. 일반 직원은 접근 불가 | |

## 6. 테스트
| 테스트 항목 | 범위 | 기대 결과 | 유형 |
|---|---|---|---|
| 상품 등록 | ItemRegistrationForm + ItemMgr | 폼 입력 후 저장 시 DB 반영 | 통합 |
| 바코드 스캐너 연동 | Scanner 이벤트 → 폼 자동 입력 | 스캔 시 바코드 필드 자동 채움 | 통합 |
| 분류 선택 | GroupSelectModal 연동 | 분류 선택 시 대분류/중분류 표시 | UI |
| 필수 필드 검증 | 폼 validation | 상품명/판매가 미입력 시 저장 불가 | UI |
| 숨김 필드 조건부 렌더링 | 매장 설정 기반 | 원가 필드 설정에 따라 표시/숨김 | UI |

## 7. 완료 기준
- [ ] UI: screens/SetupScreen/components/ItemRegistrationForm 구현
- [ ] Bridge: ITEM:REGISTER 커맨드 구현
- [ ] RTK Query: itemApi.getItemGroups endpoint 구현
- [ ] i18n: 상품 등록 관련 키 등록
- [ ] 테스트: 등록/수정 통합 테스트
- [ ] 문서 DONE

## 8. 작업 명단
| 작업 | 파일 | 상태 |
|---|---|---|
| ItemRegistrationForm | `BrandPosApp/PosUi/src/screens/SetupScreen/components/ItemRegistrationForm.tsx` | TODO |
| VirtualKeyboard | `BrandPosApp/PosUi/src/shared/ui/molecules/VirtualKeyboard.tsx` | TODO |
| itemApi (getItemGroups) | `BrandPosApp/PosUi/src/store/api/itemApi.ts` | TODO |
| ItemMgr (등록/수정) | `BrandPosApp/Domain/Item/ItemMgr.cpp/.h` | TODO |
| ItemCrud | `BrandPosApp/Infrastructure/Persistence/SQLite/Tables/Item/ItemCrud.cpp/.h` | TODO |
| ItemActions (thin router) | `BrandPosApp/Presentation/CEF/InternalBridge/PosRequestActions/Item/ItemActions.cpp/.h` | TODO |

## 9. 작업 진행 기록
| 날짜 | 범위 | 상태 | 완료 범위 | 남은 범위 | 내용 |
|---|---|---|---|---|---|
| 2026-04-05 | Shell 구현 | 완료 | 레이아웃+로컬상태+stub | Bridge/UseCase 연동 | ItemRegistrationDialog.tsx shell 구현 완료. Modal, Button 사용. 바코드/상품명/판매가/원가(조건부) 입력 필드 + 분류선택/키보드 버튼 stub. |

---
## Appendix: 레거시 UI 요소 참조

### 기본 정보

| 항목 | 값 |
|------|---|
| 다이얼로그 ID | IDD_ITEMREGI |
| 리소스 값 | 178 |
| 크기 (DLU) | 400 x 302 |
| 다이얼로그 타입 | DIALOGEX |
| 스타일 | DS_SETFONT \| DS_MODALFRAME \| WS_POPUP |
| 폰트 | 10, "System", 0, 0, 0x0 |
| 소스 파일 | Restaurant.rc |
| 총 UI 요소 수 | 19 |

### UI 요소 목록

#### 버튼 (7개)

| ID | 라벨 | 위치 (x,y) | 크기 (w x h) | 숨김 | 스타일 | 용도 추정 |
|---|---|---|---|---|---|---|
| IDC_BTN_GRP | 분류선택 | (259,104) | 55 x 25 | FALSE | BS_OWNERDRAW \| WS_TABSTOP | 분류선택 버튼 |
| IDC_BTN_SAVE | 저장 | (268,9) | 55 x 25 | FALSE | BS_OWNERDRAW \| WS_TABSTOP | 저장 버튼 |
| IDCANCEL | 닫기 | (341,9) | 42 x 25 | FALSE | BS_OWNERDRAW \| WS_TABSTOP | 닫기/취소 버튼 |
| IDOK | OK | (7,7) | 50 x 14 | **TRUE** | NOT WS_VISIBLE \| WS_DISABLED | 확인/완료 버튼 |
| IDC_CUST_KEY | 키보드 | (328,48) | 55 x 25 | FALSE | BS_OWNERDRAW \| WS_TABSTOP | 키보드 버튼 |
| IDC_BTN_AMTCHANGE | 상품찾기(F5) | (204,48) | 56 x 20 | **TRUE** | BS_OWNERDRAW \| NOT WS_VISIBLE \| WS_DISABLED \| WS_TABSTOP | 상품찾기 버튼 (숨김) |
| IDC_BTN_SHELFTAB | 선반표(F6) | (264,48) | 56 x 20 | **TRUE** | BS_OWNERDRAW \| NOT WS_VISIBLE \| WS_DISABLED \| WS_TABSTOP | 선반표 버튼 (숨김) |

#### 텍스트/라벨 (8개)

| ID | 텍스트 | 위치 (x,y) | 크기 (w x h) | 숨김 | 정렬 | 용도 추정 |
|---|---|---|---|---|---|---|
| IDC_STATIC | 판매가 | (4,90) | 47 x 13 | **TRUE** | 가운데 | 판매가 라벨 |
| IDC_STATIC | 매입가 | (5,106) | 47 x 16 | **TRUE** | 가운데 | 매입가 라벨 |
| IDC_STATIC | 상품명 | (5,70) | 47 x 16 | **TRUE** | 가운데 | 상품명 라벨 |
| IDC_STATIC | 바코드 | (4,50) | 47 x 16 | **TRUE** | 가운데 | 바코드 라벨 |
| IDC_STATIC | 대분류 | (224,86) | 25 x 8 | **TRUE** | 왼쪽 | 대분류 라벨 |
| IDC_STATIC | 중분류 | (56,8) | 25 x 8 | **TRUE** | 왼쪽 | 중분류 라벨 |
| IDC_STC_BIG | 대분류 값 | (260,84) | 65 x 15 | FALSE | 왼쪽 | 대분류 표시 |
| IDC_STC_MID | 중분류 값 | (108,7) | 65 x 10 | **TRUE** | 왼쪽 | 중분류 표시 (숨김) |

#### 입력 필드 (4개)

| ID | 타입 | 위치 (x,y) | 크기 (w x h) | 숨김 | 스타일 | 용도 추정 |
|---|---|---|---|---|---|---|
| IDC_EDT_BARCODE | EditText | (73,52) | 80 x 15 | FALSE | ES_AUTOHSCROLL | 바코드 입력 |
| IDC_EDT_ITEMNAME | EditText | (73,72) | 150 x 15 | FALSE | ES_AUTOHSCROLL | 상품명 입력 |
| IDC_EDT_SALEAMT | EditText | (73,92) | 80 x 15 | FALSE | ES_RIGHT \| ES_AUTOHSCROLL \| ES_NUMBER | 판매가 입력 |
| IDC_EDT_ORIAMT | EditText | (73,112) | 60 x 15 | **TRUE** | ES_RIGHT \| ES_AUTOHSCROLL \| ES_NUMBER \| NOT WS_VISIBLE \| WS_DISABLED | 원가 입력 (숨김) |

### 요소 통계

| 유형 | 개수 |
|------|------|
| 버튼 | 7 |
| 텍스트/라벨 | 8 |
| 입력 필드 | 4 |
| 그리드/리스트 | 0 |
| 기타 | 0 |
| **합계** | **19** |
