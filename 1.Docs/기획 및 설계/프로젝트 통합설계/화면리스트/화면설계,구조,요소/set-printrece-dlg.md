# PRINTRECE_DLG 화면 문서

## 0. 문서 정보

| 항목 | 값 |
|---|---|
| 화면명 | `PRINTRECE_DLG` |
| 화면 ID | `IDD_PRINTRECE_DLG` |
| 원본 파일 | `set-printrece-dlg.md` |
| 전환 우선순위 | `P1` |
| 담당 계층 | `PosUi / Presentation / UseCases / Domain / Infrastructure` |
| 상태 | `Shell 구현 완료` |

## 1. 화면 개요

- **화면 목적**: 일반 영수증 인쇄 양식의 11개 항목(로고/바코드, 타이틀, 전표번호, 테이블명, 판매시간, 담당번호, 상품메뉴, 합계, 할인금액, 인건비, 하단여백) 및 부가 옵션을 설정하는 화면이다.
- **해결하는 사용자 문제**: 매장 관리자가 영수증 인쇄 형식을 세밀하게 제어하고, 하단 메시지/QR코드 설정 화면으로 진입한다.
- **화면 진입 경로**: SetupScreen/PrintManager → 일반영수증 탭 선택
- **화면 종료 경로**: 저장(IDC_BTN_SAVE) → 설정 반영 (PRINT_MGR의 하위 탭 페이지)
- **관련 운영 주체**: 매장 관리자
- **운영 모드**: Setup/Maintenance mode

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
| F-001 | 영수증 인쇄 설정 조회 | 화면 진입 시 11개 항목 + 부가 옵션 설정값 로드 | 화면 진입 | P1 |
| F-002 | 영수증 인쇄 설정 저장 | 모든 항목 설정을 일괄 저장 | 저장 버튼 클릭 | P1 |
| F-003 | 인쇄 항목별 설정 변경 | 11개 항목의 표시 형식 변경 | 콤보박스 선택 | P1~P2 |
| F-004 | 하단 메시지 설정 | 영수증 하단에 인쇄할 메시지 설정 모달 열기 | 메시지 설정 버튼 클릭 | P1 |
| F-005 | QR코드 설정 | 영수증 하단 QR코드 설정 모달 열기 | QR코드 설정 버튼 클릭 | P2 |
| F-006 | 고객번호/주문번호/시간 표시 체크 | 영수증 부가 정보 표시 옵션 토글 | 체크박스 변경 | P2 |
| F-007 | 반품 미인쇄/180DPI 체크 | 프린터 관련 부가 옵션 토글 | 체크박스 변경 | P2 |

## 4. UI 구조

### 4.1 화면 구성

- **상단 영역**: 저장 버튼
- **좌측 영역**: 11개 인쇄 항목 라벨 + 콤보박스 쌍 (세로 배치)
- **우측 영역**: 체크박스 옵션들 (고객번호/주문번호/시간/반품미인쇄/180DPI), 하단 메시지 설정 버튼, QR코드 설정 버튼
- **모달**: PrintMessageConfig (하단 메시지), PrintQRConfig (QR코드)

### 4.2 재사용 UI

| 컴포넌트 | 위치 | props로 바뀌는 값 | 비고 |
|---|---|---|---|
| SelectField | shared/ui/molecules/SelectField | label, options, value, onChange | 인쇄 항목 설정 (x11) |
| Checkbox | shared/ui/atoms/Checkbox | label, checked, onChange | 부가 옵션 체크박스 |
| Label | shared/ui/atoms/Label | text | 항목 라벨 |

## 5. 구현 명세

### 5.1 상태 소유권

| 상태 | 소유 계층 | 원본 | 비고 |
|---|---|---|---|
| 영수증 인쇄 설정 | RTK Query 캐시 | setupApi.getReceiptPrintConfig | 서버 상태 |
| 폼 편집 상태 | 로컬 컴포넌트 상태 | useState / useReducer | UI 상태 |
| 메시지 모달 열림 | 로컬 컴포넌트 상태 | useState | UI 상태 |

### 5.2 Bridge 계약

| Command | Request | Response | Error | Idempotency | 비고 |
|---|---|---|---|---|---|
| SETUP:PRINT_RECEIPT:GET_CONFIG | `{}` | `{ items: [...], options: {...} }` | `CONFIG_NOT_FOUND` | -- (조회) | P1 |
| SETUP:PRINT_RECEIPT:SAVE | `{ items: [...], options: {...} }` | `{ success: true }` | `SAVE_FAILED` | `SETUP:PRINT_RECEIPT:SAVE:{timestamp}` | P1 |

### 5.3 UseCase 계약

| UseCase | Trigger | Input | Transaction | Lock | Output | 실패 규칙 |
|---|---|---|---|---|---|---|
| SaveReceiptPrintConfigUseCase | SETUP:PRINT_RECEIPT:SAVE | items[], options | SQLite TX | -- | ConfigRow[] | 덮어쓰기 저장. TX 원자적 커밋. 실패 시 롤백, UI 에러 코드 반환. 커밋 후 Outbox 적재. |

### 5.4 Domain / Manager / Store

| 항목 | 책임 | 파일 / 모듈 | 비고 |
|---|---|---|---|
| ConfigManager | 인쇄 설정 읽기/쓰기 | Domain/System/ConfigManager | |

### 5.5 DB / CentralApi / Sync / Realtime

| 연동 대상 | 역할 | 데이터 흐름 | 비고 |
|---|---|---|---|
| SQLite Tables/System/ConfigCrud | 인쇄 설정 CRUD | UseCase -> ConfigManager -> ConfigCrud -> SQLite | 로컬 원본 |
| Outbox | 설정 변경 동기화 | 커밋 후 Outbox 적재 -> Sync Worker -> CentralApi | |

### 5.6 i18n / Error / Permission

| 항목 | 규칙 | 비고 |
|---|---|---|
| i18n | `SharedAssets/i18n/locales/{ko,vi,en}/setup.json` | msgKey: setup.printReceipt.* |
| Error | 코드 기반 (type, device, code, msgKey) | 완성 문장 금지 |
| Permission | 관리자 전용 — Setup/Maintenance 모드 접근 권한 필요 | |

## 6. 테스트

| 테스트 항목 | 범위 | 기대 결과 | 유형 |
|---|---|---|---|
| 설정 로드 시 값 반영 | SetupScreen/PrintReceiptConfig | 저장된 설정값 표시 | integration |
| 설정 변경 후 저장 | SetupScreen/PrintReceiptConfig + setupApi | DB에 반영 | integration |
| 하단 메시지 설정 모달 열기 | SetupScreen/PrintReceiptConfig | PrintMessageConfig 모달 표시 | unit |
| 숨김 필드 조건부 표시 | SetupScreen/PrintReceiptConfig | feature flag에 따라 배달 관련 체크 표시 | unit |

## 7. 완료 기준

- [ ] UI 구현 완료 (screens/SetupScreen/PrintReceiptConfig)
- [ ] Bridge 계약 구현 완료 (SETUP:PRINT_RECEIPT:*)
- [ ] UseCase 연동 완료 (SaveReceiptPrintConfigUseCase)
- [ ] RTK Query 엔드포인트 구현 완료 (setupApi.getReceiptPrintConfig)
- [ ] PrintManager 탭 통합 완료
- [ ] 하단 메시지/QR코드 모달 연동
- [ ] i18n 적용 완료
- [ ] 테스트 완료
- [ ] 문서 상태 `DONE`

## 8. 작업 명단

| 작업 | 파일 | 상태 |
|---|---|---|
| Screen 구현 | `BrandPosApp/PosUi/src/screens/SetupScreen/PrintReceiptConfig/index.tsx` | TODO |
| RTK Query endpoint | `BrandPosApp/PosUi/src/store/api/setupApi.ts` (getReceiptPrintConfig) | TODO |
| Bridge command | `BrandPosApp/PosUi/src/bridge/commands/setup.ts` | TODO |
| SelectField 컴포넌트 | `BrandPosApp/PosUi/src/shared/ui/molecules/SelectField.tsx` | TODO |
| Checkbox 컴포넌트 | `BrandPosApp/PosUi/src/shared/ui/atoms/Checkbox.tsx` | TODO |
| C++ SaveReceiptPrintConfigUseCase | `BrandPosApp/UseCases/Setup/SaveReceiptPrintConfigUseCase.cpp` | TODO |
| C++ ConfigManager | `BrandPosApp/Domain/System/ConfigManager.cpp` | TODO |
| SQLite Tables/System/ConfigCrud | `BrandPosApp/Infrastructure/Persistence/SQLite/Tables/System/ConfigCrud.cpp` | TODO |

---

## Appendix: 레거시 UI 요소 참조

### 기본 정보

| 항목 | 값 |
|------|---|
| 다이얼로그 ID | IDD_PRINTRECE_DLG |
| 리소스 값 | 214 |
| 크기 (DLU) | 482 x 293 |
| 다이얼로그 타입 | DIALOGEX |
| 스타일 | DS_SETFONT \| WS_CHILD |
| 소스 파일 | RestaurantSet.rc |
| 총 UI 요소 수 | 48 |

### 요소 통계

| 유형 | 개수 |
|------|------|
| 버튼 | 5 |
| 텍스트/라벨 | 18 |
| 입력 필드 | 25 |
| **합계** | **48** |

### 마이그레이션 노트 (원본)

- 11개 인쇄 항목 + 다수 체크박스로 구성된 복합 폼 화면이다.
- 숨김 처리된 컨트롤(IDC_RECEIPTMSG1~5, IDC_CHK_DELICUST, IDC_CHK_PARTITION, IDC_CHK_DELI_EXCL)은 조건부 기능이므로 feature flag 또는 설정에 따라 표시 여부를 결정한다.
- 영수증 메시지 설정은 IDC_BTN_MSGSET을 통해 별도 모달(PrintMessageConfig)로 분리 관리되므로, 이 화면의 숨김 EditText는 신규 UI에서 제거한다.
- PRINT_MGR의 하위 탭 페이지로 동작하므로 PrintManager 내 탭으로 배치한다.
