# PAYCOSET_DLG 화면 문서

## 0. 문서 정보

| 항목 | 값 |
|---|---|
| 화면명 | `PAYCOSET_DLG` |
| 화면 ID | `IDD_PAYCOSET_DLG` |
| 원본 파일 | `set-paycoset-dlg.md` |
| 전환 우선순위 | `P0` |
| 담당 계층 | `PosUi / Presentation / UseCases / Domain / Infrastructure` |
| 상태 | `Shell 구현 완료` |

## 1. 화면 개요

- **화면 목적**: 결제사 연동 설정(PAYCO/vCAT/vORDER/간편결제)과 사용자 정의 결제 과목(4개)을 관리하는 화면이다.
- **해결하는 사용자 문제**: 매장 관리자가 PG사/VAN 연동 정보를 설정하고, 사용자 정의 결제 과목명(예: 상품권, 포인트 등)을 입력한다.
- **화면 진입 경로**: SetupScreen/PaymentManager → PAY(결제)설정 탭 선택
- **화면 종료 경로**: 저장(IDC_BTN_SAVE2) → 설정 반영 (PAY_MGR의 하위 탭 페이지)
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
| F-001 | 결제사 설정 조회 | 화면 진입 시 결제사/사용자결제 과목 설정값 로드 | 화면 진입 | P0 |
| F-002 | 결제사 설정 저장 | 모든 설정을 일괄 저장 | 저장 버튼 클릭 | P0 |
| F-003 | 사용자결제 과목 1~4 입력 | 사용자 정의 결제 과목명 입력 | 텍스트 입력 | P1 |
| F-004 | PAYCO 사업자번호 입력 | PAYCO 연동 사업자번호 (숨김/조건부) | 텍스트 입력 | P2 |
| F-005 | vCAT/vORDER 설정 | VAN 단말기 연동 정보 (숨김/조건부) | 텍스트/콤보 변경 | P2 |
| F-006 | 간편결제 설정 | 간편결제 종류/ID (숨김/조건부) | 콤보/텍스트 변경 | P2 |
| F-007 | 인증받기 | 외부 PG사 인증 연동 (숨김) | 인증 버튼 클릭 | P2 |

## 4. UI 구조

### 4.1 화면 구성

- **상단 영역**: 저장 버튼
- **좌측 영역**: PAYCO 설정 그룹 (조건부 표시) — 사업자번호, vCAT, VAN사, 포트, vORDER, 간편결제
- **우측 영역**: 사용자결제 과목 입력 그룹 (4개 텍스트 입력)

### 4.2 재사용 UI

| 컴포넌트 | 위치 | props로 바뀌는 값 | 비고 |
|---|---|---|---|
| FormGroup | shared/ui/molecules/FormGroup | title, children, visible | PAYCO/사용자결제 그룹 |
| TextInput | shared/ui/atoms/TextInput | label, value, onChange | 텍스트 입력 필드 |
| Select | shared/ui/atoms/Select | options, value, onChange | VAN사/간편결제 선택 |
| Label | shared/ui/atoms/Label | text | 과목 라벨 |

## 5. 구현 명세

### 5.1 상태 소유권

| 상태 | 소유 계층 | 원본 | 비고 |
|---|---|---|---|
| 결제사 설정 | RTK Query 캐시 | setupApi.getPaymentConfig | 서버 상태 |
| 폼 편집 상태 | 로컬 컴포넌트 상태 | useState | UI 상태 |

### 5.2 Bridge 계약

| Command | Request | Response | Error | Idempotency | 비고 |
|---|---|---|---|---|---|
| SETUP:PAY_CONFIG:GET_CONFIG | `{}` | `{ paycoConfig: {...}, userPayments: [...] }` | `CONFIG_NOT_FOUND` | -- (조회) | P0 |
| SETUP:PAY_CONFIG:SAVE | `{ paycoConfig: {...}, userPayments: [...] }` | `{ success: true }` | `SAVE_FAILED` | `SETUP:PAY_CONFIG:SAVE:{timestamp}` | P0 |

### 5.3 UseCase 계약

| UseCase | Trigger | Input | Transaction | Lock | Output | 실패 규칙 |
|---|---|---|---|---|---|---|
| SavePaymentConfigUseCase | SETUP:PAY_CONFIG:SAVE | paycoConfig, userPayments | SQLite TX | -- | ConfigRow[] | 덮어쓰기 저장. TX 원자적 커밋. 실패 시 롤백, UI 에러 코드 반환. 커밋 후 Outbox 적재. |

### 5.4 Domain / Manager / Store

| 항목 | 책임 | 파일 / 모듈 | 비고 |
|---|---|---|---|
| ConfigManager | 결제사 설정 읽기/쓰기 | Domain/System/ConfigManager | |

### 5.5 DB / CentralApi / Sync / Realtime

| 연동 대상 | 역할 | 데이터 흐름 | 비고 |
|---|---|---|---|
| SQLite Tables/System/ConfigCrud | 결제사 설정 CRUD | UseCase -> ConfigManager -> ConfigCrud -> SQLite | 로컬 원본 |
| Outbox | 설정 변경 동기화 | 커밋 후 Outbox 적재 -> Sync Worker -> CentralApi | |

### 5.6 i18n / Error / Permission

| 항목 | 규칙 | 비고 |
|---|---|---|
| i18n | `BrandPosApp/PosUi/src/i18n/locales/{ko,vi,en}/setup.json` | msgKey: setup.payConfig.* |
| Error | 코드 기반 (type, device, code, msgKey) | 완성 문장 금지 |
| Permission | 관리자 전용 — Setup/Maintenance 모드 접근 권한 필요 | |

## 6. 테스트

| 테스트 항목 | 범위 | 기대 결과 | 유형 |
|---|---|---|---|
| 사용자결제 과목 저장 | SetupScreen/PaymentCompanyConfig + setupApi | 과목명 4개 DB 반영 | integration |
| PAYCO 그룹 조건부 표시 | SetupScreen/PaymentCompanyConfig | feature flag에 따라 PAYCO 섹션 표시/숨김 | unit |
| 인증 버튼 ExternalBridge 경유 | TODO | TODO | TODO |

## 7. 완료 기준

- [ ] UI 구현 완료 (screens/SetupScreen/PaymentCompanyConfig)
- [ ] Bridge 계약 구현 완료 (SETUP:PAY_CONFIG:*)
- [ ] UseCase 연동 완료 (SavePaymentConfigUseCase)
- [ ] RTK Query 엔드포인트 구현 완료 (setupApi.getPaymentConfig)
- [ ] PaymentManager 탭 통합 완료
- [ ] 지역별 feature flag 조건부 렌더링
- [ ] i18n 적용 완료
- [ ] 테스트 완료
- [ ] 문서 상태 `DONE`

## 8. 작업 명단

| 작업 | 파일 | 상태 |
|---|---|---|
| Screen 구현 | `BrandPosApp/PosUi/src/screens/SetupScreen/PaymentCompanyConfig/index.tsx` | TODO |
| RTK Query endpoint | `BrandPosApp/PosUi/src/store/api/setupApi.ts` (getPaymentConfig) | TODO |
| Bridge command | `BrandPosApp/PosUi/src/bridge/commands/setup.ts` | TODO |
| FormGroup 컴포넌트 | `BrandPosApp/PosUi/src/shared/ui/molecules/FormGroup.tsx` | TODO |
| TextInput 컴포넌트 | `BrandPosApp/PosUi/src/shared/ui/atoms/TextInput.tsx` | TODO |
| Select 컴포넌트 | `BrandPosApp/PosUi/src/shared/ui/atoms/Select.tsx` | TODO |
| C++ SavePaymentConfigUseCase | `BrandPosApp/UseCases/Setup/SavePaymentConfigUseCase.cpp` | TODO |
| C++ ConfigManager | `BrandPosApp/Domain/System/ConfigManager.cpp` | TODO |
| SQLite Tables/System/ConfigCrud | `BrandPosApp/Infrastructure/Persistence/SQLite/Tables/System/ConfigCrud.cpp` | TODO |

---

## Appendix: 레거시 UI 요소 참조

### 기본 정보

| 항목 | 값 |
|------|---|
| 다이얼로그 ID | IDD_PAYCOSET_DLG |
| 리소스 값 | 233 |
| 크기 (DLU) | 460 x 300 |
| 다이얼로그 타입 | DIALOGEX |
| 스타일 | DS_SETFONT \| WS_POPUP |
| 소스 파일 | RestaurantSet.rc |
| 총 UI 요소 수 | 32 |

### 요소 통계

| 유형 | 개수 |
|------|------|
| 버튼 | 4 |
| 텍스트/라벨 | 14 |
| 입력 필드 | 11 |
| 기타 | 3 |
| **합계** | **32** |

### 마이그레이션 노트 (원본)

- PAYCO 관련 설정(사업자번호, vCAT, vORDER 등)은 대부분 숨김 상태이며, 베트남/한국 지역별 feature flag로 표시 여부를 제어한다.
- 사용자결제 과목(1~4)은 항상 표시되는 핵심 설정이므로 P1 우선순위로 마이그레이션한다.
- 이 화면은 PAY_MGR의 하위 탭 페이지로 동작한다.
- IDC_BTN_AUTH(인증받기)는 외부 PG사 인증 연동이며, ExternalBridge 경유 UseCase로 처리해야 한다.
