# GETTICK_DIALOG 화면 설계서

---

## 0. 문서 정보

| 항목 | 값 |
|---|---|
| 문서 ID | SCR-GETTICK-DIALOG |
| 화면 ID (레거시) | IDD_GETTICK_DIALOG |
| 작성일 | 2026-04-05 |
| 상태 | 초안 |

---

## 1. 화면 개요

GETTICK_DIALOG는 전표(매출 이력) 조회/재발행/취소 화면이다. P0 핵심 기능으로, 기간별 전표 검색, 전표 재발행, 전표 취소, 카드 결제, 미승인 카드 처리, 현금영수증 발행을 제공한다. 내장 숫자패드(0~9, CLR, BS, 000, 0000)로 금액을 입력한다.

- 신규 UI 위치: `screens/TicketScreen`
- 화면 유형: 전체 화면 (Screen)
- 우선순위: **P0**

---

## 2. 상위 기준 연결

| 기준 문서 | 관련 섹션 | 비고 |
|---|---|---|
| 04-Edge-POS-아키텍처-설계서 | 결제/매출 계층 흐름 | 전표 관리 |
| CLAUDE.md | 멱등성 / Ledger 규칙 | 전표 취소 시 COMPENSATED 상태 기록 |

---

## 3. 기능 목록

| ID | 기능명 | 우선순위 | Bridge Command | UseCase | Domain/Manager | Infrastructure |
|---|---|---|---|---|---|---|
| TICK-F01 | 전표 조회 (기간별) | P0 | TICKET:SEARCH | SearchTicketUseCase | SaleMgr | Tables/Payment/SellSlipCrud, Tables/Payment/SellDetailCrud (SQLite) |
| TICK-F02 | 회원 검색 (전화번호) | P1 | ITEM:SEARCH | SearchTicketUseCase | CustMgr | Tables/Customer/CustCrud (SQLite) |
| TICK-F03 | 전표 발행 (재발행) | P0 | TICKET:GET_DETAIL | SearchTicketUseCase | SaleMgr | Tables/Payment/SellSlipCrud (SQLite), Device/Printer |
| TICK-F04 | 전표 취소 | P0 | TICKET:SEARCH | SearchTicketUseCase | SaleMgr | Tables/Payment/SellSlipCrud (SQLite) |
| TICK-F05 | 전표 인쇄 | P1 | SYSTEM:GET_CONTENT | SearchTicketUseCase | - | Device/Printer |
| TICK-F06 | 카드 결제 (숨김) | P1 | STAFF:VERIFY_PERMISSION | VerifyPermissionUseCase | SaleMgr | ExternalBridge/PaymentGateways (SQLite) |
| TICK-F07 | 미승인 카드 처리 | P1 | STAFF:VERIFY_PERMISSION | VerifyPermissionUseCase | SaleMgr | Tables/Payment/* (SQLite) |
| TICK-F08 | 현금영수증 (숨김) | P2 | STAFF:VERIFY_PERMISSION | VerifyPermissionUseCase | SaleMgr | ExternalBridge/PaymentGateways (SQLite) |
| TICK-F09 | 전표(단) 검색 | P1 | TICKET:SEARCH | SearchTicketUseCase | SaleMgr | Tables/Payment/SellSlipCrud (SQLite) |
| TICK-F10 | 닫기 | P0 | 없음 (라우팅) | - | - | - |
| TICK-F11 | 전체 전표 보기 (숨김) | P2 | TICKET:SEARCH | SearchTicketUseCase | SaleMgr | Tables/Payment/SellSlipCrud (SQLite) |
| TICK-F12 | 숫자패드 입력 (0~9, CLR, BS, 000, 0000) | P0 | 없음 (UI 로컬 상태) | - | - | - |
| TICK-F13 | 전표 그리드 스크롤 | P0 | 없음 (UI 로컬) | - | - | - |

---

## 4. UI 구조

### 4.1 화면 레이아웃

```
+---------------------------------------------------------------+
| [영업일] [담당자]                                    [닫기]      |
|                                                               |
| [전화번호 입력] [회원검색] [전표검색]                             |
| [금액 입력]     [발행] [카드] [미승인카드]                        |
| [시작일 ~ 종료일] [조회] [취소] [인쇄]                           |
|                                                               |
| +--Numpad--+                                                  |
| | 7 8 9 BS |  +--전표 요약 그리드 (상단 바)--+                   |
| | 4 5 6 CLR|  +-----------------------------+                  |
| | 1 2 3 000|                                                  |
| | 0 0000   |  +--전표 목록--+  +--전표 상세--+                   |
| +----------+  | 그리드       |  | 그리드      |                   |
|               +-------------+  +------------+                  |
+---------------------------------------------------------------+
```

### 4.2 컴포넌트 매핑 (shared/ui 기준)

| 영역 | 컴포넌트 경로 | 비고 |
|---|---|---|
| 전표 요약/목록/상세 | shared/ui/molecules/DataTable | 3개 React 테이블 |
| 숫자패드 | screens/TicketScreen 내장 Numpad | 금액 입력용 (000, 0000 포함) |
| 날짜 선택 | shared/ui/atoms/DatePicker | 조회 기간 |

### 4.3 데이터 바인딩

| ID | 표시 항목 | 신규 UI 컴포넌트 | 데이터 소스 |
|---|---|---|---|
| TICK-D01 | 영업일 | Label | systemApi.getConfig |
| TICK-D02 | 담당자 | Label | systemApi.getConfig (로그인 직원) |
| TICK-D03 | 조회 시작일 | DatePicker | UI 로컬 상태 |
| TICK-D04 | 조회 종료일 | DatePicker | UI 로컬 상태 |
| TICK-D05 | 전화번호 입력 | TextInput | UI 로컬 상태 |
| TICK-D06 | 금액 입력 | AmountInput | UI 로컬 상태 |
| TICK-D07 | 전표 목록 그리드 | DataTable | ticketApi.searchTickets |
| TICK-D08 | 전표 상세 그리드 | DataTable | ticketApi.getTicketDetail |
| TICK-D09 | 전표 요약 그리드 | DataTable | ticketApi.searchTickets (요약) |

---

## 5. 구현 명세

### 5.1 Bridge Command

| Command | 요청 payload | 응답 payload | 비고 |
|---|---|---|---|
| TICKET:SEARCH | `{ startDate, endDate, phone, amount }` | `{ tickets[], summary }` | 기간별 검색 |
| TICKET:GET_DETAIL | `{ ticketId }` | `{ ticket, details[] }` | 전표 상세/재발행 |

### 5.2 UseCase

| UseCase | 책임 | 트랜잭션 | Ledger | Outbox |
|---|---|---|---|---|
| SearchTicketUseCase | 전표 조회, 재발행, 취소 | O (취소 시) | 취소 시 COMPENSATED 기록 | 취소 이력 동기화 |

### 5.3 Domain/Manager

| Manager | 메서드 | 책임 |
|---|---|---|
| SaleMgr | SearchTickets() | 전표 검색 |
| SaleMgr | CancelTicket() | 전표 취소 |
| SaleMgr | ReissueTicket() | 전표 재발행 |
| CustMgr | SearchByPhone() | 회원 검색 |

### 5.4 Infrastructure

| 모듈 | 파일 | 책임 |
|---|---|---|
| Tables/Payment/SellSlipCrud | SQLite | 전표 조회/취소 |
| Tables/Payment/SellDetailCrud | SQLite | 전표 상세 |
| Tables/Customer/CustCrud | SQLite | 회원 검색 |
| Device/Printer | - | 전표 인쇄 |
| ExternalBridge/PaymentGateways | - | 카드 결제/현금영수증 |

### 5.5 RTK Query 연동

| Endpoint | 태그 | 비고 |
|---|---|---|
| ticketApi.searchTickets | `TicketList` | 전표 목록 + 요약 |
| ticketApi.getTicketDetail | `Ticket:{id}` | 전표 상세 |

### 5.6 PosRealTime 이벤트

해당 없음.

---

## 6. 테스트

| ID | 시나리오 | 기대 결과 |
|---|---|---|
| TICK-T01 | 기간별 전표 조회 | 목록 + 요약 표시 |
| TICK-T02 | 전표 선택 | 상세 그리드 갱신 |
| TICK-T03 | 전표 취소 | Ledger에 COMPENSATED 기록, 목록 갱신 |
| TICK-T04 | 전표 재발행 | 영수증 출력 |
| TICK-T05 | 숫자패드 000/0000 입력 | 금액에 0 3개/4개 추가 |

---

## 7. 완료 기준

- [ ] 3개의 MFCGridCtrl이 React 테이블로 대체된다
- [ ] 전표 취소 시 SearchTicketUseCase가 멱등성을 보장하며 Ledger에 COMPENSATED 기록한다
- [ ] 내장 숫자패드(000, 0000 포함)가 React 컴포넌트로 구현된다
- [ ] 카드 결제/현금영수증 숨김 버튼이 조건부 표시로 전환된다

---

## 8. 작업 명단

| 작업 | 대상 파일 경로 | 상태 |
|---|---|---|
| Screen 구현 | `BrandPosApp/PosUi/src/screens/TicketScreen/index.tsx` | TODO |
| Bridge Command | `BrandPosApp/Presentation/CEF/InternalBridge/PosRequestActions/Payment/PaymentActions.cpp` | TODO |
| UseCase | `BrandPosApp/UseCases/Payment/SearchTicketUseCase.cpp` | TODO |
| Domain | `BrandPosApp/Domain/Payment/SaleMgr.cpp` | TODO |
| Persistence | `BrandPosApp/Infrastructure/Persistence/SQLite/Tables/Payment/SellSlipCrud.cpp` | TODO |
| Persistence | `BrandPosApp/Infrastructure/Persistence/SQLite/Tables/Payment/SellDetailCrud.cpp` | TODO |
| RTK Query | `BrandPosApp/PosUi/src/store/api/ticketApi.ts` | TODO |

---

## 9. 작업 진행 기록
| 날짜 | 범위 | 상태 | 완료 범위 | 남은 범위 | 내용 |
|---|---|---|---|---|---|
| 2026-04-05 | Shell 구현 | 완료 | 레이아웃+로컬상태+stub | Bridge/UseCase 연동 | TicketSearchDialog.tsx shell 구현 완료. Modal, Button, NumPad 사용. 검색 필터(날짜/전화번호/금액) + 내장 넘패드 + 요약바 + 전표목록/상세 마스터-디테일 테이블 + 발행/취소/인쇄/미승인카드 버튼 stub. |

---

## Appendix: 레거시 참조

### 레거시 다이얼로그 정보

| 항목 | 값 |
|---|---|
| 다이얼로그 ID | IDD_GETTICK_DIALOG |
| 리소스 값 | 390 |
| 크기 (DLU) | 512 x 384 |
| 소스 파일 | Restaurant.rc |
| 총 UI 요소 수 | 36 (버튼 27, 라벨 2, 입력 4, 그리드 3) |

### 레거시 컨트롤 -> 신규 매핑

| 레거시 컨트롤 | 신규 대응 |
|---|---|
| IDC_TICK_SEARCH | 조회 버튼 |
| IDC_TICK_GETTICK | 발행 버튼 |
| IDC_TICK_CANCEL | 취소 버튼 |
| IDC_TICK_PRN | 인쇄 버튼 |
| IDC_TICK_BPHONE | 회원검색 버튼 |
| IDC_TICK_TICKSEARCH | 전표검색 버튼 |
| IDC_TICK_CARD (숨김) | 카드 결제 (조건부) |
| IDC_TICK_UNPER | 미승인카드 버튼 |
| IDC_TICK_CASHBILL (숨김) | 현금영수증 (조건부) |
| IDC_TICK_ALLTICK (숨김) | 전체보기 토글 |
| IDC_TICK_0~9, CLR, BACK, 000, 0000 | 내장 Numpad |
| IDC_TICK_GRID / GRID2 / GRID3 (MFCGridCtrl 3개) | DataTable x 3 |
| IDC_STARTDATE / IDC_ENDDATE | DatePicker |
| IDC_TICK_EPHONE / IDC_TICK_MONEY | TextInput / AmountInput |
| IDC_TICK_DATE / IDC_TICK_EMP | Label |
| IDCANCEL | 닫기 버튼 |
