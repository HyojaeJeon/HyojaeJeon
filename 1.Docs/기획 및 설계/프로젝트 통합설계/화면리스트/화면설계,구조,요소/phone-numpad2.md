# PHONE_NUMPAD2 화면 설계서

---

## 0. 문서 정보

| 항목 | 값 |
|---|---|
| 문서 ID | SCR-PHONE-NUMPAD2 |
| 화면 ID (레거시) | IDD_PHONE_NUMPAD2 |
| 작성일 | 2026-04-05 |
| 상태 | 통합 완료 -> phone-numpad.md 참조 |

---

## 1. 통합 안내

**이 문서는 `phone-numpad.md`에 통합되었다.**

PHONE_NUMPAD2는 PHONE_NUMPAD의 소형(compact) 변형이다. 동일 컴포넌트 `shared/ui/organisms/PhoneNumpad`를 `size` prop(`compact` vs `full`)으로 구분하여 렌더링한다. 별도 컴포넌트를 만들지 않는다.

- 기능/데이터 흐름은 PHONE_NUMPAD와 동일하다.
- 크기(400x300 vs 512x386)와 레이아웃만 prop으로 분기한다.

모든 설계 내용은 아래 문서를 참조한다:

> **`phone-numpad.md`** (SCR-PHONE-NUMPAD)

---

## 9. 작업 진행 기록
| 날짜 | 범위 | 상태 | 완료 범위 | 남은 범위 | 내용 |
|---|---|---|---|---|---|
| 2026-04-05 | Shell 구현 | 완료 | 레이아웃+로컬상태+stub | - | PhoneNumPadV2.tsx는 PhoneNumPad의 re-export. phone-numpad.md에 통합됨. size="compact" prop으로 분기. |

---

## Appendix: 레거시 참조

### 레거시 다이얼로그 정보

| 항목 | 값 |
|---|---|
| 다이얼로그 ID | IDD_PHONE_NUMPAD2 |
| 리소스 값 | 451 |
| 크기 (DLU) | 400 x 300 |
| 소스 파일 | Restaurant.rc |
| 총 UI 요소 수 | 19 (버튼 15, 라벨 3, 입력 1) |

레거시 컨트롤 매핑은 `phone-numpad.md`의 Appendix를 참조한다.
