# SET-RESTAURANTSET-DIALOG: 설정 메인 허브 화면

## 0. 문서 정보

| 항목 | 값 |
|---|---|
| 문서 ID | SCR-SET-MAIN |
| 화면 ID | SetupScreen/index |
| 레거시 다이얼로그 | IDD_RESTAURANTSET_DIALOG (리소스 102) |
| 작성일 | 2026-04-05 |
| 상태 | 초안 |

---

## 1. 화면 개요

설정 프로그램(RestaurantSet)의 메인 진입 화면이다. BrandPosApp의 Setup 모드 진입 시 표시되는 최상위 네비게이션 허브로, 각 설정 하위 화면으로의 라우팅 역할을 수행한다. 레거시에서는 42개 버튼이 배치된 MFC 팝업 다이얼로그였으나, 신규에서는 단일 CEF 브라우저 내 React 라우팅 기반 사이드바/탭 네비게이션으로 대체한다.

- **운영 모드**: Setup mode

---

## 2. 상위 기준 연결

| 기준 문서 | 관련 섹션 | 비고 |
|---|---|---|
| 04-Edge-POS-아키텍처-설계서 | 2.3 통합 목표 디렉토리 구조 | screens/SetupScreen/* 위치 기준 |
| 05-Edge-POS-전체-흐름-AZ-가이드 | INI feature flag 제어 | Setup 모드 진입 플래그 |
| CLAUDE.md | PosUi 개발 규칙 / Screen 규칙 | shared/ui import, RTK Query 사용 |
| CLAUDE.md | CEF / UI 운영 규칙 | 단일 CefBrowser 인스턴스 유지, 화면 전환 시 CloseBrowser 금지 |
| CLAUDE.md | i18n 규칙 | 언어 전환은 SharedAssets/i18n/locales/ 기반 |

---

## 3. 기능 목록

| ID | 기능명 | 설명 | 우선순위 |
|---|---|---|---|
| F-SET-001 | 설정 메인 화면 진입 | Setup 모드 진입 시 네비게이션 허브 표시 | P0 |
| F-SET-002 | 상품 설정 진입 | ItemInput 화면으로 라우팅 | P0 |
| F-SET-003 | 테이블(자리) 설정 진입 | TableConfig 화면으로 라우팅 | P1 |
| F-SET-004 | 화면상품설정 진입 | MenuDisplay 화면으로 라우팅 | P1 |
| F-SET-005 | 매장 설정 진입 | StoreInfo 화면으로 라우팅 | P0 |
| F-SET-006 | 장비 설정 진입 | DeviceConfig 화면으로 라우팅 | P0 |
| F-SET-007 | 직원 설정 진입 | EmployeeInput 화면으로 라우팅 | P1 |
| F-SET-008 | 카드 설정 진입 | CardConfig 화면으로 라우팅 | P1 |
| F-SET-009 | 행사 설정 진입 | EventConfig 화면으로 라우팅 | P1 |
| F-SET-010 | 할인매출설정 진입 | DiscountConfig 화면으로 라우팅 | P1 |
| F-SET-011 | 인쇄 설정 진입 | PrintConfig 화면으로 라우팅 | P1 |
| F-SET-012 | 주문 메시지 설정 진입 | OrderMessage 화면으로 라우팅 | P1 |
| F-SET-013 | 기초 설정 진입 | BasicConfig 화면으로 라우팅 | P0 |
| F-SET-014 | Lock Clear | 잠금 해제 처리 | P2 |
| F-SET-015 | 환경 설정 진입 | IniConfig 화면으로 라우팅 | P1 |
| F-SET-016 | 설치회사 설정 진입 | CompanyConfig 화면으로 라우팅 | P2 |
| F-SET-017 | 데이터 삭제 | MaintenanceScreen/DataDelete로 라우팅 | P2 |
| F-SET-018 | 테이블(좌석) 설정 진입 | TableSeatConfig 화면으로 라우팅 | P1 |
| F-SET-019 | 입출금 설정 진입 | CashInOut 화면으로 라우팅 | P2 |
| F-SET-020 | 거래처 설정 진입 | SupplierConfig 화면으로 라우팅 | P2 |
| F-SET-021 | 데이터 복원 | MaintenanceScreen/DataRestore로 라우팅 | P2 |
| F-SET-022 | 테이블 메모 설정 진입 | TableMemo 화면으로 라우팅 | P2 |
| F-SET-023 | 간이영수증 설정 진입 | ReceiptConfig 화면으로 라우팅 | P2 |
| F-SET-024 | 고객 정보 설정 진입 | CustomerInfo 화면으로 라우팅 | P2 |
| F-SET-025 | PAY(캐시백) 설정 진입 | CashbackConfig 화면으로 라우팅 | P2 |
| F-SET-026 | 기타 설정 진입 | EtcConfig 화면으로 라우팅 | P2 |
| F-SET-027 | 메뉴 즐겨찾기 진입 | MenuFavorites 화면으로 라우팅 | P2 |
| F-SET-028 | 잠금 토글 | Setup 화면 잠금/해제 토글 | P2 |
| F-SET-029 | 기초코드 설정 진입 | BasicCode 화면으로 라우팅 | P2 |
| F-SET-030 | PLU 상품 진입 | ItemPlu 화면으로 라우팅 | P2 |
| F-SET-031 | 장비(마트) 설정 진입 | DeviceMart 화면으로 라우팅 | P2 |
| F-SET-032 | PLU키 설정 진입 | PluKey 화면으로 라우팅 | P2 |
| F-SET-033 | 프리셋 설정 진입 | PresetConfig 화면으로 라우팅 | P2 |
| F-SET-034 | 하드웨어 설치마법사 진입 | HardwareWizard 화면으로 라우팅 | P2 |
| F-SET-035 | Table Order 설정 진입 | TableOrder 화면으로 라우팅 | P2 |
| F-SET-036 | 언어 선택 (KR) | 한국어로 전환, 로컬 DB 반영 | P1 |
| F-SET-037 | 언어 선택 (EN) | 영어로 전환, 로컬 DB 반영 | P1 |
| F-SET-038 | 언어 선택 (VN) | 베트남어로 전환, 로컬 DB 반영 | P1 |
| F-SET-039 | 확인/완료 | Setup 모드 종료 | P0 |

---

## 4. UI 구조

### 4.1 화면 레이아웃

```
+--------------------------------------------------------------+
| [KR] [EN] [VN]           POS번호: {posNo}       [완료]      |
+--------------------------------------------------------------+
|                                                              |
|  +--sidebar--+  +--content area--------------------------+   |
|  | 기초설정   |  |                                       |   |
|  | 매장설정   |  |  (선택된 설정 화면 렌더링 영역)        |   |
|  | 장비설정   |  |                                       |   |
|  | 상품설정   |  |                                       |   |
|  | 행사설정   |  |                                       |   |
|  | 할인설정   |  |                                       |   |
|  | 직원설정   |  |                                       |   |
|  | ...        |  |                                       |   |
|  | 데이터삭제 |  |                                       |   |
|  | 데이터복원 |  |                                       |   |
|  +------------+  +---------------------------------------+   |
+--------------------------------------------------------------+
```

- 좌측: 카테고리별 그룹화된 사이드바 네비게이션 (React Router 기반)
- 우측: 선택된 설정 화면이 렌더링되는 콘텐츠 영역
- 상단: 언어 선택 토글, POS 번호 표시, 완료 버튼

### 4.2 공용 UI 컴포넌트 매핑

| 컴포넌트 | 위치 | 용도 |
|---|---|---|
| shared/ui/atoms/Text | POS 번호 표시 | D-SET-001 |
| shared/ui/atoms/Button | 언어 선택 토글 (KR/EN/VN), 완료 버튼 | F-SET-036~39 |
| shared/ui/molecules/SidebarNav | TODO: 설정 카테고리 사이드바 네비게이션 | 전체 라우팅 |

---

## 5. 구현 명세

### 5.1 Bridge Commands

| Command | 방향 | Payload | 응답 | 비고 |
|---|---|---|---|---|
| SETUP:NAVIGATE | UI → C++ | `{ target: string }` | - | 하위 화면 라우팅 (React Router 처리, Bridge 불필요) |
| SETUP:BASIC:SAVE | UI → C++ | `{ lang: "ko" \| "en" \| "vi" }` | `{ success: boolean }` | 언어 변경 시 로컬 DB 저장 |
| SETUP:LOCK_TOGGLE | UI → C++ | `{}` | `{ locked: boolean }` | 잠금 토글 |
| SETUP:LOCK_CLEAR | UI → C++ | `{}` | `{ success: boolean }` | Lock Clear |

#### Bridge Error 규칙

| Command | Error Code | 조건 |
|---|---|---|
| SETUP:BASIC:SAVE | VALIDATION_FAILED | lang 값이 허용 범위("ko", "en", "vi") 밖일 때 |
| SETUP:LOCK_TOGGLE | TODO: 잠금 해제 실패 조건 정의 필요 | |
| SETUP:LOCK_CLEAR | TODO: Lock Clear 실패 조건 정의 필요 | |

### 5.2 RTK Query Endpoints

| Endpoint | 메서드 | 태그 | 비고 |
|---|---|---|---|
| setupApi.getBasicConfig | GET | `BasicConfig` | POS 번호, 언어 등 기본 설정 조회 |

### 5.3 UseCase 매핑

| UseCase | 트리거 | Domain/Manager | Infrastructure |
|---|---|---|---|
| SaveBasicConfigUseCase | 언어 변경 저장 | SystemMgr | Tables/System/ConfigCrud |

#### UseCase 실패 규칙

- **멱등성**: 언어 설정 저장은 마지막 값 덮어쓰기 (idempotencyKey 불필요)
- **트랜잭션**: SQLite TX 내에서 Config UPDATE 원자적
- **Outbox**: 언어 변경은 중앙 동기화 대상 (매장 설정 → CentralApi)
- **오프라인**: 로컬 DB만 사용, 오프라인 동작 가능

### 5.7 Permission

- 설정 화면은 관리자 전용 (Setup mode 자체가 관리자 접근)
- TODO: Setup mode 진입 시 관리자 인증 절차 상세 정의 필요

### 5.4 데이터 표시 요소

| ID | 표시 항목 | 신규 UI 컴포넌트 | 데이터 소스 |
|---|---|---|---|
| D-SET-001 | POS 번호 | shared/ui/atoms/Text | setupApi.getBasicConfig → posNo |

### 5.5 상태 관리

- 선택된 네비게이션 항목: React Router URL 상태
- 잠금 상태: UI slice (setupUiSlice.locked)
- 언어 선택: RTK Query 캐시 (setupApi.getBasicConfig → lang)

### 5.6 i18n

- 언어 전환은 SharedAssets/i18n/locales/ 기반으로 처리
- 전환 시 Bridge를 통해 로컬 SQLite에 반영 후 UI 리렌더링

---

## 6. 테스트

| ID | 시나리오 | 기대 결과 |
|---|---|---|
| T-SET-001 | Setup 모드 진입 | 네비게이션 허브 표시, POS 번호 정상 출력 |
| T-SET-002 | 각 설정 메뉴 클릭 | 해당 하위 화면으로 정상 라우팅 |
| T-SET-003 | 언어 전환 (KR/EN/VN) | UI 즉시 전환, 로컬 DB 반영 확인 |
| T-SET-004 | 완료 버튼 클릭 | Setup 모드 종료, POS 메인 화면 복귀 |
| T-SET-005 | mockTransport 환경 | C++ 없이 next dev + design-system에서 정상 동작 |

---

## 7. 완료 기준

- [ ] screens/SetupScreen/index.tsx 구현 완료
- [ ] 사이드바 네비게이션에서 P0 화면(기초설정, 매장설정, 장비설정, 상품설정) 라우팅 동작
- [ ] 언어 전환 기능 동작 (SharedAssets/i18n/locales/ 기반)
- [ ] POS 번호 표시 동작
- [ ] mockTransport로 C++ 없이 독립 개발 가능
- [ ] 1024x768 해상도 + 터치 사용성 검증

---

## 8. 작업 명단

| 파일 경로 | 역할 | 상태 |
|---|---|---|
| BrandPosApp/PosUi/src/screens/SettingsScreen/index.tsx | 설정 메인 허브 (SettingsScreen hub) | SHELL 완료 (2026-04-05) |
| BrandPosApp/PosUi/src/screens/SettingsScreen/components/SettingsMainDialog.tsx | 설정 메인 네비게이션 허브 화면 | SHELL 완료 (2026-04-05) |
| BrandPosApp/PosUi/src/shared/ui/molecules/SidebarNav.tsx | 사이드바 네비게이션 컴포넌트 | TODO |
| BrandPosApp/PosUi/src/store/api/setupApi.ts | 설정 RTK Query 루트 API | TODO |
| BrandPosApp/PosUi/src/store/slices/setupUiSlice.ts | 설정 UI 상태 slice | TODO |
| BrandPosApp/PosUi/src/bridge/commands/setupCommands.ts | 설정 Bridge Command 정의 | TODO |
| BrandPosApp/Presentation/CEF/InternalBridge/PosRequestActions/System/SystemActions.cpp | SETUP:BASIC:SAVE 라우팅 | TODO |
| BrandPosApp/UseCases/System/SaveBasicConfigUseCase.cpp | 기초설정 저장 UseCase | TODO |
| BrandPosApp/Domain/System/SystemMgr.cpp | 시스템 설정 Manager | TODO |
| BrandPosApp/Infrastructure/Persistence/SQLite/Tables/System/ConfigCrud.cpp | 설정 CRUD | TODO |

---

## Appendix: 레거시 참조

### 레거시 다이얼로그 정보

| 항목 | 값 |
|---|---|
| 다이얼로그 ID | IDD_RESTAURANTSET_DIALOG |
| 리소스 값 | 102 |
| 크기 (DLU) | 501 x 453 |
| 스타일 | DS_SETFONT \| WS_POPUP \| WS_VISIBLE |
| 소스 파일 | RestaurantSet.rc |
| 총 UI 요소 수 | 43 (버튼 42, 라벨 1) |

### 레거시 버튼 매핑

| 레거시 ID | 용도 | 신규 라우팅 대상 | 비고 |
|---|---|---|---|
| IDOK | 확인/완료 | SetupScreen/index.tsx (닫기) | P0 |
| IDC_SET_ITEM | 상품설정 | SetupScreen/ItemInput | P0 |
| IDC_SET_TABLE | 테이블(자리) | SetupScreen/TableConfig | P1 |
| IDC_SET_MENU | 화면상품설정 | SetupScreen/MenuDisplay | P1 |
| IDC_SET_STORE | 매장설정 | SetupScreen/StoreInfo | P0 |
| IDC_SET_DEVICE | 장비설정 | SetupScreen/DeviceConfig | P0 |
| IDC_SET_EMP | 직원설정 | SetupScreen/EmployeeInput | P1 |
| IDC_SET_CARD | 카드설정 | SetupScreen/CardConfig | P1 |
| IDC_SET_EVENT | 행사설정 | SetupScreen/EventConfig | P1 |
| IDC_SET_DISCOUNT | 할인매출설정 | SetupScreen/DiscountConfig | P1 |
| IDC_SET_PRINT | 인쇄설정 | SetupScreen/PrintConfig | P1 |
| IDC_SET_ORDERMSG | 주문메시지설정 | SetupScreen/OrderMessage | P1 |
| IDC_SET_BASIC | 기초설정 | SetupScreen/BasicConfig | P0 |
| IDC_SET_KEYCLEAR | Lock Clear | SetupScreen/LockClear | P2 |
| IDC_SET_INISET | 환경설정 | SetupScreen/IniConfig | P1 |
| IDC_SET_COMPANY | 설치회사설정 | SetupScreen/CompanyConfig | P2 |
| IDC_SET_DATADEL | 데이터삭제 | MaintenanceScreen/DataDelete | P2 |
| IDC_SET_TABLE2 | 테이블(좌석) | SetupScreen/TableSeatConfig | P1 |
| IDC_SET_INOUT | 입출금설정 | SetupScreen/CashInOut | P2 |
| IDC_SET_SUPPLY | 거래처설정 | SetupScreen/SupplierConfig | P2 |
| IDC_SET_RESTORE | 데이터복원 | MaintenanceScreen/DataRestore | P2 |
| IDC_SET_TABLEMSG | 테이블메모설정 | SetupScreen/TableMemo | P2 |
| IDC_SET_RECEIPT | 간이영수증설정 | SetupScreen/ReceiptConfig | P2 |
| IDC_SET_CUSTINFO | 고객정보설정 | SetupScreen/CustomerInfo | P2 |
| IDC_SET_CASHBACK | PAY(캐시백)설정 | SetupScreen/CashbackConfig | P2 |
| IDC_SET_ETCSET | 기타설정 | SetupScreen/EtcConfig | P2 |
| IDC_SET_FAVORITES | 메뉴즐겨찾기 | SetupScreen/MenuFavorites | P2 |
| IDC_LOCKBTN | 잠금 | SetupScreen/index.tsx (토글) | P2 |
| IDC_SET_BASICCODE | 기초코드 | SetupScreen/BasicCode | P2 |
| IDC_SET_ITEMPLU | PLU상품 | SetupScreen/ItemPlu | P2 |
| IDC_SET_DEVICEMART | 장비(마트) | SetupScreen/DeviceMart | P2 |
| IDC_SET_PLUKEY | PLU키설정 | SetupScreen/PluKey | P2 |
| IDC_SET_PRESET | 프리셋설정 | SetupScreen/PresetConfig | P2 |
| IDC_BTN_HDWWIZ | 하드웨어설치마법사 | SetupScreen/HardwareWizard | P2 |
| IDC_SET_KIOSK | Table Order | SetupScreen/TableOrder | P2 |
| IDC_BTN_KR | 한국어 | 언어 토글 (lang=ko) | P1 |
| IDC_BTN_EN | 영어 | 언어 토글 (lang=en) | P1 |
| IDC_BTN_VN | 베트남어 | 언어 토글 (lang=vi) | P1 |
| IDC_SET_CUST | 고객설정 (숨김) | 미사용 (NOT WS_VISIBLE) | 제외 |
| IDC_SET_ASP | ASP설정 (숨김) | 미사용 (NOT WS_VISIBLE) | 제외 |
| IDC_ITEM_EXCEL | Excel (숨김) | 미사용 (NOT WS_VISIBLE) | 제외 |
| IDC_CUST_EXCEL | Excel (숨김) | 미사용 (NOT WS_VISIBLE) | 제외 |

### 마이그레이션 노트

- 레거시에서는 각 설정 진입 시 별도 MFC Dialog를 팝업으로 열었으나, 신규에서는 단일 CEF 브라우저 내 React 라우팅으로 전환한다.
- 숨김 상태(NOT WS_VISIBLE) 버튼 3종(고객설정, ASP설정, Excel)은 마이그레이션 대상에서 제외한다.
