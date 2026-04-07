# MOVEIMG_DLG 화면 설계서

---

## 0. 문서 정보

| 항목 | 값 |
|---|---|
| 문서 ID | SCR-MOVEIMG-DLG |
| 화면 ID (레거시) | IDD_MOVEIMG_DLG |
| 작성일 | 2026-04-05 |
| 상태 | 초안 |

---

## 1. 화면 개요

MOVEIMG_DLG는 이미지 이동 애니메이션용 투명 다이얼로그이다. 레거시에서 GDI로 직접 이미지를 그리며 이동 애니메이션을 구현했다(예: 주문 추가 시 메뉴 아이콘이 주문 목록으로 날아가는 효과). 신규 UI에서는 CSS transition 또는 React 애니메이션 라이브러리로 완전 대체하며, 별도 다이얼로그/모달이 필요 없다.

- 신규 UI 위치: CSS transition / React 애니메이션 (별도 컴포넌트 불필요)
- 화면 유형: 시각 효과 (Atom 수준)
- 우선순위: **P2** (기능적으로 필수가 아닌 시각 효과)

---

## 2. 상위 기준 연결

| 기준 문서 | 관련 섹션 | 비고 |
|---|---|---|
| CLAUDE.md | shared/ui 규칙 | 필요 시 shared/ui/atoms에 배치 |

---

## 3. 기능 목록

| ID | 기능명 | 우선순위 | Bridge Command | UseCase | Domain/Manager | Infrastructure |
|---|---|---|---|---|---|---|
| MOVEIMG-F01 | 이미지 이동 애니메이션 | P2 | 없음 (UI 로컬) | - | - | - |

---

## 4. UI 구조

### 4.1 화면 레이아웃

별도 레이아웃 없음. CSS transition 또는 React 애니메이션으로 구현.

### 4.2 컴포넌트 매핑 (shared/ui 기준)

| 영역 | 컴포넌트 경로 | 비고 |
|---|---|---|
| 애니메이션 | CSS transition / shared/ui/atoms/ImageMover (필요 시) | TODO: 구현 방식 확정 필요 |

### 4.3 데이터 바인딩

| ID | 표시 항목 | 신규 UI 컴포넌트 | 데이터 소스 |
|---|---|---|---|
| MOVEIMG-D01 | 이동 이미지 | CSS transition | props (이미지 소스, 시작/끝 좌표) |

---

## 5. 구현 명세

### 5.1 Bridge Command

해당 없음.

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

해당 없음. 순수 UI 컴포넌트 (시각 효과) — Bridge/UseCase 없음.

---

## 6. 테스트

| ID | 시나리오 | 기대 결과 |
|---|---|---|
| MOVEIMG-T01 | 주문 추가 시 애니메이션 | 메뉴 아이콘이 주문 목록으로 이동하는 시각 효과 |

---

## 7. 완료 기준

- [ ] CSS transition 또는 React 애니메이션으로 이미지 이동 효과가 구현된다
- [ ] 별도 다이얼로그/모달이 필요 없다
- [ ] TODO: 구현 방식(CSS transition vs React Spring 등) 확정 필요

---

## 8. 작업 명단

| 작업 | 대상 파일 경로 | 상태 |
|---|---|---|
| 애니메이션 구현 | `BrandPosApp/PosUi/src/shared/ui/atoms/ImageMover.tsx` (또는 CSS) | TODO |

---

## Appendix: 레거시 참조

### 레거시 다이얼로그 정보

| 항목 | 값 |
|---|---|
| 다이얼로그 ID | IDD_MOVEIMG_DLG |
| 리소스 값 | 319 |
| 크기 (DLU) | 110 x 110 |
| 확장 스타일 | WS_EX_TRANSPARENT |
| 소스 파일 | Restaurant.rc |
| 총 UI 요소 수 | 0 (투명 다이얼로그, GDI 직접 렌더링) |

### 레거시 컨트롤 -> 신규 매핑

| 레거시 컨트롤 | 신규 대응 |
|---|---|
| (없음 - 다이얼로그 자체가 GDI 캔버스) | CSS transition / React 애니메이션 |

---

## Progress

| 날짜 | 작업 | 상태 |
|------|------|------|
| 2026-04-05 | UI Shell 구현: `BrandPosApp/PosUi/src/screens/common/MoveImageDialog.tsx` (CSS transition 기반) | DONE |
