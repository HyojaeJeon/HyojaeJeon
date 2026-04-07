# PHONE_NUMPAD 화면 설계서

---

## 0. 문서 정보

| 항목 | 값 |
|---|---|
| 문서 ID | SCR-PHONE-NUMPAD |
| 화면 ID (레거시) | IDD_PHONE_NUMPAD (full), IDD_PHONE_NUMPAD2 (compact) |
| 작성일 | 2026-04-05 |
| 상태 | 초안 |
| 통합 대상 | phone-numpad.md + phone-numpad2.md -> 단일 컴포넌트, `size` prop으로 분기 |

---

## 1. 화면 개요

PHONE_NUMPAD는 고객 전화번호 입력용 전체화면/소형 넘패드이다. 포인트 적립/고객 조회 시 사용하며, 고객 대면 화면이므로 한국어/베트남어 동시 다국어 표시를 유지한다. 레거시 IDD_PHONE_NUMPAD(512x386, full)과 IDD_PHONE_NUMPAD2(400x300, compact)는 동일 컴포넌트를 `size` prop으로 분기하여 렌더링한다. 별도 컴포넌트를 만들지 않는다.

- 신규 UI 위치: `shared/ui/organisms/PhoneNumpad`
- 화면 유형: 모달 (Organism)
- 우선순위: **P0**

---

## 2. 상위 기준 연결

| 기준 문서 | 관련 섹션 | 비고 |
|---|---|---|
| CLAUDE.md | shared/ui 규칙 | 공용 UI는 shared/ui/organisms 배치 |
| CLAUDE.md | i18n 규칙 | 다국어 동시 표시 (고객 대면) |

---

## 3. 기능 목록

| ID | 기능명 | 우선순위 | Bridge Command | UseCase | Domain/Manager | Infrastructure |
|---|---|---|---|---|---|---|
| NUMPAD-F01 | 숫자 입력 (0~9) | P0 | 없음 (UI 로컬 상태) | - | - | - |
| NUMPAD-F02 | 다시 입력 (초기화) | P0 | 없음 (UI 로컬 상태) | - | - | - |
| NUMPAD-F03 | 백스페이스 | P0 | 없음 (UI 로컬 상태) | - | - | - |
| NUMPAD-F04 | 닫기 | P0 | 없음 (모달 닫기) | - | - | - |
| NUMPAD-F05 | 조회 (전화번호 검색) | P0 | ITEM:SEARCH 또는 콜백 | - | CustMgr | Tables/Customer/CustCrud (SQLite) |
| NUMPAD-F06 | 취소 (숨김) | P1 | 없음 (모달 닫기) | - | - | - |

---

## 4. UI 구조

### 4.1 화면 레이아웃

```
size="full" (512x386)              size="compact" (400x300)
+-------------------------------+  +---------------------------+
| [Hyojung 타이틀]               |  | [Hyojung 타이틀]           |
| [한국어 안내]                   |  | [한국어 안내]               |
| [베트남어 안내]                 |  | [베트남어 안내]             |
|                               |  |                           |
| [전화번호 표시]                 |  | [전화번호 표시]             |
| +--Numpad (큰 버튼)--+         |  | +--Numpad (작은 버튼)--+   |
| | 1  2  3 |                    |  | | 1  2  3 |              |
| | 4  5  6 |                    |  | | 4  5  6 |              |
| | 7  8  9 |                    |  | | 7  8  9 |              |
| |재입력 0 < |                   |  | |재입력 0 < |             |
| +----------+                   |  | +----------+             |
| [닫기]  [      조회      ]      |  | [닫기] [     조회     ]   |
+-------------------------------+  +---------------------------+
```

### 4.2 컴포넌트 매핑 (shared/ui 기준)

| 영역 | 컴포넌트 경로 | 비고 |
|---|---|---|
| 넘패드 전체 | shared/ui/organisms/PhoneNumpad | `size` prop: `full` / `compact` |
| 전화번호 표시 | shared/ui/organisms/PhoneNumpad 내 PhoneDisplay | 숫자 전용 |
| 안내 메시지 | shared/ui/organisms/PhoneNumpad 내 i18n 메시지 | ko + vi 동시 표시 |
| 버튼 | shared/ui/atoms/Button | 숫자, 닫기, 조회 |

### 4.3 데이터 바인딩

| ID | 표시 항목 | 신규 UI 컴포넌트 | 데이터 소스 |
|---|---|---|---|
| NUMPAD-D01 | 전화번호 입력 표시 | PhoneDisplay | UI 로컬 상태 |
| NUMPAD-D02 | 타이틀 | Title | props 또는 i18n |
| NUMPAD-D03 | 베트남어 안내 | i18n 메시지 | i18n (vi) |
| NUMPAD-D04 | 한국어 안내 | i18n 메시지 | i18n (ko) |

---

## 5. 구현 명세

### 5.1 Bridge Command

| Command | 요청 payload | 응답 payload | 비고 |
|---|---|---|---|
| (콜백 방식) | `{ phoneNumber }` | - | 조회 클릭 시 전화번호를 콜백으로 반환, 호출자가 CustMgr를 통해 고객 검색 |

### 5.2 UseCase

해당 없음. 조회는 호출자 측에서 수행.

### 5.3 Domain/Manager

| Manager | 메서드 | 책임 |
|---|---|---|
| CustMgr (호출자 측) | SearchByPhone() | 전화번호로 고객 검색 |

### 5.4 Infrastructure

| 모듈 | 파일 | 책임 |
|---|---|---|
| Tables/Customer/CustCrud (호출자 측) | SQLite | 고객 조회 |

### 5.5 RTK Query 연동

해당 없음. 조회는 호출자 측.

### 5.6 PosRealTime 이벤트

해당 없음.

### 5.7 Permission

해당 없음. 순수 UI 컴포넌트 — Bridge/UseCase 없음. 호출자가 접근 권한을 제어한다.

---

## 6. 테스트

| ID | 시나리오 | 기대 결과 |
|---|---|---|
| NUMPAD-T01 | 숫자 0~9 입력 | 전화번호 표시 갱신 |
| NUMPAD-T02 | 다시 입력 클릭 | 전화번호 초기화 |
| NUMPAD-T03 | 백스페이스 클릭 | 마지막 숫자 삭제 |
| NUMPAD-T04 | 조회 클릭 | onSearch 콜백에 전화번호 전달 |
| NUMPAD-T05 | size="full" 렌더링 | 큰 레이아웃 |
| NUMPAD-T06 | size="compact" 렌더링 | 작은 레이아웃 |
| NUMPAD-T07 | 한국어/베트남어 동시 표시 | 두 언어 안내 모두 보임 |

---

## 7. 완료 기준

- [ ] 단일 컴포넌트 PhoneNumpad가 `size` prop으로 full/compact를 분기한다
- [ ] 별도 컴포넌트(PhoneNumpad2 등)를 만들지 않는다
- [ ] 한국어/베트남어 안내 메시지가 i18n 기반 동시 표시된다
- [ ] ContentViewer(고객 대면 디스플레이)와 연동 가능하다
- [ ] 조회 시 전화번호를 콜백으로 반환한다

---

## 8. 작업 명단

| 작업 | 대상 파일 경로 | 상태 |
|---|---|---|
| Organism 구현 | `BrandPosApp/PosUi/src/shared/ui/organisms/PhoneNumpad.tsx` | TODO |
| i18n (ko) | `SharedAssets/i18n/locales/ko/customer.json` | TODO |
| i18n (vi) | `SharedAssets/i18n/locales/vi/customer.json` | TODO |

---

## 9. 작업 진행 기록
| 날짜 | 범위 | 상태 | 완료 범위 | 남은 범위 | 내용 |
|---|---|---|---|---|---|
| 2026-04-05 | Shell 구현 | 완료 | 레이아웃+로컬상태+stub | i18n 연동, ContentViewer 연동 | PhoneNumPad.tsx shell 구현 완료. 단일 컴포넌트에서 size prop(full/compact) 분기. 한국어/베트남어 안내 동시 표시. 전화번호 포맷팅 표시 + 숫자입력/재입력/백스페이스/조회 콜백. PhoneNumPadV2.tsx는 re-export만. |

---

## Appendix: 레거시 참조

### 레거시 다이얼로그 정보

#### IDD_PHONE_NUMPAD (full)

| 항목 | 값 |
|---|---|
| 다이얼로그 ID | IDD_PHONE_NUMPAD |
| 리소스 값 | 447 |
| 크기 (DLU) | 512 x 386 |
| 소스 파일 | Restaurant.rc |
| 총 UI 요소 수 | 19 (버튼 15, 라벨 3, 입력 1) |

#### IDD_PHONE_NUMPAD2 (compact)

| 항목 | 값 |
|---|---|
| 다이얼로그 ID | IDD_PHONE_NUMPAD2 |
| 리소스 값 | 451 |
| 크기 (DLU) | 400 x 300 |
| 소스 파일 | Restaurant.rc |
| 총 UI 요소 수 | 19 (버튼 15, 라벨 3, 입력 1) |

### 레거시 컨트롤 -> 신규 매핑

| 레거시 컨트롤 | 신규 대응 |
|---|---|
| IDC_N_NUM0~9 | PhoneNumpad 숫자 버튼 |
| IDC_N_REFRESH | 다시 입력 버튼 |
| IDC_N_BACKSPACE | 백스페이스 버튼 |
| IDC_N_CLOSE | 닫기 버튼 |
| IDC_N_SEARCH | 조회 버튼 |
| IDC_PHONE_NUMBER (EditText) | PhoneDisplay |
| IDC_LABEL_TITLE | Title |
| IDC_LABEL_KR | i18n (ko) 안내 |
| IDC_LABEL_VN | i18n (vi) 안내 |
| IDCANCEL (숨김) | 내부 닫기 |
