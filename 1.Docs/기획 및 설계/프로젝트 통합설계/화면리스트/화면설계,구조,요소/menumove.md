# MENUMOVE 화면 문서

## 0. 문서 정보

| 항목 | 값 |
|---|---|
| 화면명 | `MENUMOVE` |
| 화면 ID | `IDD_MENUMOVE` |
| 원본 파일 | `menumove.md` |
| 전환 우선순위 | `P1` |
| 담당 계층 | `PosUi / Presentation / UseCases / Domain / Infrastructure` |
| 상태 | `TODO` |

## 1. 화면 개요

- **화면 목적**: 테이블 간 주문 항목(메뉴)을 이동하는 모달 다이얼로그이다. 원본 테이블과 대상 테이블의 주문 항목을 좌/우 패널로 나란히 보여주고, 항목을 선택적 또는 전체로 이동시킨다.
- **해결하는 사용자 문제**: 직원이 손님의 자리 이동, 테이블 분리 등의 상황에서 주문 항목을 다른 테이블로 옮긴다.
- **화면 진입 경로**: TableScreen → 기능 선택(TABLE_BSELECT) → 이동(IDC_MOVE) 클릭, 또는 TABLE_DIALOG 동적 기능 버튼
- **화면 종료 경로**: 저장(IDC_SAVE) → TableScreen (이동 확정 후 닫기), 취소(IDC_CANCEL) → TableScreen
- **관련 운영 주체**: 직원 (홀 서빙, 카운터)

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
| F-001 | 전체 항목 이동 (좌 → 우) | 원본 테이블의 모든 주문 항목을 대상 테이블로 이동 | >> 버튼 클릭 | P0 |
| F-002 | 전체 항목 이동 (우 → 좌) | 대상 테이블의 모든 주문 항목을 원본으로 복귀 (기본 숨김) | << 버튼 클릭 | P0 |
| F-003 | 선택 항목 이동 (좌 → 우) | 원본 테이블에서 선택한 항목만 대상으로 이동 | 항목 선택 후 > 버튼 클릭 | P0 |
| F-004 | 선택 항목 이동 (우 → 좌) | 대상 테이블에서 선택한 항목을 원본으로 복귀 | 항목 선택 후 < 버튼 클릭 | P0 |
| F-005 | 이동 확정 (저장) | 이동 결과를 DB에 저장하고 모달 닫기 | 저장 버튼 클릭 | P0 |
| F-006 | 이동 취소 | 이동 내용 폐기, 모달 닫기 | 취소 버튼 클릭 | P0 |
| F-007 | 원본 그리드 위로 스크롤 | 좌측 주문 항목 리스트 위로 스크롤 | 위 스크롤 버튼 클릭 | P1 |
| F-008 | 원본 그리드 아래로 스크롤 | 좌측 주문 항목 리스트 아래로 스크롤 | 아래 스크롤 버튼 클릭 | P1 |
| F-009 | 대상 그리드 위로 스크롤 | 우측 주문 항목 리스트 위로 스크롤 | 위 스크롤 버튼 클릭 | P1 |
| F-010 | 대상 그리드 아래로 스크롤 | 우측 주문 항목 리스트 아래로 스크롤 | 아래 스크롤 버튼 클릭 | P1 |

## 4. UI 구조

### 4.1 화면 구성

- **상단 영역**: 원본 테이블명(IDC_STATIC_LEFT_TALBE), 원본 합계(IDC_BEFORE_TOTAL), 대상 테이블명(IDC_STATIC_RIGHT_TALBE), 대상 합계(IDC_NEW_TOTAL), 저장(IDC_SAVE), 취소(IDC_CANCEL)
- **본문 영역**: 좌측 패널 — 원본 주문 항목 그리드(IDC_GRID1) + 스크롤 버튼, 중앙 — 이동 방향 버튼(>>, >, <, <<), 우측 패널 — 대상 주문 항목 그리드(IDC_GRID2) + 스크롤 버튼
- **하단 영역**: 없음
- **모달/팝업**: 본 화면 자체가 모달 (MoveItemsModal)
- **사이드 패널**: 없음

### 4.2 재사용 UI

| 컴포넌트 | 위치 | props로 바뀌는 값 | 비고 |
|---|---|---|---|
| OrderItemList | shared/ui/organisms/OrderItemList | items, selectedItems, onSelect, onSelectAll | 주문 항목 리스트 — 좌/우 패널 동일 컴포넌트 재사용 |
| Label | shared/ui/atoms/Label | text | 테이블명 표시 |
| AmountLabel | shared/ui/atoms/AmountLabel | amount, currency | 합계 금액 표시 |

## 5. 구현 명세

### 5.1 상태 소유권

| 상태 | 소유 계층 | 원본 | 비고 |
|---|---|---|---|
| 원본 테이블 주문 항목 | RTK Query 캐시 | orderApi.getOrderItems (원본 테이블) | 서버 상태 |
| 대상 테이블 주문 항목 | RTK Query 캐시 | orderApi.getOrderItems (대상 테이블) | 서버 상태 |
| 원본/대상 테이블 정보 | RTK Query 캐시 | tableApi.getTableDetail | 부모에서 전달 |
| 이동 중 임시 항목 배치 | 로컬 컴포넌트 상태 | useState | 저장 전 UI 임시 상태 |
| 선택된 항목 | 로컬 컴포넌트 상태 | useState | UI 상태 |
| 합계 금액 (실시간 계산) | 로컬 컴포넌트 상태 | useMemo/useState | 항목 이동 시 재계산 |

### 5.2 Bridge 계약

| Command | Request | Response | Error | Idempotency | 비고 |
|---|---|---|---|---|---|
| TABLE:MOVE | `{ sourceTableId: number, targetTableId: number, items: [{ orderItemId: number, qty: number }] }` | `{ sourceTable: { id, code, name, status, floorId, personCount, totalAmount }, targetTable: { id, code, name, status, floorId, personCount, totalAmount } }` | `TARGET_TABLE_OCCUPIED`, `SOURCE_TABLE_EMPTY`, `SAME_TABLE`, `TABLE_NOT_FOUND`, `ITEM_NOT_FOUND` | `TABLE:MOVE:{sourceTableId}:{targetTableId}` | P0 |

### 5.3 UseCase 계약

| UseCase | Trigger | Input | Transaction | Lock | Output | 실패 규칙 |
|---|---|---|---|---|---|---|
| MoveTableUseCase | TABLE:MOVE | sourceTableId, targetTableId, items | SQLite TX | TABLE:{sourceTableId}, TABLE:{targetTableId} | TableRow, TableRow | 멱등성: 동일 requestId → 이전 결과 반환 (Ledger 확인). 대상 테이블 점유 → TARGET_TABLE_OCCUPIED 에러 (빈 테이블만 대상 가능). 원본 테이블 비어있음 → SOURCE_TABLE_EMPTY 에러. 동일 테이블 → SAME_TABLE 에러. 존재하지 않는 항목 → ITEM_NOT_FOUND 에러. 부분 이동: items 배열에 일부 항목만 포함 시 해당 항목만 이동, 원본에 남은 항목이 있으면 OCCUPIED 유지. 전체 이동: 원본의 모든 항목 이동 시 원본 테이블 EMPTY로 전환. 오프라인: 로컬 DB만 사용하므로 오프라인에서도 동작. 트랜잭션: 원본 OrderSlip/OrderItem의 tableId를 대상으로 UPDATE + 양쪽 테이블 상태 UPDATE + 합계 재계산 + Ledger INSERT + Outbox INSERT 원자적 수행. 커밋 후: PosRealTimeSender로 TABLE_MOVED 이벤트 (원본/대상 양쪽 갱신) |

### 5.4 Domain / Manager / Store

| 항목 | 책임 | 파일 / 모듈 | 비고 |
|---|---|---|---|
| TableManager | 테이블 이동 규칙 (점유 상태 전환) | Domain/Table/TableManager | |
| OrderMgr | 주문 항목 재배치 (테이블 간 이동) | Domain/Order/OrderMgr | |

### 5.5 DB / CentralApi / Sync / Realtime

| 연동 대상 | 역할 | 데이터 흐름 | 비고 |
|---|---|---|---|
| SQLite Tables/Table/TableCrud | 테이블 점유 상태 변경 | UseCase → TableManager → Crud → SQLite | 로컬 원본 |
| SQLite Tables/Order/OrderItemCrud | 주문 항목 테이블 재배치 | UseCase → OrderMgr → Crud → SQLite | 로컬 원본 |
| Outbox | 테이블/주문 변경 동기화 | 커밋 후 Outbox 적재 → Sync Worker → CentralApi | |
| PosRealTimeSender | 양쪽 테이블 변경 브로드캐스트 | UseCase 커밋 후 → PosRealTimeSender → UI | 원본/대상 모두 갱신 |
| CentralApi | 테이블 이동/주문 항목 재배치 동기화 | 테이블 상태 변경 + 주문 항목 이동 → Outbox → Sync Worker → CentralApi `mutation syncTableMove` | |

### 5.6 i18n / Error / Permission

| 항목 | 규칙 | 비고 |
|---|---|---|
| i18n | `BrandPosApp/PosUi/src/i18n/locales/{ko,vi,en}/table.json`, `order.json` | msgKey 기반 |
| Error | 코드 기반 (type, device, code, msgKey) | 완성 문장 금지 |
| Permission | 로그인된 직원 전원: 테이블 간 주문 이동 가능. 테이블/주문 조작은 관리자 권한 불필요 | |

## 6. 테스트

| 테스트 항목 | 범위 | 기대 결과 | 유형 |
|---|---|---|---|
| 전체 항목 이동 후 원본 빈 테이블 | MoveItemsModal + tableApi + orderApi | 원본 항목 0개, 대상에 전부 이동 | integration |
| 선택 항목 이동 후 양쪽 합계 재계산 | MoveItemsModal | 이동된 항목만큼 합계 변동 | unit |
| 저장 후 DB 반영 | MoveItemsModal + TABLE:MOVE | 양쪽 테이블 주문 항목 정합성 | integration |
| 취소 시 원래 상태 유지 | MoveItemsModal | 취소 후 양쪽 테이블 변경 없음 | unit |
| PosRealTime 수신 시 다른 POS 갱신 | PosRealTimeReceiver | 양쪽 테이블 상태 갱신 | integration |
| 빈 테이블에서 이동 시도 | MoveItemsModal | 에러 표시, 이동 불가 | unit |

## 7. 완료 기준

- [ ] MoveItemsModal UI 구현 완료
- [ ] TABLE:MOVE Bridge 계약 구현 완료
- [ ] MoveTableUseCase 연동 완료
- [ ] RTK Query 엔드포인트 구현 완료 (orderApi.getOrderItems)
- [ ] 실시간 합계 재계산 구현 완료
- [ ] PosRealTime 이벤트 연동 완료
- [ ] 터치 스크롤 사용성 검증 (1024x768)
- [ ] i18n 적용 완료
- [ ] 테스트 완료
- [ ] 문서 상태 `DONE`

## 8. 작업 명단

| 작업 | 파일 | 상태 |
|---|---|---|
| MoveItemsModal 컴포넌트 | `PosUi/src/screens/TableScreen/components/MoveItemsModal.tsx` | TODO |
| OrderItemList 컴포넌트 | `PosUi/src/shared/ui/organisms/OrderItemList.tsx` | TODO |
| AmountLabel 컴포넌트 | `PosUi/src/shared/ui/atoms/AmountLabel.tsx` | TODO |
| RTK Query endpoint (주문 항목) | `PosUi/src/store/api/orderApi.ts` (getOrderItems) | TODO |
| Bridge command (테이블 이동) | `PosUi/src/bridge/commands/table.ts` (MOVE) | TODO |
| C++ MoveTableUseCase | `BrandPosApp/UseCases/Table/MoveTableUseCase.cpp` | TODO |
| C++ PosRequestActions/Table (이동) | `BrandPosApp/Presentation/CEF/InternalBridge/PosRequestActions/Table/TableActions.cpp` | TODO |
| C++ TableManager (이동 규칙) | `BrandPosApp/Domain/Table/TableManager.cpp` | TODO |
| C++ OrderMgr (항목 재배치) | `BrandPosApp/Domain/Order/OrderMgr.cpp` | TODO |

## 9. 작업 진행 기록
| 날짜 | 범위 | 상태 | 완료 범위 | 남은 범위 | 내용 |
|---|---|---|---|---|---|
| 2026-04-05 | Shell 구현 | 완료 | 레이아웃+로컬상태+stub | Bridge/UseCase 연동 | MenuMoveDialog.tsx shell 구현 완료. Modal, Button 사용. 좌/우 패널(원본/대상) + 중앙 이동 버튼(>>, >, <, <<) + 항목 선택/이동/합계 재계산 로컬 상태. |

---

## Appendix: 레거시 UI 요소 참조

### 기본 정보

| 항목 | 값 |
|------|---|
| 다이얼로그 ID | IDD_MENUMOVE |
| 리소스 값 | 426 |
| 크기 (DLU) | 450 x 337 |
| 다이얼로그 타입 | DIALOGEX |
| 스타일 | DS_SETFONT \| DS_MODALFRAME \| WS_POPUP |
| 폰트 | 10, "System", 0, 0, 0x0 |
| 소스 파일 | Restaurant.rc |
| 총 UI 요소 수 | 16 |

### 버튼 (10개)

| ID | 라벨 | 위치 (x,y) | 크기 (w x h) | 숨김 | 스타일 | 용도 추정 |
|---|---|---|---|---|---|---|
| IDC_RIGHTALLSEND | >> | (204,131) | 43 x 25 | FALSE | BS_OWNERDRAW \| WS_TABSTOP | 전체 이동 (좌→우) 버튼 |
| IDC_LEFTALLSEND | << | (204,301) | 43 x 25 | **TRUE** | BS_OWNERDRAW \| NOT WS_VISIBLE \| WS_DISABLED \| WS_TABSTOP | 전체 복귀 (우→좌) 버튼 |
| IDC_RIGHTONESEND | > | (204,182) | 43 x 25 | FALSE | BS_OWNERDRAW \| WS_TABSTOP | 선택 이동 (좌→우) 버튼 |
| IDC_LEFTONESEND | < | (204,218) | 43 x 25 | FALSE | BS_OWNERDRAW \| WS_TABSTOP | 선택 복귀 (우→좌) 버튼 |
| IDC_SAVE | 저장 | (330,8) | 50 x 24 | FALSE | BS_OWNERDRAW \| WS_TABSTOP | 저장 버튼 |
| IDC_CANCEL | 취소 | (387,8) | 31 x 21 | FALSE | BS_OWNERDRAW \| WS_TABSTOP | 취소 버튼 |
| IDC_GRID_UP |  | (185,71) | 15 x 47 | FALSE | BS_OWNERDRAW \| WS_TABSTOP | 위로 스크롤 버튼 |
| IDC_GRID_DOWN |  | (185,279) | 15 x 47 | FALSE | BS_OWNERDRAW \| WS_TABSTOP | 아래로 스크롤 버튼 |
| IDC_GRID_UP2 |  | (425,71) | 15 x 47 | FALSE | BS_OWNERDRAW \| WS_TABSTOP | 위로 스크롤 버튼 |
| IDC_GRID_DOWN2 |  | (425,279) | 15 x 47 | FALSE | BS_OWNERDRAW \| WS_TABSTOP | 아래로 스크롤 버튼 |

### 텍스트/라벨 (4개)

| ID | 텍스트 | 위치 (x,y) | 크기 (w x h) | 숨김 | 정렬 | 용도 추정 |
|---|---|---|---|---|---|---|
| IDC_STATIC_LEFT_TALBE | 테이블명 | (38,49) | 58 x 13 | FALSE | 가운데 | 원본 테이블명 표시 |
| IDC_STATIC_RIGHT_TALBE | 테이블명 | (285,49) | 58 x 13 | FALSE | 가운데 | 대상 테이블명 표시 |
| IDC_BEFORE_TOTAL | Static | (127,49) | 46 x 13 | FALSE | 오른쪽 | 원본 합계 표시 |
| IDC_NEW_TOTAL | Static | (377,49) | 45 x 13 | FALSE | 오른쪽 | 대상 합계 표시 |

### 그리드/리스트 (2개)

| ID | 타입 | 위치 (x,y) | 크기 (w x h) | 숨김 | 용도 추정 |
|---|---|---|---|---|---|
| IDC_GRID1 | MFCGridCtrl | (9,71) | 176 x 255 | FALSE | 원본 주문 항목 그리드 |
| IDC_GRID2 | MFCGridCtrl | (255,71) | 170 x 255 | FALSE | 대상 주문 항목 그리드 |

### 요소 통계

| 유형 | 개수 |
|------|------|
| 버튼 | 10 |
| 텍스트/라벨 | 4 |
| 입력 필드 | 0 |
| 그리드/리스트 | 2 |
| 기타 | 0 |
| **합계** | **16** |

### 마이그레이션 노트 (원본)

- MENUMOVE는 테이블 간 주문 항목 이동 화면이다. 신규 UI에서는 TableScreen 내 MoveItemsModal로 구현한다.
- 좌/우 두 개의 MFCGridCtrl은 동일한 `shared/ui/organisms/OrderItemList` 컴포넌트를 재사용하여 원본/대상 테이블의 주문 항목을 표시한다.
- 스크롤 버튼(IDC_GRID_UP/DOWN, IDC_GRID_UP2/DOWN2)은 터치 환경에서 필요한 레거시 패턴이다. React에서는 네이티브 스크롤 또는 터치 스와이프로 대체하되, 1024x768 터치 해상도에서의 사용성을 고려하여 큰 스크롤 영역을 확보한다.
- 전체 이동(>>)과 선택 이동(>)을 명확히 구분하는 UI를 유지한다. IDC_LEFTALLSEND(<<)는 숨김 상태이므로 신규 UI에서도 기본 숨김으로 하되, 설정에 따라 활성화할 수 있도록 한다.
- 저장(IDC_SAVE) 시 TABLE:MOVE Bridge Command를 통해 MoveTableUseCase가 트랜잭션 내에서 원본/대상 테이블의 주문 항목을 재배치하고, 커밋 후 PosRealTimeSender로 양쪽 테이블 변경을 브로드캐스트한다.
- 합계 금액(IDC_BEFORE_TOTAL, IDC_NEW_TOTAL)은 항목 이동 시 실시간으로 재계산되어야 하므로, UI 상태(uiSlice 또는 로컬 컴포넌트 상태)에서 관리하고 저장 확정 시에만 서버 상태를 갱신한다.
