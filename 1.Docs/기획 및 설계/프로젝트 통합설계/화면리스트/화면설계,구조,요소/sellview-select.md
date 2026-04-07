# SELLVIEW_SELECT (매출 조회 조건 설정 모달)

## 0. 문서 정보

| 항목 | 값 |
|---|---|
| 문서 ID | SCR-SELLVIEW-SELECT |
| 레거시 다이얼로그 | IDD_SELLVIEW_SELECT (리소스 239) |
| 신규 화면 경로 | screens/SalesScreen/components/SalesFilterModal |
| 최종 수정일 | 2026-04-05 |
| 상태 | 설계 |

---

## 1. 화면 개요

SELLVIEW의 **조회 조건 설정 모달**. POS번호, 테이블명 선택, 영수증번호/금액 입력, 판매타입 체크박스 필터를 제공한다. 신규 구조에서는 독립 다이얼로그가 아닌 SalesScreen 내부 **필터 모달/패널**로 통합한다.

---

## 2. 상위 기준 연결

| 기준 문서 | 관련 섹션 | 비고 |
|---|---|---|
| sellview.md | 상위 매출 조회 화면 | SalesScreen 내부 서브 모달 |
| 04-Edge-POS-아키텍처-설계서 | 4.x 계층 책임 | UI 로컬 필터 |

---

## 3. 기능 목록

| ID | 기능명 | 우선순위 | Bridge Command | UseCase | Domain/Manager | Infrastructure |
|---|---|---|---|---|---|---|
| SVS-F01 | 매출 조회 조건 확인 | P0 | SALES:SEARCH | - | SaleMgr | SellSlipCrud |
| SVS-F02 | 매출 조회 조건 취소 | P0 | - (UI 로컬) | - | - | - |
| SVS-F03 | POS번호 선택 | P1 | - (UI 로컬 필터) | - | SystemMgr | - |
| SVS-F04 | 테이블명 선택 | P1 | - (UI 로컬 필터) | - | TableManager | - |
| SVS-F05 | 영수증번호/금액 입력 | P1 | - (UI 로컬 필터) | - | - | - |
| SVS-F06 | 판매타입 필터 (체크박스 1~6) | P1 | - (UI 로컬 필터) | - | - | - |

---

## 4. UI 구조

### 4.1 화면 구성

```
screens/SalesScreen/components/
  SalesFilterModal.tsx         -- 매출 조회 필터 모달 (독립 다이얼로그 -> 모달)
```

### 4.2 재사용 UI (shared/ui/)

| 컴포넌트 | 경로 | 용도 |
|---|---|---|
| Select | shared/ui/molecules/Select | POS번호/테이블명 드롭다운 (ComboBox 대체) |

---

## 5. 구현 명세

### 5.1 상태 소유권

| 상태 | 소유자 | 비고 |
|---|---|---|
| POS번호 목록 | RTK Query 캐시 (systemApi: getPosList) | 서버 상태 |
| 테이블명 목록 | RTK Query 캐시 (tableApi: getTableList) | 서버 상태 |
| 선택된 POS번호 | uiSlice (Redux) | UI 로컬 필터 |
| 선택된 테이블명 | uiSlice (Redux) | UI 로컬 필터 |
| 영수증번호/금액 | React 로컬 state | 컴포넌트 로컬 |
| 판매타입 체크박스 | uiSlice (Redux) | UI 로컬 필터 |

### 5.2 Bridge 계약

필터 확인(IDOK) 시 `SALES:SEARCH` 커맨드 전송.

| Command | Request | Response | Error | Idempotency | 비고 |
|---|---|---|---|---|---|
| SALES:SEARCH | `{ startDate, endDate, posNo?, tableId? }` | `{ sellSlips: [...] }` | (없음 — 읽기 전용) | - | 조회 전용. 멱등성/락/Outbox 불필요. Bridge shape 상세는 `sellview.md` 섹션 5.2 참조 |

### 5.3 UseCase 계약

읽기 전용 필터이므로 별도 UseCase 없음. 조회 실행은 상위 SalesScreen에서 처리. → handoff: sellview.md

조회 전용 UseCase 실패 규칙: 멱등성/락/Outbox 불필요. 오프라인: 로컬 DB만 사용하므로 오프라인에서도 동작.

### 5.4 Domain/Manager

| Manager | 역할 |
|---|---|
| SystemMgr | POS번호 목록 제공 |
| TableManager | 테이블명 목록 제공 |

### 5.5 DB / CentralApi / Sync / Realtime

해당 없음 (읽기 전용 필터).

### 5.6 i18n / Error / Permission

**Permission**
- 매출 조회 필터: 로그인 직원 전원 (읽기 전용 필터이므로 별도 권한 제한 없음)

- 판매타입 체크박스 라벨은 i18n 키 기반
- ComboBox -> `shared/ui/molecules/Select` 대체

---

## 6. 테스트

| ID | 시나리오 | 검증 항목 |
|---|---|---|
| T-SVS-01 | POS번호 드롭다운 | 시스템 설정 기반 POS 목록 표시 |
| T-SVS-02 | 테이블명 드롭다운 | 테이블 목록 정상 표시 |
| T-SVS-03 | 필터 확인 | 선택된 조건으로 SALES:SEARCH 전송 |
| T-SVS-04 | 필터 취소 | 조건 미적용, 모달 닫기 |

---

## 7. 완료 기준

- [ ] SalesFilterModal 구현 (독립 다이얼로그 -> 모달)
- [ ] Select 컴포넌트 재사용 (ComboBox 대체)
- [ ] 판매타입 체크박스 필터 동작
- [ ] 필터 조건 -> SALES:SEARCH 연동

---

## 8. 작업 명단

| 계층 | 파일 경로 | 설명 |
|---|---|---|
| UI Screen | BrandPosApp/PosUi/src/screens/SalesScreen/components/SalesFilterModal.tsx | 매출 필터 모달 |
| Shared UI | BrandPosApp/PosUi/src/shared/ui/molecules/Select.tsx | 드롭다운 선택 |
| Store | BrandPosApp/PosUi/src/store/api/systemApi.ts | 시스템 RTK Query |
| Store | BrandPosApp/PosUi/src/store/api/tableApi.ts | 테이블 RTK Query |

---

## Appendix: 레거시 참조

### A.1 레거시 다이얼로그 정보

| 항목 | 값 |
|---|---|
| 다이얼로그 ID | IDD_SELLVIEW_SELECT |
| 리소스 값 | 239 |
| 크기 (DLU) | 400 x 300 |
| 총 UI 요소 수 | 16 (버튼 2, 텍스트 3, 입력 9, 기타 2) |
| 소스 파일 | Restaurant.rc |

### A.2 주요 레거시 컨트롤 -> 신규 매핑

| 레거시 ID | 용도 | 신규 위치 |
|---|---|---|
| IDOK | 확인 | SalesFilterModal (확인 버튼) |
| IDCANCEL | 취소 | SalesFilterModal (취소 버튼) |
| IDC_CB_POSNO | POS번호 선택 | shared/ui/molecules/Select |
| IDC_CB_TABLENAME | 테이블명 선택 | shared/ui/molecules/Select |
| IDC_EDT_RECENO | 영수증번호/금액 | SalesFilterModal (입력 필드) |
| IDC_CHK_SELL1~6 | 판매타입 체크박스 | SalesFilterModal (체크박스 그룹) |
| IDC_STA_SELLTYPE | 판매타입 그룹박스 | SalesFilterModal (그룹 라벨) |
| IDC_STA_RECEIPT | 영수증 그룹박스 | SalesFilterModal (그룹 라벨) |

---

## 9. 작업 진행 기록
| 날짜 | 범위 | 상태 | 완료 범위 | 남은 범위 | 내용 |
|---|---|---|---|---|---|
| 2026-04-05 | Shell 구현 | 완료 | 레이아웃+로컬상태+stub | Bridge/UseCase 연동 | SalesViewSelectDialog.tsx shell 구현 완료. POS번호/테이블명 Dropdown, 영수증번호/금액 입력, 판매타입 체크박스 6개 필터 포함 |
