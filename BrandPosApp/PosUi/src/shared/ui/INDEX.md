# shared/ui Catalog

PosUi 화면 작업 0단계: **이 파일을 먼저 읽고**, 화면 문서가 요구하는 UI 요소가 이미 있는지 확인한다.
없을 때만 shared/ui 에 새 컴포넌트를 추가한다 (PR 분리). 화면 파일에 inline UI 원본을 만들지 않는다.

규칙은 `BrandPosApp/PosUi/CLAUDE.md` 를 따른다.

---

## Atoms (`atoms/`)

| 컴포넌트 | 용도 |
|---|---|
| `Badge` | 상태/카운트 표시 (small chip-like) |
| `Button` | 모든 버튼. variant: primary / secondary / outline / danger / ghost |
| `Checkbox` | 단일 체크박스 |
| `Divider` | 가로/세로 구분선 |
| `Icon` | SVG 아이콘 (path map 기반). 신규 아이콘은 path map 에 추가 |
| `Label` | 폼 라벨 텍스트 |
| `NumberInput` | 숫자 전용 input (HTML input 기반) |
| `Radio` | 단일 라디오 |
| `Skeleton` | 로딩 자리표시자 |
| `Spinner` | 로딩 인디케이터 |
| `TextInput` | 일반 텍스트 input (HTML input 기반) |
| `Toggle` | on/off 스위치 |

## Molecules (`molecules/`)

| 컴포넌트 | 용도 |
|---|---|
| `Alert` | 인라인 경고/정보 박스 |
| `AmountInput` | 통화 금액 입력 (포맷팅 포함) |
| `Chip` | 선택 가능한 칩 / 필터 칩 |
| `DatePicker` | 날짜 선택 |
| `Dropdown` | 단일 선택 드롭다운 |
| `FormField` | 라벨 + 입력 + 에러 수직 스택 래퍼 (HTML input 기반 폼) |
| `IconLabelField` | 아이콘 + 인라인 라벨 + 값 한 줄 셀 (키패드 입력 화면용. Login/Settings) |
| `NumPad` | POS 숫자 키패드. variant: `standard`(4x4 + 확인) / `compact`(4x3, 확인 없음) |
| `ProgressBar` | 진행률 바 |
| `SearchBar` | 검색 입력 + 버튼 |
| `Stepper` | 수량 +/- |
| `Tabs` | 탭 네비게이션 |
| `Toast` | 일시 알림 |

## Organisms (`organisms/`)

| 컴포넌트 | 용도 |
|---|---|
| `AppHeader` | 앱 상단 헤더 |
| `CategoryBar` | 메뉴 카테고리 가로 바 |
| `ConfirmDialog` | 확인/취소 모달 |
| `CustomerInfoPanel` | 고객 정보 사이드 패널 |
| `DeviceStatus` | 디바이스 연결 상태 표시 |
| `Drawer` | 사이드 슬라이드 패널 |
| `EditableDataGrid` | 인라인 편집 가능 데이터 그리드 |
| `EmployeeSelector` | 직원 선택 (콤보) |
| `FloorSelector` | 매장 층 선택 |
| `Header` | 화면 상단 헤더 (AppHeader 와 구분: 화면 단위) |
| `KeypadPanel` | 키패드 + 표시 영역 묶음 패널 |
| `KitchenDisplay` | 주방 표시기 |
| `MemoDialog` | 메모 입력 모달 |
| `MenuCard` | 단일 메뉴 카드 |
| `MenuGrid` | 메뉴 카드 그리드 |
| `MessageDialog` | 메시지 모달 |
| `Modal` | 일반 모달 컨테이너 |
| `NavigationBar` | 하단/상단 네비게이션 바 |
| `OrderItemList` | 주문 아이템 리스트 |
| `OrderSidebar` | 주문 사이드바 (Master-Detail 우측) |
| `PaymentMethodSelector` | 결제수단 선택 |
| `PhoneNumPad` / `PhoneNumPadV2` | 전화번호 입력 키패드 |
| `ReceiptPreview` | 영수증 미리보기 |
| `SummaryPanel` | 합계 패널 |
| `TableCard` | 테이블 단일 카드 |
| `TableGrid` | 테이블 그리드 |
| `TakeoutBar` | 포장 / 매장 토글 바 |
| `UnauthorizedDialog` | 권한 없음 모달 |

## Templates (`templates/`)

화면 레이아웃 패턴. **신규 화면은 이 중 하나를 선택해 시작한다.**

| 템플릿 | 화면 패턴 | 사용 예 |
|---|---|---|
| `POSMainLayout` | POS 메인 레이아웃 (헤더 + 본문 + 사이드바) | OrderScreen, MainMenuScreen |
| `SplitPanelLayout` | Master-Detail 좌/우 분할 | CustomerScreen, StockScreen |
| `FullScreenPanel` | 단일 풀스크린 패널 | LoginScreen, SetupScreen |
| `FullScreenModal` | 풀스크린 모달 | PaymentScreen, QR Dialog |

## Specialized (`specialized/`)

특수 도메인 컴포넌트. 일반 화면에서는 거의 사용하지 않음.

| 컴포넌트 | 용도 |
|---|---|
| `ChangeCalculator` | 거스름돈 계산기 |
| `DiscountCalculator` | 할인 계산기 |
| `ErrorRecovery` | 에러 복구 UI |
| `OptionSelector` | 메뉴 옵션 선택기 |
| `PaymentStatus` | 결제 상태 표시 |
| `QRCodeDisplay` | QR 코드 표시 |
| `SignaturePad` | 서명 입력 |
| `VoidReceipt` | 취소 영수증 |

## Concepts (`concepts/`)

디자인 컨셉 프리셋 (테마/팔레트). 일반 화면 작업에서는 import 하지 않는다.

---

## Reference 화면 (5개 패턴)

신규 화면을 시작하기 전, **같은 패턴의 reference 화면 폴더 전체를 먼저 읽는다.**

| 화면 패턴 | Template | Reference 화면 |
|---|---|---|
| Form / Keypad Input | `FullScreenPanel` | `screens/LoginScreen` |
| Master-Detail | `POSMainLayout` | `screens/OrderScreen` |
| Grid Picker | `POSMainLayout` | `screens/MainMenuScreen` (TBD) |
| Wizard / Stepper | `FullScreenPanel` | `screens/SetupScreen` (TBD) |
| Full-Screen Dialog | `FullScreenModal` | `screens/PaymentScreen` |

(TBD 표시는 reference 미확정. 첫 작업 시 reference 로 지정한다.)

---

## 테마 (라이트 / 다크 필수)

- 모든 컴포넌트는 라이트 / 다크 양쪽 테마를 지원해야 한다.
- 색상은 의미 토큰(`bg-pos-bg`, `bg-pos-surface`, `text-pos-text`, `border-pos-border`, `bg-pos-error` 등) 만 사용한다. 토큰은 `data-theme="light"` / `data-theme="dark"` 양쪽에 정의되어 있다.
- 컴포넌트/화면 코드에 테마 분기 (`if (theme === 'dark') ...`) 를 작성하지 않는다. 토큰이 자동으로 전환된다.
- 신규 토큰을 추가하면 `src/styles/tokens/` 의 light / dark 양쪽 파일에 값을 정의한다.
- 신규 컴포넌트 PR 은 두 테마 모두에서 시각 검증한 뒤 머지한다 (`design-docs` 에서 테마 토글로 확인).

## 신규 컴포넌트 추가 절차

1. 화면 작업 중 shared/ui 에 없는 UI 요소가 발견되면 작업을 멈춘다.
2. **선행 PR** 로 `shared/ui/<atoms|molecules|organisms>/<PascalCase>.tsx` 를 추가한다.
3. 이 파일(`INDEX.md`)에 한 줄 추가한다.
4. 즉시 머지 후 화면 작업 PR 을 진행한다.

화면 폴더(`screens/<Screen>/components/`) 에 재사용 UI 원본을 만들지 않는다.
화면 전용 컴포지션(여러 shared/ui 를 묶은 화면 전용 조합) 만 `components/` 에 둔다.
