# ORACC_BSELECT 화면 문서

## 0. 문서 정보
| 항목 | 값 |
|---|---|
| 화면명 | `ORACC_BSELECT` |
| 화면 ID | `IDD_ORACC_BSELECT` |
| 원본 파일 | `oracc-bselect.md` |
| 전환 우선순위 | `P0` |
| 담당 계층 | `PosUi / Presentation / UseCases / Domain / Infrastructure` |
| 상태 | `TODO` |

## 1. 화면 개요
- **화면 목적**: 주문+결제 통합 화면의 결제수단 선택 및 버튼 배치 관리 다이얼로그이다. 가장 많은 결제 수단(현금, 카드, ZALOPAY, NAPAS, HJ VIETPAY, INFOPLUS 계열, PAYCO, 카카오페이, 제로페이, UserPay 등)과 기능 버튼을 포함한다.
- **해결하는 사용자 문제**: 다양한 결제 수단 중 적절한 수단을 선택하고, 주문 관련 부가 기능(서비스, 포장, 배달, 할인, 취소 등)을 실행한다.
- **진입 경로**: ORACC_DIALOG에서 결제수단 선택 영역으로 진입한다.
- **종료 경로**: 닫기(IDCANCEL) 시 복귀, 주문완료(IDD_ORCOM) 시 주문 확정 후 복귀한다.
- **관련 운영 주체**: 매장 직원 (결제 담당)

## 2. 상위 기준 연결
| 기준 | 연결 문서 | 비고 |
|---|---|---|
| 전체 아키텍처 | `00-Platform-최종-아키텍처-기준서.md` | 필수 |
| Edge POS 설계 | `04-Edge-POS-아키텍처-설계서.md` | 필수 |
| 전체 흐름 | `05-Edge-POS-전체-흐름-AZ-가이드.md` | 필수 |
| DB 설계 | `DB설계/` | SellSlip, SellDetail, UserPayment, WaitPayment 테이블 |
| 화면 인벤토리 | `_index.md` | 필수 |

## 3. 화면 기능 목록
| ID | 기능명 | 설명 | 사용자 액션 | 우선순위 |
|---|---|---|---|---|
| FN-001 | 현금 결제 | 현금 결제 처리 | 현금 버튼 터치 | P0 |
| FN-002 | 카드 결제 | 카드 결제 (카드 리더기 연동) | 카드 버튼 터치 | P0 |
| FN-003 | ZALOPAY 결제 | ZaloPay QR 결제 (베트남) | ZALOPAY 버튼 터치 | P0 |
| FN-004 | NAPAS 결제 | NAPAS 카드 결제 (베트남) | NAPAS 버튼 터치 | P1 |
| FN-005 | HJ VIETPAY 결제 | HJ VietPay 결제 (베트남) | HJ VIETPAY 버튼 터치 | P1 |
| FN-006 | INFOPLUS (SHINHAN) 결제 | Infoplus 신한 결제 | INFOPLUS (SHINHAN) 버튼 터치 | P1 |
| FN-007 | INFOPLUS (BIDV) 결제 | Infoplus BIDV 결제 | INFOPLUS (BIDV) 버튼 터치 | P1 |
| FN-008 | INFOPLUS (WOORI) 결제 | Infoplus 우리 결제 | INFOPLUS (WOORI) 버튼 터치 | P1 |
| FN-009 | 서비스 적용 | 선택 항목에 서비스 적용 | 서비스 버튼 터치 | P1 |
| FN-010 | 포장 설정 | 주문을 포장으로 설정 | 포장 버튼 터치 | P1 |
| FN-011 | 배달 설정 | 주문을 배달로 설정 | 배달 버튼 터치 | P1 |
| FN-012 | 입력 & 고객 | 고객 검색/입력 모달 | 입력&고객 버튼 터치 | P1 |
| FN-013 | 수량 -1 | 선택 항목 수량 감소 | 수량-1 버튼 터치 | P0 |
| FN-014 | 세트메뉴 | 세트메뉴 구성 모달 | 세트메뉴 버튼 터치 | P1 |
| FN-015 | 판매 관리 | 별도 관리 화면 이동 | 판매관리 버튼 터치 | P2 |
| FN-016 | 주방 메모 | 주방 전달 메모 추가 | 주문메모 버튼 터치 | P1 |
| FN-017 | 개별 취소 | 선택 주문 항목 취소 | 개별취소 버튼 터치 | P0 |
| FN-018 | 전체 취소 | 현재 주문 전체 취소 | 전체취소 버튼 터치 | P0 |
| FN-019 | 할인 적용 | 선택 항목에 할인 적용 | 할인 버튼 터치 | P0 |
| FN-020 | 10% 할인 | 10% 정률 할인 적용 | 10%할인 버튼 터치 | P1 |
| FN-021 | 금전함 열기 | 금전함 장치 오픈 | 금전함 버튼 터치 | P2 |
| FN-022 | 결제 초기화 | 결제 내역 초기화 | 결제초기화 버튼 터치 | P0 |
| FN-023 | T 보류 | 주문 임시 보류 | T보류 버튼 터치 | P2 |
| FN-024 | 보류불러오기 | 보류된 주문 불러오기 | 보류불러오기 버튼 터치 | P2 |
| FN-025 | 상품할인 | 개별 상품 할인 적용 | 상품할인 버튼 터치 | P1 |
| FN-026 | 주문 완료 | 현재 주문 확정 | 주문완료 버튼 터치 | P0 |
| FN-027 | 기타결제 | 기타 결제 수단 | 기타결제 버튼 터치 | P1 |
| FN-028 | 결제 완료 | 결제 확정 | 결제완료 버튼 터치 | P0 |
| FN-029 | 상품교환 | 상품 교환 처리 | 상품교환 버튼 터치 | P2 |
| FN-030 | 전자상품권 | 전자상품권 결제 | 전자상품권 버튼 터치 | P2 |
| FN-031 | 더치페이 (상품별) | 상품별 분할 결제 | 더치페이 버튼 터치 | P2 |
| FN-032 | 임시단가 | 임시 단가 변경 | 임시단가 버튼 터치 | P2 |
| FN-033 | 수량 입력 | 수량 직접 입력 | 수량 버튼 터치 | P1 |
| FN-034 | 매출재발행 | 매출전표 재발행 | 매출재발행 버튼 터치 | P2 |
| FN-035 | 영수증재발행 | 영수증 재인쇄 | 영수증재발행 버튼 터치 | P2 |
| FN-036 | 인건비변환 | 인건비 변환 처리 | 인건비변환 버튼 터치 | P2 |
| FN-037 | 회원검색 | 고객/회원 검색 | 회원검색 버튼 터치 | P1 |
| FN-038 | 상품검색 | 상품 검색 모달 호출 | 상품검색 버튼 터치 | P1 |
| FN-039 | 미수결제 (숨김) | 외상/미수 결제 | 미수결제 버튼 터치 | P2 |
| FN-040 | 현금영수증 (숨김) | 현금영수증 발행 | 현금영수증 버튼 터치 | P1 |
| FN-041 | 테이블 담당자 (숨김) | 담당 직원 지정 | 테이블담당자 버튼 터치 | P2 |
| FN-042 | 초기화 (버튼 배치) | 버튼 레이아웃 초기화 | 초기화 버튼 터치 | P2 |
| FN-043 | 버튼 배치 저장 | 버튼 레이아웃 저장 | 저장 버튼 터치 | P2 |
| FN-044 | 버튼 삭제 | 버튼 배치에서 삭제 | 삭제 버튼 터치 | P2 |
| FN-045 | 닫기 | 화면 닫기 | 닫기 버튼 터치 | P0 |
| FN-046 | 언어 선택 (KR/EN/VN) | i18n 언어 전환 | 언어 버튼 터치 | P2 |
| FN-047 | PLU Area 전환 | 메뉴 그리드 뷰 전환 | PLU Area 버튼 터치 | P2 |
| FN-048 | UserPay 1~4 (사용자 정의 결제, 숨김) | 매장별 사용자 정의 결제 | UserPay 버튼 터치 | P2 |
| FN-049 | PAYCO 결제 (숨김) | PAYCO 결제 | PAYCO 버튼 터치 | P2 |
| FN-050 | 카카오페이 결제 (숨김) | 카카오페이 결제 | 카카오페이 버튼 터치 | P2 |
| FN-051 | 제로페이 결제 (숨김) | 제로페이 결제 | 제로페이 버튼 터치 | P2 |
| FN-052 | 카드/소비 결제 (숨김) | 카드/소비 결제 | 카드/소비 버튼 터치 | P2 |
| FN-053 | 캐시백적립 (숨김) | 캐시백 적립 | 캐시백적립 버튼 터치 | P2 |
| FN-054 | 캐시백조회 (숨김) | 캐시백 조회 | 캐시백조회 버튼 터치 | P2 |
| FN-055 | 전표조회 (숨김) | 전표 조회 | 전표조회 버튼 터치 | P2 |
| FN-056 | 1회환불/회수 (숨김) | 환불/회수 처리 | 1회환불 버튼 터치 | P2 |
| FN-057 | 포인트이력 (숨김) | 고객 포인트 이력 조회 | 포인트이력 버튼 터치 | P2 |
| FN-058 | 주문/결제 기능 버튼 (설정 가능) | 17개 커스텀 버튼, 동적 매핑 | 커스텀 버튼 터치 | P2 |

## 4. UI 구조
### 4.1 화면 구성
- **상단**: 언어 선택(KR/EN/VN), PLU Area 버튼, 닫기 버튼, 숨김 영역(캐시백, 전표조회, 1회환불 등)
- **좌측 상단**: 결제 수단 버튼 그리드 - 현금, 카드, ZALOPAY, NAPAS, HJ VIETPAY, INFOPLUS 계열, UserPay1~4 (국가/매장 설정 기반 조건부 렌더링)
- **중앙**: 주문/결제 액션 버튼 - 서비스, 포장, 배달, 입력&고객, 세트메뉴, 상품할인, 기타결제, 할인, 10%할인, 개별취소, 전체취소, 판매관리, 결제초기화, T보류, 보류불러오기, 주방메모, 상품교환, 인건비변환, 회원검색, 상품검색 등
- **하단 좌측**: 주문완료, 결제완료, 전자상품권, 더치페이, 임시단가, 수량, 매출재발행, 영수증재발행
- **하단**: 버튼 배치 관리(삭제, 초기화, 저장) + 커스텀 기능 버튼(IDC_OA_BTN1~17)

### 4.2 재사용 UI
| 컴포넌트 | 위치 | props로 바뀌는 값 | 비고 |
|---|---|---|---|
| PaymentMethodPanel | `screens/PaymentScreen/components/PaymentMethodPanel` | paymentMethods, onSelect | 결제 수단 그리드 |
| OrderActionBar | `screens/OrderScreen/components/OrderActionBar` | actions, onAction | 주문 액션 버튼 |
| CustomActionGrid | `screens/OrderScreen/components/CustomActionGrid` | buttonConfig, onAction | 커스텀 기능 버튼 (17개) |
| HeaderBar | `shared/ui/organisms/HeaderBar` | language, onLanguageChange | 언어 선택 |
| ItemSearchModal | `screens/OrderScreen/components/ItemSearchModal` | onSelect | 상품 검색 |
| GroupSelectModal | `shared/ui/organisms/GroupSelectModal` | onSelect | 분류 선택 |

## 5. 구현 명세
### 5.1 상태 소유권
| 상태 | 소유 계층 | 원본 | 비고 |
|---|---|---|---|
| 결제 수단 설정 | RTK Query 캐시 | systemApi.getPaymentMethodConfig | 국가/매장별 설정 |
| 버튼 배치 설정 | RTK Query 캐시 | systemApi.getButtonConfig | 커스텀 버튼 매핑 |
| 주문 상태 | RTK Query 캐시 | orderApi.getOrderDetail | 서버 상태 |
| 결제 상태 | RTK Query 캐시 | paymentApi.getPaymentDetail | 서버 상태 |
| 선택된 결제 수단 | UI 로컬 상태 | - | 화면 상태 |
| i18n 현재 언어 | UI slice | uiSlice.language | 화면 상태 |

### 5.2 Bridge 계약
| Command | Request | Response | Error | Idempotency | 비고 |
|---|---|---|---|---|---|
| PAYMENT:CASH | `{ orderSlipId, amount }` | `{ success, paymentId }` | `ORDER_NOT_FOUND`, `INSUFFICIENT_AMOUNT` | `PAYMENT:CASH:{orderSlipId}:{timestamp}` | P0 |
| PAYMENT:CARD | `{ orderSlipId, amount }` | `{ success, paymentId, approvalNo }` | `ORDER_NOT_FOUND`, `CARD_READER_ERROR`, `CARD_DECLINED`, `OFFLINE_BLOCKED` | `PAYMENT:CARD:{orderSlipId}:{timestamp}` | P0. 동기 대기. 오프라인 시 진입 차단 |
| PAYMENT:EXECUTE | `{ orderSlipId, paymentMethod, amount, gateway }` | `{ success, paymentId }` | `ORDER_NOT_FOUND`, `GATEWAY_ERROR`, `OFFLINE_BLOCKED`, `UNSUPPORTED_METHOD` | `PAYMENT:EXECUTE:{orderSlipId}:{paymentMethod}:{timestamp}` | P0. 외부 PG 동기 대기. 오프라인 시 진입 차단 |
| PAYMENT:VOID | `{ paymentId }` | `{ success }` | `PAYMENT_NOT_FOUND`, `PAYMENT_ALREADY_CONFIRMED` | `PAYMENT:VOID:{paymentId}:{timestamp}` | P0 |
| PAYMENT:CANCEL | `{ paymentId }` | `{ success }` | `PAYMENT_NOT_FOUND`, `PAYMENT_ALREADY_CONFIRMED` | `PAYMENT:CANCEL:{paymentId}:{timestamp}` | P2 |
| ORDER:ADD_ITEM | `{ tableCode, itemCode, qty }` | `{ orderSlipId, orderItems }` | `TABLE_NOT_FOUND`, `ITEM_NOT_FOUND` | `ORDER:ADD_ITEM:{tableCode}:{itemCode}:{timestamp}` | P0 |
| ORDER:COMPLETE | `{ tableCode, orderSlipId }` | `{ success }` | `ORDER_NOT_FOUND`, `ORDER_EMPTY` | `ORDER:COMPLETE:{orderSlipId}` | P0 |
| ORDER:REMOVE_ITEM | `{ orderSlipId, orderItemId }` | `{ success }` | `ORDER_ITEM_NOT_FOUND` | `ORDER:REMOVE_ITEM:{orderSlipId}:{orderItemId}:{timestamp}` | P0 |
| ORDER:CANCEL | `{ orderSlipId }` | `{ success }` | `ORDER_NOT_FOUND`, `ORDER_ALREADY_PAID` | `ORDER:CANCEL:{orderSlipId}:{timestamp}` | P0 |
| ORDER:APPLY_DISCOUNT | `{ orderItemId, discountType, discountValue }` | `{ success }` | `ORDER_ITEM_NOT_FOUND`, `INVALID_DISCOUNT` | `ORDER:APPLY_DISCOUNT:{orderItemId}:{timestamp}` | P0 |
| ORDER:MODIFY_QTY | `{ orderItemId, qty }` | `{ success }` | `ORDER_ITEM_NOT_FOUND` | `ORDER:MODIFY_QTY:{orderItemId}:{timestamp}` | P0. 수량 0 이하 시 항목 삭제 |
| ORDER:SET_KITCHEN_MEMO | `{ orderSlipId, memo }` | `{ success }` | `ORDER_NOT_FOUND` | - | P1 |
| ORDER:APPLY_SERVICE | `{ orderItemId, serviceType }` | `{ success }` | `ORDER_ITEM_NOT_FOUND` | - | P1 |
| ORDER:SET_PACKING | `{ orderSlipId, packing }` | `{ success }` | `ORDER_NOT_FOUND` | - | P1 |
| ORDER:SET_DELIVERY | `{ orderSlipId, delivery }` | `{ success }` | `ORDER_NOT_FOUND` | - | P1 |
| ORDER:PRINT | `{ orderSlipId, printType }` | `{ success }` | `PRINTER_NOT_CONNECTED` | - | P2 |
| ITEM:SEARCH | `{ keyword?, groupId?, purposeId? }` | `{ items: [...] }` | (없음) | - | P1. → handoff: item-search.md |
| CUSTOMER:SEARCH | `{ phone?, name?, searchType? }` | `{ customers: [...] }` | (없음) | - | P1 |
| CUSTOMER:GET_DETAIL | `{ customerId }` | `{ customer: {...} }` | `CUSTOMER_NOT_FOUND` | - | P2 |
| STAFF:SELECT | `{ tableId, staffId }` | `{ success }` | `TABLE_NOT_FOUND`, `STAFF_NOT_FOUND` | - | P2 |

### 5.3 UseCase 계약
| UseCase | Trigger | Input | Transaction | Lock | Output | 실패 규칙 |
|---|---|---|---|---|---|---|
| ExecutePaymentUseCase | PAYMENT:CASH/CARD/EXECUTE | orderSlipId, method, amount | SQLite + Ledger + Outbox | orderSlipId | success, paymentId | 멱등성: 동일 requestId → Ledger 이전 결과 반환. 카드/외부 PG: 동기 대기 → 승인 실패 시 Ledger FAILED, SQLite TX 롤백. 오프라인: 외부 결제(카드/QR/PG) 진입 차단 (UseCases 레벨). 현금 결제는 오프라인에서도 동작. 트랜잭션: SQLite TX 내에서 SellSlip/SellDetail INSERT + Ledger INSERT + Outbox INSERT 원자적 수행. 커밋 후: PosRealTimeSender로 PAYMENT_COMPLETED 이벤트 브로드캐스트. Outbox 불가: 카드/QR 승인 요청은 Outbox 재전송 대상 아님 |
| VoidPaymentUseCase | PAYMENT:VOID | paymentId | SQLite 단일 트랜잭션 | orderSlipId | success | 멱등성: 동일 requestId → Ledger 이전 결과 반환. 이미 확정된 결제 → PAYMENT_ALREADY_CONFIRMED 에러. 트랜잭션: SQLite TX 내에서 결제 상태 변경 + Ledger INSERT 원자적 수행. 커밋 후: PosRealTimeSender로 PAYMENT_VOIDED 이벤트 |
| CancelPaymentUseCase | PAYMENT:CANCEL | paymentId | SQLite + Ledger | orderSlipId | success | 멱등성: 동일 requestId → Ledger 이전 결과 반환. 이미 확정된 결제 → PAYMENT_ALREADY_CONFIRMED 에러. 외부 PG 취소 필요 시 동기 대기. 오프라인: 외부 PG 취소 진입 차단 |
| CompleteOrderUseCase | ORDER:COMPLETE | orderSlipId | SQLite + Outbox | orderSlipId | success | 멱등성: 동일 requestId → Ledger 이전 결과 반환. 빈 주문 → ORDER_EMPTY 에러. Ledger SUCCEEDED 후 Outbox PENDING. 커밋 후: PosRealTimeSender로 ORDER_COMPLETED 이벤트 |
| AddOrderItemUseCase | ORDER:ADD_ITEM | tableCode, itemCode, qty | SQLite 단일 트랜잭션 | tableCode | orderSlipId, orderItems | 멱등성: 동일 requestId → Ledger 이전 결과 반환. 상품 미존재 → ITEM_NOT_FOUND. 오프라인: 로컬 DB만 사용하므로 동작. 커밋 후: PosRealTimeSender로 ORDER_ITEM_CHANGED 이벤트 |
| RemoveOrderItemUseCase | ORDER:REMOVE_ITEM | orderItemId | SQLite 단일 트랜잭션 | orderSlipId | success | 이미 삭제된 항목 → 무시 (멱등). 커밋 후: PosRealTimeSender로 ORDER_ITEM_CHANGED 이벤트 |
| CancelOrderUseCase | ORDER:CANCEL | orderSlipId | SQLite 단일 트랜잭션 | orderSlipId | success | 이미 결제된 주문 → ORDER_ALREADY_PAID 에러. 커밋 후: PosRealTimeSender로 ORDER_CANCELLED 이벤트 |
| ApplyDiscountUseCase | ORDER:APPLY_DISCOUNT | orderItemId, discountType, value | SQLite 단일 트랜잭션 | orderSlipId | success | 항목 미존재 → ORDER_ITEM_NOT_FOUND. 할인율 범위 초과 → INVALID_DISCOUNT. 오프라인: 로컬 DB만 사용하므로 동작. 커밋 후: PosRealTimeSender로 ORDER_ITEM_CHANGED 이벤트 |
| ModifyOrderQtyUseCase | ORDER:MODIFY_QTY | orderItemId, qty | SQLite 단일 트랜잭션 | orderSlipId | success | 수량 0 이하 시 항목 삭제. 항목 미존재 → ORDER_ITEM_NOT_FOUND. 커밋 후: PosRealTimeSender로 ORDER_ITEM_CHANGED 이벤트 |
| SearchCustomerUseCase | CUSTOMER:SEARCH | phone?, name?, searchType? | 없음 (읽기 전용) | - | customers[] | 조회 전용: 멱등성/락/Outbox 불필요. 오프라인: 로컬 DB만 사용하므로 동작 |

### 5.4 Domain / Manager / Store
| 항목 | 책임 | 파일 / 모듈 | 비고 |
|---|---|---|---|
| SaleMgr | 결제 처리, 매출 관리, 결제 수단 분기 | `Domain/Payment/SaleMgr` | 핵심 |
| OrderMgr | 주문 생성/수정/취소/완료 | `Domain/Order/OrderMgr` | 핵심 |
| ItemMgr | 메뉴 항목 조회 | `Domain/Item/ItemMgr` | 보조 |
| CustMgr | 고객 검색/조회 | `Domain/Customer/CustMgr` | P1 |
| AccountingMgr | 인건비 변환 등 회계 처리 | `Domain/Accounting/AccountingMgr` | P2 |
| SystemMgr | 버튼 배치/결제 수단 설정 관리 | `Domain/System/SystemMgr` | 설정 |
| RequestLedgerStore | 결제 요청 멱등성/상태 추적 | `Infrastructure/Persistence/SQLite/Stores/RequestLedgerStore` | 운영 저장소 |
| OutboxStore | 중앙 서버 동기화 대기열 | `Infrastructure/Persistence/SQLite/Stores/OutboxStore` | 운영 저장소 |

### 5.5 DB / CentralApi / Sync / Realtime
| 연동 대상 | 역할 | 데이터 흐름 | 비고 |
|---|---|---|---|
| SQLite (SellSlip, SellDetail) | 결제 영속화 | ExecutePaymentUseCase → SQLite | Offline-First |
| SQLite (OrderSlip, OrderItem) | 주문 영속화 | UseCases → SQLite | Offline-First |
| ExternalBridge/PaymentGateways/ZaloPay | ZALOPAY QR 결제 | ExecutePaymentUseCase → ZaloPay API | 동기 대기 |
| ExternalBridge/PaymentGateways/HJVietPay | HJ VietPay 결제 | ExecutePaymentUseCase → HJVietPay API | 동기 대기 |
| ExternalBridge/PaymentGateways/Infoplus | Infoplus 결제 | ExecutePaymentUseCase → Infoplus API | 동기 대기 |
| ExternalBridge/PaymentGateways/BIDV | BIDV 결제 | ExecutePaymentUseCase → BIDV API | 동기 대기 |
| ExternalBridge/PaymentGateways/WeTax | 현금영수증 | ExecutePaymentUseCase → WeTax API | 동기 대기 |
| Device/CardReader | 카드 결제 | ExecutePaymentUseCase → CardReader | 동기 대기 |
| Device/Printer | 영수증/매출 인쇄 | PrintOrderUseCase → Printer | 비동기 후처리 |
| Device/* (금전함) | 금전함 열기 | Device 직접 명령 | Bridge 경유 |
| OutboxStore | 결제/주문 완료 시 중앙 동기화 | UseCases → OutboxStore | 비동기 |
| RequestLedgerStore | 결제 요청 추적 | ExecutePaymentUseCase → Ledger | 멱등성 보장 |
| PosRealTimeSender | 결제/주문 변경 시 UI 갱신 | UseCases → PosRealTimeSender → PosUi | 단방향 |

### 5.6 i18n / Error / Permission
| 항목 | 규칙 | 비고 |
|---|---|---|
| i18n | `BrandPosApp/PosUi/src/i18n/locales/` 기반 msgKey | KR/EN/VN 3개 언어 전환 |
| Error | Device Error 코드 기반 (type, device, code, msgKey) | 카드 리더기, 외부 PG 오류 |
| Permission | 주문/결제 실행: 로그인된 직원 전원. 결제 수단 설정/버튼 배치 관리: 관리자 또는 권한 직원. 결제 수단별 활성화는 국가/매장 설정 기반 | 베트남 전용(ZALOPAY/NAPAS/INFOPLUS), 한국 전용(PAYCO/카카오/제로페이) |

## 6. 테스트
| 테스트 항목 | 범위 | 기대 결과 | 유형 |
|---|---|---|---|
| 현금 결제 | PaymentMethodPanel + ExecutePaymentUseCase | 결제 DB 저장 | 통합 |
| 카드 결제 | PaymentMethodPanel + CardReader + ExecutePaymentUseCase | 카드 승인 후 결제 확정 | 통합 |
| ZALOPAY 결제 | PaymentMethodPanel + ZaloPay API + ExecutePaymentUseCase | QR 결제 후 확정 | 통합 |
| 결제 초기화 | VoidPaymentUseCase | 결제 내역 초기화 | 통합 |
| 국가별 결제 수단 조건부 렌더링 | PaymentMethodPanel | 설정 기반 버튼 표시/숨김 | UI |
| 멱등성 검증 | ExecutePaymentUseCase 중복 호출 | 동일 idempotencyKey 시 중복 없음 | 단위 |
| 오프라인 외부 결제 차단 | ExecutePaymentUseCase (오프라인) | 외부 결제 진입 차단, 에러 표시 | 통합 |
| 버튼 배치 저장/복원 | ButtonLayoutPanel + SystemMgr | 레이아웃 저장 후 복원 | 통합 |
| 커스텀 버튼 동적 매핑 | CustomActionGrid + systemApi.getButtonConfig | 설정 기반 버튼 기능 매핑 | UI |
| 언어 전환 | HeaderBar i18n | 버튼 라벨 언어 전환 | UI |

## 7. 완료 기준
- [ ] UI: PaymentScreen + OrderScreen 결제수단 선택 흐름 구현
- [ ] Bridge: PAYMENT:*, ORDER:* 커맨드 구현
- [ ] UseCase: ExecutePayment, VoidPayment, CancelPayment, CompleteOrder, AddOrderItem, RemoveOrderItem, CancelOrder, ApplyDiscount, ModifyOrderQty
- [ ] RTK Query: paymentApi, orderApi, systemApi, itemApi, customerApi endpoint 구현
- [ ] PosRealTime: 결제/주문 변경 이벤트 수신/처리
- [ ] i18n: 결제 수단, 액션 버튼 관련 키 등록 (KR/EN/VN)
- [ ] 테스트: 결제 통합 테스트 + 국가별 조건부 렌더링 테스트
- [ ] 문서 DONE

## 8. 작업 명단
| 작업 | 파일 | 상태 |
|---|---|---|
| PaymentScreen 메인 | `BrandPosApp/PosUi/src/screens/PaymentScreen/index.tsx` | TODO |
| PaymentMethodPanel | `BrandPosApp/PosUi/src/screens/PaymentScreen/components/PaymentMethodPanel.tsx` | TODO |
| PaymentActionBar | `BrandPosApp/PosUi/src/screens/PaymentScreen/components/PaymentActionBar.tsx` | TODO |
| PaymentSummary | `BrandPosApp/PosUi/src/screens/PaymentScreen/components/PaymentSummary.tsx` | TODO |
| PaymentList | `BrandPosApp/PosUi/src/screens/PaymentScreen/components/PaymentList.tsx` | TODO |
| DiscountPanel | `BrandPosApp/PosUi/src/screens/PaymentScreen/components/DiscountPanel.tsx` | TODO |
| DutchPayModal | `BrandPosApp/PosUi/src/screens/PaymentScreen/components/DutchPayModal.tsx` | TODO |
| PriceChangeModal | `BrandPosApp/PosUi/src/screens/OrderScreen/components/PriceChangeModal.tsx` | TODO |
| SetMenuModal | `BrandPosApp/PosUi/src/screens/OrderScreen/components/SetMenuModal.tsx` | TODO |
| ButtonLayoutPanel | `BrandPosApp/PosUi/src/screens/SetupScreen/components/ButtonLayoutPanel.tsx` | TODO |
| CustomActionGrid (공유) | `BrandPosApp/PosUi/src/screens/OrderScreen/components/CustomActionGrid.tsx` | TODO |
| OrderActionBar (공유) | `BrandPosApp/PosUi/src/screens/OrderScreen/components/OrderActionBar.tsx` | TODO |
| HeaderBar (공유) | `BrandPosApp/PosUi/src/shared/ui/organisms/HeaderBar.tsx` | TODO |
| ItemSearchModal (공유) | `BrandPosApp/PosUi/src/screens/OrderScreen/components/ItemSearchModal.tsx` | TODO |
| CustomerSearchModal (공유) | `BrandPosApp/PosUi/src/screens/OrderScreen/components/CustomerSearchModal.tsx` | TODO |
| paymentApi | `BrandPosApp/PosUi/src/store/api/paymentApi.ts` | TODO |
| orderApi | `BrandPosApp/PosUi/src/store/api/orderApi.ts` | TODO |
| systemApi | `BrandPosApp/PosUi/src/store/api/systemApi.ts` | TODO |
| itemApi | `BrandPosApp/PosUi/src/store/api/itemApi.ts` | TODO |
| customerApi | `BrandPosApp/PosUi/src/store/api/customerApi.ts` | TODO |
| ExecutePaymentUseCase | `BrandPosApp/UseCases/Payment/ExecutePaymentUseCase.cpp/.h` | TODO |
| VoidPaymentUseCase | `BrandPosApp/UseCases/Payment/VoidPaymentUseCase.cpp/.h` | TODO |
| CancelPaymentUseCase | `BrandPosApp/UseCases/Payment/CancelPaymentUseCase.cpp/.h` | TODO |
| SaleMgr | `BrandPosApp/Domain/Payment/SaleMgr.cpp/.h` | TODO |
| SystemMgr (버튼 배치) | `BrandPosApp/Domain/System/SystemMgr.cpp/.h` | TODO |
| Bridge command (주문) | `BrandPosApp/PosUi/src/bridge/commands/order.ts` | TODO |
| Bridge command (결제) | `BrandPosApp/PosUi/src/bridge/commands/payment.ts` | TODO |
| PaymentActions (thin router) | `BrandPosApp/Presentation/CEF/InternalBridge/PosRequestActions/Payment/PaymentActions.cpp/.h` | TODO |
| SellSlipCrud | `BrandPosApp/Infrastructure/Persistence/SQLite/Tables/Payment/SellSlipCrud.cpp/.h` | TODO |
| SellDetailCrud | `BrandPosApp/Infrastructure/Persistence/SQLite/Tables/Payment/SellDetailCrud.cpp/.h` | TODO |

---
## Appendix: 레거시 UI 요소 참조

### 기본 정보

| 항목 | 값 |
|------|---|
| 다이얼로그 ID | IDD_ORACC_BSELECT |
| 리소스 값 | 118 |
| 크기 (DLU) | 441 x 330 |
| 다이얼로그 타입 | DIALOGEX |
| 스타일 | DS_SETFONT \| DS_MODALFRAME \| WS_POPUP |
| 폰트 | 10, "System", 0, 0, 0x0 |
| 소스 파일 | Restaurant.rc |
| 총 UI 요소 수 | 80 |

### UI 요소 목록

#### 버튼 (80개)

| ID | 용도 추정 | 숨김 |
|---|---|---|
| IDOK | 확인 버튼 | **TRUE** |
| IDCANCEL | 닫기 버튼 | FALSE |
| IDC_REDRAW | 초기화 버튼 | FALSE |
| IDC_SAVE | 저장 버튼 | FALSE |
| IDC_DEL | 삭제 버튼 | FALSE |
| IDC_OA_BTN1~17 | 커스텀 기능 버튼 (17개) | FALSE |
| IDD_ORCOM | 주문완료 버튼 | FALSE |
| IDC_O_MONEYBOX | 금전함 버튼 | FALSE |
| IDC_O_UNPER | 미수결제 버튼 | **TRUE** |
| IDC_O_ETC | 기타결제 버튼 | FALSE |
| IDC_O_CARDBTN | 카드 버튼 | FALSE |
| IDC_O_CASHRECEBTN | 현금영수증 버튼 | **TRUE** |
| IDC_O_CASHBTN | 현금 버튼 | FALSE |
| IDC_O_TABLEEMP | 테이블담당자 버튼 | **TRUE** |
| IDC_O_KITCHENMEMO | 주문메모 버튼 | FALSE |
| IDC_O_TOTALCALLBACK | 전체취소 버튼 | FALSE |
| IDC_O_DISCOUNT | 할인 버튼 | FALSE |
| IDC_O_ONECALLBACK | 개별취소 버튼 | FALSE |
| IDC_O_PACKING | 포장 버튼 | FALSE |
| IDC_O_DELIVERY | 배달 버튼 | FALSE |
| IDC_O_SERVICE | 서비스 버튼 | FALSE |
| IDC_O_NUMBERBACK | 수량-1 버튼 | FALSE |
| IDC_O_INPUTANDCUST | 입력&고객 버튼 | FALSE |
| IDC_O_SALEMANAGE | 판매관리 버튼 | FALSE |
| IDC_O_SETMENU | 세트메뉴 버튼 | FALSE |
| IDC_O_ACCCLEAR | 결제초기화 버튼 | FALSE |
| IDC_O_HOLD | T보류 버튼 | FALSE |
| IDC_O_GETHOLD | 보류불러오기 버튼 | FALSE |
| IDC_O_MENUDC1 | 상품할인 버튼 | FALSE |
| IDC_O_CASHBAG | 캐시백적립 버튼 | **TRUE** |
| IDC_O_SERCHCASH | 캐시백조회 버튼 | **TRUE** |
| IDC_O_DOUBLE2 | 상품교환 버튼 | FALSE |
| IDC_O_CHECK | 전표조회 버튼 | **TRUE** |
| IDC_O_EDENRED | 전자상품권 버튼 | FALSE |
| IDC_O_ACCOUNT1 | 결제완료 버튼 | FALSE |
| IDC_O_CARDBTN2 | 카드/소비 버튼 | **TRUE** |
| IDC_O_PAYCO | PAYCO 버튼 | **TRUE** |
| IDC_O_DISCOUNT2 | 10%할인 버튼 | FALSE |
| IDC_O_QTYNUM | 수량 버튼 | FALSE |
| IDC_O_RESELL | 매출재발행 버튼 | FALSE |
| IDC_O_REPRINT | 영수증재발행 버튼 | FALSE |
| IDC_O_KAKAO | 카카오페이 버튼 | **TRUE** |
| IDC_O_ZEROPAY | 제로페이 버튼 | **TRUE** |
| IDC_O_CUSTPOINT2 | 포인트이력 버튼 | **TRUE** |
| IDC_O_COSMOREFUND | 1회환불/회수 버튼 | **TRUE** |
| IDC_O_DUTCHPAY | 더치페이 버튼 | FALSE |
| IDC_O_TMPAMTCHANGE2 | 임시단가 버튼 | FALSE |
| IDC_BTN_KR | 한국어 선택 | FALSE |
| IDC_BTN_EN | 영어 선택 | FALSE |
| IDC_BTN_VN | 베트남어 선택 | FALSE |
| IDC_O_USERPAY1~4 | UserPay 버튼 (4개) | **TRUE** |
| IDC_O_VATCHANGE2 | 인건비변환 버튼 | FALSE |
| IDC_O_ZALOPAY | ZALOPAY 버튼 | FALSE |
| IDC_O_NAPAS | NAPAS 버튼 | FALSE |
| IDC_O_INFOPLUS_SHINHAN | INFOPLUS (SHINHAN) 버튼 | FALSE |
| IDC_O_INFOPLUS_BIDV | INFOPLUS (BIDV) 버튼 | FALSE |
| IDC_BTN_PLUAREA | PLU Area 버튼 | FALSE |
| IDC_O_CUSTSEARCH | 회원검색 버튼 | FALSE |
| IDC_O_HJVIETPAY | HJ VIETPAY 버튼 | FALSE |
| IDC_O_ITEMSEARCH3 | 상품검색 버튼 | FALSE |
| IDC_O_INFOPLUS_WOORI | INFOPLUS (WOORI) 버튼 | FALSE |

### 요소 통계

| 유형 | 개수 |
|------|------|
| 버튼 | 80 |
| 텍스트/라벨 | 0 |
| 입력 필드 | 0 |
| 그리드/리스트 | 0 |
| 기타 | 0 |
| **합계** | **80** |

---

## 9. 작업 진행 기록
| 날짜 | 범위 | 상태 | 완료 범위 | 남은 범위 | 내용 |
|---|---|---|---|---|---|
| 2026-04-05 | Shell 구현 | 완료 | 레이아웃+로컬상태+stub | Bridge/UseCase 연동 | OrderPaymentQuickSelect.tsx shell 구현 완료. 58개 기능 매핑, 결제수단/주문액션/커스텀버튼 그리드, 언어선택/버튼배치 설정 포함 |
