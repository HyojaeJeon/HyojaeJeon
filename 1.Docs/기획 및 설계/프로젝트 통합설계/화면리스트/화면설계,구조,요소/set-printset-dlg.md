# SET-PRINTSET-DLG: 인쇄 설정 화면

---

## 0. 문서 정보

| 항목 | 값 |
|---|---|
| 문서 ID | SET-PRINTSET-DLG |
| 화면명 | 인쇄(주문전표) 설정 |
| 레거시 다이얼로그 | IDD_PRINTSET_DLG (리소스 171) |
| 신규 라우트 | `/pos/setup/print-config` |
| 신규 Screen 경로 | `screens/SetupScreen/PrintConfig` |
| 모드 | Setup mode |
| 작성일 | 2026-04-05 |
| 상태 | Shell 구현 완료 |

---

## 1. 화면 개요

주문전표 인쇄 레이아웃을 설정하는 화면이다. 전표의 각 영역(상단여백, 타이틀, 테이블명/주문번호, 주문시간, 주문메뉴, 주문메시지, 하단여백, 여백타입)별 글꼴 크기를 개별 라디오 그룹으로 제어한다. 59개 UI 요소로 설정 화면 중 가장 복잡하며, 주문번호 최대값/시작값 관리, 대기번호 초기화, 프린터 선택 등의 기능도 포함한다. 인쇄 설정은 주문 프로세스에 직접 영향하므로 P0 핵심 기능이다.

레거시에서는 WS_CHILD 스타일로 다른 탭 컨트롤에 임베딩되는 자식 다이얼로그로 동작한다.

---

## 2. 상위 기준 연결

| 기준 문서 | 관련 섹션 | 비고 |
|---|---|---|
| 04-Edge-POS-아키텍처-설계서 | 2.3 통합 목표 디렉토리 구조 | `screens/SetupScreen/*` 배치 |
| 04-Edge-POS-아키텍처-설계서 | 4.x InternalBridge | `PosRequestActions/System/` thin router |
| CLAUDE.md | DB 엔진 전환 | SQLite `Tables/System/ConfigCrud` |

---

## 3. 기능 목록

| ID | 기능명 | 우선순위 | Bridge Command | UseCase | Domain/Manager | Infrastructure |
|---|---|---|---|---|---|---|
| PRT-F01 | 인쇄 설정 조회 | P0 | `SETUP:PRINT:GET_CONFIG` | `SavePrintConfigUseCase` (조회 경로) | `SystemMgr` | SQLite `Tables/System/ConfigCrud` |
| PRT-F02 | 인쇄 설정 저장 | P0 | `SETUP:PRINT:SAVE` | `SavePrintConfigUseCase` | `SystemMgr` | SQLite `Tables/System/ConfigCrud` |
| PRT-F03 | 상단여백 설정 | P1 | - | - | - | - |
| PRT-F04 | 타이틀 입력 | P1 | - | - | - | - |
| PRT-F05~F08 | 타이틀 글꼴 크기 (소/중/대/특대) | P1 | - | - | - | - |
| PRT-F09~F12 | 테이블명/주문번호 글꼴 크기 | P1 | - | - | - | - |
| PRT-F13~F16 | 주문시간 글꼴 크기 | P1 | - | - | - | - |
| PRT-F17~F20 | 주문메뉴 글꼴 크기 | P1 | - | - | - | - |
| PRT-F21~F24 | 주문메시지 글꼴 크기 | P1 | - | - | - | - |
| PRT-F25~F26 | 주문전표 메뉴 체크 | P1 | - | - | - | - |
| PRT-F27 | 하단여백 설정 | P1 | - | - | - | - |
| PRT-F28 | 주문번호 최대값 입력 | P1 | - | - | - | - |
| PRT-F29 | 최대값 저장 | P1 | `SETUP:PRINT:SAVE` | `SavePrintConfigUseCase` | `SystemMgr` | SQLite `Tables/System/ConfigCrud` |
| PRT-F30 | 초기화 메시지 입력 | P1 | - | - | - | - |
| PRT-F31 | 초기화 실행 | P1 | `SETUP:PRINT:SAVE` | `SavePrintConfigUseCase` | `SystemMgr` | SQLite `Tables/System/ConfigCrud` |
| PRT-F32 | 대기번호 초기화 | P1 | `SETUP:PRINT:SAVE` | `SavePrintConfigUseCase` | `SystemMgr` | SQLite `Tables/System/ConfigCrud` |
| PRT-F33~F34 | 메뉴 출력 체크 | P1 | - | - | - | - |
| PRT-F35 | 세트메뉴 설정 체크 | P2 | - | - | - | - |
| PRT-F36 | 180도 회전 체크 | P2 | - | - | - | - |
| PRT-F37 | 대기인쇄 프린터 선택 | P1 | - | - | - | - |
| PRT-F38 | 대기인쇄 체크 | P2 | - | - | - | - |
| PRT-F39 | 주문메시지 출력 체크 | P1 | - | - | - | - |
| PRT-F40 | 주문번호 시작값 입력 | P1 | - | - | - | - |
| PRT-F41 | 인쇄 타입 선택 | P1 | - | - | - | - |
| PRT-F42 | 주문번호 시작값 저장 | P1 | `SETUP:PRINT:SAVE` | `SavePrintConfigUseCase` | `SystemMgr` | SQLite `Tables/System/ConfigCrud` |

---

## 4. UI 구조

### 4.1 화면 레이아웃

```
+---------------------------------------------------------------+
| [저장]                                             헤더 영역   |
+---------------------------+-----------------------------------+
| 인쇄 영역 라벨           | 글꼴 크기 설정                     |
|                           |                                   |
| 1. 상단여백:  [Select ▼] | 상단여백: [Select ▼]              |
| 2. 타이틀:   [TextField] | ○소 ○중 ○대 ○특대              |
| 3. 테이블명/주문번호      | ☑ 체크1 ☑ 체크2                  |
| 4. 주문시간               | ○소 ○중 ○대 ○특대              |
| 5. 주문메뉴               | ○소 ○중 ○대 ○특대 ☑메뉴 ☑메시지|
| 6. 주문메시지             | ○소 ○중 ○대 ○특대              |
| 7. 하단여백               | 하단여백: [Select ▼]              |
| - 여백타입:  [Select ▼]  |                                   |
+---------------------------+-----------------------------------+
| 주문번호 최대값 설정      | 주문번호 시작값 설정               |
| [NumberField] [최대값저장]| [NumberField] [저장]               |
|                           | 대기번호 초기화                    |
| 영수증 하단 메시지        | [대기번호 초기화]                  |
| [TextField] [초기화]     | 대기인쇄: [Select ▼]             |
+---------------------------+-----------------------------------+
```

### 4.2 사용 컴포넌트 (shared/ui)

| 컴포넌트 | 경로 | 용도 |
|---|---|---|
| `FontSizeRadioGroup` | `shared/ui/molecules/FontSizeRadioGroup` | 5개 영역별 글꼴 크기 라디오 (소/중/대/특대) <!-- TODO: 컴포넌트 신규 생성 필요 --> |
| `Select` | `shared/ui/atoms/Select` | 상단/하단여백, 대기인쇄 프린터, 인쇄 타입 |
| `TextField` | `shared/ui/atoms/TextField` | 타이틀, 초기화 메시지 |
| `NumberField` | `shared/ui/atoms/NumberField` | 주문번호 최대값, 시작값 <!-- TODO: NumberField 컴포넌트 존재 여부 확인 --> |
| `Checkbox` | `shared/ui/atoms/Checkbox` | 메뉴 출력 체크, 메시지 출력 체크 등 |
| `Button` | `shared/ui/atoms/Button` | 저장, 최대값 저장, 초기화, 대기번호 초기화, 시작값 저장 |

---

## 5. 구현 명세

### 5.1 RTK Query Endpoints

| Endpoint | 메서드 | 설명 |
|---|---|---|
| `setupApi.useGetPrintConfigQuery` | GET | 인쇄 설정 전체 조회 |
| `setupApi.useSavePrintConfigMutation` | POST | 인쇄 설정 저장 |

### 5.2 Bridge Commands

| Command | 방향 | Payload | 비고 |
|---|---|---|---|
| `SETUP:PRINT:GET_CONFIG` | UI -> C++ | `{ v, requestId, timestamp }` | 인쇄 설정 조회 |
| `SETUP:PRINT:SAVE` | UI -> C++ | `{ v, requestId, timestamp, idempotencyKey, data: { fontSizes, margins, orderNo, ... } }` | 인쇄 설정 저장 |

### 5.3 UseCase 흐름

**SavePrintConfigUseCase (저장)**
1. `idempotencyKey` 검사 (Ledger)
2. `SystemMgr.validatePrintConfig()` 호출
3. SQLite 트랜잭션: `ConfigCrud.savePrintConfig()` + Ledger 갱신
4. 커밋 후 `PosRealTimeSender` -> UI 갱신 이벤트

### 5.4 Domain/Manager

| Manager | 메서드 | 설명 |
|---|---|---|
| `SystemMgr` | `validatePrintConfig()` | 인쇄 설정 유효성 검증 |
| `SystemMgr` | `getPrintConfig()` | 인쇄 설정 조회 |
| `SystemMgr` | `resetOrderNumber()` | 주문번호/대기번호 초기화 |

### 5.5 Infrastructure

| 모듈 | 파일 | 설명 |
|---|---|---|
| SQLite | `Tables/System/ConfigCrud` | 인쇄 설정 CRUD |

### 5.6 주의사항

- 5개 영역 x 4개 크기 옵션 = 20개 라디오 버튼은 신규에서 `FontSizeRadioGroup` 재사용 컴포넌트로 통합. <!-- TODO: FontSizeRadioGroup 컴포넌트 설계 -->
- 숨김 체크박스(IDC_CHK_SETMENU, IDC_CHK_ROT180, IDC_CHK_WAITPRN2)는 P2. 세트메뉴/180도 회전/대기인쇄2는 현재 미사용.
- 주문번호 최대값(IDC_EDT_MAXNO)과 시작값(IDC_EDT_ORDERNO)은 숫자만 입력. 신규에서 `NumberField`로 대체.
- 레거시에서 WS_CHILD 스타일로 탭 컨트롤 자식 다이얼로그로 동작. 신규에서는 독립 라우트로 전환.
- IDOK, IDCANCEL 모두 숨김 상태.

### 5.7 UseCase 실패 규칙

- **멱등성**: 인쇄설정 저장은 마지막 값 덮어쓰기 (idempotencyKey 불필요)
- **트랜잭션**: SQLite TX 내에서 Config UPDATE 원자적
- **참조 무결성**: 해당 없음 (key-value 설정)
- **Outbox**: 인쇄설정 변경 → 중앙 동기화 대상 (매장 설정 → CentralApi)
- **오프라인**: 로컬 DB만 사용, 오프라인 동작 가능

### 5.8 Permission

- 설정 화면은 관리자 전용 (Setup/Maintenance mode 접근 권한 필요)
- TODO: Setup mode 진입 시 관리자 인증 절차 상세 정의 필요

---

## 6. 테스트

| ID | 시나리오 | 기대 결과 | 우선순위 |
|---|---|---|---|
| PRT-T01 | 화면 진입 시 인쇄 설정 로드 | 모든 라디오/셀렉트/텍스트 필드에 현재값 바인딩 | P0 |
| PRT-T02 | 글꼴 크기 변경 후 저장 | DB에 변경된 글꼴 크기 반영 | P0 |
| PRT-T03 | 주문번호 최대값 설정 후 저장 | DB에 최대값 반영 | P1 |
| PRT-T04 | 대기번호 초기화 실행 | 대기번호 카운터 리셋 확인 | P1 |
| PRT-T05 | 주문번호 시작값 변경 후 저장 | DB에 시작값 반영 | P1 |
| PRT-T06 | 저장 멱등성 확인 | 동일 idempotencyKey로 중복 저장 시 1회만 반영 | P0 |

---

## 7. 완료 기준

- [ ] P0: 인쇄 설정 조회/저장 정상 동작 (PRT-F01, PRT-F02)
- [ ] P1: 5개 영역별 글꼴 크기 라디오 동작
- [ ] P1: 상단/하단 여백, 타이틀, 인쇄 타입 설정 동작
- [ ] P1: 주문번호 최대값/시작값 관리 동작
- [ ] P1: 대기번호 초기화 동작
- [ ] P2: 세트메뉴/180도 회전/대기인쇄2 체크 구현 <!-- TODO -->
- [ ] `FontSizeRadioGroup` 공용 컴포넌트 구현 확인
- [ ] 멱등성 테스트 통과

---

## 8. 작업 명단

| 계층 | 파일 경로 | 작업 내용 |
|---|---|---|
| Screen | `BrandPosApp/PosUi/src/screens/SetupScreen/PrintConfig/index.tsx` | 인쇄 설정 화면 구현 |
| Screen Hook | `BrandPosApp/PosUi/src/screens/SetupScreen/PrintConfig/hooks/usePrintConfig.ts` | UI 전용 훅 |
| RTK Query | `BrandPosApp/PosUi/src/store/api/setupApi.ts` | `getPrintConfig`, `savePrintConfig` endpoint |
| shared/ui | `BrandPosApp/PosUi/src/shared/ui/molecules/FontSizeRadioGroup/index.tsx` | 글꼴 크기 라디오 그룹 (신규 공용) |
| shared/ui | `BrandPosApp/PosUi/src/shared/ui/atoms/Select` | 드롭다운 (공용) |
| shared/ui | `BrandPosApp/PosUi/src/shared/ui/atoms/TextField` | 텍스트 입력 (공용) |
| shared/ui | `BrandPosApp/PosUi/src/shared/ui/atoms/NumberField` | 숫자 입력 (공용) |
| shared/ui | `BrandPosApp/PosUi/src/shared/ui/atoms/Checkbox` | 체크박스 (공용) |
| shared/ui | `BrandPosApp/PosUi/src/shared/ui/atoms/Button` | 버튼 (공용) |
| Bridge | `BrandPosApp/PosUi/src/bridge/commands/setupCommands.ts` | `SETUP:PRINT:*` 커맨드 정의 |
| PosRequestActions | `BrandPosApp/Presentation/CEF/InternalBridge/PosRequestActions/System/SetupActions.cpp` | 인쇄 설정 thin router |
| UseCase | `BrandPosApp/UseCases/System/SavePrintConfigUseCase.cpp` | 인쇄 설정 저장 UseCase |
| Domain | `BrandPosApp/Domain/System/SystemMgr.cpp` | 인쇄 설정 검증/조회/초기화 |
| Infrastructure | `BrandPosApp/Infrastructure/Persistence/SQLite/Tables/System/ConfigCrud.cpp` | 인쇄 설정 CRUD |

---

## Appendix: 레거시 참조

### A.1 레거시 기본 정보

| 항목 | 값 |
|---|---|
| 다이얼로그 ID | IDD_PRINTSET_DLG |
| 리소스 값 | 171 |
| 크기 (DLU) | 512 x 302 |
| 다이얼로그 타입 | DIALOGEX |
| 스타일 | DS_SETFONT \| WS_CHILD |
| 폰트 | 10, "System", 0, 0, 0x0 |
| 소스 파일 | RestaurantSet.rc |
| 총 UI 요소 수 | 59 (버튼 7, 텍스트/라벨 16, 입력 필드 36) |

### A.2 레거시 UI 요소

**버튼 (7개):** IDCANCEL (숨김), IDC_SAVE (저장), IDC_ORDERINIT (초기화), IDC_ORDERINIT2 (대기번호 초기화), IDC_ORDERSAVE (최대값 저장), IDOK (숨김), IDC_BTN_ORNOST (시작값 저장)

**텍스트/라벨 (16개):** IDC_STA_PRINT0~7 (인쇄 영역 라벨), IDC_STA_MAXORDER (최대값 라벨), IDC_STA_WAITINIT (대기번호 초기화 라벨), IDC_STA_STARTORDERNO (시작값 라벨), IDC_STATIC5 (영수증 하단 메시지 라벨), 빈 텍스트 x4

**입력 필드 (36개):**
- IDC_ORDER*S/M/B/B2 (5그룹 x 4옵션 = 20개 라디오) - 글꼴 크기
- IDC_CHKORDER2_1/2 (체크박스 2개) - 메뉴 체크
- IDC_BLANK, IDC_UPBLANK (ComboBox 2개) - 하단/상단 여백
- IDC_EDT_MAXNO, IDC_EDT_ORDERNO (EditText 2개) - 최대값/시작값
- IDC_CHK_MENU/MENU2/ORMSG (체크박스 3개) - 메뉴/메시지 출력
- IDC_CHK_SETMENU/ROT180/WAITPRN2 (체크박스 3개, 숨김) - 미사용
- IDC_CB_WAITPRN (ComboBox) - 대기인쇄 프린터
- IDC_EDT_ORDERTITLE (EditText) - 타이틀
- IDC_EDITORDERINIT (EditText) - 초기화 메시지
- IDC_ORPRN_PRNTYPE (ComboBox) - 인쇄 타입

### A.3 마이그레이션 노트

- 59개 UI 요소로 설정 화면 중 가장 복잡.
- 5개 영역 x 4개 크기 옵션 = 20개 라디오 버튼은 FontSizeRadioGroup 재사용 컴포넌트로 통합.
- IDOK, IDCANCEL 모두 숨김 상태. WS_CHILD 스타일로 탭 컨트롤 자식 다이얼로그.
- 숨김 체크박스 3개는 P2. 세트메뉴/180도 회전/대기인쇄2는 현재 미사용.
