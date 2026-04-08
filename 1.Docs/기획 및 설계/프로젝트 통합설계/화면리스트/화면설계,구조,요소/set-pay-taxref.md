# PAY_TAXREF 화면 문서

## 0. 문서 정보

| 항목 | 값 |
|---|---|
| 화면명 | `PAY_TAXREF` |
| 화면 ID | `IDD_PAY_TAXREF` |
| 원본 파일 | `set-pay-taxref.md` |
| 전환 우선순위 | `P0` |
| 담당 계층 | `PosUi / Presentation / UseCases / Domain / Infrastructure` |
| 상태 | `Shell 구현 완료` |

## 1. 화면 개요

- **화면 목적**: 전자세금계산서 발행사 선택, 인증 정보(UserName/Password), 인보이스 설정(Type/Template/Series), 세금 조정 옵션, 판매자 정보 관리를 위한 설정 화면이다. 한국(면세)과 베트남(전자세금계산서) 지역에 따라 표시 항목이 다르다.
- **해결하는 사용자 문제**: 매장 관리자가 전자세금계산서 발행에 필요한 인증 및 인보이스 정보를 설정하고, 판매자 정보를 관리한다.
- **화면 진입 경로**: SetupScreen/PaymentManager → 세금계산서/물품대 탭 선택
- **화면 종료 경로**: 저장(IDC_BTN_SAVE) → 설정 반영 (PAY_MGR의 하위 탭 페이지)
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
| F-001 | 세금 설정 조회 | 화면 진입 시 발행사, 인증, 인보이스 설정값 로드 | 화면 진입 | P1 |
| F-002 | 세금 설정 저장 | 모든 설정을 일괄 저장 | 저장 버튼 클릭 | P1 |
| F-003 | 세금계산서 발행사 선택 | 발행사(MISA 등) 선택 | 콤보박스 선택 | P0 |
| F-004 | UserName/Password 입력 | 발행사 인증 정보 입력 | 텍스트 입력 | P0 |
| F-005 | InvoiceType/TemplateCode/InvoiceSeries 입력 | 인보이스 설정값 입력 | 텍스트 입력 | P1 |
| F-006 | 세금 조정 체크/비율 입력 | 세금 조정 활성화 및 비율 설정 | 체크/숫자 입력 | P1 |
| F-007 | 세금 감면 라인 표시 | 감면 라인 표시 옵션 토글 | 체크박스 변경 | P2 |
| F-008 | 판매자 설정 | 판매자 정보 모달 열기 | 판매자 설정 버튼 클릭 | P1 |
| F-009 | 한국 면세 설정 (숨김 7개) | 면세 관련 레거시 설정 (지역별 조건부) | 콤보/텍스트 변경 | P2 |

## 4. UI 구조

### 4.1 화면 구성

- **상단 영역**: 발행사 선택 콤보박스, 인보이스 타이틀, 저장 버튼
- **중앙 영역**: 인증 정보 그룹(UserName/Password), 인보이스 설정(Type/Template/Series)
- **하단 영역**: 세금 조정 옵션, 판매자 설정 버튼
- **좌측 숨김**: 한국 면세 설정 (지역별 feature flag로 조건부 표시)
- **모달**: TaxSellerConfig (판매자 정보)

### 4.2 재사용 UI

| 컴포넌트 | 위치 | props로 바뀌는 값 | 비고 |
|---|---|---|---|
| SelectField | shared/ui/molecules/SelectField | label, options, value, onChange | 발행사 선택 |
| TextInput | shared/ui/atoms/TextInput | label, value, onChange, type | 인증/인보이스 입력 |
| PasswordInput | shared/ui/atoms/TextInput (type=password) | label, value, onChange | 패스워드 마스킹 입력 |
| Checkbox | shared/ui/atoms/Checkbox | label, checked, onChange | 세금 조정/감면 체크 |
| NumberInput | shared/ui/atoms/TextInput (type=number) | label, value, onChange | 조정 비율 입력 |
| FormGroup | shared/ui/molecules/FormGroup | title, children, visible | 지역별 조건부 그룹 |
| Label | shared/ui/atoms/Label | text | 설정 라벨 |
| HelpText | shared/ui/atoms/HelpText | text, visible | 안내 텍스트 |

## 5. 구현 명세

### 5.1 상태 소유권

| 상태 | 소유 계층 | 원본 | 비고 |
|---|---|---|---|
| 세금 설정 | RTK Query 캐시 | setupApi.getTaxRefConfig | 서버 상태 |
| 폼 편집 상태 | 로컬 컴포넌트 상태 | useState | UI 상태 |
| 판매자 모달 열림 | 로컬 컴포넌트 상태 | useState | UI 상태 |

### 5.2 Bridge 계약

| Command | Request | Response | Error | Idempotency | 비고 |
|---|---|---|---|---|---|
| SETUP:TAX_REF:GET_CONFIG | `{}` | `{ issuer, auth, invoice, taxAdjust, legacyRef }` | `CONFIG_NOT_FOUND` | -- (조회) | P1 |
| SETUP:TAX_REF:SAVE | `{ issuer, auth, invoice, taxAdjust, legacyRef }` | `{ success: true }` | `SAVE_FAILED` | `SETUP:TAX_REF:SAVE:{timestamp}` | P1 |

### 5.3 UseCase 계약

| UseCase | Trigger | Input | Transaction | Lock | Output | 실패 규칙 |
|---|---|---|---|---|---|---|
| SaveTaxRefConfigUseCase | SETUP:TAX_REF:SAVE | issuer, auth, invoice, taxAdjust | SQLite TX | -- | ConfigRow[] | TODO |

### 5.4 Domain / Manager / Store

| 항목 | 책임 | 파일 / 모듈 | 비고 |
|---|---|---|---|
| ConfigManager | 세금 설정 읽기/쓰기 | Domain/System/ConfigManager | |

### 5.5 DB / CentralApi / Sync / Realtime

| 연동 대상 | 역할 | 데이터 흐름 | 비고 |
|---|---|---|---|
| SQLite Tables/System/ConfigCrud | 세금 설정 CRUD | UseCase -> ConfigManager -> ConfigCrud -> SQLite | 로컬 원본 |
| Outbox | 설정 변경 동기화 | 커밋 후 Outbox 적재 -> Sync Worker -> CentralApi | |

### 5.6 i18n / Error / Permission

| 항목 | 규칙 | 비고 |
|---|---|---|
| i18n | `BrandPosApp/PosUi/src/i18n/locales/{ko,vi,en}/setup.json` | msgKey: setup.taxRef.* |
| Error | 코드 기반 (type, device, code, msgKey) | 완성 문장 금지 |
| Permission | 관리자 전용 — Setup/Maintenance 모드 접근 권한 필요 | |

## 6. 테스트

| 테스트 항목 | 범위 | 기대 결과 | 유형 |
|---|---|---|---|
| 발행사 선택 후 설정 저장 | SetupScreen/TaxRefConfig + setupApi | DB에 반영 | integration |
| 패스워드 마스킹 | SetupScreen/TaxRefConfig | 입력값 마스킹 표시 | unit |
| 지역별 조건부 표시 | SetupScreen/TaxRefConfig | 한국/베트남에 따라 필드 표시/숨김 | unit |
| 판매자 설정 모달 열기 | SetupScreen/TaxRefConfig | TaxSellerConfig 모달 표시 | unit |

## 7. 완료 기준

- [ ] UI 구현 완료 (screens/SetupScreen/TaxRefConfig)
- [ ] Bridge 계약 구현 완료 (SETUP:TAX_REF:*)
- [ ] UseCase 연동 완료 (SaveTaxRefConfigUseCase)
- [ ] RTK Query 엔드포인트 구현 완료 (setupApi.getTaxRefConfig)
- [ ] PaymentManager 탭 통합 완료
- [ ] 지역별 feature flag 조건부 렌더링
- [ ] 판매자 모달 연동
- [ ] i18n 적용 완료
- [ ] 테스트 완료
- [ ] 문서 상태 `DONE`

## 8. 작업 명단

| 작업 | 파일 | 상태 |
|---|---|---|
| Screen 구현 | `BrandPosApp/PosUi/src/screens/SetupScreen/TaxRefConfig/index.tsx` | TODO |
| RTK Query endpoint | `BrandPosApp/PosUi/src/store/api/setupApi.ts` (getTaxRefConfig) | TODO |
| Bridge command | `BrandPosApp/PosUi/src/bridge/commands/setup.ts` | TODO |
| TextInput 컴포넌트 | `BrandPosApp/PosUi/src/shared/ui/atoms/TextInput.tsx` | TODO |
| Checkbox 컴포넌트 | `BrandPosApp/PosUi/src/shared/ui/atoms/Checkbox.tsx` | TODO |
| FormGroup 컴포넌트 | `BrandPosApp/PosUi/src/shared/ui/molecules/FormGroup.tsx` | TODO |
| C++ SaveTaxRefConfigUseCase | `BrandPosApp/UseCases/Setup/SaveTaxRefConfigUseCase.cpp` | TODO |
| C++ ConfigManager | `BrandPosApp/Domain/System/ConfigManager.cpp` | TODO |
| SQLite Tables/System/ConfigCrud | `BrandPosApp/Infrastructure/Persistence/SQLite/Tables/System/ConfigCrud.cpp` | TODO |

---

## Appendix: 레거시 UI 요소 참조

### 기본 정보

| 항목 | 값 |
|------|---|
| 다이얼로그 ID | IDD_PAY_TAXREF |
| 리소스 값 | 234 |
| 크기 (DLU) | 460 x 300 |
| 다이얼로그 타입 | DIALOGEX |
| 스타일 | DS_SETFONT \| WS_POPUP |
| 소스 파일 | RestaurantSet.rc |
| 총 UI 요소 수 | 30 |

### 요소 통계

| 유형 | 개수 |
|------|------|
| 버튼 | 4 |
| 텍스트/라벨 | 8 |
| 입력 필드 | 17 |
| 기타 | 1 |
| **합계** | **30** |

### 마이그레이션 노트 (원본)

- 이 화면은 한국(면세)/베트남(전자세금계산서) 지역에 따라 표시 항목이 크게 다르다.
- 숨김 처리된 한국 면세 관련 7개 컨트롤은 지역별 feature flag로 제어한다.
- 베트남 전자세금계산서(MISA 등) 설정이 주 활성 영역이다.
- IDC_EDT_PASSWORD는 ES_PASSWORD 스타일이므로 마스킹 입력 컴포넌트를 사용한다.
- IDC_BTN_SELLER(판매자 설정)는 별도 모달로 분리 관리한다.
- PAY_MGR의 하위 탭 페이지로 동작한다.
