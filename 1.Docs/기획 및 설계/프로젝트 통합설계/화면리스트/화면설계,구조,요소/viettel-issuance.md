# VIETTEL_ISSUANCE 화면 설계서

---

## 0. 문서 정보

| 항목 | 값 |
|---|---|
| 문서 ID | SCR-VIETTEL-ISSUANCE |
| 화면 ID (레거시) | IDD_VIETTEL_ISSUANCE |
| 작성일 | 2026-04-05 |
| 상태 | 초안 |

---

## 1. 화면 개요

VIETTEL_ISSUANCE는 베트남 전자세금계산서(Viettel S-Invoice) 발행 화면이다. 베트남 시장 전용이며, 구매자 정보 입력(19개 필드), 세금계산서 발행/대량 발행, 고객 검색/저장을 제공한다. 온라인 필수 기능이므로 Offline-First 예외에 해당한다. feature flag 또는 국가 설정(locale=vi)으로 활성화 여부를 제어한다.

- 신규 UI 위치: `screens/ViettelScreen/CardIssuance`
- 화면 유형: 전체 화면 (Screen)
- 우선순위: **P0** (베트남 시장 필수)

---

## 2. 상위 기준 연결

| 기준 문서 | 관련 섹션 | 비고 |
|---|---|---|
| 04-Edge-POS-아키텍처-설계서 | ExternalBridge 규칙 | Viettel API 연동 |
| CLAUDE.md | Offline-First 규칙 | 온라인 필수 예외 |
| CLAUDE.md | i18n 규칙 | 베트남어 폼 라벨 |

---

## 3. 기능 목록

| ID | 기능명 | 우선순위 | Bridge Command | UseCase | Domain/Manager | Infrastructure |
|---|---|---|---|---|---|---|
| VT-F01 | 세금계산서 발행 | P0 | NOTIFICATION:ISSUE_VIETTEL | IssueViettelCardUseCase | AccountingMgr | Network/HTTP, ExternalBridge/Viettel |
| VT-F02 | 대량 발행 | P1 | NOTIFICATION:ISSUE_VIETTEL | IssueViettelCardUseCase | AccountingMgr | Network/HTTP, ExternalBridge/Viettel |
| VT-F03 | 고객 검색 | P0 | ITEM:SEARCH | IssueViettelCardUseCase | CustMgr | Tables/Customer/CustCrud (SQLite) |
| VT-F04 | 고객 정보 저장 | P1 | NOTIFICATION:ISSUE_VIETTEL | IssueViettelCardUseCase | CustMgr | Tables/Customer/CustCrud (SQLite) |
| VT-F05 | 입력 초기화 | P1 | 없음 (UI 로컬 상태) | - | - | - |
| VT-F06 | 닫기 | P0 | 없음 (라우팅) | - | - | - |
| VT-F07 | 세금계산서 발행사 선택 | P0 | 없음 (UI 로컬 상태) | - | - | - |
| VT-F08 | 신분증 유형 선택 | P1 | 없음 (UI 로컬 상태) | - | - | - |
| VT-F09 | 은행계좌 직접 입력 체크 | P1 | 없음 (UI 로컬 상태) | - | - | - |

---

## 4. UI 구조

### 4.1 화면 레이아웃

```
+---------------------------------------------------------------+
| [발행사 드롭다운]     [대량발행] [발행]       [닫기]              |
|                                                               |
| *세금코드    [입력]        *법인명     [입력]                     |
| *고객코드    [입력]        *구매자명   [입력]    [검색] [저장] [초기화] |
|  도시명      [입력]         구/군명    [입력]                     |
| *주소        [입력 (넓은)]                                       |
|  은행계좌    [입력]         은행명     [입력]   [직접입력 체크]      |
| *이메일      [입력]        *전화번호   [입력]   팩스번호  [입력]    |
|  신분증유형  [드롭다운]     신분증번호  [입력]   생년월일  [DatePicker] |
|  국가코드    [입력]                                              |
|                                                               |
| +--발행 이력 그리드----------------------------------------+     |
| | 날짜 | 발행번호 | 고객명 | 금액 | 상태 | ...                |     |
| +------------------------------------------------------+     |
+---------------------------------------------------------------+
```

### 4.2 컴포넌트 매핑 (shared/ui 기준)

| 영역 | 컴포넌트 경로 | 비고 |
|---|---|---|
| 발행 이력 | shared/ui/molecules/DataTable | React 테이블 |
| 입력 필드 19개 | shared/ui/atoms/TextInput, AmountInput | TODO: React Hook Form 활용 검토 |
| 드롭다운 | shared/ui/atoms/Select | 발행사, 신분증 유형 |
| 날짜 선택 | shared/ui/atoms/DatePicker | 생년월일 |
| 체크박스 | shared/ui/atoms/Checkbox | 은행계좌 직접 입력 |
| 폼 라벨 16개 | shared/ui/atoms/Label | i18n (vi) 기반 |

### 4.3 데이터 바인딩

| ID | 표시 항목 | 신규 UI 컴포넌트 | 데이터 소스 |
|---|---|---|---|
| VT-D01~D13 | 구매자 정보 입력 (13개 텍스트) | TextInput / AmountInput | UI 로컬 상태 |
| VT-D14 | 신분증 유형 | Select | 정적 목록 |
| VT-D15 | 생년월일 | DatePicker | UI 로컬 상태 |
| VT-D16 | 신분증 번호 | TextInput | UI 로컬 상태 |
| VT-D17 | 발행사 선택 | Select | systemApi.getConfig (발행사 목록) |
| VT-D18 | 은행계좌 직접입력 체크 | Checkbox | UI 로컬 상태 |
| VT-D19 | 은행계좌 직접입력 필드 | TextInput (ReadOnly) | UI 로컬 상태 |
| VT-D20 | Viettel 코드 (숨김) | 내부 상태 | systemApi.getConfig |
| VT-D21 | 라벨 16개 | Label | i18n (vi) |
| VT-D22 | 발행 이력 그리드 | DataTable | viettelApi.getIssuanceHistory |

---

## 5. 구현 명세

### 5.1 Bridge Command

| Command | 요청 payload | 응답 payload | Error | 비고 |
|---|---|---|---|---|
| NOTIFICATION:ISSUE_VIETTEL | `{ customerInfo }` | `{ cardNumber, issuedAt }` | `OFFLINE_BLOCKED`, `ISSUANCE_FAILED` | 세금계산서 발행 |
| ITEM:SEARCH | `{ taxCode?, customerCode? }` | `{ customer }` | (없음) | 고객 검색 |

### 5.2 UseCase

| UseCase | 책임 | 트랜잭션 | Ledger | Outbox |
|---|---|---|---|---|
| IssueViettelCardUseCase | Viettel API 통해 세금계산서 발행 | O (SQLite TX 원자적) | RECEIVED -> SUCCEEDED / FAILED | 재전송 대상 아님 (온라인 필수) |

> **UseCase 실패 규칙**: 멱등성 Ledger 기록 (requestId + idempotencyKey). SQLite TX 원자적 — 실패 시 전체 롤백. **온라인 필수** — 오프라인 시 `OFFLINE_BLOCKED`로 진입/발행 차단. Viettel API 실패 시 `ISSUANCE_FAILED` 반환, Outbox 재전송 대상 아님.

### 5.3 Domain/Manager

| Manager | 메서드 | 책임 |
|---|---|---|
| AccountingMgr | IssueViettelInvoice() | 세금계산서 발행 처리 |
| CustMgr | SearchByTaxCode() | 세금코드로 고객 검색 |
| CustMgr | SaveCustomer() | 고객 정보 저장 |

### 5.4 Infrastructure

| 모듈 | 파일 | 책임 |
|---|---|---|
| Network/HTTP | - | API 호출 |
| ExternalBridge/Viettel | - | Viettel S-Invoice API |
| Tables/Customer/CustCrud | SQLite | 고객 정보 |

### 5.5 RTK Query 연동

| Endpoint | 태그 | 비고 |
|---|---|---|
| viettelApi.getIssuanceHistory | `ViettelHistory` | 발행 이력 |
| systemApi.getConfig | `SystemConfig` | 발행사 목록, Viettel 코드 |

### 5.6 PosRealTime 이벤트

해당 없음.

### 5.7 i18n / Error / Permission

| 항목 | 규칙 | 비고 |
|---|---|---|
| i18n | `SharedAssets/i18n/locales/vi/viettel.json` | 베트남 전용, vi 필수 |
| Error | 코드 기반: `{ type, code, msgKey, severity, recoverable }` | `OFFLINE_BLOCKED`, `ISSUANCE_FAILED` |
| Permission | **로그인 직원 전원** (베트남 시장). locale=vi 또는 feature flag 활성화 시에만 접근 가능. | |

---

## 6. 테스트

| ID | 시나리오 | 기대 결과 |
|---|---|---|
| VT-T01 | 구매자 정보 입력 후 발행 | Viettel API 호출 + 발행번호 반환 |
| VT-T02 | 오프라인 상태에서 발행 시도 | 발행 불가 에러 표시 |
| VT-T03 | 대량 발행 | 선택된 여러 건 일괄 발행 |
| VT-T04 | 고객 검색 (세금코드) | 고객 정보 자동 입력 |
| VT-T05 | 입력 초기화 | 모든 필드 초기화 |
| VT-T06 | locale=ko 환경 | 화면 비활성화 (베트남 전용) |

---

## 7. 완료 기준

- [ ] IssueViettelCardUseCase가 Viettel API를 통해 세금계산서를 발행한다
- [ ] 온라인 필수이며, 오프라인 시 진입/발행 차단된다
- [ ] feature flag 또는 국가 설정(locale=vi)으로 활성화 여부를 제어한다
- [ ] 19개 입력 필드가 React Hook Form 등으로 폼 관리된다
- [ ] 16개 라벨이 i18n (vi) 기반으로 처리된다
- [ ] MFCGridCtrl 1개가 React 테이블로 대체된다
- [ ] TODO: React Hook Form 도입 여부 확정 필요

---

## 8. 작업 명단

| 작업 | 대상 파일 경로 | 상태 |
|---|---|---|
| Screen 구현 | `BrandPosApp/PosUi/src/screens/ViettelScreen/CardIssuance/index.tsx` | TODO |
| Bridge Command | `BrandPosApp/Presentation/CEF/InternalBridge/PosRequestActions/Notification/NotificationActions.cpp` | TODO |
| UseCase | `BrandPosApp/UseCases/Notification/IssueViettelCardUseCase.cpp` | TODO |
| Domain | `BrandPosApp/Domain/Accounting/AccountingMgr.cpp` | TODO |
| Domain | `BrandPosApp/Domain/Customer/CustMgr.cpp` | TODO |
| ExternalBridge | `BrandPosApp/Infrastructure/ExternalBridge/Viettel/` | TODO |
| Persistence | `BrandPosApp/Infrastructure/Persistence/SQLite/Tables/Customer/CustCrud.cpp` | TODO |
| RTK Query | `BrandPosApp/PosUi/src/store/api/viettelApi.ts` | TODO |
| i18n (vi) | `SharedAssets/i18n/locales/vi/viettel.json` | TODO |
| Screen Shell | `BrandPosApp/PosUi/src/screens/PaymentScreen/components/ViettelIssuanceDialog.tsx` | DONE (shell) |

---

## Appendix: 레거시 참조

### 레거시 다이얼로그 정보

| 항목 | 값 |
|---|---|
| 다이얼로그 ID | IDD_VIETTEL_ISSUANCE |
| 리소스 값 | 385 |
| 크기 (DLU) | 512 x 384 |
| 소스 파일 | Restaurant.rc |
| 총 UI 요소 수 | 44 (버튼 7, 라벨 17, 입력 19, 그리드 1) |

### 레거시 컨트롤 -> 신규 매핑

| 레거시 컨트롤 | 신규 대응 |
|---|---|
| IDC_BTN_ISSUANCE | 발행 버튼 |
| IDC_BTN_VOLU_ISSUANCE | 대량발행 버튼 |
| IDC_BTN_SEARCH | 검색 버튼 |
| IDC_BTN_SAVE | 저장 버튼 |
| IDC_BTN_CLEAR | 초기화 버튼 |
| IDCANCEL | 닫기 버튼 |
| IDC_CMB_TAX_ISSUER | Select (발행사) |
| IDC_CB_IDTYPE | Select (신분증 유형) |
| IDC_DTP_BIRTHDAY | DatePicker (생년월일) |
| IDC_CHECK1 | Checkbox (은행계좌 직접입력) |
| IDC_EDT_TAXCODE~COUNTRYCODE (13개) | TextInput |
| IDC_EDT_BANKACCOUNT, PHONENUMBER, FAXNUMBER | NumberInput |
| IDC_EDIT12000 (ReadOnly) | TextInput (ReadOnly) |
| IDC_STA_BUYER1~16 | Label (i18n vi) |
| IDC_STA_VTCODE (숨김) | 내부 상태 |
| IDC_GRID (MFCGridCtrl) | DataTable (발행 이력) |
