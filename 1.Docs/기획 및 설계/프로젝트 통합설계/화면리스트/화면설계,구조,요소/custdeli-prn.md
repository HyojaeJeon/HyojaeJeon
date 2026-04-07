# CUSTDELI_PRN — 배달 전표 일괄 인쇄 모달

## 0. 문서 정보

| 항목 | 값 |
|---|---|
| 문서 ID | CUSTDELI_PRN |
| 레거시 다이얼로그 | IDD_CUSTDELI_PRN (152) |
| 신규 위치 | screens/DeliveryScreen/DeliveryPrintModal |
| 작성일 | 2026-04-05 |
| 상태 | 초안 |

---

## 1. 화면 개요

배달 전표를 일괄 조회하고 선택 인쇄하는 모달 화면이다.
주소 필터 + 미인쇄건 필터로 대상을 조회한 후, 체크박스로 선택하여 일괄 인쇄한다.
CUSTDELI에서 호출된다.

---

## 2. 상위 기준 연결

| 기준 문서 | 관련 섹션 | 비고 |
|---|---|---|
| 04-Edge-POS-아키텍처-설계서 | UseCases, Device 계층 | 인쇄는 커밋 후 비동기 후처리 |
| 05-Edge-POS-전체-흐름-AZ-가이드 | 인쇄 플로우 | 영수증 인쇄 비동기 규칙 적용 |

---

## 3. 기능 목록

| ID | 기능명 | 우선순위 | Bridge Command | UseCase | Domain/Manager | Infrastructure |
|---|---|---|---|---|---|---|
| CUSTDELIPRN-F01 | 배달 전표 조회 | P0 | DELIVERY:SEARCH_ADDRESS | SearchDeliveryAddressUseCase | CustMgr | Tables/Customer/DeliveryCrud |
| CUSTDELIPRN-F02 | 주소 필터 | P1 | DELIVERY:SEARCH_ADDRESS | SearchDeliveryAddressUseCase | CustMgr | Tables/Customer/DeliveryCrud |
| CUSTDELIPRN-F03 | 배달 전표 인쇄 | P0 | DELIVERY:PRINT_SLIP | PrintDeliverySlipUseCase | N/A | Device/Printer |
| CUSTDELIPRN-F04 | 전체 선택/해제 토글 | P1 | N/A (UI 로컬) | N/A | N/A | N/A |
| CUSTDELIPRN-F05 | 인쇄 대상 체크 필터 (미인쇄건만) | P1 | N/A (UI 로컬) | N/A | N/A | N/A |
| CUSTDELIPRN-F06 | 주소 검색 입력 | P0 | N/A (UI 로컬) | N/A | N/A | N/A |
| CUSTDELIPRN-F07 | 닫기/취소 | P0 | N/A (UI 로컬) | N/A | N/A | N/A |

---

## 4. UI 구조

### 4.1 화면 레이아웃

```
+--------------------------------------------------------------+
| 배달 리스트 인쇄                          [인쇄]  [닫기]       |
+--------------------------------------------------------------+
| 주소조회 [TextInput] [조회] [주소]  [ ] 미인쇄건만  [전체선택해제]|
+--------------------------------------------------------------+
| 배달 전표 DataGrid (체크박스 포함)                              |
| (선택, 주문번호, 고객명, 주소, 금액, 인쇄여부 등)               |
|                                                                |
|                                                                |
|                                                                |
+--------------------------------------------------------------+
```

- 풀스크린(512x384 DLU 기반) 모달
- 조회 -> 선택 -> 인쇄 플로우
- DataGrid에 체크박스 열 포함

### 4.2 사용 컴포넌트 (shared/ui)

| 컴포넌트 | 경로 | 용도 |
|---|---|---|
| TextInput | shared/ui/atoms/TextInput | 주소 검색 입력 |
| Checkbox | shared/ui/atoms/Checkbox | 미인쇄건 필터 |
| DataGrid | shared/ui/organisms/DataGrid | 전표 목록 (체크박스 selectAll/deselectAll 지원) |

---

## 5. 구현 명세

### 5.1 Bridge Command

**DELIVERY:PRINT_SLIP**

```jsonc
// Request
{
  "v": 1,
  "requestId": "<uuid>",
  "timestamp": "<ISO8601>",
  "command": "DELIVERY:PRINT_SLIP",
  "params": {
    "deliveryIds": ["string"],
    "printType": "BATCH"
  }
}

// Response
{
  "v": 1,
  "requestId": "<echo>",
  "timestamp": "<ISO8601>",
  "status": "OK | ERROR",
  "data": {
    "printedCount": "number"
  }
}
```

> 인쇄는 커밋 후 비동기 후처리. UI 블로킹 불필요.

#### UseCase 실패 규칙

| 실패 조건 | 에러 코드 | Ledger 상태 | UI 처리 |
|---|---|---|---|
| 프린터 미연결 | PRINTER_NOT_CONNECTED | N/A (후처리) | 장치 에러 안내 |
| 인쇄 대상 없음 | 클라이언트 검증 (Bridge 미전송) | N/A | 안내 메시지 표시 |

#### Permission

| 기능 | 권한 |
|---|---|
| 배달 전표 조회/인쇄 | 로그인 직원 전원 |

### 5.2 RTK Query Endpoint

| Endpoint | 파일 | 메서드 | Tags |
|---|---|---|---|
| useGetDeliverySlipsQuery | store/api/deliveryApi.tsx | DELIVERY:GET_SLIPS | `DeliverySlips` |
| usePrintDeliverySlipMutation | store/api/deliveryApi.tsx | DELIVERY:PRINT_SLIP | invalidates `DeliverySlips` |

미인쇄건 필터는 RTK Query 파라미터로 전달:
```js
useGetDeliverySlipsQuery({ addr: searchText, unprintedOnly: checkboxValue })
```

### 5.3 UseCases

| UseCase | 역할 | 멱등성 |
|---|---|---|
| SearchDeliveryAddressUseCase | 전표 목록 조회 (주소/인쇄상태 필터) | 조회 전용 |
| PrintDeliverySlipUseCase | 선택 전표 일괄 인쇄, 인쇄 상태 업데이트 | N/A (후처리) |

### 5.4 Domain / Manager

| Manager | 메서드 | 역할 |
|---|---|---|
| CustMgr | GetDeliverySlips() | 전표 목록 조회 |

### 5.5 Infrastructure

| 모듈 | 파일 | 역할 |
|---|---|---|
| Tables/Customer/DeliveryCrud | Infrastructure/Persistence/SQLite/Tables/Customer/DeliveryCrud.cpp | 전표 조회/인쇄상태 업데이트 |
| Device/Printer | Infrastructure/Device/Printer/ | 전표 인쇄 (비동기) |

### 5.6 PosRealTime 이벤트

해당 없음 (인쇄 전용 화면).

---

## 6. 테스트

| ID | 시나리오 | 예상 결과 |
|---|---|---|
| CUSTDELIPRN-T01 | 전표 목록 조회 | DataGrid에 전표 목록 표시 |
| CUSTDELIPRN-T02 | 주소 필터 조회 | 매칭 주소 전표만 표시 |
| CUSTDELIPRN-T03 | 미인쇄건만 필터 | 미인쇄 전표만 표시 |
| CUSTDELIPRN-T04 | 전체 선택/해제 | 체크박스 일괄 토글 |
| CUSTDELIPRN-T05 | 선택 인쇄 | 프린터 출력, 인쇄 상태 갱신 |
| CUSTDELIPRN-T06 | 인쇄 대상 없음 | 안내 메시지 |

---

## 7. 완료 기준

- [ ] 전표 목록 조회 + 필터 동작
- [ ] DataGrid 체크박스 selectAll/deselectAll
- [ ] DELIVERY:PRINT_SLIP 비동기 인쇄 동작
- [ ] 인쇄 후 인쇄 상태 업데이트
- [ ] 1024x768 해상도, 터치 사용성 검증

---

## 8. 작업 명단

| 계층 | 파일 경로 | 작업 내용 |
|---|---|---|
| PosUi Screen | BrandPosApp/PosUi/src/screens/DeliveryScreen/DeliveryPrintModal.tsx | 전표 인쇄 모달 |
| PosUi Store | BrandPosApp/PosUi/src/store/api/deliveryApi.ts | useGetDeliverySlipsQuery, usePrintDeliverySlipMutation |
| PosUi Shared | BrandPosApp/PosUi/src/shared/ui/atoms/TextInput.tsx | 검색 입력 |
| PosUi Shared | BrandPosApp/PosUi/src/shared/ui/atoms/Checkbox.tsx | 필터 체크박스 |
| PosUi Shared | BrandPosApp/PosUi/src/shared/ui/organisms/DataGrid.tsx | 전표 그리드 (체크박스 열) |
| Bridge Command | BrandPosApp/PosUi/src/bridge/commands/deliveryCommands.ts | DELIVERY:PRINT_SLIP |
| C++ Actions | BrandPosApp/Presentation/CEF/InternalBridge/PosRequestActions/Delivery/DeliveryActions.cpp | thin router |
| C++ UseCase | BrandPosApp/UseCases/Delivery/PrintDeliverySlipUseCase.cpp | 일괄 인쇄 |
| C++ UseCase | BrandPosApp/UseCases/Delivery/SearchDeliveryAddressUseCase.cpp | 전표 조회 |
| C++ Manager | BrandPosApp/Domain/Customer/CustMgr.cpp | 전표 조회 |
| C++ Persistence | BrandPosApp/Infrastructure/Persistence/SQLite/Tables/Customer/DeliveryCrud.cpp | 전표 CRUD |

---

## Appendix: 레거시 UI 참조

### A.1 기본 정보

| 항목 | 값 |
|---|---|
| 다이얼로그 ID | IDD_CUSTDELI_PRN |
| 리소스 값 | 152 |
| 크기 (DLU) | 512 x 384 |
| 다이얼로그 타입 | DIALOGEX |
| 스타일 | DS_SETFONT \| WS_POPUP |
| 소스 파일 | Restaurant.rc |
| 총 UI 요소 수 | 11 |

### A.2 레거시 UI 요소 목록

**버튼 (6개)**: IDC_DELI_SEARCHBTN(조회), IDC_DELI_ADDRESS(주소), IDC_DELI_PRN(인쇄), IDC_BTN_SELCAN(전체선택해제), IDCANCEL(닫기), IDOK(숨김)

**텍스트/라벨 (2개)**: IDC_STATIC(주소조회), IDC_STA_TITLE(배달 리스트 인쇄)

**입력 필드 (2개)**: IDC_DELI_SEARCH(주소 검색 입력), IDC_DELI_CHK(미인쇄건 체크박스)

**그리드 (1개)**: IDC_GRID(전표 목록)

### A.3 마이그레이션 노트

- 배달 전표 일괄 인쇄 전용 화면. 조회 -> 선택 -> 인쇄 플로우
- PrintDeliverySlipUseCase는 커밋 후 비동기 후처리(Device/Printer). UI 블로킹 불필요
- IDC_BTN_SELCAN(전체선택/해제)은 DataGrid selectAll/deselectAll로 구현
- IDC_DELI_CHK 체크박스는 미인쇄 건만 필터링하는 조회 조건. RTK Query 파라미터로 전달

---

## Progress Record

| 날짜 | 작업 | 상태 |
|---|---|---|
| 2026-04-05 | UI Shell 구현: `BrandPosApp/PosUi/src/screens/CustomerScreen/components/DeliveryPrintDialog.tsx` | Shell 완료 (checkbox grid, filters, batch print, stub handlers). Backend 미연결. |
