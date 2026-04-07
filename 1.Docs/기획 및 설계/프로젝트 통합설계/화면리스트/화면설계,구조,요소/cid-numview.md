# CID_NUMVIEW 화면 설계서

---

## 0. 문서 정보

| 항목 | 값 |
|---|---|
| 문서 ID | SCR-CID-NUMVIEW |
| 화면 ID (레거시) | IDD_CID_NUMVIEW |
| 작성일 | 2026-04-05 |
| 상태 | 초안 |

---

## 1. 화면 개요

CID_NUMVIEW는 발신자표시(CID) 팝업이다. POS에 연결된 CID 장치에서 전화번호를 수신하면 화면 상단에 소형(299x40) 팝업으로 표시된다. 고객 배정, 예약 처리, 자동 닫힘 타이머(5~10초)를 제공한다.

- 신규 UI 위치: `shared/ui/molecules/CallerIdPopup`
- 화면 유형: 팝업 (Molecule)
- 우선순위: **P1**

---

## 2. 상위 기준 연결

| 기준 문서 | 관련 섹션 | 비고 |
|---|---|---|
| 04-Edge-POS-아키텍처-설계서 | PosRealTime 채널 | Device/CID -> PosRealTimeSender -> UI |
| CLAUDE.md | shared/ui 규칙 | 공용 UI는 shared/ui 배치 |

---

## 3. 기능 목록

| ID | 기능명 | 우선순위 | Bridge Command | UseCase | Domain/Manager | Infrastructure |
|---|---|---|---|---|---|---|
| CID-F01 | 고객 배정 (테이블에 배정) | P1 | STAFF:VERIFY_PERMISSION | VerifyPermissionUseCase | CustMgr, TableManager | Tables/Customer/CustCrud, Tables/Table/* (SQLite) |
| CID-F02 | 예약 처리 | P2 | STAFF:VERIFY_PERMISSION | VerifyPermissionUseCase | CustMgr | Tables/Customer/CustCrud (SQLite) |
| CID-F03 | 닫기 | P1 | 없음 (팝업 닫기) | - | - | - |

---

## 4. UI 구조

### 4.1 화면 레이아웃

```
+--------------------------------------------------+
| [CH] [전화번호: 010-1234-5678]  [고객 주소]  [배정] [예약] [닫기] |
+--------------------------------------------------+
```

소형 팝업 (화면 상단 오버레이), 자동 닫힘 타이머 5~10초.

### 4.2 컴포넌트 매핑 (shared/ui 기준)

| 영역 | 컴포넌트 경로 | 비고 |
|---|---|---|
| 팝업 전체 | shared/ui/molecules/CallerIdPopup | 소형 오버레이 팝업 |
| 버튼 | shared/ui/atoms/Button | 배정/예약/닫기 |

### 4.3 데이터 바인딩

| ID | 표시 항목 | 신규 UI 컴포넌트 | 데이터 소스 |
|---|---|---|---|
| CID-D01 | 수신 전화번호 | PhoneNumber | PosRealTimeReceiver (장치 이벤트) |
| CID-D02 | 발신 채널 표시 | ChannelIcon | PosRealTimeReceiver (장치 이벤트) |
| CID-D03 | 고객 주소 | Address | customerApi.getByPhone (캐시) |

---

## 5. 구현 명세

### 5.1 Bridge Command

| Command | 요청 payload | 응답 payload | 비고 |
|---|---|---|---|
| STAFF:VERIFY_PERMISSION | `{ phoneNumber, action, tableId }` | `{ success }` | action: `assign` / `reserve` |

### 5.2 UseCase

| UseCase | 책임 | 트랜잭션 | Ledger | Outbox |
|---|---|---|---|---|
| VerifyPermissionUseCase | 권한 검증 후 고객 배정/예약 처리 | O | - | 고객 배정 이력 동기화 |

### 5.3 Domain/Manager

| Manager | 메서드 | 책임 |
|---|---|---|
| CustMgr | GetByPhone() | 전화번호로 고객 조회 |
| TableManager | AssignCustomer() | 테이블에 고객 배정 |

### 5.4 Infrastructure

| 모듈 | 파일 | 책임 |
|---|---|---|
| Tables/Customer/CustCrud | SQLite | 고객 조회 |
| Tables/Table/* | SQLite | 테이블 배정 |
| Device/CID | - | CID 장치 이벤트 수신 |

### 5.5 RTK Query 연동

| Endpoint | 태그 | 비고 |
|---|---|---|
| customerApi.getByPhone | `Customer:{phone}` | 전화번호로 고객 조회 |

### 5.6 PosRealTime 이벤트

| 이벤트 | 방향 | 비고 |
|---|---|---|
| DEVICE:CID_CALL | C++ -> UI | 전화 수신 시 팝업 트리거 |

### 5.7 Permission

해당 없음. 순수 UI 컴포넌트 (CID 팝업) — 장치 이벤트에 의해 자동 표시. 배정/예약 시 호출자 측 UseCase에서 권한 검증.

---

## 6. 테스트

| ID | 시나리오 | 기대 결과 |
|---|---|---|
| CID-T01 | CID 장치에서 전화 수신 | 팝업 표시 + 전화번호 + 고객 정보 |
| CID-T02 | 배정 클릭 | 현재 테이블에 고객 배정 |
| CID-T03 | 예약 클릭 | 예약 처리 |
| CID-T04 | 5~10초 응답 없음 | 자동 닫힘 |

---

## 7. 완료 기준

- [ ] CID 장치 이벤트가 PosRealTimeSender를 통해 전달된다
- [ ] 자동 닫힘 타이머(5~10초)가 적용된다
- [ ] 고객 배정/예약이 VerifyPermissionUseCase를 통해 처리된다
- [ ] 전화번호로 고객 정보(주소)를 자동 조회한다

---

## 8. 작업 명단

| 작업 | 대상 파일 경로 | 상태 |
|---|---|---|
| Molecule 구현 | `BrandPosApp/PosUi/src/shared/ui/molecules/CallerIdPopup.tsx` | TODO |
| PosRealTime | `BrandPosApp/PosUi/src/providers/PosRealTimeReceiver.tsx` | TODO |
| Device | `BrandPosApp/Infrastructure/Device/CID/` | TODO |
| UseCase | `BrandPosApp/UseCases/Staff/VerifyPermissionUseCase.cpp` | TODO |
| RTK Query | `BrandPosApp/PosUi/src/store/api/customerApi.ts` | TODO |

---

## Appendix: 레거시 참조

### 레거시 다이얼로그 정보

| 항목 | 값 |
|---|---|
| 다이얼로그 ID | IDD_CID_NUMVIEW |
| 리소스 값 | 124 |
| 크기 (DLU) | 299 x 40 |
| 소스 파일 | Restaurant.rc |
| 총 UI 요소 수 | 6 (버튼 3, 라벨 3) |

### 레거시 컨트롤 -> 신규 매핑

| 레거시 컨트롤 | 신규 대응 |
|---|---|
| IDOK | 배정 버튼 |
| IDC_APPOINT | 예약 버튼 |
| IDCANCEL | 닫기 버튼 |
| IDC_CID_PHONEVIEW | PhoneNumber 표시 |
| IDC_CID_CHVIEW | ChannelIcon |
| IDC_CID_ADDRVIEW | Address 표시 |

---

## Progress Record

| 날짜 | 작업 | 상태 |
|---|---|---|
| 2026-04-05 | UI Shell 구현: `BrandPosApp/PosUi/src/screens/CustomerScreen/components/CallerIdDialog.tsx` | Shell 완료 (overlay popup, auto-close timer, stub handlers). Backend 미연결. |
