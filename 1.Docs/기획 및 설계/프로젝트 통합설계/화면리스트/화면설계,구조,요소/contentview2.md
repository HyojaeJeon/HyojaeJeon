# CONTENTVIEW2 화면 설계서

---

## 0. 문서 정보

| 항목 | 값 |
|---|---|
| 문서 ID | SCR-CONTENTVIEW2 |
| 화면 ID (레거시) | IDD_CONTENTVIEW2 |
| 작성일 | 2026-04-05 |
| 상태 | 통합 완료 -> contentview.md 참조 |

---

## 1. 통합 안내

**이 문서는 `contentview.md`에 통합되었다.**

CONTENTVIEW2는 CONTENTVIEW의 소형(414x327) 변형이다. 동일 컴포넌트 `shared/ui/organisms/ContentViewer`를 `size` prop(`compact` vs `full`)으로 구분하여 렌더링한다. 별도 컴포넌트를 만들지 않는다.

- 기능/데이터 흐름은 CONTENTVIEW와 동일하다.
- 레이아웃과 크기만 prop으로 분기한다.
- CONTENTVIEW와 달리 ActiveX WebBrowser 컨트롤이 없다.

모든 설계 내용은 아래 문서를 참조한다:

> **`contentview.md`** (SCR-CONTENTVIEW)

---

## Appendix: 레거시 참조

### 레거시 다이얼로그 정보

| 항목 | 값 |
|---|---|
| 다이얼로그 ID | IDD_CONTENTVIEW2 |
| 리소스 값 | 164 |
| 크기 (DLU) | 414 x 327 |
| 소스 파일 | Restaurant.rc |
| 총 UI 요소 수 | 30 (버튼 11, 라벨 18, 그리드 1) |

레거시 컨트롤 매핑은 `contentview.md`의 Appendix를 참조한다.

---

## 9. 진행 기록

| 작업 | 대상 파일 경로 | 상태 |
|---|---|---|
| Screen Shell | `BrandPosApp/PosUi/src/screens/EmployeeScreen/components/ContentView2Dialog.tsx` | DONE (shell) |
