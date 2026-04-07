# UNPERMISSION 화면 설계서

---

## 0. 문서 정보

| 항목 | 값 |
|---|---|
| 문서 ID | SCR-UNPERMISSION |
| 화면 ID (레거시) | IDD_UNPERMISSION |
| 작성일 | 2026-04-05 |
| 상태 | 초안 |

---

## 1. 화면 개요

UNPERMISSION은 단말기 미승인(수기) 결제 처리 모달이다. 카드 단말기가 작동하지 않을 때 카드사를 선택하고 수기로 금액을 입력하여 결제를 기록한다.

- 신규 UI 위치: `shared/ui/organisms/PermissionModal`
- 화면 유형: 모달 (Organism)
- 우선순위: **P0**

---

## 2. 상위 기준 연결

| 기준 문서 | 관련 섹션 | 비고 |
|---|---|---|
| 04-Edge-POS-아키텍처-설계서 | 결제 계층 흐름 | 미승인 결제 예외 처리 |
| CLAUDE.md | shared/ui 규칙 | 공용 모달은 shared/ui/organisms |

---

## 3. 기능 목록

| ID | 기능명 | 우선순위 | Bridge Command | UseCase | Domain/Manager | Infrastructure |
|---|---|---|---|---|---|---|
| UNPER-F01 | 확인 (미승인 결제 확정) | P0 | STAFF:VERIFY_PERMISSION | VerifyPermissionUseCase | StaffMgr, SaleMgr | Tables/Staff/StaffCrud, Tables/Payment/* (SQLite) |
| UNPER-F02 | 닫기/취소 | P0 | 없음 (모달 닫기) | - | - | - |
| UNPER-F03 | 카드사 선택 (8개 버튼) | P0 | 없음 (UI 로컬 상태) | - | - | - |
| UNPER-F04 | 미등록 카드사 처리 (숨김) | P2 | 없음 (UI 로컬 상태) | - | - | - |
| UNPER-F05 | 카카오페이 처리 (숨김) | P2 | 없음 (UI 로컬 상태) | - | - | - |
| UNPER-F06 | 수기 금액 입력 | P0 | 없음 (UI 로컬 상태) | - | - | - |

---

## 4. UI 구조

### 4.1 화면 레이아웃

```
+------------------------------------------+
| [확인]  [닫기]                             |
|                                          |
| [안내 메시지: "이 카드사는 ..."]             |
|                                          |
| [카드사명]                                 |
| +--카드사 선택 그리드 (2열 x 4행)--+         |
| | [카드사1] [카드사5] |                     |
| | [카드사2] [카드사6] |                     |
| | [카드사3] [카드사7] |                     |
| | [카드사4] [카드사8] |                     |
| +------------------------------+         |
|                                          |
| 수기결제 금액 (잔액): [금액 입력]            |
+------------------------------------------+
```

### 4.2 컴포넌트 매핑 (shared/ui 기준)

| 영역 | 컴포넌트 경로 | 비고 |
|---|---|---|
| 모달 전체 | shared/ui/organisms/PermissionModal | 미승인 결제 모달 |
| 카드사 버튼 | shared/ui/atoms/Button | 8개 동적 로드 |
| 금액 입력 | shared/ui/atoms/AmountInput | 수기 금액 |

### 4.3 데이터 바인딩

| ID | 표시 항목 | 신규 UI 컴포넌트 | 데이터 소스 |
|---|---|---|---|
| UNPER-D01 | 카드사명 표시 | Label | paymentApi.getCardCompanies |
| UNPER-D02 | 안내 메시지 | Text | i18n |
| UNPER-D03 | 수기 결제 금액 (잔액) | AmountLabel | props (호출자 전달) |
| UNPER-D04 | 금액 입력 | AmountInput | UI 로컬 상태 |
| UNPER-D05 | 카드사 버튼 8개 | Button x 8 | paymentApi.getCardCompanies |
| UNPER-D06 | 날짜 (숨김) | 내부 상태 | UI 로컬 상태 |
| UNPER-D07 | 영수증번호 (숨김) | 내부 상태 | UI 로컬 상태 |

---

## 5. 구현 명세

### 5.1 Bridge Command

| Command | 요청 payload | 응답 payload | Error | 비고 |
|---|---|---|---|---|
| STAFF:VERIFY_PERMISSION | `{ staffId, password, requiredPermission }` | `{ granted: boolean }` | `INVALID_PASSWORD` | 권한 검증 모달 |

### 5.2 UseCase

| UseCase | 책임 | 트랜잭션 | Ledger | Outbox |
|---|---|---|---|---|
| VerifyPermissionUseCase | 권한 검증 후 미승인 결제 기록 | O (SQLite TX 원자적) | RECEIVED -> SUCCEEDED | 미승인 결제 이력 동기화 |

> **UseCase 실패 규칙**: 멱등성 Ledger 기록 (requestId + idempotencyKey). SQLite TX 원자적 — 실패 시 전체 롤백. 오프라인 동작 가능 (로컬 SQLite 기준 권한 검증 + 결제 기록).

### 5.3 Domain/Manager

| Manager | 메서드 | 책임 |
|---|---|---|
| StaffMgr | VerifyPermission() | 권한 검증 |
| SaleMgr | RecordManualPayment() | 수기 결제 기록 |

### 5.4 Infrastructure

| 모듈 | 파일 | 책임 |
|---|---|---|
| Tables/Staff/StaffCrud | SQLite | 권한 검증 |
| Tables/Payment/* | SQLite | 결제 기록 |

### 5.5 RTK Query 연동

| Endpoint | 태그 | 비고 |
|---|---|---|
| paymentApi.getCardCompanies | `CardCompanies` | 카드사 목록 |

### 5.6 PosRealTime 이벤트

해당 없음.

### 5.7 i18n / Error / Permission

| 항목 | 규칙 | 비고 |
|---|---|---|
| i18n | `SharedAssets/i18n/locales/{ko,vi,en}/payment.json` | msgKey 기반 |
| Error | 코드 기반: `{ type, code, msgKey, severity, recoverable }` | `INVALID_PASSWORD` |
| Permission | **권한 검증 모달**. 이 모달 자체가 권한 검증 UI이다. 호출자가 requiredPermission을 지정한다. | |

---

## 6. 테스트

| ID | 시나리오 | 기대 결과 |
|---|---|---|
| UNPER-T01 | 카드사 선택 후 금액 입력, 확인 | 미승인 결제 기록 |
| UNPER-T02 | 금액 미입력 상태에서 확인 | 에러 표시 |
| UNPER-T03 | 닫기 클릭 | 모달 닫힘, 결제 미기록 |

---

## 7. 완료 기준

- [ ] 카드사 8개 버튼이 동적으로 로드된다
- [ ] VerifyPermissionUseCase를 통해 권한 검증 후 미승인 결제가 기록된다
- [ ] 숨김 필드(날짜, 영수증번호)가 React 상태로 관리된다
- [ ] IDC_BTN_CARD9(미등록), IDC_BTN_CARD10(카카오페이)은 향후 확장 시 활성화한다

---

## 8. 작업 명단

| 작업 | 대상 파일 경로 | 상태 |
|---|---|---|
| Organism 구현 | `BrandPosApp/PosUi/src/shared/ui/organisms/PermissionModal.tsx` | TODO |
| Bridge Command | `BrandPosApp/Presentation/CEF/InternalBridge/PosRequestActions/Staff/StaffActions.cpp` | TODO |
| UseCase | `BrandPosApp/UseCases/Staff/VerifyPermissionUseCase.cpp` | TODO |
| Persistence | `BrandPosApp/Infrastructure/Persistence/SQLite/Tables/Payment/` | TODO |
| RTK Query | `BrandPosApp/PosUi/src/store/api/paymentApi.ts` | TODO |

---

## 9. 작업 진행 기록
| 날짜 | 범위 | 상태 | 완료 범위 | 남은 범위 | 내용 |
|---|---|---|---|---|---|
| 2026-04-05 | Shell 구현 | 완료 | 레이아웃+로컬상태+stub | Bridge/UseCase 연동 | UnauthorizedDialog.tsx shell 구현 완료. Modal, Button 사용. 카드사 8개 버튼(2열x4행) + 카드사명 표시 + 수기 금액 입력 + 확인 stub. 숨김 필드(날짜/영수증번호) React 상태 관리. |

---

## Appendix: 레거시 참조

### 레거시 다이얼로그 정보

| 항목 | 값 |
|---|---|
| 다이얼로그 ID | IDD_UNPERMISSION |
| 리소스 값 | 399 |
| 크기 (DLU) | 400 x 300 |
| 소스 파일 | Restaurant.rc |
| 총 UI 요소 수 | 19 (버튼 12, 라벨 4, 입력 3) |

### 레거시 컨트롤 -> 신규 매핑

| 레거시 컨트롤 | 신규 대응 |
|---|---|
| IDOK | 확인 버튼 |
| IDCANCEL | 닫기 버튼 |
| IDC_BTN_CARD1~8 | 카드사 선택 버튼 (동적 로드) |
| IDC_BTN_CARD9 (숨김) | 미등록 카드사 (향후 확장) |
| IDC_BTN_CARD10 (숨김) | 카카오페이 (향후 확장) |
| IDC_UNAMT | AmountInput (수기 금액) |
| IDC_UNDATE (숨김) | React 상태 |
| IDC_UNRECEIPTNO (숨김) | React 상태 |
| IDC_STA_CARDNAME | 카드사명 Label |
| IDC_STA_INFO | 안내 메시지 (i18n) |
| IDC_STA_RECEIVE | 잔액 AmountLabel |
