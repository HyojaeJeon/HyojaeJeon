# MESSAGE_DIALOG 화면 설계서

---

## 0. 문서 정보

| 항목 | 값 |
|---|---|
| 문서 ID | SCR-MESSAGE-DIALOG |
| 화면 ID (레거시) | IDD_MESSAGE_DIALOG |
| 작성일 | 2026-04-05 |
| 상태 | 초안 |

---

## 1. 화면 개요

MESSAGE_DIALOG는 범용 확인/예-아니오 다이얼로그이다. 앱 전반에서 사용되며, 3가지 모드를 지원한다: OK만 표시, Yes/No 표시, 자동 닫힘 타이머 포함. Bridge 호출 없이 순수 UI 컴포넌트로 구현하며, 호출자가 onConfirm/onCancel 콜백을 전달한다.

- 신규 UI 위치: `shared/ui/molecules/MessageDialog`
- 화면 유형: 모달 (Molecule)
- 우선순위: **P0**

---

## 2. 상위 기준 연결

| 기준 문서 | 관련 섹션 | 비고 |
|---|---|---|
| CLAUDE.md | shared/ui 규칙 | 공용 UI는 shared/ui에 배치 |
| CLAUDE.md | i18n 규칙 | msgKey + msgParams 기반, 완성 문장 하드코딩 금지 |

---

## 3. 기능 목록

| ID | 기능명 | 우선순위 | Bridge Command | UseCase | Domain/Manager | Infrastructure |
|---|---|---|---|---|---|---|
| MSG-F01 | 예(Yes) 응답 | P0 | 없음 (UI 콜백) | - | - | - |
| MSG-F02 | 확인(OK) 응답 | P0 | 없음 (UI 콜백) | - | - | - |
| MSG-F03 | 아니오(No) 응답 | P0 | 없음 (UI 콜백) | - | - | - |

---

## 4. UI 구조

### 4.1 화면 레이아웃

```
+-----------------------------------+
| [메시지 제목 (1줄)]                 |
| [메시지 설명 (2줄)]                 |
|                                   |
|  [예]  [확인]  [아니오]   [타이머]  |
+-----------------------------------+
```

모드별 버튼 표시:
- `alert`: [확인] 만 표시
- `confirm`: [예] [아니오] 표시
- `timed`: [확인] + 자동 닫힘 카운트다운

### 4.2 컴포넌트 매핑 (shared/ui 기준)

| 영역 | 컴포넌트 경로 | 비고 |
|---|---|---|
| 다이얼로그 전체 | shared/ui/molecules/MessageDialog | 범용 모달 |
| 버튼 | shared/ui/atoms/Button | 예/확인/아니오 |
| 카운트다운 | shared/ui/atoms/CountdownTimer | 자동 닫힘 타이머 |

### 4.3 데이터 바인딩

| ID | 표시 항목 | 신규 UI 컴포넌트 | 데이터 소스 |
|---|---|---|---|
| MSG-D01 | 메시지 1줄차 | title prop | props (호출자 전달, i18n msgKey) |
| MSG-D02 | 메시지 2줄차 | description prop | props (호출자 전달, i18n msgKey) |
| MSG-D03 | 자동 닫힘 타이머 | CountdownTimer | props.autoCloseSeconds |

---

## 5. 구현 명세

### 5.1 Bridge Command

해당 없음. 순수 UI 컴포넌트.

### 5.2 UseCase

해당 없음.

### 5.3 Domain/Manager

해당 없음.

### 5.4 Infrastructure

해당 없음.

### 5.5 RTK Query 연동

해당 없음.

### 5.6 PosRealTime 이벤트

해당 없음.

### 5.7 Permission

해당 없음. 순수 UI 컴포넌트 — Bridge/UseCase 없음. 호출자가 접근 권한을 제어한다.

---

## 6. 테스트

| ID | 시나리오 | 기대 결과 |
|---|---|---|
| MSG-T01 | alert 모드 (OK만) | 확인 버튼만 표시, 클릭 시 onConfirm 호출 |
| MSG-T02 | confirm 모드 (Yes/No) | 예/아니오 버튼 표시, 각각 onConfirm/onCancel 호출 |
| MSG-T03 | timed 모드 (자동 닫힘) | 카운트다운 후 자동 닫힘 |
| MSG-T04 | i18n msgKey 전달 | 다국어 메시지 표시 |

---

## 7. 완료 기준

- [ ] 3가지 모드(alert, confirm, timed)를 props로 구분한다
- [ ] 메시지 텍스트가 i18n msgKey + msgParams 기반이다 (완성 문장 하드코딩 금지)
- [ ] 자동 닫힘 타이머가 setTimeout + 상태 관리로 구현된다
- [ ] Bridge 호출 없이 순수 UI 컴포넌트로 동작한다

---

## 8. 작업 명단

| 작업 | 대상 파일 경로 | 상태 |
|---|---|---|
| Molecule 구현 | `BrandPosApp/PosUi/src/shared/ui/molecules/MessageDialog.tsx` | TODO |
| i18n | `SharedAssets/i18n/locales/ko/common.json` | TODO |
| i18n | `SharedAssets/i18n/locales/vi/common.json` | TODO |
| i18n | `SharedAssets/i18n/locales/en/common.json` | TODO |

---

## 9. 작업 진행 기록
| 날짜 | 범위 | 상태 | 완료 범위 | 남은 범위 | 내용 |
|---|---|---|---|---|---|
| 2026-04-05 | Shell 구현 | 완료 | 레이아웃+로컬상태+stub | i18n msgKey 연동 | MessageDialog.tsx shell 구현 완료. 3가지 모드(alert/confirm/timed) props 분기. 자동 닫힘 카운트다운, onConfirm/onCancel 콜백. Bridge 호출 없는 순수 UI 컴포넌트. |

---

## Appendix: 레거시 참조

### 레거시 다이얼로그 정보

| 항목 | 값 |
|---|---|
| 다이얼로그 ID | IDD_MESSAGE_DIALOG |
| 리소스 값 | 364 |
| 크기 (DLU) | 300 x 125 |
| 소스 파일 | Restaurant.rc |
| 총 UI 요소 수 | 6 (버튼 3, 라벨 3) |

### 레거시 컨트롤 -> 신규 매핑

| 레거시 컨트롤 | 신규 대응 |
|---|---|
| IDC_MESSAGEYES | Button (예) |
| IDC_MESSAGEOK | Button (확인) |
| IDC_MESSAGENO | Button (아니오) |
| IDC_SMSG1 | title prop |
| IDC_SMSG2 | description prop |
| IDC_STIME | CountdownTimer |
