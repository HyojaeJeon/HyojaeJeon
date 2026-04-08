# KIOSK_DLG - 키오스크 메인

## 0. 문서정보

| 항목 | 값 |
|------|---|
| 문서 ID | SCR-KIOSK |
| 레거시 다이얼로그 | IDD_KIOSK_DLG (276) |
| 신규 화면 경로 | screens/KioskScreen |
| 작성일 | 2026-04-05 |
| 상태 | 초안 |

## 1. 화면개요

키오스크 메인 화면이다. 고객 대면 UI로, 메뉴 그룹/카테고리를 탐색하고 주문 항목을 선택하여 주문을 처리한다. 다국어(KR/EN/CN/JP) 전환을 지원하며, 무응답 타임아웃 타이머, 바코드 스캔, 관리자 모드 진입 기능을 포함한다. 1024x768 터치 사용성 기준을 엄격히 준수해야 하는 화면이다.

## 2. 상위기준연결

| 기준 문서 | 관련 섹션 |
|-----------|-----------|
| 04-Edge-POS-아키텍처-설계서 | 계층 흐름, CEF/UI 운영 규칙 (1024x768 고정 해상도, 터치 사용성) |
| 05-Edge-POS-전체-흐름-AZ-가이드 | 키오스크 주문 흐름 |
| CLAUDE.md | Offline-First, i18n 규칙 (BrandPosApp/PosUi/src/i18n/locales/ 원본) |

## 3. 기능목록

| ID | 기능명 | 우선순위 | Bridge Command | UseCase | Domain/Manager | Infrastructure |
|---|---|---|---|---|---|---|
| KD-F01 | 키오스크 주문 처리 (버튼 1~4) | P0 | KIOSK:PROCESS | ProcessKioskOrderUseCase | KioskMgr, OrderMgr | Tables/Stock/OrderCrud, OutboxStore |
| KD-F02 | 관리자 모드 진입 | P1 | KIOSK:GET_ORDERS | GetKioskOrdersUseCase | KioskMgr, SystemMgr | Tables/Stock/OrderCrud |
| KD-F03 | 홈 화면 이동 | P1 | - (React 라우팅) | - | - | - |
| KD-F04 | 다국어 선택 (KR/EN/CN/JP) | P1 | - | - | - | - |
| KD-F05 | 주문 그리드 스크롤 | P2 | - | - | - | - |
| KD-F06 | 확인 (숨김) | P2 | - | - | - | - |
| KD-F07 | 닫기 (숨김) | P2 | - | - | - | - |

## 4. UI 구조

### 4.1 화면 레이아웃

```
+---------------------------------------------------------------+
| [관리자]                 [KR][EN][CN][JP]   [타이머] [홈]      |
+-------------------------------------------+-------------------+
| 메뉴 그룹 탭                               |                   |
+-------------------------------------------+ 주문 목록         |
|                                           | DataGrid          |
| 메뉴 카테고리 영역                         |                   |
| (데이터 기반 동적 렌더링)                   | 합계: ₩0          |
|                                           +-------------------+
|                                           | [주문버튼1][주문버튼2] |
|                                           | [주문버튼3][주문버튼4] |
+-------------------------------------------+-------------------+
| [바코드 스캔 핸들러 - 숨김 input]                              |
+---------------------------------------------------------------+
```

### 4.2 shared/ui 컴포넌트 매핑

| shared/ui 컴포넌트 | 용도 | 비고 |
|---|---|---|
| shared/ui/organisms/DataGrid | 주문 목록 그리드 | 가상 스크롤 적용 |
| shared/ui/molecules/LanguageSelector | 다국어 선택 (KR/EN/CN/JP) | 설정에 따라 조건부 활성화, i18n은 BrandPosApp/PosUi/src/i18n/locales/ 원본 |

## 5. 구현명세

### 5.1 PosRequest 명세

| Command | Payload | 응답 | 비고 |
|---|---|---|---|
| KIOSK:GET_ORDERS | `{}` | `{ orders: [...] }` | 주문 목록 조회. Error: (없음) |
| KIOSK:PROCESS | `{ orderId, action: "ACCEPT" \| "REJECT" }` | `{ order: { orderId, status, processedAt } }` | 주문 수락/거절. Error: `ORDER_NOT_FOUND` |

### 5.2 RTK Query endpoint

| endpoint | 태그 | 캐시 전략 |
|---|---|---|
| kioskApi.getKioskMenu | `KioskMenuList` | TODO: 메뉴 갱신 주기 확정 필요 |
| kioskApi.getKioskOrders | `KioskOrder:{id}` | mutation 성공 시 updateQueryData |

### 5.3 UseCase 흐름

**ProcessKioskOrderUseCase (P0)**
1. requestId + idempotencyKey 검사 (RequestLedgerStore)
2. 작업 단위 락 획득
3. actionType에 따라 분기:
   - confirm: KioskMgr.ConfirmOrder() + OrderMgr.CreateOrder()
   - cancel: KioskMgr.CancelOrder()
   - modify: KioskMgr.ModifyOrder()
   - pay: TODO: 결제 흐름 연결 확정 필요
4. 트랜잭션 내: 업무 데이터 + Ledger(SUCCEEDED) + Outbox(PENDING) 기록
5. 커밋 후: PosRealTimeSender로 UI 갱신 이벤트 방송

**중요**: Offline-First 원칙에 따라 로컬 SQLite에 먼저 저장한 후 UI를 갱신한다.

### 5.4 Domain/Manager

| Manager | 메서드 | 책임 |
|---|---|---|
| KioskMgr | ConfirmOrder() | 키오스크 주문 확인 처리 |
| KioskMgr | CancelOrder() | 키오스크 주문 취소 |
| KioskMgr | ModifyOrder() | 키오스크 주문 수정 |
| OrderMgr | CreateOrder() | 주문 데이터 생성 |
| SystemMgr | ValidateAdminAccess() | 관리자 모드 접근 검증 |

### 5.5 Infrastructure

| 모듈 | 파일 | 책임 |
|---|---|---|
| Tables/Stock/OrderCrud | OrderCrud.h/cpp | 주문 CRUD |
| OutboxStore | OutboxStore.h/cpp | 중앙 서버 동기화 큐 |
| RequestLedgerStore | RequestLedgerStore.h/cpp | 멱등성 기록 |

### 5.6 PosRealTime 이벤트

| 이벤트 | 발행 시점 | 수신 UI 처리 |
|---|---|---|
| KIOSK:ORDER_PROCESSED | ProcessKioskOrderUseCase 커밋 후 | 주문 목록/합계 갱신 (외부 변경만) |

### 5.7 Permission

| 대상 기능 | 권한 | 비고 |
|---|---|---|
| 키오스크 주문 조회/처리 (KIOSK:GET_ORDERS, KIOSK:PROCESS) | 고객 대면 (권한 없음) | 고객 터치 UI에서 직접 조작 |
| 관리자 모드 진입 | 관리자 전용 | TODO: 관리자 모드 진입 인증 방식(PIN 등) 확정 필요 |

## 6. 테스트

| ID | 시나리오 | 검증 항목 |
|---|---|---|
| KD-T01 | 키오스크 주문 확인 | DB 저장, Outbox 생성, UI 갱신 확인 |
| KD-T02 | 키오스크 주문 취소 | 주문 취소 처리, 금액 환산 확인 |
| KD-T03 | 동일 idempotencyKey 중복 요청 | 멱등성 보장 확인 |
| KD-T04 | 다국어 전환 (KR->EN->CN->JP) | 텍스트 전환 확인, i18n 원본 일치 |
| KD-T05 | 무응답 타임아웃 | 타이머 만료 시 홈 화면 복귀 확인 |
| KD-T06 | 바코드 스캔 입력 | 스캔 데이터 수신 및 메뉴 항목 매칭 |
| KD-T07 | 터치 버튼 최소 크기 준수 | 주문 버튼 44x44px 이상 확인 |

## 7. 완료기준

- [ ] ProcessKioskOrderUseCase 트랜잭션/멱등성/Outbox 일괄 처리 구현
- [ ] KioskMgr 도메인 로직 구현 (주문 확인/취소/수정)
- [ ] screens/KioskScreen 화면 구현 (1024x768 터치 사용성 준수)
- [ ] 메뉴 그룹/카테고리 데이터 기반 동적 렌더링 구현
- [ ] 다국어 LanguageSelector 구현 (BrandPosApp/PosUi/src/i18n/locales/ 원본)
- [ ] 무응답 타임아웃 타이머 구현 (useEffect 기반)
- [ ] 바코드 스캔 핸들러 구현 (숨김 input + onKeyDown)
- [ ] 주문 버튼 최소 터치 크기 44x44px 보장

## 8. 작업명단

| 계층 | 파일 경로 |
|------|-----------|
| Screen | BrandPosApp/PosUi/src/screens/KioskScreen/index.tsx |
| Screen hooks | BrandPosApp/PosUi/src/screens/KioskScreen/hooks/useKioskOrder.ts |
| Screen hooks | BrandPosApp/PosUi/src/screens/KioskScreen/hooks/useKioskTimer.ts |
| shared/ui | BrandPosApp/PosUi/src/shared/ui/organisms/DataGrid.tsx |
| shared/ui | BrandPosApp/PosUi/src/shared/ui/molecules/LanguageSelector.tsx |
| RTK Query | BrandPosApp/PosUi/src/store/api/kioskApi.ts |
| Bridge Command | BrandPosApp/PosUi/src/bridge/commands/kioskCommands.ts |
| PosRequestActions | BrandPosApp/Presentation/CEF/InternalBridge/PosRequestActions/Kiosk/KioskActions.cpp |
| PosRequestActions | BrandPosApp/Presentation/CEF/InternalBridge/PosRequestActions/Kiosk/KioskActions.h |
| UseCase | BrandPosApp/UseCases/Kiosk/ProcessKioskOrderUseCase.cpp |
| UseCase | BrandPosApp/UseCases/Kiosk/ProcessKioskOrderUseCase.h |
| UseCase | BrandPosApp/UseCases/Kiosk/GetKioskOrdersUseCase.cpp |
| UseCase | BrandPosApp/UseCases/Kiosk/GetKioskOrdersUseCase.h |
| Domain | BrandPosApp/Domain/Kiosk/KioskMgr.cpp |
| Domain | BrandPosApp/Domain/Kiosk/KioskMgr.h |
| Domain | BrandPosApp/Domain/Order/OrderMgr.cpp |
| Domain | BrandPosApp/Domain/Order/OrderMgr.h |
| Domain | BrandPosApp/Domain/System/SystemMgr.cpp |
| Domain | BrandPosApp/Domain/System/SystemMgr.h |
| Infrastructure | BrandPosApp/Infrastructure/Persistence/SQLite/Tables/Stock/OrderCrud.cpp |
| Infrastructure | BrandPosApp/Infrastructure/Persistence/SQLite/Tables/Stock/OrderCrud.h |

---

## Appendix: 레거시 참조

### 레거시 다이얼로그 정보

| 항목 | 값 |
|------|---|
| 다이얼로그 ID | IDD_KIOSK_DLG |
| 리소스 값 | 276 |
| 크기 (DLU) | 512 x 384 |
| 다이얼로그 타입 | DIALOGEX |
| 스타일 | DS_SETFONT \| WS_POPUP |
| 폰트 | 10, "System", 0, 0, 0x1 |
| 소스 파일 | Restaurant.rc |
| 총 UI 요소 수 | 20 (버튼 14, 텍스트/라벨 5, 그리드/리스트 1) |

### 레거시 UI 요소 → 신규 매핑

| 레거시 ID | 레거시 용도 | 신규 대응 |
|---|---|---|
| IDC_BTN_KIO1~4 | 주문 처리 버튼 (4개) | 주문 액션 버튼 (actionType 파라미터로 분기) |
| IDC_BTN_MANGR | 관리자 모드 버튼 | 관리자 버튼 |
| IDC_BTN_HOME | 홈 버튼 | React 라우팅 홈 |
| IDC_BTN_GRIDUP, IDC_BTN_GRIDDN | 그리드 스크롤 | 가상 스크롤로 대체 |
| IDC_BTN_LANKR, IDC_BTN_LANEN, IDC_BTN_LANCN, IDC_BTN_LANJP | 다국어 선택 (숨김) | shared/ui/molecules/LanguageSelector |
| IDOK | 확인 (숨김) | 제거 |
| IDCANCEL | 닫기 (숨김) | 제거 |
| IDC_FRM_PLUMENU | 메뉴 플러그인 컨테이너 (숨김) | 데이터 기반 동적 렌더링 |
| IDC_FRM_PLUGRP | 그룹 플러그인 컨테이너 (숨김) | 메뉴 그룹 탭 (동적 렌더링) |
| IDC_LAB_RECEIVE | 합계 금액 표시 | 합계 금액 컴포넌트 |
| IDC_STA_TIMER | 타이머 표시 | useEffect 기반 타이머 컴포넌트 |
| IDC_EDT_BARCODE | 바코드 입력 (숨김) | 숨김 input + onKeyDown 핸들러 |
| IDC_GRID | 주문 목록 그리드 (MFCGridCtrl) | shared/ui/organisms/DataGrid |
