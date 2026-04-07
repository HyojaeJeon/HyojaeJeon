# RESTAURANT_DIALOG 화면 문서

## 0. 문서 정보

| 항목 | 값 |
|---|---|
| 화면명 | `RESTAURANT_DIALOG` |
| 화면 ID | `IDD_RESTAURANT_DIALOG` |
| 원본 파일 | `restaurant-dialog.md` |
| 전환 우선순위 | `P0` |
| 담당 계층 | `PosUi / Presentation / UseCases / Domain / Infrastructure` |
| 상태 | `TODO` |

## 1. 화면 개요

- **화면 목적**: POS 앱의 메인 런처 화면으로, 영업 시작/마감, 설정, 분석, 회원 관리 등 주요 업무 흐름의 진입점 역할을 한다. 매장 정보와 POS 상태를 한눈에 보여준다.
- **해결하는 사용자 문제**: 직원/관리자가 POS를 시작한 후 영업 개시, 마감, 설정 변경, 분석 조회 등 핵심 업무를 선택하여 진입한다.
- **화면 진입 경로**: POS 앱 시작 시 자동 표시 (부트스트랩 완료 후)
- **화면 종료 경로**: 영업 시작 → TableScreen, 설정 → SetupScreen, 분석 → AnalysisScreen, 종료(IDCANCEL) → POS 앱 종료
- **관련 운영 주체**: 직원, 관리자

## 2. 상위 기준 연결

| 기준 | 연결 문서 | 비고 |
|---|---|---|
| 전체 아키텍처 | `00-Platform-최종-아키텍처-기준서.md` | 필수 |
| Edge POS 설계 | `04-Edge-POS-아키텍처-설계서.md` | 필수 |
| 전체 흐름 | `05-Edge-POS-전체-흐름-AZ-가이드.md` | 필수 |
| DB 설계 | `DB설계/` | 해당 |
| 화면 인벤토리 | `_index.md` | 필수 |

## 3. 화면 기능 목록

| ID | 기능명 | 설명 | 사용자 액션 | 우선순위 |
|---|---|---|---|---|
| F-001 | POS 종료 | POS 앱 종료 | 종료 버튼 클릭 | P0 |
| F-002 | 영업 시작 | 당일 영업 개시 처리 | 영업 시작 버튼 클릭 | P0 |
| F-003 | 마감 | 당일 영업 마감 처리 | 마감 버튼 클릭 | P0 |
| F-004 | 분석 | 매출/운영 분석 화면 진입 | 분석 버튼 클릭 | P1 |
| F-005 | 설정 | POS 설정 화면 진입 | 설정 버튼 클릭 | P1 |
| F-006 | 회원 관리 | 회원 검색/관리 화면 진입 | 회원 관리 버튼 클릭 | P1 |
| F-007 | 출퇴근 (숨김) | 직원 출퇴근 기록 | 출퇴근 버튼 클릭 | P1 |
| F-008 | 원격제어요청 | 원격 제어 요청 발송 | 원격제어 버튼 클릭 | P2 |
| F-009 | 재고조회 | 재고 현황 조회 | 재고조회 버튼 클릭 | P2 |
| F-010 | 공지사항 (숨김) | 중앙 서버 공지사항 표시 | 공지사항 버튼 클릭 | P2 |
| F-011 | 웹페이지 (숨김) | 외부 웹페이지 열기 | 버튼 클릭 | P2 |
| F-012 | 서버상품적용 (숨김) | 중앙 서버에서 상품 정보 동기화 | 서버상품적용 버튼 클릭 | P2 |
| F-013 | 인증 취소 | POS 인증 취소 | 인증 취소 버튼 클릭 | P2 |
| F-014 | 업데이트 (숨김) | POS 소프트웨어 업데이트 | 업데이트 버튼 클릭 | P2 |
| F-015 | 방화벽 확인 | 방화벽 설정 확인/테스트 | 방화벽확인 버튼 클릭 | P2 |
| F-016 | 종료 (X 버튼, 숨김) | IDCANCEL과 동일, 숨김 대체 종료 | X 버튼 클릭 | P2 |
| F-017 | 언어 선택 (KR/EN/VN) | UI 언어 변경 | 언어 버튼 클릭 | P1 |
| F-018 | 메시지박스 테스트 (숨김) | 디버그 전용, 제거 대상 | 버튼 클릭 | P2 |

## 4. UI 구조

### 4.1 화면 구성

- **상단 영역**: 인증 취소 버튼(IDC_BTN_AUTHCAN), 언어 선택(KR/EN/VN)
- **본문 영역**: 매장 정보 패널 (매장명, POS번호, 직원명, 정산번호, 영업시작시간, 버전), 주요 기능 버튼 그리드 (영업 시작, 마감, 분석, 설정, 회원 관리, 종료)
- **하단 영역**: 파트너명(IDC_PARTNERNAME), 설치 업체/A/S 업체 정보, 재고조회/원격제어요청 버튼, 방화벽확인 버튼
- **모달/팝업**: 없음 (각 버튼은 다른 Screen으로 라우팅)
- **사이드 패널**: 공지사항 영역 (숨김, 온라인 시에만 표시)

### 4.2 재사용 UI

| 컴포넌트 | 위치 | props로 바뀌는 값 | 비고 |
|---|---|---|---|
| LanguageSelector | shared/ui/molecules/LanguageSelector | currentLang, onSelect | TABLE_BSELECT와 동일 컴포넌트 재사용 |
| VersionLabel | shared/ui/atoms/VersionLabel | version | 버전 정보 표시 |
| Label | shared/ui/atoms/Label | text | 매장명, POS번호, 직원명, 정산번호, 시간 등 |
| StaffBadge | shared/ui/atoms/StaffBadge | staffName | 직원명 표시 |
| NoticeBar | shared/ui/molecules/NoticeBar | notices | 공지사항 (숨김, 온라인 시) |

## 5. 구현 명세

### 5.1 상태 소유권

| 상태 | 소유 계층 | 원본 | 비고 |
|---|---|---|---|
| 매장 정보 | RTK Query 캐시 | systemApi.getStoreInfo | 서버 상태 |
| POS 설정 (직원, 정산번호, 영업시간) | RTK Query 캐시 | systemApi.getConfig | 서버 상태 |
| 공지사항 | RTK Query 캐시 | systemApi.getNotices | 서버 상태 (온라인 시) |
| 현재 언어 | RTK Query 캐시 | systemApi.getConfig | 서버 상태 |

### 5.2 Bridge 계약

| Command | Request | Response | Error | Idempotency | 비고 |
|---|---|---|---|---|---|
| SYSTEM:EXIT | `{}` | — (프로세스 종료) | — | — | P0 |
| SYSTEM:OPEN_BUSINESS | `{}` | `{ config: { storeId, posNo, adjustNo, businessStartTime, businessStatus } }` | `BUSINESS_ALREADY_OPEN`, `BUSINESS_OPEN_FAILED` | `SYSTEM:OPEN_BUSINESS:{posNo}:{date}` | P0 |
| SYSTEM:CLOSE_BUSINESS | `{}` | `{ config: { storeId, posNo, adjustNo, businessEndTime, businessStatus } }` | `BUSINESS_ALREADY_CLOSED`, `UNSETTLED_TABLES_EXIST`, `BUSINESS_CLOSE_FAILED` | `SYSTEM:CLOSE_BUSINESS:{posNo}:{date}` | P0 |
| SYSTEM:SET_LANG | `{ lang: string }` | `{ config: { lang } }` | — | — | P1 |
| CUSTOMER:SEARCH | `{ query: string, page?: number, limit?: number }` | `{ customers: [{ id, name, phone, grade, visitCount }], totalCount: number }` | — (결과 없으면 빈 배열) | — (조회) | P1 |
| STAFF:CLOCK_IN_OUT | → handoff: `emp-diligence.md` (StaffScreen 소유) | → handoff | → handoff | → handoff | P1 |
| SYSTEM:REMOTE_CONTROL | `{ targetPosNo?: number }` | `{ success: boolean }` | `REMOTE_CONTROL_DENIED`, `TARGET_POS_OFFLINE` | — | P2 |
| SYSTEM:GET_NOTICE | `{}` | `{ notices: [{ id, title, content, createdAt, priority }] }` | — (오프라인 시 빈 배열) | — (조회) | P2 |
| SYSTEM:UPDATE | `{}` | `{ version: string, updateAvailable: boolean }` | `UPDATE_CHECK_FAILED`, `ALREADY_LATEST` | — | P2 |
| SYSTEM:CHECK_FIREWALL | `{}` | `{ results: [{ host: string, port: number, reachable: boolean }] }` | — | — | P2 |

### 5.3 UseCase 계약

| UseCase | Trigger | Input | Transaction | Lock | Output | 실패 규칙 |
|---|---|---|---|---|---|---|
| OpenBusinessUseCase | SYSTEM:OPEN_BUSINESS | — | SQLite TX | SYSTEM:BUSINESS | ConfigRow | 멱등성: 동일 requestId → 이전 결과 반환. 이미 영업 중 → BUSINESS_ALREADY_OPEN (성공 반환). 트랜잭션: ConfigRow 영업 상태 OPEN으로 UPDATE + adjustNo 발번 + Ledger INSERT + Outbox INSERT 원자적 수행. 오프라인: 로컬 DB만 사용하므로 오프라인에서도 동작. 커밋 후: PosRealTimeSender로 BUSINESS_OPENED 이벤트 브로드캐스트 |
| CloseBusinessUseCase | SYSTEM:CLOSE_BUSINESS | — | SQLite TX | SYSTEM:BUSINESS | ConfigRow | 멱등성: 동일 requestId → 이전 결과 반환. 이미 마감 → BUSINESS_ALREADY_CLOSED (성공 반환). 미정산 테이블 존재 → UNSETTLED_TABLES_EXIST 에러, 롤백. 트랜잭션: ConfigRow 영업 상태 CLOSED로 UPDATE + 정산 데이터 생성 + Ledger INSERT + Outbox INSERT. 오프라인: 로컬 DB만 사용하므로 오프라인에서도 동작. 커밋 후: PosRealTimeSender로 BUSINESS_CLOSED 이벤트 |
| SearchCustomerUseCase | CUSTOMER:SEARCH | query, page?, limit? | SQLite TX (조회) | — | CustRow[] | 조회 전용이므로 멱등성/락/Outbox 불필요. 항상 성공 (빈 배열 가능) |
| ClockInOutUseCase | STAFF:CLOCK_IN_OUT | → handoff: `emp-diligence.md` (StaffScreen 소유) | — | — | — | → handoff: `emp-diligence.md` |
| UpdateConfigUseCase | SYSTEM:SET_LANG | lang | SQLite TX | — | ConfigRow | 설정 변경이므로 멱등성 불필요. 트랜잭션: ConfigRow UPDATE. 커밋 후: PosRealTimeSender로 CONFIG_CHANGED 이벤트 |

### 5.4 Domain / Manager / Store

| 항목 | 책임 | 파일 / 모듈 | 비고 |
|---|---|---|---|
| SystemMgr | 영업 시작/마감, 설정, 언어 변경 | Domain/System/SystemMgr | |
| AccountingMgr | 마감 시 정산 처리 | Domain/Accounting/AccountingMgr | |
| CustMgr | 회원 검색/관리 | Domain/Customer/CustMgr | |
| StaffMgr | 직원 출퇴근 | Domain/Staff/StaffMgr | |
| ItemMgr | 재고 조회 | Domain/Item/ItemMgr | |

### 5.5 DB / CentralApi / Sync / Realtime

| 연동 대상 | 역할 | 데이터 흐름 | 비고 |
|---|---|---|---|
| SQLite Tables/System/ConfigCrud | POS 설정/영업 상태 | UseCase → SystemMgr → Crud → SQLite | 로컬 원본 |
| SQLite Tables/Payment/SellSlipCrud | 마감 시 정산 데이터 | UseCase → AccountingMgr → Crud → SQLite | 로컬 원본 |
| SQLite Tables/Customer/CustomerCrud | 회원 검색 | UseCase → CustMgr → Crud → SQLite | 로컬 원본 |
| Outbox | 영업 시작/마감 동기화 | 커밋 후 Outbox 적재 → Sync Worker → CentralApi | |
| PosRealTimeSender | 영업 상태 변경 브로드캐스트 | UseCase 커밋 후 → PosRealTimeSender → UI | |
| CentralApi | 영업 시작/마감 동기화, 공지사항 조회 | 영업 시작/마감 → Outbox → Sync Worker → CentralApi `mutation syncBusinessStatus`. 공지사항 → CentralApi `query getNotices` (온라인 시에만, 조회 전용이므로 Outbox 불필요). 서버상품 → CentralApi `query getItems` (온라인 시에만) | 온라인 시에만 동작 |

### 5.6 i18n / Error / Permission

| 항목 | 규칙 | 비고 |
|---|---|---|
| i18n | `SharedAssets/i18n/locales/{ko,vi,en}/system.json` | msgKey 기반 |
| Error | 코드 기반 (type, device, code, msgKey) | 완성 문장 금지 |
| Permission | 로그인된 직원 전원: 영업 시작, 회원 검색, 언어 전환, 공지사항 조회. 관리자 전용: 영업 마감, 설정 진입, 인증 취소, POS 종료. TODO: 원격제어요청 권한 정책 미확정 — 확인 필요: 원격제어 허용 권한 레벨 | |

## 6. 테스트

| 테스트 항목 | 범위 | 기대 결과 | 유형 |
|---|---|---|---|
| 영업 시작 후 TableScreen 전환 | MainScreen + systemApi | 영업 상태 OPEN, TableScreen 표시 | integration |
| 마감 후 정산 데이터 생성 | MainScreen + systemApi + accountingApi | 정산 레코드 생성, 영업 상태 CLOSED | integration |
| 매장 정보 표시 | MainScreen | 매장명, POS번호, 직원명 정상 표시 | unit |
| 언어 전환 | LanguageSelector | UI 텍스트 변경 | integration |
| POS 종료 | MainScreen | SYSTEM:EXIT 호출 | unit |
| 공지사항 온라인 시 표시, 오프라인 시 숨김 | MainScreen + systemApi.getNotices | 온라인: 공지 목록 표시. 오프라인: NoticeBar 숨김 처리 | integration |

## 7. 완료 기준

- [ ] UI 구현 완료 (screens/MainScreen)
- [ ] 영업 시작/마감 Bridge 계약 구현 완료
- [ ] UseCase 연동 완료 (OpenBusiness, CloseBusiness)
- [ ] RTK Query 엔드포인트 구현 완료 (systemApi.getStoreInfo, getConfig)
- [ ] 언어 선택 공용 컴포넌트 연동 완료
- [ ] 매장 정보 표시 구현 완료
- [ ] POS 종료 흐름 구현 완료
- [ ] i18n 적용 완료
- [ ] 테스트 완료
- [ ] 문서 상태 `DONE`

## 8. 작업 명단

| 작업 | 파일 | 상태 |
|---|---|---|
| Screen 구현 | `BrandPosApp/PosUi/src/screens/MainScreen/index.tsx` | TODO |
| RTK Query endpoint (시스템) | `BrandPosApp/PosUi/src/store/api/systemApi.ts` (getStoreInfo, getConfig) | TODO |
| Bridge command (시스템) | `BrandPosApp/PosUi/src/bridge/commands/system.ts` | TODO |
| LanguageSelector 컴포넌트 | `BrandPosApp/PosUi/src/shared/ui/molecules/LanguageSelector.tsx` | TODO (TABLE_BSELECT와 공유) |
| VersionLabel 컴포넌트 | `BrandPosApp/PosUi/src/shared/ui/atoms/VersionLabel.tsx` | TODO |
| NoticeBar 컴포넌트 | `BrandPosApp/PosUi/src/shared/ui/molecules/NoticeBar.tsx` | TODO |
| StaffBadge 컴포넌트 | `BrandPosApp/PosUi/src/shared/ui/atoms/StaffBadge.tsx` | TODO (TABLE_DIALOG과 공유) |
| C++ PosRequestActions/System | `BrandPosApp/Presentation/CEF/InternalBridge/PosRequestActions/System/SystemActions.cpp` | TODO |
| C++ OpenBusinessUseCase | `BrandPosApp/UseCases/System/OpenBusinessUseCase.cpp` | TODO |
| C++ CloseBusinessUseCase | `BrandPosApp/UseCases/System/CloseBusinessUseCase.cpp` | TODO |
| C++ SystemMgr | `BrandPosApp/Domain/System/SystemMgr.cpp` | TODO |

---

## Appendix: 레거시 UI 요소 참조

### 기본 정보

| 항목 | 값 |
|------|---|
| 다이얼로그 ID | IDD_RESTAURANT_DIALOG |
| 리소스 값 | 102 |
| 크기 (DLU) | 587 x 518 |
| 다이얼로그 타입 | DIALOGEX |
| 스타일 | DS_SETFONT \| WS_POPUP \| WS_VISIBLE |
| 확장 스타일 | WS_EX_APPWINDOW |
| 폰트 | 9, "굴림", 400, 0, 0x0 |
| 소스 파일 | Restaurant.rc |
| 총 UI 요소 수 | 32 |

### 버튼 (20개)

| ID | 라벨 | 위치 (x,y) | 크기 (w x h) | 숨김 | 스타일 | 용도 추정 |
|---|---|---|---|---|---|---|
| IDCANCEL |  | (478,224) | 52 x 60 | FALSE | BS_OWNERDRAW \| WS_TABSTOP | 닫기/취소 버튼 |
| IDC_M_BUSINESS |  | (44,278) | 52 x 60 | FALSE | BS_OWNERDRAW \| WS_TABSTOP | 영업 시작 버튼 |
| IDC_M_FINISH |  | (130,224) | 52 x 60 | FALSE | BS_OWNERDRAW \| WS_TABSTOP | 마감 버튼 |
| IDC_M_ANALYSIS |  | (218,278) | 52 x 60 | FALSE | BS_OWNERDRAW \| WS_TABSTOP | 분석 버튼 |
| IDC_M_COMMUTE | M_COMMUTE | (3,487) | 52 x 24 | **TRUE** | BS_OWNERDRAW \| NOT WS_VISIBLE \| WS_DISABLED \| WS_TABSTOP | 출퇴근 버튼 |
| IDC_M_SETUP |  | (391,278) | 52 x 60 | FALSE | BS_OWNERDRAW \| WS_TABSTOP | 설정 버튼 |
| IDC_M_MEMBER |  | (306,224) | 52 x 60 | FALSE | BS_OWNERDRAW \| WS_TABSTOP | 회원 관리 버튼 |
| IDC_MBTEST | 메시지박스테스트 | (86,492) | 77 x 19 | **TRUE** | NOT WS_VISIBLE \| WS_DISABLED | 메시지박스테스트 버튼 |
| IDC_REMOCON | 원격제어요청 | (120,368) | 76 x 28 | FALSE | BS_OWNERDRAW \| WS_TABSTOP | 원격제어요청 버튼 |
| IDC_STOCK | 재고조회 | (32,368) | 76 x 28 | FALSE | BS_OWNERDRAW \| WS_TABSTOP | 재고조회 버튼 |
| IDC_NOTICE | 공지사항 | (207,171) | 58 x 23 | **TRUE** | BS_OWNERDRAW \| NOT WS_VISIBLE \| WS_TABSTOP | 공지사항 버튼 |
| IDC_WEBPAGE |  | (389,323) | 117 x 23 | **TRUE** | BS_OWNERDRAW \| NOT WS_VISIBLE \| WS_TABSTOP | 웹페이지 버튼 |
| IDC_SERVERITEM | 서버상품적용 | (301,446) | 58 x 23 | **TRUE** | BS_OWNERDRAW \| NOT WS_VISIBLE \| WS_DISABLED \| WS_TABSTOP | 서버상품적용 버튼 |
| IDC_BTN_AUTHCAN |  | (3,3) | 15 x 15 | FALSE |  | 인증 취소 버튼 |
| IDC_BTN_UPDATE |  | (389,361) | 117 x 23 | **TRUE** | BS_OWNERDRAW \| NOT WS_VISIBLE \| WS_TABSTOP | 업데이트 버튼 |
| IDC_BTN_FIREWALL | 방화벽확인 | (227,454) | 65 x 21 | FALSE | BS_OWNERDRAW \| WS_TABSTOP | 방화벽확인 버튼 |
| IDC_BTN_EXIT2 | X | (558,7) | 22 x 18 | **TRUE** | BS_OWNERDRAW \| NOT WS_VISIBLE \| WS_TABSTOP | X 버튼 |
| IDC_BTN_KR | KR | (82,15) | 35 x 22 | FALSE | BS_OWNERDRAW \| WS_TABSTOP | 한국어 선택 버튼 |
| IDC_BTN_EN | EN | (119,15) | 35 x 22 | FALSE | BS_OWNERDRAW \| WS_TABSTOP | 영어 선택 버튼 |
| IDC_BTN_VN | VN | (155,15) | 35 x 22 | FALSE | BS_OWNERDRAW \| WS_TABSTOP | 베트남어 선택 버튼 |

### 텍스트/라벨 (12개)

| ID | 텍스트 | 위치 (x,y) | 크기 (w x h) | 숨김 | 정렬 | 용도 추정 |
|---|---|---|---|---|---|---|
| IDC_M_VER | 버전 : | (225,106) | 88 x 11 | FALSE | 왼쪽 | 버전 표시 |
| IDC_M_STORE | 매장명 | (83,44) | 121 x 19 | FALSE | 왼쪽 | 매장명 표시 |
| IDC_M_POSNO | POS번호 | (83,69) | 121 x 19 | FALSE | 왼쪽 | POS 번호 표시 |
| IDC_M_EMP | 직원명 | (83,95) | 121 x 19 | FALSE | 왼쪽 | 직원명 표시 |
| IDC_M_ADJUST | 정산번호 | (83,121) | 121 x 19 | FALSE | 왼쪽 | 정산 번호 표시 |
| IDC_M_OPEN | 시작시간 | (83,148) | 121 x 19 | FALSE | 왼쪽 | 영업 시작 시간 표시 |
| IDC_M_COMPANY | 설치업체 | (425,419) | 121 x 21 | FALSE | 왼쪽 | 설치 업체 표시 |
| IDC_M_COMPANY2 | A/S 업체 | (433,442) | 121 x 21 | FALSE | 왼쪽 | A/S 업체 표시 |
| IDC_NOTICES1 | Static | (415,30) | 143 x 19 | **TRUE** | 왼쪽 | Static 표시 |
| IDC_NOTICES2 | Static | (411,49) | 144 x 19 | **TRUE** | 왼쪽 | Static 표시 |
| IDC_NOTICES3 | Static | (407,68) | 142 x 19 | **TRUE** | 왼쪽 | Static 표시 |
| IDC_PARTNERNAME | partner | (21,408) | 263 x 17 | FALSE | 왼쪽 | partner 표시 |

### 요소 통계

| 유형 | 개수 |
|------|------|
| 버튼 | 20 |
| 텍스트/라벨 | 12 |
| 입력 필드 | 0 |
| 그리드/리스트 | 0 |
| 기타 | 0 |
| **합계** | **32** |

### 마이그레이션 노트 (원본)

- RESTAURANT_DIALOG는 POS 앱의 메인 화면(런처)이다. 신규 UI에서는 screens/MainScreen으로 구현하며, 영업 시작/마감/설정/분석 등 주요 진입점 역할을 한다.
- 매장 정보(매장명, POS번호, 직원명, 정산번호, 영업시간)는 `systemApi.getStoreInfo`와 `systemApi.getConfig` 엔드포인트로 통합 조회한다.
- 언어 선택(KR/EN/VN)은 TABLE_BSELECT와 동일한 `shared/ui/molecules/LanguageSelector` 공용 컴포넌트를 재사용한다.
- 영업 시작(IDC_M_BUSINESS)과 마감(IDC_M_FINISH)은 핵심 비즈니스 플로우이므로 P0으로 분류하며, 각각 전용 Bridge Command를 통해 UseCases에서 처리한다.
- 숨김 상태인 공지사항(IDC_NOTICES1~3), 웹페이지(IDC_WEBPAGE), 업데이트(IDC_BTN_UPDATE) 등은 중앙 서버 연동 기능으로, Offline-First 정책에 따라 온라인 상태에서만 동작하도록 구현한다.
- 재고조회(IDC_STOCK)와 서버상품적용(IDC_SERVERITEM)은 SetupScreen 또는 MaintenanceScreen으로 분리하여 운영 흐름과 설정 흐름을 명확히 구분한다.
- 원격제어요청(IDC_REMOCON)은 보안 정책 검토 후 구현 여부를 결정한다.
- 방화벽 확인(IDC_BTN_FIREWALL)은 MaintenanceScreen 전용 기능으로 분류한다.

## 9. 작업 진행 기록

| 날짜 | 범위 | 상태 | 완료 범위 | 남은 범위 | 내용 |
|---|---|---|---|---|---|
| 2026-04-05 | Shell 구현 | 완료 | 레이아웃+로컬상태+stub | Bridge/UseCase 연동, RTK Query 연동, i18n | MainMenuScreen shell 구현 완료. 영업시작/마감/분석/설정/회원/종료 stub handler, 언어 선택, 매장 정보 패널, 공지사항 영역(조건부), 유틸리티 버튼, 인증 취소 버튼 구현. |
