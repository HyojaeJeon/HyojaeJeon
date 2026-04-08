# NUMPAD 화면 문서

## 0. 문서 정보

| 항목 | 값 |
|---|---|
| 화면명 | `NUMPAD` |
| 화면 ID | `IDD_NUMPAD` |
| 원본 파일 | `set-numpad.md` |
| 전환 우선순위 | `P0` |
| 담당 계층 | `PosUi (shared/ui 전용)` |
| 상태 | `Shell 구현 완료` |

## 1. 화면 개요

- **화면 목적**: 여러 설정 화면에서 재사용하는 공용 모달형 숫자 입력기이다. 독립 화면이 아니라 shared/ui 컴포넌트로 구현한다.
- **해결하는 사용자 문제**: 터치 환경에서 숫자 값(금액, 수량 등)을 편리하게 입력할 수 있도록 전용 넘패드 UI를 제공한다.
- **화면 진입 경로**: 설정 화면 내 숫자 입력 필드 클릭 시 모달로 열림
- **화면 종료 경로**: 선택(확정) 버튼 클릭 → 값 반환, 닫기(IDCANCEL) → 취소
- **관련 운영 주체**: 매장 관리자, 직원
- **운영 모드**: 공용 컴포넌트 (Setup/Maintenance + 운영 화면 공용)

## 2. 상위 기준 연결

| 기준 | 연결 문서 | 비고 |
|---|---|---|
| 전체 아키텍처 | `00-Platform-최종-아키텍처-기준서.md` | 필수 |
| Edge POS 설계 | `04-Edge-POS-아키텍처-설계서.md` | 필수 |
| 화면 인벤토리 | `_index.md` | 필수 |

## 3. 화면 기능 목록

| ID | 기능명 | 설명 | 사용자 액션 | 우선순위 |
|---|---|---|---|---|
| F-001 | 숫자 입력 (0~9) | 개별 숫자 버튼으로 값 입력 | 숫자 버튼 클릭 | P0 |
| F-002 | 00 입력 | 두 자리 영(00) 입력 | 00 버튼 클릭 | P0 |
| F-003 | 000 입력 (천 단위) | 세 자리 영(000) 입력 — 한국 화폐 단위 특성 반영 | 000 버튼 클릭 | P0 |
| F-004 | 0000 입력 (만 단위) | 네 자리 영(0000) 입력 — 한국 화폐 단위 특성 반영 | 0000 버튼 클릭 | P0 |
| F-005 | 백스페이스 | 마지막 입력 숫자 삭제 | BS 버튼 클릭 | P0 |
| F-006 | 전체 클리어 | 입력값 전체 초기화 | CLR 버튼 클릭 | P0 |
| F-007 | 선택 (값 확정) | 현재 입력값을 호출자에게 반환하고 모달 닫기 | 선택 버튼 클릭 | P0 |
| F-008 | 닫기/취소 | 입력 취소하고 모달 닫기 | 닫기 버튼 클릭 | P0 |

## 4. UI 구조

### 4.1 화면 구성

- **상단 영역**: 타이틀(호출자 전달), 선택 버튼, 닫기 버튼
- **중앙 영역**: 입력값 표시 필드 (우측 정렬)
- **하단 영역**: 숫자 키패드 (7-8-9 / 4-5-6 / 1-2-3 / 0-BS-CLR + 0000-000-00)

### 4.2 재사용 UI

| 컴포넌트 | 위치 | props로 바뀌는 값 | 비고 |
|---|---|---|---|
| Numpad | shared/ui/organisms/Numpad | title, initialValue, onConfirm, onCancel, min?, max? | 공용 모달 숫자 입력기 |
| NumberDisplay | shared/ui/atoms/NumberDisplay | value, align | 입력값 표시 |

## 5. 구현 명세

### 5.1 상태 소유권

| 상태 | 소유 계층 | 원본 | 비고 |
|---|---|---|---|
| 현재 입력값 | 로컬 컴포넌트 상태 | useState | UI 상태 |
| 모달 열림 여부 | 호출자 컴포넌트 상태 | useState | UI 상태 |

### 5.2 Bridge 계약

Bridge 계약 없음. 순수 UI 컴포넌트로 C++ 통신 불필요.

### 5.3 UseCase 계약

UseCase 없음. 값 확정 시 호출자에게 콜백으로 반환.

### 5.4 Domain / Manager / Store

해당 없음.

### 5.5 DB / CentralApi / Sync / Realtime

해당 없음.

### 5.6 i18n / Error / Permission

| 항목 | 규칙 | 비고 |
|---|---|---|
| i18n | `BrandPosApp/PosUi/src/i18n/locales/{ko,vi,en}/common.json` | msgKey: common.numpad.* |
| Error | 해당 없음 | |
| Permission | 해당 없음 | |

## 6. 테스트

| 테스트 항목 | 범위 | 기대 결과 | 유형 |
|---|---|---|---|
| 숫자 입력 후 표시값 갱신 | Numpad | 입력 숫자가 표시 필드에 반영 | unit |
| 백스페이스 동작 | Numpad | 마지막 자리 삭제 | unit |
| CLR 동작 | Numpad | 입력값 0으로 초기화 | unit |
| 000/0000 버튼 동작 | Numpad | 해당 자릿수만큼 0 추가 | unit |
| 선택 시 onConfirm 콜백 호출 | Numpad | 현재 값을 인자로 콜백 호출 | unit |
| 취소 시 onCancel 콜백 호출 | Numpad | 콜백 호출, 값 미반환 | unit |
| 터치 최적화 (44x44px 이상) | Numpad | 모든 버튼 최소 터치 영역 충족 | visual |

## 7. 완료 기준

- [ ] UI 구현 완료 (shared/ui/organisms/Numpad)
- [ ] 터치 최적화 확인 (최소 44x44px)
- [ ] 호출자 통합 테스트 완료
- [ ] i18n 적용 완료
- [ ] 테스트 완료
- [ ] 문서 상태 `DONE`

## 8. 작업 명단

| 작업 | 파일 | 상태 |
|---|---|---|
| Numpad 컴포넌트 구현 | `BrandPosApp/PosUi/src/shared/ui/organisms/Numpad.tsx` | TODO |
| NumberDisplay 컴포넌트 구현 | `BrandPosApp/PosUi/src/shared/ui/atoms/NumberDisplay.tsx` | TODO |
| Numpad 스토리/프리뷰 | `BrandPosApp/PosUi/src/app/design-system/components/numpad/page.tsx` | TODO |

---

## Appendix: 레거시 UI 요소 참조

### 기본 정보

| 항목 | 값 |
|------|---|
| 다이얼로그 ID | IDD_NUMPAD |
| 리소스 값 | 424 |
| 크기 (DLU) | 320 x 239 |
| 다이얼로그 타입 | DIALOGEX |
| 스타일 | DS_SETFONT \| DS_MODALFRAME \| WS_POPUP |
| 폰트 | 10, "System", 0, 0, 0x0 |
| 소스 파일 | RestaurantSet.rc |
| 총 UI 요소 수 | 19 |

### 버튼 (17개)

| ID | 라벨 | 위치 (x,y) | 크기 (w x h) | 용도 추정 |
|---|---|---|---|---|
| IDCANCEL | 닫기 | (254,8) | 39 x 21 | 닫기/취소 |
| IDC_N_NUM0~9 | 0~9 | 키패드 배치 | 27 x 28 | 숫자 입력 |
| IDC_N_NUM00 | 00 | (182,188) | 39 x 29 | 확인 |
| IDC_N_NUM000 | 000 | (140,188) | 39 x 29 | 천 단위 |
| IDC_N_NUM0000 | 0000 | (97,188) | 39 x 29 | 만 단위 |
| IDC_N_NUMBS | BS | (192,91) | 27 x 28 | 백스페이스 |
| IDC_N_NUMCLR | CLR | (192,123) | 27 x 28 | 클리어 |
| IDC_NUMPAD_SELECT | 선택 | (198,8) | 39 x 21 | 값 확정 |

### 텍스트/라벨 (1개)

| ID | 텍스트 | 용도 추정 |
|---|---|---|
| IDC_TITLE | 번호입력 | 타이틀 |

### 입력 필드 (1개)

| ID | 타입 | 스타일 | 용도 추정 |
|---|---|---|---|
| IDC_NUM_NUM | EditText | ES_RIGHT \| ES_AUTOHSCROLL | 입력값 표시 |

### 요소 통계

| 유형 | 개수 |
|------|------|
| 버튼 | 17 |
| 텍스트/라벨 | 1 |
| 입력 필드 | 1 |
| **합계** | **19** |

### 마이그레이션 노트 (원본)

- Numpad는 독립 화면이 아니라 공용 UI 컴포넌트(shared/ui/organisms/Numpad)로 구현한다.
- 여러 설정 화면에서 재사용하는 모달형 숫자 입력기이므로 Bridge Command 없이 UI 자체 로직으로 처리 가능하다.
- 000/0000 버튼은 한국 화폐 단위 특성을 반영한 UX이므로 유지한다.
- 터치 최적화: 버튼 크기는 최소 44x44px 이상으로 설정한다.
