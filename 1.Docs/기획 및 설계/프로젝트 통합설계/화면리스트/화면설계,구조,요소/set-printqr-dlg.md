# PRINTQR_DLG 화면 문서

## 0. 문서 정보

| 항목 | 값 |
|---|---|
| 화면명 | `PRINTQR_DLG` |
| 화면 ID | `IDD_PRINTQR_DLG` |
| 원본 파일 | `set-printqr-dlg.md` |
| 전환 우선순위 | `P1` |
| 담당 계층 | `PosUi / Presentation / UseCases / Domain / Infrastructure` |
| 상태 | `Shell 구현 완료` |

## 1. 화면 개요

- **화면 목적**: 영수증/주문서에 QR 코드를 포함하기 위한 설정 화면이다. QR 데이터 소스를 선택하고, 타이틀과 데이터 내용을 설정한다.
- **해결하는 사용자 문제**: 매장 관리자가 결제 완료 시 영수증에 인쇄되는 QR 코드의 내용과 타이틀을 설정한다.
- **화면 진입 경로**: SetupScreen/PrintReceiptConfig → QR코드 설정 버튼 클릭
- **화면 종료 경로**: 저장(IDC_BTN_SAVE) → 설정 반영, 닫기(IDCANCEL) → 모달 닫기
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
| F-001 | QR 인쇄 설정 조회 | 화면 진입 시 QR 설정값 로드 | 화면 진입 | P1 |
| F-002 | QR 데이터 소스 선택 | QR 데이터의 원본 선택 (직접입력 등) | 콤보박스 선택 | P1 |
| F-003 | QR 타이틀 입력 | QR 코드 상단 타이틀 텍스트 설정 | 텍스트 입력 | P1 |
| F-004 | QR 데이터 직접 입력 | 소스가 "직접입력"일 때 QR 데이터 내용 입력 (조건부) | 멀티라인 텍스트 입력 | P1 |
| F-005 | QR 인쇄 설정 저장 | 설정을 저장한다 | 저장 버튼 클릭 | P1 |
| F-006 | 닫기 | 모달 닫기 | 닫기 버튼 클릭 | P2 |

## 4. UI 구조

### 4.1 화면 구성

- **상단 영역**: 저장 버튼, 닫기 버튼
- **안내 영역**: 안내 문구 ("해당 설정은 결제완료시 데이터가 QR코드로 인쇄되어 나옵니다")
- **설정 영역**: QR 데이터 소스 콤보, QR 타이틀 입력, QR 데이터 멀티라인 입력 (조건부)

### 4.2 재사용 UI

| 컴포넌트 | 위치 | props로 바뀌는 값 | 비고 |
|---|---|---|---|
| Select | shared/ui/atoms/Select | options, value, onChange | QR 데이터 소스 선택 |
| TextInput | shared/ui/atoms/TextInput | label, value, onChange | QR 타이틀 |
| TextArea | shared/ui/atoms/TextArea | label, value, onChange, visible | QR 데이터 (조건부) |
| InfoText | shared/ui/atoms/InfoText | text | 안내 문구 |

## 5. 구현 명세

### 5.1 상태 소유권

| 상태 | 소유 계층 | 원본 | 비고 |
|---|---|---|---|
| QR 인쇄 설정 | RTK Query 캐시 | setupApi.getPrintQRConfig | 서버 상태 |
| 폼 편집 상태 | 로컬 컴포넌트 상태 | useState | UI 상태 |

### 5.2 Bridge 계약

| Command | Request | Response | Error | Idempotency | 비고 |
|---|---|---|---|---|---|
| SETUP:PRINT_QR:GET_CONFIG | `{}` | `{ source, title, data }` | `CONFIG_NOT_FOUND` | -- (조회) | P1 |
| SETUP:PRINT_QR:SAVE | `{ source, title, data }` | `{ success: true }` | `SAVE_FAILED` | `SETUP:PRINT_QR:SAVE:{timestamp}` | P1 |

### 5.3 UseCase 계약

| UseCase | Trigger | Input | Transaction | Lock | Output | 실패 규칙 |
|---|---|---|---|---|---|---|
| SavePrintQRConfigUseCase | SETUP:PRINT_QR:SAVE | source, title, data | SQLite TX | -- | ConfigRow[] | TODO |

### 5.4 Domain / Manager / Store

| 항목 | 책임 | 파일 / 모듈 | 비고 |
|---|---|---|---|
| SystemManager | QR 인쇄 설정 관리 | Domain/System/SystemManager | |

### 5.5 DB / CentralApi / Sync / Realtime

| 연동 대상 | 역할 | 데이터 흐름 | 비고 |
|---|---|---|---|
| SQLite Tables/System/ConfigCrud | QR 설정 CRUD | UseCase -> SystemManager -> ConfigCrud -> SQLite | 로컬 원본 |

### 5.6 i18n / Error / Permission

| 항목 | 규칙 | 비고 |
|---|---|---|
| i18n | `BrandPosApp/PosUi/src/i18n/locales/{ko,vi,en}/setup.json` | msgKey: setup.printQR.* |
| Error | 코드 기반 (type, device, code, msgKey) | 완성 문장 금지 |
| Permission | TODO: 관리자 권한 레벨 확인 필요 | |

## 6. 테스트

| 테스트 항목 | 범위 | 기대 결과 | 유형 |
|---|---|---|---|
| QR 설정 로드 | SetupScreen/PrintQRConfig + setupApi | 저장된 설정 표시 | integration |
| 소스 "직접입력" 선택 시 데이터 영역 표시 | SetupScreen/PrintQRConfig | TextArea 조건부 노출 | unit |
| QR 설정 저장 | SetupScreen/PrintQRConfig + setupApi | DB에 반영 | integration |

## 7. 완료 기준

- [ ] UI 구현 완료 (screens/SetupScreen/PrintQRConfig — 모달)
- [ ] Bridge 계약 구현 완료 (SETUP:PRINT_QR:*)
- [ ] UseCase 연동 완료 (SavePrintQRConfigUseCase)
- [ ] RTK Query 엔드포인트 구현 완료 (setupApi.getPrintQRConfig)
- [ ] PrintReceiptConfig 모달 연동 완료
- [ ] 소스별 조건부 렌더링
- [ ] i18n 적용 완료
- [ ] 테스트 완료
- [ ] 문서 상태 `DONE`

## 8. 작업 명단

| 작업 | 파일 | 상태 |
|---|---|---|
| Modal 구현 | `BrandPosApp/PosUi/src/screens/SetupScreen/PrintQRConfig/index.tsx` | TODO |
| RTK Query endpoint | `BrandPosApp/PosUi/src/store/api/setupApi.ts` (getPrintQRConfig) | TODO |
| Bridge command | `BrandPosApp/PosUi/src/bridge/commands/setup.ts` | TODO |
| InfoText 컴포넌트 | `BrandPosApp/PosUi/src/shared/ui/atoms/InfoText.tsx` | TODO |
| C++ SavePrintQRConfigUseCase | `BrandPosApp/UseCases/Setup/SavePrintQRConfigUseCase.cpp` | TODO |
| C++ SystemManager | `BrandPosApp/Domain/System/SystemManager.cpp` | TODO |
| SQLite Tables/System/ConfigCrud | `BrandPosApp/Infrastructure/Persistence/SQLite/Tables/System/ConfigCrud.cpp` | TODO |

---

## Appendix: 레거시 UI 요소 참조

### 기본 정보

| 항목 | 값 |
|------|---|
| 다이얼로그 ID | IDD_PRINTQR_DLG |
| 리소스 값 | 260 |
| 크기 (DLU) | 326 x 253 |
| 다이얼로그 타입 | DIALOGEX |
| 스타일 | DS_SETFONT \| DS_MODALFRAME \| WS_POPUP |
| 소스 파일 | RestaurantSet.rc |
| 총 UI 요소 수 | 9 |

### 요소 통계

| 유형 | 개수 |
|------|------|
| 버튼 | 3 |
| 텍스트/라벨 | 3 |
| 입력 필드 | 3 |
| **합계** | **9** |

### 마이그레이션 노트 (원본)

- IDC_CB_QRDATA 선택에 따라 IDC_EDT_QRDATA(멀티라인 입력)가 표시/숨김 토글된다.
- 안내 문구는 i18n 키로 관리한다.
