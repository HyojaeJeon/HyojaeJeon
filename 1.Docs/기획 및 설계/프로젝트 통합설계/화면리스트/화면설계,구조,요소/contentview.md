# CONTENTVIEW 화면 설계서

---

## 0. 문서 정보

| 항목 | 값 |
|---|---|
| 문서 ID | SCR-CONTENTVIEW |
| 화면 ID (레거시) | IDD_CONTENTVIEW (full), IDD_CONTENTVIEW2 (compact) |
| 작성일 | 2026-04-05 |
| 상태 | 초안 |
| 통합 대상 | contentview.md + contentview2.md -> 단일 컴포넌트, `size` prop으로 분기 |

---

## 1. 화면 개요

CONTENTVIEW는 고객 대면 디스플레이 화면이다. 결제 시 고객에게 주문 내역, 금액 정보, QR 결제 코드를 보여주며, 대기 시 광고/홍보 콘텐츠를 표시한다. 레거시 IDD_CONTENTVIEW(525x383, full)과 IDD_CONTENTVIEW2(414x327, compact)는 동일 컴포넌트를 `size` prop으로 분기하여 렌더링한다. 별도 컴포넌트를 만들지 않는다.

- 신규 UI 위치: `shared/ui/organisms/ContentViewer`
- 화면 유형: 외부 디스플레이 (Organism)
- 우선순위: **P0**
- PosRealTimeSender를 통해 C++에서 데이터를 수신하여 props로 표시하는 패턴이다.

---

## 2. 상위 기준 연결

| 기준 문서 | 관련 섹션 | 비고 |
|---|---|---|
| 04-Edge-POS-아키텍처-설계서 | PosRealTime 채널 | C++ -> UI 단방향 데이터 수신 |
| CLAUDE.md | shared/ui 규칙 | 공용 Organism |
| CLAUDE.md | i18n 규칙 | QR 관련 텍스트 다국어 처리 |

---

## 3. 기능 목록

| ID | 기능명 | 우선순위 | Bridge Command | UseCase | Domain/Manager | Infrastructure |
|---|---|---|---|---|---|---|
| CV-F01 | 고객확인 (결제 확정) | P0 | SYSTEM:GET_CONTENT | - | - | - |
| CV-F02 | 파일 열기 (숨김) | P2 | SYSTEM:GET_CONTENT | - | - | Support/File |
| CV-F03 | 닫기 (숨김) | P1 | 없음 (모달 닫기) | - | - | - |
| CV-F04 | QR 결제 취소 (숨김) | P1 | 없음 (콜백) | - | - | - |
| CV-F05 | QR 결제 확인 (숨김) | P1 | 없음 (콜백) | - | - | - |

---

## 4. UI 구조

### 4.1 화면 레이아웃

```
size="full" (525x383)                    size="compact" (414x327)
+-------------------------------------+  +-------------------------------+
| [매장명]            [고객명]          |  | [매장명]          [고객명]      |
| +--미디어 영역--+  +--주문 그리드--+  |  | +--미디어--+ +--주문 그리드--+  |
| | 영상/이미지/QR |  | 항목 | 수량   |  |  | |         | |              |  |
| |               |  | 금액 | ...   |  |  | +---------+ +--------------+  |
| +---------------+  +--------------+  |  |                               |
| [QR 타이틀 (NAPAS)]                   |  | 총금액   할인   받을금액          |
| 총금액  할인  받을금액  받은금액  거스름  |  | 받은금액   거스름돈               |
|                                     |  |                               |
| [고객정보: 이름/방문일/포인트 (조건부)]  |  | [고객정보 (조건부)]               |
| [고객확인 버튼]                        |  | [고객확인 버튼]                   |
+-------------------------------------+  +-------------------------------+
```

### 4.2 컴포넌트 매핑 (shared/ui 기준)

| 영역 | 컴포넌트 경로 | 비고 |
|---|---|---|
| 뷰어 전체 | shared/ui/organisms/ContentViewer | `size` prop: `full` / `compact` |
| 미디어 영역 | shared/ui/organisms/ContentViewer 내 MediaArea | 영상/이미지/QR 표시 |
| 주문 그리드 | shared/ui/molecules/DataTable | 주문 항목 테이블 |
| 금액 표시 | shared/ui/atoms/AmountLabel | 총금액/할인/받을금액 등 |
| QR 코드 | shared/ui/atoms/QRCode | VietQR/NAPAS (조건부) |

### 4.3 데이터 바인딩

| ID | 표시 항목 | 신규 UI 컴포넌트 | 데이터 소스 |
|---|---|---|---|
| CV-D01 | 영상/이미지 표시 영역 | MediaArea | props (미디어 URL) |
| CV-D02 | 총금액 | AmountLabel | props (주문 금액) |
| CV-D03 | 할인금액 | AmountLabel | props |
| CV-D04 | 받을금액 | AmountLabel | props |
| CV-D05 | 받은금액 | AmountLabel | props |
| CV-D06 | 잔돈/거스름 | AmountLabel | props |
| CV-D07 | 주문 내역 그리드 | DataTable | props (주문 항목 배열) |
| CV-D08 | 매장명 | Label | systemApi.getConfig |
| CV-D09 | 고객명 | Label | props |
| CV-D10 | QR코드 영역 (조건부) | QRCode | props (QR 데이터) |
| CV-D11 | QR 결제 금액 (조건부) | AmountLabel | props |
| CV-D12 | 고객 이름 (조건부) | Label | props |
| CV-D13 | 최근 방문일 (조건부) | Label | props |
| CV-D14 | 포인트 (조건부) | Label | props |
| CV-D15 | QR 타이틀 (NAPAS) | Label | i18n |

---

## 5. 구현 명세

### 5.1 Bridge Command

| Command | 요청 payload | 응답 payload | Error | 비고 |
|---|---|---|---|---|
| SYSTEM:GET_CONTENT | `{ contentId, page? }` | `{ content, totalPages }` | `CONTENT_NOT_FOUND` | 콘텐츠 데이터 요청 |

### 5.2 UseCase

해당 없음. 데이터는 PosRealTimeSender를 통해 수신.

### 5.3 Domain/Manager

해당 없음.

### 5.4 Infrastructure

해당 없음 (레거시 ActiveX WebBrowser 컨트롤은 CEF 기반 전환으로 완전 제거).

### 5.5 RTK Query 연동

| Endpoint | 태그 | 비고 |
|---|---|---|
| systemApi.getConfig | `SystemConfig` | 매장명 |

### 5.6 PosRealTime 이벤트

| 이벤트 | 방향 | 비고 |
|---|---|---|
| CONTENT:UPDATE | C++ -> UI | 주문/금액/QR 데이터 갱신 |
| CONTENT:MEDIA_CHANGE | C++ -> UI | 미디어(광고) 변경 |

### 5.7 Permission

해당 없음. 순수 UI 컴포넌트 (고객 대면 디스플레이) — Bridge/UseCase 없음. 데이터는 PosRealTimeSender를 통해 수신.

---

## 6. 테스트

| ID | 시나리오 | 기대 결과 |
|---|---|---|
| CV-T01 | 주문 금액 데이터 수신 | 금액 표시 갱신 |
| CV-T02 | QR 결제 모드 (베트남) | QR코드 + NAPAS 타이틀 표시 |
| CV-T03 | 고객 정보 수신 | 이름/방문일/포인트 표시 |
| CV-T04 | size="full" 렌더링 | 큰 레이아웃 |
| CV-T05 | size="compact" 렌더링 | 작은 레이아웃 |
| CV-T06 | 대기 시 광고 표시 | MediaArea에 광고 콘텐츠 |
| CV-T07 | 고객확인 클릭 | onConfirm 콜백 호출 |

---

## 7. 완료 기준

- [ ] 단일 컴포넌트 ContentViewer가 `size` prop으로 full/compact를 분기한다
- [ ] 별도 컴포넌트(ContentViewer2 등)를 만들지 않는다
- [ ] 레거시 ActiveX WebBrowser 컨트롤이 완전 제거된다
- [ ] QR 결제(VietQR/NAPAS)가 베트남 시장 전용 조건부 렌더링으로 처리된다
- [ ] PosRealTimeSender를 통해 C++에서 데이터를 수신하여 표시한다

---

## 8. 작업 명단

| 작업 | 대상 파일 경로 | 상태 |
|---|---|---|
| Organism 구현 | `BrandPosApp/PosUi/src/shared/ui/organisms/ContentViewer.tsx` | TODO |
| RTK Query | `BrandPosApp/PosUi/src/store/api/systemApi.ts` | TODO |
| PosRealTime | `BrandPosApp/PosUi/src/providers/PosRealTimeReceiver.tsx` | TODO |
| i18n (ko) | `SharedAssets/i18n/locales/ko/content.json` | TODO |
| i18n (vi) | `SharedAssets/i18n/locales/vi/content.json` | TODO |

---

## Appendix: 레거시 참조

### 레거시 다이얼로그 정보

#### IDD_CONTENTVIEW (full)

| 항목 | 값 |
|---|---|
| 다이얼로그 ID | IDD_CONTENTVIEW |
| 리소스 값 | 288 |
| 크기 (DLU) | 525 x 383 |
| 소스 파일 | Restaurant.rc |
| 총 UI 요소 수 | 32 (버튼 11, 라벨 19, 그리드 1, 기타 1) |

#### IDD_CONTENTVIEW2 (compact)

| 항목 | 값 |
|---|---|
| 다이얼로그 ID | IDD_CONTENTVIEW2 |
| 리소스 값 | 164 |
| 크기 (DLU) | 414 x 327 |
| 소스 파일 | Restaurant.rc |
| 총 UI 요소 수 | 30 (버튼 11, 라벨 18, 그리드 1) |

### 레거시 컨트롤 -> 신규 매핑

| 레거시 컨트롤 | 신규 대응 |
|---|---|
| IDC_VIDEORECT1 | MediaArea (영상/이미지/QR) |
| IDC_CONTENT_GRID (MFCGridCtrl) | DataTable (주문 내역) |
| IDC_CONTENT_TOTALAMT | AmountLabel (총금액) |
| IDC_CONTENT_DIS | AmountLabel (할인) |
| IDC_CONTENT_REAMT | AmountLabel (받을금액) |
| IDC_CONTENT_RECVAMT | AmountLabel (받은금액) |
| IDC_CONTENT_CHANGEAMT | AmountLabel (거스름) |
| IDC_CONTENT_STORE | Label (매장명) |
| IDC_CONTENT_CUST | Label (고객명) |
| IDC_CUSTOK | 고객확인 버튼 |
| IDC_STA_QRCODE (숨김) | QRCode 컴포넌트 |
| IDC_QR_AMOUNT (숨김) | QR 금액 |
| IDC_CUST_NAME/LASTVISIT/POINT (숨김) | 고객 정보 (조건부) |
| IDC_QR_TITLE | QR 타이틀 (i18n) |
| IDC_BKGRND_QR/CUST, IDC_VIETQR_ICON, IDC_HYOJUNG_ICON_SM | 정적 자원 |
| IDC_EXPLORER1 (ActiveX) | 제거 (CEF 기반) |

---

## Progress Record

| 날짜 | 작업 | 상태 |
|---|---|---|
| 2026-04-05 | UI Shell 구현: `BrandPosApp/PosUi/src/screens/CustomerScreen/components/ContentViewDialog.tsx` | Shell 완료 (size prop full/compact, media area, order grid, QR conditional, stub handlers). Backend 미연결. |
