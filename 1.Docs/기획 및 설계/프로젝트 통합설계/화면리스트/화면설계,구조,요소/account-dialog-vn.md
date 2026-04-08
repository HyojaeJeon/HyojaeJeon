# ACCOUNT_DIALOG_VN (결제 메인 다이얼로그 - 베트남 로케일)

## 0. 문서 정보

| 항목 | 값 |
|---|---|
| 문서 ID | SCR-ACCOUNT-DIALOG-VN |
| 레거시 다이얼로그 | IDD_ACCOUNT_DIALOG_VN (리소스 443) |
| 신규 화면 경로 | screens/PaymentScreen (KR 버전과 통합) |
| 최종 수정일 | 2026-04-05 |
| 상태 | 설계 |

> **통합 안내**: 이 화면은 `account-dialog.md`(SCR-ACCOUNT-DIALOG)와 **단일 PaymentScreen으로 통합**된다. 본 문서는 VN 로케일 고유 차이점만 기술하며, 전체 기능/구현 명세는 `account-dialog.md`를 참조한다.

---

## 1. 화면 개요

IDD_ACCOUNT_DIALOG_VN은 KR 버전(IDD_ACCOUNT_DIALOG)의 베트남 로케일 변형이다. 컨트롤 ID, 레이아웃, 기능이 동일하다. 신규 아키텍처에서는 **i18n 기반 단일 PaymentScreen**으로 통합하며, 별도 VN 다이얼로그를 유지하지 않는다.

---

## 2. 상위 기준 연결

`account-dialog.md` 섹션 2와 동일. 추가 참조:
- CLAUDE.md: i18n 규칙 - 번역 원본은 `BrandPosApp/PosUi/src/i18n/locales/` 하나

---

## 3. 기능 목록

`account-dialog.md` 섹션 3과 동일. KR 버전 기능 ID(AD-F01~F26)를 공유한다.

---

## 4. UI 구조

### 4.1 화면 구성

`account-dialog.md` 섹션 4.1과 동일. 단일 PaymentScreen으로 통합.

### 4.2 재사용 UI

`account-dialog.md` 섹션 4.2와 동일.

---

## 5. 구현 명세

### 5.1~5.5

`account-dialog.md` 섹션 5.1~5.5와 동일.

### 5.6 i18n / Error / Permission (VN 고유)

**i18n - VN 로케일 차이**
- 번역 원본: `BrandPosApp/PosUi/src/i18n/locales/vi/payment.json`
- 통화 포맷: VND (소수점 없음, 천 단위 구분자 `.`)
- 세금 표시: 베트남 VAT 규정 기반 표시
- 숨김 버튼 조건: KR 버전과 동일하게 INI feature flag 기반

**Bridge shape / UseCase 실패 규칙 / Permission**: `account-dialog.md` 섹션 5.2, 5.3, 5.6 참조. VN 로케일 고유 차이 없음 (동일 규칙 적용).

**KR 버전 대비 숨김 처리 차이 없음** - 모든 조건부 표시는 국가/시스템 설정 기반으로 통합 관리

---

## 6. 테스트

| ID | 시나리오 | 검증 항목 |
|---|---|---|
| T-ADVN-01 | VN 로케일 결제 화면 표시 | vi locale 키 기반 라벨/통화 포맷 정상 |
| T-ADVN-02 | VND 통화 포맷 | 소수점 없음, 천 단위 구분자 정상 |
| T-ADVN-03 | KR/VN 런타임 전환 | 언어 전환 시 결제 화면 라벨 즉시 갱신 |

---

## 7. 완료 기준

- [ ] KR 버전 PaymentScreen에서 VN 로케일 정상 동작
- [ ] `BrandPosApp/PosUi/src/i18n/locales/vi/payment.json` 번역 완료
- [ ] VND 통화 포맷 정상 표시
- [ ] 별도 VN 다이얼로그 미생성 확인

---

## 8. 작업 명단

`account-dialog.md` 섹션 8의 작업 명단을 공유한다. VN 고유 추가 파일:

| 계층 | 파일 경로 | 설명 |
|---|---|---|
| i18n | BrandPosApp/PosUi/src/i18n/locales/vi/payment.json | 베트남어 결제 번역 |

---

## Appendix: 레거시 참조

### A.1 레거시 다이얼로그 정보

| 항목 | 값 |
|---|---|
| 다이얼로그 ID | IDD_ACCOUNT_DIALOG_VN |
| 리소스 값 | 443 |
| 크기 (DLU) | 519 x 383 |
| 총 UI 요소 수 | 96 (버튼 58, 텍스트 33, 입력 2, 그리드 3) |
| 소스 파일 | Restaurant.rc |

### A.2 KR 버전 대비 차이

- 컨트롤 ID, 레이아웃, 기능 모두 동일
- 라벨 텍스트만 인코딩 차이 (레거시 RC 파일 내 EUC-KR vs 베트남어)
- 신규 구조에서는 i18n 키 기반 통합으로 차이점 해소

---

## 9. 작업 진행 기록
| 날짜 | 범위 | 상태 | 완료 범위 | 남은 범위 | 내용 |
|---|---|---|---|---|---|
| 2026-04-05 | Shell 구현 | 완료 | 레이아웃+로컬상태+stub | Bridge/UseCase 연동 | PaymentVNExtension.tsx shell 구현 완료. VND 통화 포맷, VAT 표시 로직 포함 |
