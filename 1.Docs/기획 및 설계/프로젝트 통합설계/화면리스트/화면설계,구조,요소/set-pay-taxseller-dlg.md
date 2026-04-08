# PAY_TAXSELLER_DLG 화면 문서

## 0. 문서 정보

| 항목 | 값 |
|---|---|
| 화면명 | `PAY_TAXSELLER_DLG` |
| 화면 ID | `IDD_PAY_TAXSELLER_DLG` |
| 원본 파일 | `set-pay-taxseller-dlg.md` |
| 전환 우선순위 | `P1` |
| 담당 계층 | `PosUi / Presentation / UseCases / Domain / Infrastructure` |
| 상태 | `Shell 구현 완료` |

## 1. 화면 개요

- **화면 목적**: 베트남 전자세금계산서(VAT Invoice) 발행용 판매자 정보를 설정하는 모달 화면이다. 13개 텍스트 입력 필드로 구성된 단순 폼이다.
- **해결하는 사용자 문제**: 매장 관리자가 세금계산서에 인쇄되는 판매자 정보(사업자코드, 회사명, 주소, 은행 정보, 연락처 등)를 등록/수정한다.
- **화면 진입 경로**: SetupScreen/TaxRefConfig → 판매자 설정 버튼 클릭
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
| F-001 | 판매자 정보 조회 | 화면 진입 시 13개 필드 설정값 로드 | 화면 진입 | P1 |
| F-002 | 판매자 정보 저장 | 모든 필드를 일괄 저장 | 저장 버튼 클릭 | P1 |
| F-003 | 사업자코드/회사명/고객코드/고객명 입력 | 기본 사업자 정보 입력 | 텍스트 입력 | P1 |
| F-004 | 주소 정보 입력 (시/도, 구/군, 주소) | 사업장 주소 입력 | 텍스트 입력 | P1 |
| F-005 | 은행 정보 입력 (계좌번호, 은행명) | 결제 수신 은행 정보 | 텍스트 입력 | P1 |
| F-006 | 연락처 입력 (이메일, 전화, 팩스, 국가코드) | 판매자 연락처 | 텍스트 입력 | P1~P2 |
| F-007 | 닫기 | 모달 닫기 | 닫기 버튼 클릭 | P2 |

## 4. UI 구조

### 4.1 화면 구성

- **상단 영역**: 저장 버튼, 닫기 버튼
- **본문 영역**: 13개 라벨 + 텍스트 입력 쌍 (세로 배치)
  - 사업자코드, 회사명, 고객코드, 고객명, 시/도, 구/군, 주소, 은행계좌번호, 은행명, 이메일, 전화번호, 팩스, 국가전화번호

### 4.2 재사용 UI

| 컴포넌트 | 위치 | props로 바뀌는 값 | 비고 |
|---|---|---|---|
| TextInput | shared/ui/atoms/TextInput | label, value, onChange, type | 텍스트/숫자/이메일/전화 입력 |
| Label | shared/ui/atoms/Label | text | 필드 라벨 |

## 5. 구현 명세

### 5.1 상태 소유권

| 상태 | 소유 계층 | 원본 | 비고 |
|---|---|---|---|
| 판매자 정보 설정 | RTK Query 캐시 | setupApi.getTaxSellerConfig | 서버 상태 |
| 폼 편집 상태 | 로컬 컴포넌트 상태 | useState | UI 상태 |

### 5.2 Bridge 계약

| Command | Request | Response | Error | Idempotency | 비고 |
|---|---|---|---|---|---|
| SETUP:TAX_SELLER:GET_CONFIG | `{}` | `{ seller: {...} }` | `CONFIG_NOT_FOUND` | -- (조회) | P1 |
| SETUP:TAX_SELLER:SAVE | `{ seller: {...} }` | `{ success: true }` | `SAVE_FAILED` | `SETUP:TAX_SELLER:SAVE:{timestamp}` | P1 |

### 5.3 UseCase 계약

| UseCase | Trigger | Input | Transaction | Lock | Output | 실패 규칙 |
|---|---|---|---|---|---|---|
| SaveTaxSellerConfigUseCase | SETUP:TAX_SELLER:SAVE | seller | SQLite TX | -- | ConfigRow[] | TODO |

### 5.4 Domain / Manager / Store

| 항목 | 책임 | 파일 / 모듈 | 비고 |
|---|---|---|---|
| SystemManager | 판매자 정보 관리 | Domain/System/SystemManager | |

### 5.5 DB / CentralApi / Sync / Realtime

| 연동 대상 | 역할 | 데이터 흐름 | 비고 |
|---|---|---|---|
| SQLite Tables/System/ConfigCrud | 판매자 정보 CRUD | UseCase -> SystemManager -> ConfigCrud -> SQLite | 로컬 원본 |

### 5.6 i18n / Error / Permission

| 항목 | 규칙 | 비고 |
|---|---|---|
| i18n | `BrandPosApp/PosUi/src/i18n/locales/{ko,vi,en}/setup.json` | msgKey: setup.taxSeller.* |
| Error | 코드 기반 (type, device, code, msgKey) | 완성 문장 금지 |
| Permission | TODO: 관리자 권한 레벨 확인 필요 | |

## 6. 테스트

| 테스트 항목 | 범위 | 기대 결과 | 유형 |
|---|---|---|---|
| 판매자 정보 로드 | SetupScreen/TaxSellerConfig + setupApi | 13개 필드 값 표시 | integration |
| 판매자 정보 저장 | SetupScreen/TaxSellerConfig + setupApi | DB에 반영 | integration |
| 숫자 전용 필드 유효성 | SetupScreen/TaxSellerConfig | 계좌/전화/팩스에 숫자만 입력 | unit |

## 7. 완료 기준

- [ ] UI 구현 완료 (screens/SetupScreen/TaxSellerConfig — 모달)
- [ ] Bridge 계약 구현 완료 (SETUP:TAX_SELLER:*)
- [ ] UseCase 연동 완료 (SaveTaxSellerConfigUseCase)
- [ ] RTK Query 엔드포인트 구현 완료 (setupApi.getTaxSellerConfig)
- [ ] TaxRefConfig 모달 연동 완료
- [ ] 필드 유효성 검증 (type=number, type=email, type=tel)
- [ ] i18n 적용 완료
- [ ] 테스트 완료
- [ ] 문서 상태 `DONE`

## 8. 작업 명단

| 작업 | 파일 | 상태 |
|---|---|---|
| Modal 구현 | `BrandPosApp/PosUi/src/screens/SetupScreen/TaxSellerConfig/index.tsx` | TODO |
| RTK Query endpoint | `BrandPosApp/PosUi/src/store/api/setupApi.ts` (getTaxSellerConfig) | TODO |
| Bridge command | `BrandPosApp/PosUi/src/bridge/commands/setup.ts` | TODO |
| TextInput 컴포넌트 | `BrandPosApp/PosUi/src/shared/ui/atoms/TextInput.tsx` | TODO |
| C++ SaveTaxSellerConfigUseCase | `BrandPosApp/UseCases/Setup/SaveTaxSellerConfigUseCase.cpp` | TODO |
| C++ SystemManager | `BrandPosApp/Domain/System/SystemManager.cpp` | TODO |
| SQLite Tables/System/ConfigCrud | `BrandPosApp/Infrastructure/Persistence/SQLite/Tables/System/ConfigCrud.cpp` | TODO |

---

## Appendix: 레거시 UI 요소 참조

### 기본 정보

| 항목 | 값 |
|------|---|
| 다이얼로그 ID | IDD_PAY_TAXSELLER_DLG |
| 리소스 값 | 290 |
| 크기 (DLU) | 476 x 348 |
| 다이얼로그 타입 | DIALOGEX |
| 스타일 | DS_SETFONT \| DS_MODALFRAME \| WS_POPUP \| WS_SYSMENU |
| 소스 파일 | RestaurantSet.rc |
| 총 UI 요소 수 | 29 |

### 요소 통계

| 유형 | 개수 |
|------|------|
| 버튼 | 3 |
| 텍스트/라벨 | 13 |
| 입력 필드 | 13 |
| **합계** | **29** |

### 마이그레이션 노트 (원본)

- 베트남 전자세금계산서 발행용 판매자 정보 설정 화면이다. 13개의 텍스트 입력 필드로 구성된 단순 폼이다.
- ES_NUMBER 스타일 필드(계좌번호, 전화번호, 팩스번호)는 적절한 input type과 유효성 검증을 적용한다.
- 모든 입력 필드는 하나의 저장 버튼으로 일괄 저장된다.
