# ORACC_DIALOG 화면 문서

## 0. 문서 정보
| 항목 | 값 |
|---|---|
| 화면명 | `ORACC_DIALOG` |
| 화면 ID | `IDD_ORACC_DIALOG` |
| 원본 파일 | `oracc-dialog.md` |
| 전환 우선순위 | `P0` |
| 담당 계층 | `PosUi / Presentation / UseCases / Domain / Infrastructure` |
| 상태 | `TODO` |

## 1. 화면 개요
- **화면 목적**: ORDER_DIALOG의 확장판으로, 주문+결제 기능을 하나의 화면에 통합한 복합 다이얼로그이다. 메뉴 선택/주문/결제를 한 화면에서 처리한다.
- **해결하는 사용자 문제**: 주문과 결제를 한 번에 처리해야 하는 매장 운영 흐름(즉시결제, 소규모 매장)을 지원한다.
- **진입 경로**: TableScreen에서 테이블 선택 후 진입 (매장 설정에 따라 ORDER_DIALOG 대신 진입)한다.
- **종료 경로**: 주문 완료(IDOK) 시 TableScreen 복귀, 닫기(IDCANCEL) 시 TableScreen 복귀한다.
- **관련 운영 주체**: 매장 직원 (주문+결제 통합 담당)

## 2. 상위 기준 연결
| 기준 | 연결 문서 | 비고 |
|---|---|---|
| 전체 아키텍처 | `00-Platform-최종-아키텍처-기준서.md` | 필수 |
| Edge POS 설계 | `04-Edge-POS-아키텍처-설계서.md` | 필수 |
| 전체 흐름 | `05-Edge-POS-전체-흐름-AZ-가이드.md` | 필수 |
| DB 설계 | `DB설계/` | OrderSlip, OrderItem, SellSlip, SellDetail 테이블 |
| 화면 인벤토리 | `_index.md` | 필수 |

## 3. 화면 기능 목록
| ID | 기능명 | 설명 | 사용자 액션 | 우선순위 |
|---|---|---|---|---|
| FN-001 | 메뉴 항목 선택 (주문 추가) | 25개 메뉴 버튼 그리드에서 메뉴 선택 시 주문 항목 추가 | 메뉴 버튼 터치 | P0 |
| FN-002 | 메뉴 그룹 탭 전환 | 12개 그룹 탭으로 메뉴 분류 전환 | 그룹 탭 터치 | P0 |
| FN-003 | 메뉴 페이지 이동 | 메뉴 그룹 페이지 이전/다음 | 이전/다음 버튼 터치 | P1 |
| FN-004 | 주문 완료 | 현재 주문 확정 저장 | 주문완료 버튼 터치 | P0 |
| FN-005 | 닫기 | 화면 닫고 복귀 | 닫기 버튼 터치 | P0 |
| FN-006 | 현금 결제 | 현금 결제 처리 | 현금 버튼 터치 | P0 |
| FN-007 | 카드 결제 | 카드 결제 처리 (카드 리더기 연동) | 카드 버튼 터치 | P0 |
| FN-008 | 결제 완료 | 결제 확정 | 결제완료 버튼 터치 | P0 |
| FN-009 | 결제 초기화 | 결제 내역 초기화 | 결제초기화 버튼 터치 | P0 |
| FN-010 | 개별 취소 | 선택 주문 항목 1개 취소 | 개별취소 버튼 터치 | P0 |
| FN-011 | 전체 취소 | 현재 주문 전체 취소 | 전체취소 버튼 터치 | P0 |
| FN-012 | 할인 적용 | 선택 항목에 할인 적용 | 할인 버튼 터치 | P0 |
| FN-013 | 서비스 적용 | 선택 항목에 서비스(무료) 적용 | 서비스 버튼 터치 | P1 |
| FN-014 | 포장 설정 | 주문을 포장 주문으로 설정 | 포장 버튼 터치 | P1 |
| FN-015 | 배달 설정 | 주문을 배달 주문으로 설정 | 배달 버튼 터치 | P1 |
| FN-016 | 수량 -1 | 선택 항목 수량 1 감소 | 수량-1 버튼 터치 | P0 |
| FN-017 | 주문 인쇄 | 주문 내역 인쇄 | 주문인쇄 버튼 터치 | P1 |
| FN-018 | 영수증 인쇄 | 영수증 인쇄 | 영수증인쇄 버튼 터치 | P1 |
| FN-019 | 주방 메모 | 주방 전달 메모 추가 | 주문메모 버튼 터치 | P1 |
| FN-020 | 테이블 담당자 설정 | 테이블에 담당 직원 지정 | 테이블담당자 버튼 터치 | P2 |
| FN-021 | 판매 관리 | 별도 판매 관리 화면으로 이동 | 판매관리 버튼 터치 | P2 |
| FN-022 | 행 변경 (주문라인 선택) | 주문 목록에서 특정 라인 선택 | 행변경 버튼 터치 | P1 |
| FN-023 | 주문 목록 스크롤 | 주문 목록 위/아래 스크롤 | 스크롤 버튼 터치 | P2 |
| FN-024 | 선택 버튼 | 메뉴 그리드에서 선택 확정 | 선택 버튼 터치 | P0 |
| FN-025 | 금전함 열기 | 금전함 장치 오픈 | 금전함 버튼 터치 | P2 |
| FN-026 | 기타결제 | 기타 결제 수단 처리 | 기타결제 버튼 터치 | P1 |
| FN-027 | 입력 & 고객 | 고객 검색/입력 모달 | 입력&고객 버튼 터치 | P1 |
| FN-028 | 현금영수증 | 현금영수증 발행 | 현금영수증 버튼 터치 | P1 |
| FN-029 | 미수결제 | 외상/미수 결제 처리 | 미수결제 버튼 터치 | P2 |
| FN-030 | 배달고객 (숨김) | 배달 고객 정보 조회 | 배달고객 버튼 터치 | P2 |
| FN-031 | 근태 버튼 | 직원 출/퇴근 기록 | 근태 버튼 터치 | P2 |
| FN-032 | 최소화 | CEF 윈도우 최소화 | 최소화 영역 터치 | P2 |
| FN-033 | 수량 위/아래 스크롤 | 주문 항목 수량 증감 | 수량 스크롤 버튼 터치 | P1 |
| FN-034 | 주문/결제 기능 버튼 (설정 가능) | 17개 커스텀 버튼, 매장 설정에 따라 동적 매핑 | 커스텀 버튼 터치 | P2 |

## 4. UI 구조
### 4.1 화면 구성
- **상단**: 테이블 번호, 인원수, 고객 번호, 근태 버튼, 주문인쇄 버튼, 영수증인쇄 버튼, 닫기 버튼, 최소화 영역
- **좌측 본문**: 주문 목록 그리드, 금액 요약 (총매출액/할인금액/주문금액/받은금액/거스름돈), 고객/결제 목록
- **우측 본문**: 메뉴 그룹 탭 (2행 x 5열 + 페이지 이동), 메뉴 버튼 그리드 (5행 x 5열)
- **하단 좌측**: 주문 액션 버튼 (숨김 영역: 결제, 취소, 할인, 서비스, 포장, 배달 등)
- **하단 우측**: 주문/결제 기능 버튼 (IDC_OA_BTN1~17)
- **모달**: 주방 메모 모달, 회원 검색 모달, 담당자 선택 모달, 배달고객 모달

### 4.2 재사용 UI
| 컴포넌트 | 위치 | props로 바뀌는 값 | 비고 |
|---|---|---|---|
| Numpad | `shared/ui/molecules/Numpad` | value, onConfirm, onClear | 수량 입력 (숨김) |
| HeaderBar | `shared/ui/organisms/HeaderBar` | tableNumber, personCount, onMinimize | 근태, 최소화 포함 |
| MenuGrid | ORDER_DIALOG과 동일 컴포넌트 공유 | groupCode, onItemSelect | 메뉴 버튼 그리드 |
| MenuGroupTabs | ORDER_DIALOG과 동일 컴포넌트 공유 | activeGroup, onGroupChange | 메뉴 그룹 탭 |
| OrderList | ORDER_DIALOG과 동일 컴포넌트 공유 | orderItems, selectedLine | 주문 목록 |
| OrderSummary | ORDER_DIALOG과 동일 컴포넌트 공유 | orderAmount, discount, total | 주문 금액 요약 |
| CustomActionGrid | ORDER_DIALOG과 동일 컴포넌트 공유 | buttonConfig, onAction | 커스텀 기능 버튼 |

## 5. 구현 명세
### 5.1 상태 소유권
| 상태 | 소유 계층 | 원본 | 비고 |
|---|---|---|---|
| 주문 항목 목록 | RTK Query 캐시 | orderApi.getOrderItems | 서버 상태 |
| 주문 요약 | RTK Query 캐시 | orderApi.getOrderDetail | 서버 상태 |
| 결제 내역 | RTK Query 캐시 | paymentApi.getPaymentDetail | 서버 상태 |
| 테이블 정보 | RTK Query 캐시 | tableApi.getTableDetail | 서버 상태 |
| 메뉴 목록 | RTK Query 캐시 | itemApi.getItemsByGroup | 서버 상태 |
| 받은 금액 / 거스름돈 | RTK Query 캐시 | paymentApi.getPaymentDetail | 서버 상태 |
| 선택된 주문 라인 | UI slice | uiSlice.selectedOrderLine | 화면 상태 |
| 넘패드 입력값 | UI 로컬 상태 | - | 임시 입력 |

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
| PAYMENT:CASH | `{ orderSlipId, amount }` | `{ success: true, paymentId }` | `INSUFFICIENT_AMOUNT`, `ORDER_NOT_FOUND` | `PAYMENT:CASH:{orderSlipId}:{timestamp}` | P0 |
| PAYMENT:CARD | `{ orderSlipId, amount }` | `{ success: true, paymentId, approvalNo }` | `CARD_READ_FAILED`, `CARD_APPROVAL_DENIED`, `CARD_READER_NOT_CONNECTED`, `ORDER_NOT_FOUND` | `PAYMENT:CARD:{orderSlipId}:{timestamp}` | P0 |
| PAYMENT:EXECUTE | `{ orderSlipId, paymentMethod, amount }` | `{ success: true, paymentId }` | `UNSUPPORTED_PAYMENT_METHOD`, `EXTERNAL_PG_ERROR`, `OFFLINE_EXTERNAL_BLOCKED` | `PAYMENT:EXECUTE:{orderSlipId}:{timestamp}` | P0 |
| PAYMENT:VOID | `{ paymentId }` | `{ success: true }` | `PAYMENT_NOT_FOUND`, `PAYMENT_ALREADY_CONFIRMED` | `PAYMENT:VOID:{paymentId}:{timestamp}` | P0 |
| ITEM:GET_LIST | `{ groupCode }` | `{ items: [{ id, name, price, groupName, barcode }] }` | (없음, 빈 배열) | - | P0 |
| ORDER:APPLY_SERVICE | `{ tableId, orderItemId }` | `{ orderSlip: { id, items: [...] } }` | `ORDER_ITEM_NOT_FOUND`, `ALREADY_SERVICE` | `ORDER:APPLY_SERVICE:{orderItemId}:{timestamp}` | P1 |
| ORDER:SET_PACKING | `{ tableId, orderItemId }` | `{ orderSlip: { id, items: [...] } }` | `ORDER_ITEM_NOT_FOUND` | `ORDER:SET_PACKING:{orderItemId}:{timestamp}` | P1 |
| ORDER:SET_DELIVERY | TODO: 배달 연동 설계 완료 후 확정 필요 — 확인 필요: 배달앱 연동 시 ExternalBridge 경유 여부 | TODO | TODO | TODO | P1 |
| CUSTOMER:SEARCH | TODO: 고객 도메인 설계 완료 후 확정 필요 — 확인 필요: 고객 검색 범위(로컬/중앙) | TODO | TODO | TODO | P1 |
| STAFF:SELECT | TODO: 직원 도메인 설계 완료 후 확정 필요 | TODO | TODO | TODO | P2 |
| STAFF:CLOCK_IN_OUT | TODO: 직원 도메인 설계 완료 후 확정 필요 | TODO | TODO | TODO | P2 |

### 5.3 UseCase 계약
| UseCase | Trigger | Input | Transaction | Lock | Output | 실패 규칙 |
|---|---|---|---|---|---|---|
| AddOrderItemUseCase | ORDER:ADD_ITEM | tableId, itemId, qty, options?, kitchenMemo? | SQLite 단일 트랜잭션 (OrderSlip + OrderItem INSERT/UPDATE 원자적) | tableId 단위 | orderSlip | 멱등성: 동일 requestId+idempotencyKey → 이전 결과 반환. 품절: ITEM_SOLD_OUT → 추가 거부. 오프라인: 로컬 DB만 사용, 정상 동작. 커밋 후: PosRealTimeSender → ORDER_UPDATED |
| CompleteOrderUseCase | ORDER:COMPLETE | tableId | SQLite + Outbox 트랜잭션 (OrderSlip status UPDATE + Outbox INSERT 원자적) | orderSlipId | orderSlip | 멱등성: 동일 requestId → 이전 결과. 빈 주문: ORDER_EMPTY → 거부. 커밋 후: PosRealTimeSender → ORDER_COMPLETED + 주방 인쇄 트리거(비동기) |
| RemoveOrderItemUseCase | ORDER:REMOVE_ITEM | tableId, orderItemId | SQLite 단일 트랜잭션 | orderSlipId | orderSlip | 멱등성: 동일 requestId → 이전 결과. 이미 삭제: 무시(성공). 결제 완료: ORDER_ALREADY_COMPLETED. 권한: 관리자/권한 직원만, 아니면 PERMISSION_DENIED. 커밋 후: PosRealTimeSender → ORDER_UPDATED |
| CancelOrderUseCase | ORDER:CANCEL | tableId, reason? | SQLite 단일 트랜잭션 | orderSlipId | orderSlip | 멱등성: 동일 requestId → 이전 결과. 결제 완료: ORDER_ALREADY_COMPLETED. 권한: 관리자/권한 직원만. 커밋 후: PosRealTimeSender → ORDER_CANCELLED |
| ApplyDiscountUseCase | ORDER:APPLY_DISCOUNT | tableId, orderItemId?, discountType, discountValue | SQLite 단일 트랜잭션 | orderSlipId | orderSlip | 멱등성: 동일 requestId → 이전 결과. 잘못된 할인: INVALID_DISCOUNT. 권한: 관리자/권한 직원만. 커밋 후: PosRealTimeSender → ORDER_UPDATED |
| ModifyOrderQtyUseCase | ORDER:MODIFY_QTY | tableId, orderItemId, newQty | SQLite 단일 트랜잭션 | orderSlipId | orderSlip | 멱등성: 동일 requestId → 이전 결과. 수량 0 이하: 항목 삭제. 결제 완료: ORDER_ALREADY_COMPLETED. 커밋 후: PosRealTimeSender → ORDER_UPDATED |
| ExecutePaymentUseCase | PAYMENT:CASH/CARD/EXECUTE | orderSlipId, paymentMethod, amount | SQLite + Ledger + Outbox 트랜잭션 | orderSlipId | success, paymentId | 멱등성: 동일 requestId+idempotencyKey → 이전 결과. 카드 승인 실패: Ledger FAILED, 롤백. 외부 PG 실패: EXTERNAL_PG_ERROR. 오프라인 시 외부 결제(카드/QR): OFFLINE_EXTERNAL_BLOCKED → 진입 차단. 현금 결제: 오프라인 가능. 커밋 후: PosRealTimeSender → PAYMENT_COMPLETED + Outbox PENDING |
| VoidPaymentUseCase | PAYMENT:VOID | paymentId | SQLite 단일 트랜잭션 | orderSlipId | success | 멱등성: 동일 requestId → 이전 결과. 이미 확정: PAYMENT_ALREADY_CONFIRMED → 거부. 커밋 후: PosRealTimeSender → PAYMENT_VOIDED |
| PrintOrderUseCase | ORDER:PRINT | tableId, printType | 없음 (비동기 후처리) | - | success | 프린터 미연결: PRINTER_NOT_CONNECTED. 인쇄 실패: PRINT_FAILED (Device Error 코드 기반) |
| SearchCustomerUseCase | CUSTOMER:SEARCH | TODO: 고객 도메인 설계 완료 후 확정 필요 | TODO | TODO | TODO | TODO |

### 5.4 Domain / Manager / Store
| 항목 | 책임 | 파일 / 모듈 | 비고 |
|---|---|---|---|
| OrderMgr | 주문 생성/수정/취소/완료 업무 계산 | `Domain/Order/OrderMgr` | 핵심 |
| ItemMgr | 메뉴 항목 조회, 가격 계산 | `Domain/Item/ItemMgr` | 핵심 |
| SaleMgr | 결제 처리, 매출 관리 | `Domain/Payment/SaleMgr` | 핵심 (결제) |
| CustMgr | 고객 검색/조회 | `Domain/Customer/CustMgr` | P1 |
| StaffMgr | 담당자/근태 관리 | `Domain/Staff/StaffMgr` | P2 |
| RequestLedgerStore | 결제 요청 멱등성/상태 추적 | `Infrastructure/Persistence/SQLite/Stores/RequestLedgerStore` | 운영 저장소 |
| OutboxStore | 중앙 서버 동기화 대기열 | `Infrastructure/Persistence/SQLite/Stores/OutboxStore` | 운영 저장소 |

### 5.5 DB / CentralApi / Sync / Realtime
| 연동 대상 | 역할 | 데이터 흐름 | 비고 |
|---|---|---|---|
| SQLite (OrderSlip, OrderItem) | 주문 영속화 | UseCases → SQLite → Outbox | Offline-First |
| SQLite (SellSlip, SellDetail) | 결제 영속화 | ExecutePaymentUseCase → SQLite | Offline-First |
| SQLite (Item) | 메뉴 항목 조회 | ItemMgr → SQLite (읽기 전용) | 마스터 데이터 |
| OutboxStore | 주문 완료/결제 완료 시 중앙 동기화 | UseCases → OutboxStore | Sync 대상: OrderSlip(COMPLETED) + OrderItem, SellSlip + SellDetail. 비동기 |
| RequestLedgerStore | 주문/결제 요청 멱등성 추적 | UseCases → Ledger | 상태: RECEIVED → PROCESSING → SUCCEEDED/FAILED |
| PosRealTimeSender | 주문/결제 변경 시 UI 갱신 | UseCases → PosRealTimeSender → PosUi | 단방향. 이벤트: ORDER_UPDATED, ORDER_COMPLETED, ORDER_CANCELLED, PAYMENT_COMPLETED, PAYMENT_VOIDED |
| Device/CardReader | 카드 결제 | ExecutePaymentUseCase → CardReader | 동기 대기 |
| Device/Printer | 주문/영수증 인쇄 | PrintOrderUseCase → Printer | 비동기 후처리 |
| CentralApi | 주문/결제 완료 데이터 수신 | Outbox → SyncWorker → CentralApi | Sync 대상 확정: 주문 전표 + 결제 전표 |

### 5.6 i18n / Error / Permission
| 항목 | 규칙 | 비고 |
|---|---|---|
| i18n | `BrandPosApp/PosUi/src/i18n/locales/` 기반 msgKey | KR/EN/VN 3개 언어, 금액 라벨 포함 |
| Error | Device Error 코드 기반 (type, device, code, msgKey) | 카드 리더기/프린터 오류 |
| Permission | TODO | 담당자/권한에 따른 결제 수단 활성화 |

## 6. 테스트
| 테스트 항목 | 범위 | 기대 결과 | 유형 |
|---|---|---|---|
| 메뉴 선택 + 주문 추가 | OrderScreen + AddOrderItemUseCase | 주문 목록에 항목 추가 | 통합 |
| 현금 결제 | PaymentScreen + ExecutePaymentUseCase | 결제 DB 저장 + 거스름돈 표시 | 통합 |
| 카드 결제 | PaymentScreen + ExecutePaymentUseCase + CardReader | 카드 승인 후 결제 확정 | 통합 |
| 주문 완료 + Outbox | CompleteOrderUseCase | DB 저장 + Outbox PENDING | 통합 |
| 결제 초기화 | VoidPaymentUseCase | 결제 내역 초기화 | 통합 |
| 개별/전체 취소 | RemoveOrderItem/CancelOrderUseCase | 항목/전체 삭제 후 금액 재계산 | 통합 |
| 멱등성 검증 | ExecutePaymentUseCase 중복 호출 | 동일 idempotencyKey 시 중복 결제 없음 | 단위 |
| ORDER_DIALOG과 컴포넌트 공유 | MenuGrid, OrderList 등 | 동일 컴포넌트로 양쪽 화면 동작 | UI |

## 7. 완료 기준
- [ ] UI: OrderScreen + PaymentScreen 주문/결제 통합 흐름 구현
- [ ] Bridge: ORDER:*, PAYMENT:*, ITEM:GET_LIST 커맨드 구현
- [ ] UseCase: AddOrderItem, CompleteOrder, RemoveOrderItem, CancelOrder, ApplyDiscount, ModifyOrderQty, ExecutePayment, VoidPayment, PrintOrder
- [ ] RTK Query: orderApi, paymentApi, itemApi endpoint 구현
- [ ] PosRealTime: 주문/결제 변경 이벤트 수신/처리
- [ ] i18n: 주문+결제 화면 관련 키 등록
- [ ] 테스트: 통합 테스트 + UI 테스트
- [ ] 문서 DONE

## 8. 작업 명단
| 작업 | 파일 | 상태 |
|---|---|---|
| OrderScreen (ORDER_DIALOG과 공유) | `BrandPosApp/PosUi/src/screens/OrderScreen/index.tsx` | TODO |
| PaymentScreen 메인 | `BrandPosApp/PosUi/src/screens/PaymentScreen/index.tsx` | TODO |
| PaymentMethodPanel | `BrandPosApp/PosUi/src/screens/PaymentScreen/components/PaymentMethodPanel.tsx` | TODO |
| PaymentSummary | `BrandPosApp/PosUi/src/screens/PaymentScreen/components/PaymentSummary.tsx` | TODO |
| PaymentActionBar | `BrandPosApp/PosUi/src/screens/PaymentScreen/components/PaymentActionBar.tsx` | TODO |
| PaymentList | `BrandPosApp/PosUi/src/screens/PaymentScreen/components/PaymentList.tsx` | TODO |
| MenuGrid (공유) | `BrandPosApp/PosUi/src/screens/OrderScreen/components/MenuGrid.tsx` | TODO |
| MenuGroupTabs (공유) | `BrandPosApp/PosUi/src/screens/OrderScreen/components/MenuGroupTabs.tsx` | TODO |
| OrderList (공유) | `BrandPosApp/PosUi/src/screens/OrderScreen/components/OrderList.tsx` | TODO |
| OrderSummary (공유) | `BrandPosApp/PosUi/src/screens/OrderScreen/components/OrderSummary.tsx` | TODO |
| OrderActionBar (공유) | `BrandPosApp/PosUi/src/screens/OrderScreen/components/OrderActionBar.tsx` | TODO |
| CustomActionGrid (공유) | `BrandPosApp/PosUi/src/screens/OrderScreen/components/CustomActionGrid.tsx` | TODO |
| CustomerSearchModal | `BrandPosApp/PosUi/src/screens/OrderScreen/components/CustomerSearchModal.tsx` | TODO |
| DeliveryCustomerModal | `BrandPosApp/PosUi/src/screens/OrderScreen/components/DeliveryCustomerModal.tsx` | TODO |
| KitchenMemoModal | `BrandPosApp/PosUi/src/screens/OrderScreen/components/KitchenMemoModal.tsx` | TODO |
| HeaderBar (공유) | `BrandPosApp/PosUi/src/shared/ui/organisms/HeaderBar.tsx` | TODO |
| orderApi | `BrandPosApp/PosUi/src/store/api/orderApi.ts` | TODO |
| paymentApi | `BrandPosApp/PosUi/src/store/api/paymentApi.ts` | TODO |
| itemApi | `BrandPosApp/PosUi/src/store/api/itemApi.ts` | TODO |
| customerApi | `BrandPosApp/PosUi/src/store/api/customerApi.ts` | TODO |
| ExecutePaymentUseCase | `BrandPosApp/UseCases/Payment/ExecutePaymentUseCase.cpp/.h` | TODO |
| VoidPaymentUseCase | `BrandPosApp/UseCases/Payment/VoidPaymentUseCase.cpp/.h` | TODO |
| AddOrderItemUseCase | `BrandPosApp/UseCases/Order/AddOrderItemUseCase.cpp/.h` | TODO |
| CompleteOrderUseCase | `BrandPosApp/UseCases/Order/CompleteOrderUseCase.cpp/.h` | TODO |
| SaleMgr | `BrandPosApp/Domain/Payment/SaleMgr.cpp/.h` | TODO |
| OrderMgr | `BrandPosApp/Domain/Order/OrderMgr.cpp/.h` | TODO |
| Bridge command (주문) | `BrandPosApp/PosUi/src/bridge/commands/order.ts` | TODO |
| Bridge command (결제) | `BrandPosApp/PosUi/src/bridge/commands/payment.ts` | TODO |
| OrderActions (thin router) | `BrandPosApp/Presentation/CEF/InternalBridge/PosRequestActions/Order/OrderActions.cpp/.h` | TODO |
| PaymentActions (thin router) | `BrandPosApp/Presentation/CEF/InternalBridge/PosRequestActions/Payment/PaymentActions.cpp/.h` | TODO |

---
## Appendix: 레거시 UI 요소 참조

### 기본 정보

| 항목 | 값 |
|------|---|
| 다이얼로그 ID | IDD_ORACC_DIALOG |
| 리소스 값 | 428 |
| 크기 (DLU) | 528 x 380 |
| 다이얼로그 타입 | DIALOGEX |
| 스타일 | DS_SETFONT \| WS_POPUP |
| 폰트 | 10, "System", 0, 0, 0x0 |
| 소스 파일 | Restaurant.rc |
| 총 UI 요소 수 | 109 |

### UI 요소 목록

#### 버튼 (88개)

| ID | 용도 추정 | 숨김 |
|---|---|---|
| IDOK | 주문완료 버튼 | **TRUE** |
| IDCANCEL | 닫기 버튼 | FALSE |
| IDC_O_DELIVERY | 배달 버튼 | **TRUE** |
| IDC_O_PACKING | 포장 버튼 | **TRUE** |
| IDC_O_ONECALLBACK | 개별 취소 버튼 | **TRUE** |
| IDC_O_TOTALCALLBACK | 전체 취소 버튼 | **TRUE** |
| IDC_O_KITCHENMEMO | 주문 메모 버튼 | **TRUE** |
| IDC_O_SERVICE | 서비스 버튼 | **TRUE** |
| IDC_O_DISCOUNT | 할인 버튼 | **TRUE** |
| IDC_O_NUMBERBACK | 수량 -1 버튼 | **TRUE** |
| IDC_O_ORDERPRINT | 주문 인쇄 버튼 | FALSE |
| IDC_O_SALEMANAGE | 판매 관리 버튼 | **TRUE** |
| IDC_O_TABLEEMP | 테이블 담당자 버튼 | **TRUE** |
| IDC_O_UP, IDC_O_DOWN | 주문 목록 스크롤 | FALSE |
| IDC_O_MENU00~44 | 메뉴 버튼 (25개) | **TRUE** |
| IDC_O_TOPMENU1~10, 14, 15 | 메뉴 그룹 탭 (12개) | **TRUE**/FALSE |
| IDC_O_CASHBTN | 현금 버튼 | **TRUE** |
| IDC_O_ACCCOMBTN | 결제완료 버튼 | **TRUE** |
| IDC_O_CARDBTN | 카드 버튼 | **TRUE** |
| IDC_O_REACCBTN | 결제초기화 버튼 | **TRUE** |
| IDC_O_MONEYBOX | 금전함 열기 버튼 | **TRUE** |
| IDC_O_ETCBTN | 기타결제 버튼 | **TRUE** |
| IDC_O_INPUTANDCUST | 입력&고객 버튼 | **TRUE** |
| IDC_O_CASHRECEBTN | 현금영수증 버튼 | **TRUE** |
| IDC_O_UNPERBTN | 미수결제 버튼 | **TRUE** |
| IDC_O_BACK2, IDC_O_NEXT2 | 메뉴 페이지 이동 | FALSE |
| IDC_O_SELLPRINT | 영수증인쇄 버튼 | FALSE |
| IDC_O_LINECHANGE | 행변경 버튼 | FALSE |
| IDC_OA_BTN1~17 | 주문/결제 기능 버튼 (17개) | FALSE |
| IDC_O_SELECT | 선택 버튼 | FALSE |
| IDC_O_CUSTDELI | 배달고객 버튼 | **TRUE** |
| IDC_O_DILIGENCE | 근태 버튼 | FALSE |
| IDC_O_NUMBERADD3, IDC_O_NUMBER_BACK2 | 수량 스크롤 | FALSE |
| IDC_O_MINIMIZE | 최소화 | FALSE |

#### 텍스트/라벨 (17개)

| ID | 용도 추정 | 숨김 |
|---|---|---|
| IDC_O_TABLENUM | 테이블 번호 표시 | FALSE |
| IDC_O_PERSON | 인원수 표시 | FALSE |
| IDC_O_CUSTNUM | 고객 번호 표시 | FALSE |
| IDC_O_ORDERMONEY | 주문 금액 표시 | FALSE |
| IDC_O_DISMONEY | 할인 금액 표시 | FALSE |
| IDC_O_TOTALMONEY | 총 금액 표시 | FALSE |
| IDC_O_CUSTCARD | 고객 카드 | **TRUE** |
| IDC_O_CUSTIN | 고객 입장 | **TRUE** |
| IDC_O_CUSTPOINT | 고객 포인트 | **TRUE** |
| IDC_O_RECEIVED | 받은 금액 | FALSE |
| IDC_O_CHANGEMONEY | 거스름돈 | FALSE |
| IDC_O_TABLEMSG | 테이블 메시지 | FALSE |
| IDC_O_TOTALMONEY2 | 총매출액 라벨 | FALSE |
| IDC_O_DISMONEY2 | 할인금액 라벨 | FALSE |
| IDC_O_ORDERMONEY2 | 주문금액 라벨 | FALSE |
| IDC_O_RECEIVED2 | 받은금액 라벨 | FALSE |
| IDC_O_CHANGEMONEY2 | 거스름돈 라벨 | FALSE |

#### 입력 필드 (1개)

| ID | 타입 | 숨김 | 용도 |
|---|---|---|---|
| IDC_O_SNUM | EditText | **TRUE** | 수량 입력 |

#### 그리드/리스트 (3개)

| ID | 타입 | 용도 |
|---|---|---|
| IDC_ACCLIST | ListBox | 결제 내역 목록 |
| IDC_CUSTLIST | ListBox | 고객/결제 목록 |
| IDC_GRID | MFCGridCtrl | 주문 그리드 |

### 요소 통계

| 유형 | 개수 |
|------|------|
| 버튼 | 88 |
| 텍스트/라벨 | 17 |
| 입력 필드 | 1 |
| 그리드/리스트 | 3 |
| 기타 | 0 |
| **합계** | **109** |

---

## 9. 작업 진행 기록
| 날짜 | 범위 | 상태 | 완료 범위 | 남은 범위 | 내용 |
|---|---|---|---|---|---|
| 2026-04-05 | Shell 구현 | 완료 | 레이아웃+로컬상태+stub | Bridge/UseCase 연동 | OrderPaymentDialog.tsx shell 구현 완료. 메뉴그리드+주문목록+결제액션+금액요약 통합 레이아웃, 34개 기능 stub handler 포함 |
