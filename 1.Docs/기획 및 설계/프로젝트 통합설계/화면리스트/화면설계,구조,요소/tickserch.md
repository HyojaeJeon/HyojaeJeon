# TICKSERCH 화면 설계서

---

## 0. 문서 정보

| 항목 | 값 |
|---|---|
| 문서 ID | SCR-TICKSERCH |
| 화면 ID (레거시) | IDD_TICKSERCH |
| 작성일 | 2026-04-05 |
| 상태 | 초안 |

---

## 1. 화면 개요

TICKSERCH는 전표 검색 전용 모달이다. GETTICK_DIALOG에서 전표검색(IDC_TICK_TICKSEARCH) 클릭 시 열리며, 기간 + 키워드 기반 검색을 지원한다. SearchTicketUseCase를 재사용한다.

- 신규 UI 위치: `shared/ui/organisms/TicketSearchModal`
- 화면 유형: 모달 (Organism)
- 우선순위: **P0**

---

## 2. 상위 기준 연결

| 기준 문서 | 관련 섹션 | 비고 |
|---|---|---|
| 04-Edge-POS-아키텍처-설계서 | 결제/매출 계층 흐름 | 전표 검색 |
| CLAUDE.md | shared/ui 규칙 | 공용 모달은 shared/ui/organisms |

---

## 3. 기능 목록

| ID | 기능명 | 우선순위 | Bridge Command | UseCase | Domain/Manager | Infrastructure |
|---|---|---|---|---|---|---|
| TSRCH-F01 | 전표 검색 (기간+키워드) | P0 | TICKET:SEARCH | SearchTicketUseCase | SaleMgr | Tables/Payment/SellSlipCrud (SQLite) |
| TSRCH-F02 | 전표 선택 | P0 | TICKET:GET_DETAIL | SearchTicketUseCase | SaleMgr | Tables/Payment/SellSlipCrud (SQLite) |
| TSRCH-F03 | 닫기 | P0 | 없음 (모달 닫기) | - | - | - |
| TSRCH-F04 | 엑셀 내보내기 | P2 | SYSTEM:GET_CONTENT | - | - | Support/Excel |
| TSRCH-F05 | 그리드 스크롤 | P0 | 없음 (UI 로컬) | - | - | - |

---

## 4. UI 구조

### 4.1 화면 레이아웃

```
+-------------------------------------------------------+
| [영업일] [담당자]                    [선택] [닫기]        |
|                                                       |
| [시작일 ~ 종료일] [검색어 입력] [조회]           [엑셀]  |
|                                                       |
| +--전표 검색 결과 그리드--------------------------+      |
| | 날짜 | 전표번호 | 금액 | 결제수단 | ...         |      |
| |                                              |      |
| +----------------------------------------------+      |
+-------------------------------------------------------+
```

### 4.2 컴포넌트 매핑 (shared/ui 기준)

| 영역 | 컴포넌트 경로 | 비고 |
|---|---|---|
| 모달 전체 | shared/ui/organisms/TicketSearchModal | 전표 검색 모달 |
| 검색 결과 | shared/ui/molecules/DataTable | React 테이블 |
| 날짜 선택 | shared/ui/atoms/DatePicker | 조회 기간 |
| 검색 입력 | shared/ui/atoms/SearchInput | 키워드 검색 |

### 4.3 데이터 바인딩

| ID | 표시 항목 | 신규 UI 컴포넌트 | 데이터 소스 |
|---|---|---|---|
| TSRCH-D01 | 영업일 | Label | systemApi.getConfig |
| TSRCH-D02 | 담당자 | Label | systemApi.getConfig |
| TSRCH-D03 | 검색어 입력 | SearchInput | UI 로컬 상태 |
| TSRCH-D04 | 조회 시작일 | DatePicker | UI 로컬 상태 |
| TSRCH-D05 | 조회 종료일 | DatePicker | UI 로컬 상태 |
| TSRCH-D06 | 전표 검색 결과 그리드 | DataTable | ticketApi.searchTickets |

---

## 5. 구현 명세

### 5.1 Bridge Command

| Command | 요청 payload | 응답 payload | Error | 비고 |
|---|---|---|---|---|
| TICKET:SEARCH | `{ keyword?, startDate?, endDate? }` | `{ tickets: [...] }` | (없음) | 키워드 포함 검색 |
| TICKET:GET_DETAIL | `{ ticketId }` | `{ ticket }` | (없음) | 선택된 전표 반환 |

### 5.2 UseCase

| UseCase | 책임 | 트랜잭션 | Ledger | Outbox |
|---|---|---|---|---|
| SearchTicketUseCase | 전표 검색 (재사용) | X (읽기 전용) | - | - |

### 5.3 Domain/Manager

| Manager | 메서드 | 책임 |
|---|---|---|
| SaleMgr | SearchTickets() | 전표 검색 |

### 5.4 Infrastructure

| 모듈 | 파일 | 책임 |
|---|---|---|
| Tables/Payment/SellSlipCrud | SQLite | 전표 검색 |
| Support/Excel | - | 엑셀 내보내기 |

### 5.5 RTK Query 연동

| Endpoint | 태그 | 비고 |
|---|---|---|
| ticketApi.searchTickets | `TicketList` | 전표 검색 결과 |

### 5.6 PosRealTime 이벤트

해당 없음.

### 5.7 i18n / Error / Permission

| 항목 | 규칙 | 비고 |
|---|---|---|
| i18n | `SharedAssets/i18n/locales/{ko,vi,en}/ticket.json` | msgKey 기반 |
| Error | 코드 기반: `{ type, code, msgKey, severity, recoverable }` | |
| Permission | **로그인 직원 전원**. 전표 검색은 특별한 권한 제한 없음. | |

> **UseCase 실패 규칙**: SearchTicketUseCase는 읽기 전용 — Ledger/TX 불필요. 오프라인 동작 가능 (로컬 SQLite 기준).

---

## 6. 테스트

| ID | 시나리오 | 기대 결과 |
|---|---|---|
| TSRCH-T01 | 기간 + 키워드 검색 | 조건에 맞는 전표 표시 |
| TSRCH-T02 | 전표 선택 후 확인 | 선택된 전표 정보 콜백 반환 |
| TSRCH-T03 | 엑셀 내보내기 | 파일 생성 |

---

## 7. 완료 기준

- [ ] MFCGridCtrl 1개가 React 테이블로 대체된다
- [ ] SearchTicketUseCase를 재사용한다
- [ ] 선택(IDC_TICKSERCH_SELECT) 시 선택된 전표 정보를 콜백으로 반환한다
- [ ] 레거시 스크롤 버튼이 네이티브 스크롤로 대체된다

---

## 8. 작업 명단

| 작업 | 대상 파일 경로 | 상태 |
|---|---|---|
| Organism 구현 | `BrandPosApp/PosUi/src/shared/ui/organisms/TicketSearchModal.tsx` | TODO |
| RTK Query | `BrandPosApp/PosUi/src/store/api/ticketApi.ts` | TODO |

---

## Appendix: 레거시 참조

### 레거시 다이얼로그 정보

| 항목 | 값 |
|---|---|
| 다이얼로그 ID | IDD_TICKSERCH |
| 리소스 값 | 421 |
| 크기 (DLU) | 512 x 384 |
| 소스 파일 | Restaurant.rc |
| 총 UI 요소 수 | 12 (버튼 6, 라벨 2, 입력 3, 그리드 1) |

### 레거시 컨트롤 -> 신규 매핑

| 레거시 컨트롤 | 신규 대응 |
|---|---|
| IDC_TICKSERCH_SERCH | 조회 버튼 |
| IDC_TICKSERCH_SELECT | 선택 버튼 |
| IDCANCEL | 닫기 버튼 |
| IDC_BTN_EXCEL | 엑셀 버튼 |
| IDC_TICKSERCH_UP / DOWN | 네이티브 스크롤 |
| IDC_TICKSERCH_GRID (MFCGridCtrl) | DataTable |
| IDC_EDT_SEARCH2 | SearchInput |
| IDC_TICKSERCH_START / END | DatePicker |
| IDC_TICKSERCH_DATE / EMP | Label |
