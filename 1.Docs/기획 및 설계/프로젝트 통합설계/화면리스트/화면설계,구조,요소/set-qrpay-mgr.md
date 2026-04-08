# QRPAY_MGR 화면 문서

## 0. 문서 정보

| 항목 | 값 |
|---|---|
| 화면명 | `QRPAY_MGR` |
| 화면 ID | `IDD_QRPAY_MGR` |
| 원본 파일 | `set-qrpay-mgr.md` |
| 전환 우선순위 | `P0` |
| 담당 계층 | `PosUi / Presentation / UseCases / Domain / Infrastructure` |
| 상태 | `Shell 구현 완료` |

## 1. 화면 개요

- **화면 목적**: QR 결제(ZaloPay 등) 연동에 필요한 인증 정보(QR 타입, App User, App ID, KEY1, KEY2)를 설정하는 화면이다. QR 결제 없이는 베트남 매장 운영이 제한되므로 P0이다.
- **해결하는 사용자 문제**: 매장 관리자가 QR 결제 서비스의 인증 정보를 등록/수정한다.
- **화면 진입 경로**: SetupScreen(설정 메인) → QR결제 설정 선택
- **화면 종료 경로**: 저장(IDC_BTN_SAVE) → 설정 반영 (PAY_MGR 하위 탭 또는 독립 진입)
- **관련 운영 주체**: 매장 관리자
- **운영 모드**: Setup/Maintenance mode

## 2. 상위 기준 연결

| 기준 | 연결 문서 | 비고 |
|---|---|---|
| 전체 아키텍처 | `00-Platform-최종-아키텍처-기준서.md` | 필수 |
| Edge POS 설계 | `04-Edge-POS-아키텍처-설계서.md` | 필수 |
| DB 설계 | `DB설계/` | 해당 |
| 화면 인벤토리 | `_index.md` | 필수 |

## 3. 화면 기능 목록

| ID | 기능명 | 설명 | 사용자 액션 | 우선순위 |
|---|---|---|---|---|
| F-001 | QR결제 설정 조회 | 화면 진입 시 설정값 로드 | 화면 진입 | P0 |
| F-002 | QR 결제 타입 선택 | QR 결제 서비스 종류 선택 | 콤보박스 선택 | P0 |
| F-003 | App User 입력 | 앱 사용자 ID 입력 | 텍스트 입력 | P0 |
| F-004 | App ID 입력 | 앱 ID 입력 | 텍스트 입력 | P0 |
| F-005 | KEY 1/KEY 2 입력 | 인증 키 입력 (마스킹) | 패스워드 입력 | P0 |
| F-006 | Bank 선택 (숨김) | 특정 QR 타입에서만 활성화 | 콤보박스 선택 | P2 |
| F-007 | QR결제 설정 저장 | 설정을 저장한다 | 저장 버튼 클릭 | P0 |
| F-008 | 한국 전용 설정 (숨김 7개) | 레거시 공통 숨김 필드 | 콤보/텍스트 변경 | P2 |

## 4. UI 구조

### 4.1 화면 구성

- **상단 영역**: QR 결제 타입 콤보박스, 타이틀, 저장 버튼
- **중앙 영역**: 설정 그룹(GroupBox) — App User, App ID, KEY 1, KEY 2, Bank(조건부)
- **좌측 숨김**: 한국 전용 설정 7개 필드 (지역별 조건부 표시)

### 4.2 재사용 UI

| 컴포넌트 | 위치 | props로 바뀌는 값 | 비고 |
|---|---|---|---|
| Select | shared/ui/atoms/Select | options, value, onChange | QR 타입/Bank 선택 |
| TextInput | shared/ui/atoms/TextInput | label, value, onChange, type | App User/App ID 입력 |
| TextInput (password) | shared/ui/atoms/TextInput | label, value, onChange, type=password | KEY 마스킹 입력 |
| ConfigSection | shared/ui/molecules/ConfigSection | title, children | 설정 그룹 |
| PageTitle | shared/ui/atoms/PageTitle | title | 화면 타이틀 |

## 5. 구현 명세

### 5.1 상태 소유권

| 상태 | 소유 계층 | 원본 | 비고 |
|---|---|---|---|
| QR결제 설정 | RTK Query 캐시 | setupApi.getQRPayConfig | 서버 상태 |
| 폼 편집 상태 | 로컬 컴포넌트 상태 | useState | UI 상태 |

### 5.2 Bridge 계약

| Command | Request | Response | Error | Idempotency | 비고 |
|---|---|---|---|---|---|
| SETUP:QR_PAY:GET_CONFIG | `{}` | `{ qrType, appUser, appId, key1, key2, bank }` | `CONFIG_NOT_FOUND` | -- (조회) | P0 |
| SETUP:QR_PAY:SAVE | `{ qrType, appUser, appId, key1, key2, bank }` | `{ success: true }` | `SAVE_FAILED` | `SETUP:QR_PAY:SAVE:{timestamp}` | P0 |

### 5.3 UseCase 계약

| UseCase | Trigger | Input | Transaction | Lock | Output | 실패 규칙 |
|---|---|---|---|---|---|---|
| SaveQRPayConfigUseCase | SETUP:QR_PAY:SAVE | qrType, appUser, appId, key1, key2 | SQLite TX | -- | ConfigRow[] | TODO |

### 5.4 Domain / Manager / Store

| 항목 | 책임 | 파일 / 모듈 | 비고 |
|---|---|---|---|
| SystemManager | QR결제 설정 관리 | Domain/System/SystemManager | |

### 5.5 DB / CentralApi / Sync / Realtime

| 연동 대상 | 역할 | 데이터 흐름 | 비고 |
|---|---|---|---|
| SQLite Tables/System/ConfigCrud | QR결제 설정 CRUD | UseCase -> SystemManager -> ConfigCrud -> SQLite | 로컬 원본 |
| ExternalBridge/PaymentGateways/ZaloPay | QR 타입별 설정 스키마 | Infrastructure 계층 | |

### 5.6 i18n / Error / Permission

| 항목 | 규칙 | 비고 |
|---|---|---|
| i18n | `BrandPosApp/PosUi/src/i18n/locales/{ko,vi,en}/setup.json` | msgKey: setup.qrPay.* |
| Error | 코드 기반 (type, device, code, msgKey) | 완성 문장 금지 |
| Permission | TODO: 관리자 권한 레벨 확인 필요 | |

## 6. 테스트

| 테스트 항목 | 범위 | 기대 결과 | 유형 |
|---|---|---|---|
| 설정 로드 | SetupScreen/QRPayConfig + setupApi | 저장된 설정 표시 | integration |
| KEY 마스킹 | SetupScreen/QRPayConfig | KEY1/KEY2 마스킹 표시 | unit |
| QR 타입 변경 시 Bank 필드 토글 | SetupScreen/QRPayConfig | 특정 타입에서만 Bank 표시 | unit |
| 설정 저장 | SetupScreen/QRPayConfig + setupApi | DB에 반영 | integration |

## 7. 완료 기준

- [ ] UI 구현 완료 (screens/SetupScreen/QRPayConfig)
- [ ] Bridge 계약 구현 완료 (SETUP:QR_PAY:*)
- [ ] UseCase 연동 완료 (SaveQRPayConfigUseCase)
- [ ] RTK Query 엔드포인트 구현 완료 (setupApi.getQRPayConfig)
- [ ] QR 타입별 조건부 렌더링
- [ ] KEY 암호화 처리 (Infrastructure 계층)
- [ ] i18n 적용 완료
- [ ] 테스트 완료
- [ ] 문서 상태 `DONE`

## 8. 작업 명단

| 작업 | 파일 | 상태 |
|---|---|---|
| Screen 구현 | `BrandPosApp/PosUi/src/screens/SetupScreen/QRPayConfig/index.tsx` | TODO |
| RTK Query endpoint | `BrandPosApp/PosUi/src/store/api/setupApi.ts` (getQRPayConfig) | TODO |
| Bridge command | `BrandPosApp/PosUi/src/bridge/commands/setup.ts` | TODO |
| C++ SaveQRPayConfigUseCase | `BrandPosApp/UseCases/Setup/SaveQRPayConfigUseCase.cpp` | TODO |
| C++ SystemManager | `BrandPosApp/Domain/System/SystemManager.cpp` | TODO |
| SQLite Tables/System/ConfigCrud | `BrandPosApp/Infrastructure/Persistence/SQLite/Tables/System/ConfigCrud.cpp` | TODO |

---

## Appendix: 레거시 UI 요소 참조

### 기본 정보

| 항목 | 값 |
|------|---|
| 다이얼로그 ID | IDD_QRPAY_MGR |
| 리소스 값 | 426 |
| 크기 (DLU) | 460 x 300 |
| 다이얼로그 타입 | DIALOGEX |
| 스타일 | DS_SETFONT \| WS_POPUP |
| 소스 파일 | RestaurantSet.rc |
| 총 UI 요소 수 | 25 |

### 요소 통계

| 유형 | 개수 |
|------|------|
| 버튼 | 3 |
| 텍스트/라벨 | 8 |
| 입력 필드 | 13 |
| 기타 | 1 |
| **합계** | **25** |

### 마이그레이션 노트 (원본)

- QR결제 설정은 ZaloPay 등 QR 기반 결제 수단의 핵심 인증 정보 설정이므로 P0이다.
- 카드리더기와 동일한 숨김 필드 패턴(IDC_CB_REFSEL ~ IDC_CB_TEAMCHK)을 공유하며, 공통 컴포넌트로 추출 가능하다.
- KEY 1, KEY 2는 ES_PASSWORD 스타일이며, 저장 시 암호화 처리를 Infrastructure 계층에서 수행한다.
- QR 결제 타입 선택에 따라 하위 필드 구성이 달라질 수 있다.
