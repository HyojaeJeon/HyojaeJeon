# ORDER_DIALOG 화면 문서

## 0. 문서 정보
| 항목 | 값 |
|---|---|
| 화면명 | `ORDER_DIALOG` |
| 화면 ID | `IDD_ORDER_DIALOG` |
| 원본 파일 | `order-dialog.md` |
| 전환 우선순위 | `P0` |
| 담당 계층 | `PosUi / Presentation / UseCases / Domain / Infrastructure` |
| 상태 | `TODO` |

## 1. 화면 개요
- **화면 목적**: 테이블 선택 후 메뉴를 선택하고 주문을 입력/수정/완료하는 핵심 주문 화면이다.
- **해결하는 사용자 문제**: 메뉴 그룹별 항목 선택, 수량 조정, 할인/서비스/포장/배달 설정, 주문 완료까지 한 화면에서 처리한다.
- **진입 경로**: TableScreen에서 테이블 선택 후 진입한다.
- **종료 경로**: 주문 완료(IDOK) 시 TableScreen 복귀, 닫기(IDCANCEL) 시 TableScreen 복귀, 결제 진입(IDC_O_ACCOUNT) 시 PaymentScreen으로 라우팅한다.
- **관련 운영 주체**: 매장 직원 (주문 담당)

## 2. 상위 기준 연결
| 기준 | 연결 문서 | 비고 |
|---|---|---|
| 전체 아키텍처 | `00-Platform-최종-아키텍처-기준서.md` | 필수 |
| Edge POS 설계 | `04-Edge-POS-아키텍처-설계서.md` | 필수 |
| 전체 흐름 | `05-Edge-POS-전체-흐름-AZ-가이드.md` | 필수 |
| DB 설계 | `DB설계/` | OrderSlip, OrderItem 테이블 |
| 화면 인벤토리 | `_index.md` | 필수 |

## 3. 화면 기능 목록
| ID | 기능명 | 설명 | 사용자 액션 | 우선순위 |
|---|---|---|---|---|
| FN-001 | 메뉴 항목 선택 (주문 추가) | 25개 메뉴 버튼 그리드에서 메뉴 선택 시 주문 항목 추가 | 메뉴 버튼 터치 | P0 |
| FN-002 | 메뉴 그룹 탭 전환 | 12개 그룹 탭으로 메뉴 분류 전환 | 그룹 탭 터치 | P0 |
| FN-003 | 메뉴 그룹 페이지 이동 | 그룹 탭 페이지 이전/다음 이동 | 이전/다음 버튼 터치 | P1 |
| FN-004 | 주문 완료 | 현재 주문을 확정하고 저장 | 주문완료 버튼 터치 | P0 |
| FN-005 | 주문 닫기/취소 | 주문 화면을 닫고 테이블 화면으로 복귀 | 닫기 버튼 터치 | P0 |
| FN-006 | 결제 진입 | 결제 화면으로 라우팅 | 결제 버튼 터치 | P0 |
| FN-007 | 개별 취소 | 선택된 주문 항목 1개 취소 | 개별취소 버튼 터치 | P0 |
| FN-008 | 전체 취소 | 현재 주문 전체 취소 | 전체취소 버튼 터치 | P0 |
| FN-009 | 할인 적용 | 선택 항목에 할인 적용 | 할인 버튼 터치 | P0 |
| FN-010 | 서비스 적용 | 선택 항목에 서비스(무료) 적용 | 서비스 버튼 터치 | P1 |
| FN-011 | 포장 설정 | 주문을 포장 주문으로 설정 | 포장 버튼 터치 | P1 |
| FN-012 | 배달 설정 | 주문을 배달 주문으로 설정 | 배달 버튼 터치 | P1 |
| FN-013 | 수량 -1 | 선택 항목 수량 1 감소 | 수량-1 버튼 터치 | P0 |
| FN-014 | 숫자 입력 (넘패드) | 수량 직접 입력을 위한 숫자 패드 | 숫자 버튼 터치 | P0 |
| FN-015 | 수량 입력 확정 | 넘패드로 입력한 수량 확정 적용 | 수량입력 버튼 터치 | P0 |
| FN-016 | 주문 인쇄 | 현재 주문 내역 인쇄 | 주문인쇄 버튼 터치 | P1 |
| FN-017 | 회원 검색 | 고객/회원 검색 모달 호출 | 회원검색 버튼 터치 | P1 |
| FN-018 | 고객번호 입력 | 고객번호 직접 입력 | 고객번호 버튼 터치 | P1 |
| FN-019 | 행 변경 (주문라인 선택) | 주문 목록에서 특정 라인 선택 | 행변경 버튼 터치 | P1 |
| FN-020 | 주문 목록 스크롤 | 주문 목록 위/아래 스크롤 | 스크롤 버튼 터치 | P2 |
| FN-021 | 선택 버튼 | 메뉴 그리드에서 선택 확정 | 선택 버튼 터치 | P0 |
| FN-022 | 주방 메모 | 주문에 주방 전달 메모 추가 | 주문메모 버튼 터치 | P1 |
| FN-023 | 테이블 담당자 설정 | 테이블에 담당 직원 지정 | 테이블담당자 버튼 터치 | P2 |
| FN-024 | 판매 관리 | 별도 판매 관리 화면으로 이동 | 판매관리 버튼 터치 | P2 |
| FN-025 | 근태 버튼 | 직원 출/퇴근 기록 | 근태 버튼 터치 | P2 |
| FN-026 | 최소화 | CEF 윈도우 최소화 | 최소화 영역 터치 | P2 |
| FN-027 | 수량 위/아래 스크롤 | 주문 항목 수량 증감 스크롤 | 수량 스크롤 버튼 터치 | P1 |
| FN-028 | 주문 기능 버튼 (설정 가능) | 11개 커스텀 버튼, 매장 설정에 따라 동적 매핑 | 커스텀 버튼 터치 | P2 |

## 4. UI 구조
### 4.1 화면 구성
- **상단**: 테이블 번호, 인원수, 고객 번호, 근태 버튼, 주문인쇄 버튼, 닫기 버튼, 최소화 영역
- **좌측 본문**: 주문 목록 그리드 (MFCGridCtrl -> React 가상화 리스트), 주문 금액/할인/총액 요약, 수량 입력 영역, 회원 검색 영역
- **우측 본문**: 메뉴 그룹 탭 (2행 x 5열 + 페이지 이동), 메뉴 버튼 그리드 (5행 x 5열)
- **하단**: 주문 기능 버튼 (IDC_OR_BTN1~11), 주문 액션 버튼 (할인, 서비스, 포장, 배달 등 숨김 영역)
- **모달**: 주방 메모 모달, 회원 검색 모달, 담당자 선택 모달

### 4.2 재사용 UI
| 컴포넌트 | 위치 | props로 바뀌는 값 | 비고 |
|---|---|---|---|
| Numpad | `shared/ui/molecules/Numpad` | value, onConfirm, onClear | 수량 입력, 결제 화면에서도 재사용 |
| HeaderBar | `shared/ui/organisms/HeaderBar` | tableNumber, personCount, onMinimize | 근태, 최소화 포함 |
| Select | `shared/ui/atoms/Select` | options, value, onChange | 드롭다운 필터 |
| Input | `shared/ui/atoms/Input` | value, onChange, type | 수량 입력 필드 |

## 5. 구현 명세
### 5.1 상태 소유권
| 상태 | 소유 계층 | 원본 | 비고 |
|---|---|---|---|
| 주문 항목 목록 | RTK Query 캐시 | orderApi.getOrderItems | 서버 상태 |
| 주문 요약 (금액/할인/총액) | RTK Query 캐시 | orderApi.getOrderDetail | 서버 상태 |
| 테이블 정보 | RTK Query 캐시 | tableApi.getTableDetail | 서버 상태 |
| 메뉴 목록 | RTK Query 캐시 | itemApi.getItemsByGroup | 서버 상태 |
| 넘패드 입력값 | UI slice / 로컬 상태 | - | 임시 입력 |
| 선택된 주문 라인 | UI slice | uiSlice.selectedOrderLine | 화면 상태 |
| 메뉴 그룹 탭 현재 페이지 | UI slice / 로컬 상태 | - | 화면 상태 |

### 5.2 Bridge 계약
| Command | Request | Response | Error | Idempotency | 비고 |
|---|---|---|---|---|---|
| ORDER:ADD_ITEM | `{ tableId, itemId, qty, options?: [{ optionId, qty }], kitchenMemo?: string }` | `{ orderSlip: { id, tableId, items: [...], totalAmount } }` | `TABLE_NOT_SELECTED`, `ITEM_NOT_FOUND`, `ITEM_SOLD_OUT`, `INVALID_QTY` | `ORDER:ADD_ITEM:{tableId}:{itemId}:{timestamp}` | P0 |
| ORDER:COMPLETE | `{ tableId }` | `{ orderSlip: { id, status: "COMPLETED", totalAmount } }` | `TABLE_NOT_SELECTED`, `ORDER_EMPTY` | `ORDER:COMPLETE:{orderSlipId}` | P0 |
| ORDER:REMOVE_ITEM | `{ tableId, orderItemId }` | `{ orderSlip: { id, items: [...], totalAmount } }` | `ORDER_ITEM_NOT_FOUND`, `ORDER_ALREADY_COMPLETED`, `PERMISSION_DENIED` | `ORDER:REMOVE_ITEM:{orderItemId}` | P0 |
| ORDER:CANCEL | `{ tableId, reason?: string }` | `{ orderSlip: { id, status: "CANCELLED" } }` | `ORDER_EMPTY`, `ORDER_ALREADY_COMPLETED`, `PERMISSION_DENIED` | `ORDER:CANCEL:{orderSlipId}` | P0 |
| ORDER:APPLY_DISCOUNT | `{ tableId, orderItemId?, discountType, discountValue }` | `{ orderSlip: { id, items: [...], discountAmount, totalAmount } }` | `INVALID_DISCOUNT`, `ORDER_ITEM_NOT_FOUND`, `PERMISSION_DENIED` | `ORDER:APPLY_DISCOUNT:{orderSlipId}:{timestamp}` | P0 |
| ORDER:MODIFY_QTY | `{ tableId, orderItemId, newQty }` | `{ orderSlip: { id, items: [...], totalAmount } }` | `ORDER_ITEM_NOT_FOUND`, `INVALID_QTY`, `ORDER_ALREADY_COMPLETED` | `ORDER:MODIFY_QTY:{orderItemId}:{timestamp}` | P0 |
| ORDER:PRINT | `{ tableId, printType: "kitchen" \| "customer" }` | `{ success: true }` | `PRINTER_NOT_CONNECTED`, `PRINT_FAILED` | - | P1 |
| ORDER:SET_KITCHEN_MEMO | `{ tableId, orderItemId, memo: string }` | `{ success: true }` | `ORDER_ITEM_NOT_FOUND` | - | P1 |
| ORDER:APPLY_SERVICE | `{ tableId, orderItemId }` | `{ orderSlip: { id, items: [...] } }` | `ORDER_ITEM_NOT_FOUND`, `ALREADY_SERVICE` | `ORDER:APPLY_SERVICE:{orderItemId}:{timestamp}` | P1 |
| ORDER:SET_PACKING | `{ tableId, orderItemId }` | `{ orderSlip: { id, items: [...] } }` | `ORDER_ITEM_NOT_FOUND` | `ORDER:SET_PACKING:{orderItemId}:{timestamp}` | P1 |
| ORDER:SET_DELIVERY | TODO: 배달 연동 설계 완료 후 확정 필요 — 확인 필요: 배달앱 연동 시 ExternalBridge 경유 여부 | TODO | TODO | TODO | P1 |
| ITEM:GET_LIST | `{ groupCode }` | `{ items: [{ id, name, price, groupName, barcode }] }` | (없음, 빈 배열) | - | P0 |
| CUSTOMER:SEARCH | TODO: 고객 도메인 설계 완료 후 확정 필요 — 확인 필요: 고객 검색 범위(로컬/중앙) | TODO | TODO | TODO | P1 |
| STAFF:SELECT | TODO: 직원 도메인 설계 완료 후 확정 필요 | TODO | TODO | TODO | P2 |
| STAFF:CLOCK_IN_OUT | TODO: 직원 도메인 설계 완료 후 확정 필요 | TODO | TODO | TODO | P2 |

### 5.3 UseCase 계약
| UseCase | Trigger | Input | Transaction | Lock | Output | 실패 규칙 |
|---|---|---|---|---|---|---|
| AddOrderItemUseCase | ORDER:ADD_ITEM | tableId, itemId, qty, options?, kitchenMemo? | SQLite 단일 트랜잭션 (OrderSlip + OrderItem INSERT/UPDATE 원자적) | tableId 단위 | orderSlip | 멱등성: 동일 requestId+idempotencyKey → 이전 결과 반환. 품절: ITEM_SOLD_OUT → 추가 거부. 오프라인: 로컬 DB만 사용, 정상 동작. 커밋 후: PosRealTimeSender → ORDER_UPDATED |
| CompleteOrderUseCase | ORDER:COMPLETE | tableId | SQLite + Outbox 트랜잭션 (OrderSlip status UPDATE + Outbox INSERT 원자적) | orderSlipId | orderSlip | 멱등성: 동일 requestId → 이전 결과. 빈 주문: ORDER_EMPTY → 거부. 커밋 후: PosRealTimeSender → ORDER_COMPLETED + 주방 인쇄 트리거(비동기) |
| RemoveOrderItemUseCase | ORDER:REMOVE_ITEM | tableId, orderItemId | SQLite 단일 트랜잭션 | orderSlipId | orderSlip | 멱등성: 동일 requestId → 이전 결과. 이미 삭제된 항목: 무시(성공 반환). 결제 완료 주문: ORDER_ALREADY_COMPLETED → 거부. 권한: 관리자 또는 권한 직원만 가능, 아니면 PERMISSION_DENIED. 커밋 후: PosRealTimeSender → ORDER_UPDATED |
| CancelOrderUseCase | ORDER:CANCEL | tableId, reason? | SQLite 단일 트랜잭션 | orderSlipId | orderSlip | 멱등성: 동일 requestId → 이전 결과. 이미 결제된 주문: ORDER_ALREADY_COMPLETED → 거부. 권한: 관리자 또는 권한 직원만, 아니면 PERMISSION_DENIED. 커밋 후: PosRealTimeSender → ORDER_CANCELLED |
| ApplyDiscountUseCase | ORDER:APPLY_DISCOUNT | tableId, orderItemId?, discountType, discountValue | SQLite 단일 트랜잭션 | orderSlipId | orderSlip | 멱등성: 동일 requestId → 이전 결과. 잘못된 할인: INVALID_DISCOUNT → 거부. 권한: 관리자 또는 권한 직원만, 아니면 PERMISSION_DENIED. 커밋 후: PosRealTimeSender → ORDER_UPDATED |
| ModifyOrderQtyUseCase | ORDER:MODIFY_QTY | tableId, orderItemId, newQty | SQLite 단일 트랜잭션 | orderSlipId | orderSlip | 멱등성: 동일 requestId → 이전 결과. 수량 0 이하: 항목 삭제 처리. 결제 완료: ORDER_ALREADY_COMPLETED → 거부. 커밋 후: PosRealTimeSender → ORDER_UPDATED |
| PrintOrderUseCase | ORDER:PRINT | tableId, printType | 없음 (비동기 후처리) | - | success | 프린터 미연결: PRINTER_NOT_CONNECTED. 인쇄 실패: PRINT_FAILED (Device Error 코드 기반). 멱등성 불필요 (부수효과 전용) |
| ApplyServiceUseCase | ORDER:APPLY_SERVICE | tableId, orderItemId | SQLite 단일 트랜잭션 | orderSlipId | orderSlip | 멱등성: 동일 requestId → 이전 결과. 이미 서비스: ALREADY_SERVICE → 거부. 커밋 후: PosRealTimeSender → ORDER_UPDATED |
| SetPackingUseCase | ORDER:SET_PACKING | tableId, orderItemId | SQLite 단일 트랜잭션 | orderSlipId | orderSlip | 멱등성: 동일 requestId → 이전 결과. 커밋 후: PosRealTimeSender → ORDER_UPDATED |
| SearchCustomerUseCase | CUSTOMER:SEARCH | TODO: 고객 도메인 설계 완료 후 확정 필요 | TODO | TODO | TODO | TODO |
| ClockInOutUseCase | STAFF:CLOCK_IN_OUT | TODO: 직원 도메인 설계 완료 후 확정 필요 | TODO | TODO | TODO | TODO |

### 5.4 Domain / Manager / Store
| 항목 | 책임 | 파일 / 모듈 | 비고 |
|---|---|---|---|
| OrderMgr | 주문 생성/수정/취소/완료 업무 계산 | `Domain/Order/OrderMgr` | 핵심 |
| ItemMgr | 메뉴 항목 조회, 가격 계산 | `Domain/Item/ItemMgr` | 핵심 |
| CustMgr | 고객 검색/조회 | `Domain/Customer/CustMgr` | P1 |
| StaffMgr | 담당자/근태 관리 | `Domain/Staff/StaffMgr` | P2 |
| RequestLedgerStore | 요청 멱등성/상태 추적 | `Infrastructure/Persistence/SQLite/Stores/RequestLedgerStore` | 운영 저장소 |
| OutboxStore | 중앙 서버 동기화 대기열 | `Infrastructure/Persistence/SQLite/Stores/OutboxStore` | 운영 저장소 |

### 5.5 DB / CentralApi / Sync / Realtime
| 연동 대상 | 역할 | 데이터 흐름 | 비고 |
|---|---|---|---|
| SQLite (OrderSlip) | 주문 전표 영속화 | UseCases → SQLite → Outbox | Offline-First |
| SQLite (OrderItem) | 주문 항목 영속화 | UseCases → SQLite | Offline-First |
| SQLite (Item) | 메뉴 항목 조회 | ItemMgr → SQLite (읽기 전용) | 마스터 데이터 |
| OutboxStore | 주문 완료 시 중앙 동기화 | CompleteOrderUseCase → OutboxStore | Sync 대상: OrderSlip(status=COMPLETED) + OrderItem 전체. 비동기 |
| RequestLedgerStore | 주문 변경 요청 멱등성 추적 | UseCases → Ledger | 상태: RECEIVED → PROCESSING → SUCCEEDED/FAILED |
| PosRealTimeSender | 주문 변경 시 UI 갱신 이벤트 | UseCases → PosRealTimeSender → PosUi | 단방향. 이벤트: ORDER_UPDATED, ORDER_COMPLETED, ORDER_CANCELLED |
| Device/Printer | 주문 인쇄 | PrintOrderUseCase → Printer | 비동기 후처리 |
| CentralApi | 주문 완료 데이터 수신 | Outbox → SyncWorker → CentralApi | Sync 대상 확정: 주문 완료 전표 + 항목 |

### 5.6 i18n / Error / Permission
| 항목 | 규칙 | 비고 |
|---|---|---|
| i18n | `BrandPosApp/PosUi/src/i18n/locales/` 기반 msgKey | KR/EN/VN 3개 언어 |
| Error | Device Error는 코드 기반 (type, device, code, msgKey, severity, recoverable, retryable, action) | 완성 문장 하드코딩 금지 |
| Permission — 주문 추가/수정 | 로그인 직원 전원 | ORDER:ADD_ITEM, ORDER:MODIFY_QTY, ORDER:SET_KITCHEN_MEMO |
| Permission — 주문 취소 | 관리자 또는 권한 직원. 미충족 시 PERMISSION_DENIED | ORDER:REMOVE_ITEM, ORDER:CANCEL |
| Permission — 할인 적용 | 관리자 또는 권한 직원. 미충족 시 PERMISSION_DENIED | ORDER:APPLY_DISCOUNT |
| Permission — 서비스 적용 | 로그인 직원 전원 | ORDER:APPLY_SERVICE |
| Permission — 주문 인쇄 | 로그인 직원 전원 | ORDER:PRINT |
| Permission — 결제 진입 | 로그인 직원 전원 | → handoff: oracc-bselect.md |

## 6. 테스트
| 테스트 항목 | 범위 | 기대 결과 | 유형 |
|---|---|---|---|
| 메뉴 선택 시 주문 추가 | OrderScreen + AddOrderItemUseCase | ORDER:ADD_ITEM 호출 → 주문 목록에 항목 추가, totalAmount 갱신, PosRealTime ORDER_UPDATED 수신 | 통합 |
| 수량 변경 | OrderScreen + ModifyOrderQtyUseCase | ORDER:MODIFY_QTY 호출 → 수량 변경 후 금액 재계산, 0 이하 시 항목 삭제 | 통합 |
| 주문 완료 | CompleteOrderUseCase | ORDER:COMPLETE 호출 → OrderSlip status COMPLETED, Outbox PENDING, PosRealTime ORDER_COMPLETED + 주방 인쇄(비동기) | 통합 |
| 개별 취소 (권한 검증) | RemoveOrderItemUseCase | 관리자/권한 직원: 항목 삭제 + 금액 재계산. 일반 직원: PERMISSION_DENIED 반환 | 통합 |
| 전체 취소 (권한 검증) | CancelOrderUseCase | 관리자/권한 직원: 전체 삭제 + ORDER_CANCELLED. 결제 완료 주문: ORDER_ALREADY_COMPLETED | 통합 |
| 멱등성 검증 | AddOrderItemUseCase 중복 호출 | 동일 requestId+idempotencyKey 시 이전 결과 반환, DB 중복 INSERT 없음 | 단위 |
| 오프라인 주문 | Offline 상태에서 주문 완료 | SQLite 저장 성공, Outbox PENDING, 네트워크 복구 후 Sync | 통합 |
| 품절 상품 주문 시도 | AddOrderItemUseCase + 품절 상품 | ITEM_SOLD_OUT 에러 반환, 주문 목록 변경 없음 | 단위 |
| 메뉴 그룹 전환 | MenuGroupTabs | 탭 전환 시 해당 그룹 메뉴 표시 | UI |
| 넘패드 수량 입력 | Numpad + OrderActionBar | 숫자 입력 후 확정 시 수량 반영 | UI |
| 할인 적용 (권한 검증) | ApplyDiscountUseCase | 관리자/권한 직원: 할인 적용 + 금액 재계산. 일반 직원: PERMISSION_DENIED | 통합 |

## 7. 완료 기준
- [ ] UI: screens/OrderScreen 전체 컴포넌트 구현
- [ ] Bridge: ORDER:*, ITEM:GET_LIST 커맨드 구현
- [ ] UseCase: AddOrderItem, CompleteOrder, RemoveOrderItem, CancelOrder, ApplyDiscount, ModifyOrderQty, PrintOrder
- [ ] RTK Query: orderApi, itemApi endpoint 구현
- [ ] PosRealTime: 주문 변경 이벤트 수신/처리
- [ ] i18n: 주문 화면 관련 키 등록
- [ ] 테스트: 통합 테스트 + UI 테스트
- [ ] 문서 DONE

## 8. 작업 명단
| 작업 | 파일 | 상태 |
|---|---|---|
| OrderScreen 메인 | `BrandPosApp/PosUi/src/screens/OrderScreen/index.tsx` | TODO |
| MenuGrid | `BrandPosApp/PosUi/src/screens/OrderScreen/components/MenuGrid.tsx` | TODO |
| MenuGroupTabs | `BrandPosApp/PosUi/src/screens/OrderScreen/components/MenuGroupTabs.tsx` | TODO |
| OrderList | `BrandPosApp/PosUi/src/screens/OrderScreen/components/OrderList.tsx` | TODO |
| OrderSummary | `BrandPosApp/PosUi/src/screens/OrderScreen/components/OrderSummary.tsx` | TODO |
| OrderHeader | `BrandPosApp/PosUi/src/screens/OrderScreen/components/OrderHeader.tsx` | TODO |
| OrderActionBar | `BrandPosApp/PosUi/src/screens/OrderScreen/components/OrderActionBar.tsx` | TODO |
| CustomActionGrid | `BrandPosApp/PosUi/src/screens/OrderScreen/components/CustomActionGrid.tsx` | TODO |
| KitchenMemoModal | `BrandPosApp/PosUi/src/screens/OrderScreen/components/KitchenMemoModal.tsx` | TODO |
| CustomerSearchModal | `BrandPosApp/PosUi/src/screens/OrderScreen/components/CustomerSearchModal.tsx` | TODO |
| StaffSelectModal | `BrandPosApp/PosUi/src/screens/OrderScreen/components/StaffSelectModal.tsx` | TODO |
| Numpad | `BrandPosApp/PosUi/src/shared/ui/molecules/Numpad.tsx` | TODO |
| HeaderBar | `BrandPosApp/PosUi/src/shared/ui/organisms/HeaderBar.tsx` | TODO |
| orderApi | `BrandPosApp/PosUi/src/store/api/orderApi.ts` | TODO |
| itemApi | `BrandPosApp/PosUi/src/store/api/itemApi.ts` | TODO |
| customerApi | `BrandPosApp/PosUi/src/store/api/customerApi.ts` | TODO |
| AddOrderItemUseCase | `BrandPosApp/UseCases/Order/AddOrderItemUseCase.cpp/.h` | TODO |
| CompleteOrderUseCase | `BrandPosApp/UseCases/Order/CompleteOrderUseCase.cpp/.h` | TODO |
| RemoveOrderItemUseCase | `BrandPosApp/UseCases/Order/RemoveOrderItemUseCase.cpp/.h` | TODO |
| CancelOrderUseCase | `BrandPosApp/UseCases/Order/CancelOrderUseCase.cpp/.h` | TODO |
| ApplyDiscountUseCase | `BrandPosApp/UseCases/Order/ApplyDiscountUseCase.cpp/.h` | TODO |
| ModifyOrderQtyUseCase | `BrandPosApp/UseCases/Order/ModifyOrderQtyUseCase.cpp/.h` | TODO |
| PrintOrderUseCase | `BrandPosApp/UseCases/Order/PrintOrderUseCase.cpp/.h` | TODO |
| OrderMgr | `BrandPosApp/Domain/Order/OrderMgr.cpp/.h` | TODO |
| ItemMgr | `BrandPosApp/Domain/Item/ItemMgr.cpp/.h` | TODO |
| OrderActions (thin router) | `BrandPosApp/Presentation/CEF/InternalBridge/PosRequestActions/Order/OrderActions.cpp/.h` | TODO |
| OrderItemCrud | `BrandPosApp/Infrastructure/Persistence/SQLite/Tables/Order/OrderItemCrud.cpp/.h` | TODO |
| OrderSlipCrud | `BrandPosApp/Infrastructure/Persistence/SQLite/Tables/Order/OrderSlipCrud.cpp/.h` | TODO |

## 9. 작업 진행 기록
| 날짜 | 범위 | 상태 | 완료 범위 | 남은 범위 | 내용 |
|---|---|---|---|---|---|
| 2026-04-05 | Shell 구현 | 완료 | 레이아웃+로컬상태+stub | Bridge/UseCase 연동 | OrderScreen/index.tsx shell 구현 완료. SplitPanelLayout, Header, CategoryBar, MenuGrid, OrderItemList, NumPad, Button 재사용. 메뉴 그룹 탭(2행x5열+페이징), 25개 메뉴 그리드, 주문 목록, 수량 넘패드, 주문 요약, 11개 커스텀 액션 버튼, 전체 기능 버튼 stub 포함. |

---
## Appendix: 레거시 UI 요소 참조

### 기본 정보

| 항목 | 값 |
|------|---|
| 다이얼로그 ID | IDD_ORDER_DIALOG |
| 리소스 값 | 174 |
| 크기 (DLU) | 528 x 380 |
| 다이얼로그 타입 | DIALOGEX |
| 스타일 | DS_SETFONT \| WS_POPUP |
| 폰트 | 10, "System", 0, 0, 0x0 |
| 소스 파일 | Restaurant.rc |
| 총 UI 요소 수 | 100 |

### UI 요소 목록

#### 버튼 (87개)

| ID | 라벨 | 위치 (x,y) | 크기 (w x h) | 숨김 | 스타일 | 용도 추정 |
|---|---|---|---|---|---|---|
| IDC_O_SELECT | 선택 | (447,286) | 50 x 24 | FALSE | BS_OWNERDRAW \| WS_TABSTOP | 선택 버튼 |
| IDC_O_TABLEEMP | 테이블담당자 | (7,48) | 17 x 7 | **TRUE** | BS_OWNERDRAW \| NOT WS_VISIBLE \| WS_DISABLED \| WS_TABSTOP | 테이블 담당자 버튼 |
| IDC_O_DISCOUNT | 할인 | (24,48) | 17 x 7 | **TRUE** | BS_OWNERDRAW \| NOT WS_VISIBLE \| WS_DISABLED \| WS_TABSTOP | 할인 버튼 |
| IDC_O_KITCHENMEMO | 주문메모 | (41,48) | 17 x 7 | **TRUE** | BS_OWNERDRAW \| NOT WS_VISIBLE \| WS_DISABLED \| WS_TABSTOP | 주문 메모 버튼 |
| IDOK | 주문완료 | (58,48) | 17 x 7 | **TRUE** | BS_OWNERDRAW \| NOT WS_VISIBLE \| WS_DISABLED \| WS_TABSTOP | 확인/완료 버튼 |
| IDC_O_ACCOUNT | 결제 | (7,41) | 17 x 7 | **TRUE** | BS_OWNERDRAW \| NOT WS_VISIBLE \| WS_DISABLED \| WS_TABSTOP | 결제 버튼 |
| IDC_O_ONECALLBACK | 개별취소 | (24,41) | 17 x 7 | **TRUE** | BS_OWNERDRAW \| NOT WS_VISIBLE \| WS_DISABLED \| WS_TABSTOP | 개별 취소 버튼 |
| IDC_O_TOTALCALLBACK | 전체취소 | (41,41) | 17 x 7 | **TRUE** | BS_OWNERDRAW \| NOT WS_VISIBLE \| WS_DISABLED \| WS_TABSTOP | 전체 취소 버튼 |
| IDC_O_SALEMANAGE | 판매관리 | (58,41) | 17 x 7 | **TRUE** | BS_OWNERDRAW \| NOT WS_VISIBLE \| WS_DISABLED \| WS_TABSTOP | 판매 관리 버튼 |
| IDC_O_NUMBERBACK | 수량-1 | (7,34) | 17 x 7 | **TRUE** | BS_OWNERDRAW \| NOT WS_VISIBLE \| WS_DISABLED \| WS_TABSTOP | 수량 -1 버튼 |
| IDC_O_SERVICE | 서비스 | (24,34) | 17 x 7 | **TRUE** | BS_OWNERDRAW \| NOT WS_VISIBLE \| WS_DISABLED \| WS_TABSTOP | 서비스 버튼 |
| IDC_O_PACKING | 포장 | (41,34) | 17 x 7 | **TRUE** | BS_OWNERDRAW \| NOT WS_VISIBLE \| WS_DISABLED \| WS_TABSTOP | 포장 버튼 |
| IDC_O_DELIVERY | 배달 | (58,34) | 17 x 7 | **TRUE** | BS_OWNERDRAW \| NOT WS_VISIBLE \| WS_DISABLED \| WS_TABSTOP | 배달 버튼 |
| IDC_O_LINECHANGE | 행변경 | (12,214) | 50 x 16 | FALSE | BS_OWNERDRAW \| WS_TABSTOP | 행 변경 버튼 |
| IDC_O_TOPMENU1~10 | GRP01~10 | 다수 | 44 x 29 | **TRUE** | BS_OWNERDRAW \| NOT WS_VISIBLE \| WS_DISABLED \| WS_TABSTOP | 메뉴 그룹 탭 버튼 (10개) |
| IDC_O_TOPMENU14, 15 | 이전/다음 | (474,44), (474,76) | 26 x 29 | FALSE | BS_OWNERDRAW \| WS_TABSTOP | 메뉴 그룹 페이지 이동 |
| IDCANCEL | 닫기 | (454,9) | 55 x 20 | FALSE | BS_OWNERDRAW \| WS_TABSTOP | 닫기/취소 버튼 |
| IDC_O_BACK, IDC_O_NEXT | 이전/다음 | (449,248), (476,248) | 26 x 29 | FALSE | BS_OWNERDRAW \| WS_TABSTOP | 메뉴 페이지 이동 |
| IDC_O_MENU00~44 | 메뉴 | 다수 | 51 x 29 | **TRUE** | BS_OWNERDRAW \| BS_MULTILINE \| NOT WS_VISIBLE \| WS_DISABLED \| WS_TABSTOP | 메뉴 버튼 (25개) |
| IDC_O_NUM0~9 | 0~9 | 다수 | 29 x 28 | **TRUE** | BS_OWNERDRAW \| NOT WS_VISIBLE \| WS_DISABLED \| WS_TABSTOP | 숫자 버튼 (10개) |
| IDC_O_NUMCLR | CLR | (199,289) | 29 x 28 | **TRUE** | BS_OWNERDRAW \| NOT WS_VISIBLE \| WS_DISABLED \| WS_TABSTOP | 클리어 버튼 |
| IDC_O_NUMBS | BS | (199,259) | 29 x 28 | **TRUE** | BS_OWNERDRAW \| NOT WS_VISIBLE \| WS_DISABLED \| WS_TABSTOP | 백스페이스 버튼 |
| IDC_O_NUMINPUT | 수량입력 | (106,350) | 39 x 28 | FALSE | BS_OWNERDRAW \| WS_TABSTOP | 수량 입력 버튼 |
| IDC_O_ORDERPRINT | 주문인쇄 | (396,8) | 36 x 20 | FALSE | BS_OWNERDRAW \| WS_TABSTOP | 주문 인쇄 버튼 |
| IDC_O_CUSTSERCH | 회원검색 | (190,350) | 39 x 28 | FALSE | BS_OWNERDRAW \| WS_TABSTOP | 회원 검색 버튼 |
| IDC_CUSTNUM | 고객번호 | (148,350) | 39 x 28 | FALSE | BS_OWNERDRAW \| WS_TABSTOP | 고객번호 버튼 |
| IDC_O_UP, IDC_O_DOWN | 스크롤 | (207,41), (207,164) | 16 x 48 | FALSE | BS_OWNERDRAW \| WS_TABSTOP | 주문 목록 위/아래 |
| IDC_OR_BTN1~11 | 1~11 | 다수 | 61 x 24~35 | FALSE | BS_OWNERDRAW \| WS_TABSTOP | 주문 기능 버튼 (11개) |
| IDC_O_MINIMIZE | 최소화 | (5,6) | 98 x 25 | FALSE | - | 최소화 버튼 |
| IDC_O_DILIGENCE | 근태 | (234,9) | 23 x 23 | FALSE | - | 근태 버튼 |
| IDC_O_NUMBERADD2, IDC_O_NUMBER_BACK | 수량 스크롤 | (208,92), (208,131) | 16 x 30 | FALSE | BS_OWNERDRAW \| WS_TABSTOP | 수량 위/아래 스크롤 |

#### 텍스트/라벨 (10개)

| ID | 텍스트 | 위치 (x,y) | 크기 (w x h) | 숨김 | 정렬 | 용도 추정 |
|---|---|---|---|---|---|---|
| IDC_O_TABLENUM | (동적) | (110,13) | 110 x 19 | FALSE | 가운데 | 테이블 번호 표시 |
| IDC_O_CUSTCARD | 고객카드 | (84,46) | 25 x 8 | **TRUE** | 가운데 | 고객 카드 |
| IDC_O_PERSON | (동적) | (258,15) | 44 x 14 | FALSE | 가운데 | 인원수 표시 |
| IDC_O_CUSTNUM | (동적) | (333,15) | 46 x 14 | FALSE | 가운데 | 고객 번호 표시 |
| IDC_O_ORDERMONEY | 0 | (11,362) | 84 x 14 | FALSE | 오른쪽 | 주문 금액 표시 |
| IDC_O_DISMONEY | 0 | (11,332) | 84 x 14 | FALSE | 오른쪽 | 할인 금액 표시 |
| IDC_O_TOTALMONEY | 0 | (11,302) | 84 x 14 | FALSE | 오른쪽 | 총 금액 표시 |
| IDC_O_CUSTIN | 고객입장 | (109,46) | 25 x 8 | **TRUE** | 가운데 | 고객 입장 |
| IDC_O_CUSTPOINT | 고객포인트 | (84,37) | 25 x 8 | **TRUE** | 가운데 | 고객 포인트 |
| IDC_O_TABLEMSG | (동적) | (70,216) | 150 x 13 | FALSE | 왼쪽 | 테이블 메시지 표시 |

#### 입력 필드 (1개)

| ID | 타입 | 위치 (x,y) | 크기 (w x h) | 숨김 | 스타일 | 용도 추정 |
|---|---|---|---|---|---|---|
| IDC_O_SNUM | EditText | (114,241) | 105 x 13 | FALSE | ES_RIGHT \| ES_AUTOHSCROLL \| ES_NUMBER \| NOT WS_BORDER | 수량 입력 |

#### 그리드/리스트 (2개)

| ID | 타입 | 위치 (x,y) | 크기 (w x h) | 숨김 | 용도 추정 |
|---|---|---|---|---|---|
| IDC_CUSTLIST | ListBox | (7,239) | 94 x 42 | FALSE | 데이터 표시 영역 |
| IDC_GRID | MFCGridCtrl | (3,56) | 204 x 156 | FALSE | 데이터 그리드 |

### 요소 통계

| 유형 | 개수 |
|------|------|
| 버튼 | 87 |
| 텍스트/라벨 | 10 |
| 입력 필드 | 1 |
| 그리드/리스트 | 2 |
| 기타 | 0 |
| **합계** | **100** |
