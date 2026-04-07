# KAKAOTALK_ALIM 화면 설계서

---

## 0. 문서 정보

| 항목 | 값 |
|---|---|
| 문서 ID | SCR-KAKAOTALK-ALIM |
| 화면 ID (레거시) | IDD_KAKAOTALK_ALIM |
| 작성일 | 2026-04-05 |
| 상태 | 초안 |

---

## 1. 화면 개요

KAKAOTALK_ALIM은 카카오 알림톡 발송 관리 모달이다. 대기 목록 조회, 호출(발송), 선택/전체 삭제, 새로고침, 필터링 기능을 제공한다. 알림톡 발송은 온라인 필수 기능이므로 오프라인 시 발송 불가를 명시하며, Outbox 재전송 대상이 아니다 (실시간 외부 거래 규칙 적용).

- 신규 UI 위치: `shared/ui/organisms/KakaoAlimModal`
- 화면 유형: 모달 (Organism)
- 우선순위: **P1**

---

## 2. 상위 기준 연결

| 기준 문서 | 관련 섹션 | 비고 |
|---|---|---|
| 04-Edge-POS-아키텍처-설계서 | ExternalBridge 규칙 | Fooding API 연동 |
| CLAUDE.md | Outbox 규칙 | 실시간 외부 거래 -> Outbox 재전송 금지 |
| CLAUDE.md | shared/ui 규칙 | 공용 모달은 shared/ui/organisms |

---

## 3. 기능 목록

| ID | 기능명 | 우선순위 | Bridge Command | UseCase | Domain/Manager | Infrastructure |
|---|---|---|---|---|---|---|
| KAKAO-F01 | 호출하기 (알림톡 발송) | P1 | NOTIFICATION:SEND_KAKAO | SendKakaoAlimUseCase | CustMgr | Network/HTTP, ExternalBridge/Fooding |
| KAKAO-F02 | 새로고침 | P1 | NOTIFICATION:SEND_KAKAO | SendKakaoAlimUseCase | CustMgr | Network/HTTP |
| KAKAO-F03 | 선택 삭제 | P1 | NOTIFICATION:SEND_KAKAO | SendKakaoAlimUseCase | CustMgr | Tables/Customer/CustCrud (SQLite) |
| KAKAO-F04 | 전체 삭제 | P1 | NOTIFICATION:SEND_KAKAO | SendKakaoAlimUseCase | CustMgr | Tables/Customer/CustCrud (SQLite) |
| KAKAO-F05 | 닫기 | P1 | 없음 (모달 닫기) | - | - | - |
| KAKAO-F06 | 주문완료 알림톡 체험 (숨김) | P2 | NOTIFICATION:SEND_KAKAO | SendKakaoAlimUseCase | - | Network/HTTP, ExternalBridge/Fooding |
| KAKAO-F07 | 미사용 요청 알림톡 체험 (숨김) | P2 | NOTIFICATION:SEND_KAKAO | SendKakaoAlimUseCase | - | Network/HTTP, ExternalBridge/Fooding |
| KAKAO-F08 | 필터: 매출1/2/3 체크 | P1 | 없음 (UI 로컬 필터) | - | - | - |

---

## 4. UI 구조

### 4.1 화면 레이아웃

```
+-------------------------------------------------------+
| [닫기]                                                  |
|                                                       |
| 대기 건수: [___]    [매출1 체크] [매출2 체크] [매출3 체크]  |
|                                                       |
| +--알림톡 대기 목록 그리드--------------------------+     |
| | 번호 | 이름 | 전화번호 | 주문내역 | 상태 | ...     |     |
| |                                                |     |
| +------------------------------------------------+     |
|                                                       |
| [선택삭제] [전체삭제]        [새로고침]  [호출하기]         |
| 잔여 알림 횟수: [___]                                    |
+-------------------------------------------------------+
```

### 4.2 컴포넌트 매핑 (shared/ui 기준)

| 영역 | 컴포넌트 경로 | 비고 |
|---|---|---|
| 모달 전체 | shared/ui/organisms/KakaoAlimModal | 알림톡 관리 모달 |
| 대기 목록 | shared/ui/molecules/DataTable | React 테이블 |
| 필터 체크박스 | shared/ui/atoms/Checkbox | 3개 필터 |

### 4.3 데이터 바인딩

| ID | 표시 항목 | 신규 UI 컴포넌트 | 데이터 소스 |
|---|---|---|---|
| KAKAO-D01 | 대기 건수 | Label | notificationApi.getKakaoQueue |
| KAKAO-D02 | 잔여 알림 횟수 | Label | notificationApi.getKakaoQuota |
| KAKAO-D03 | 알림톡 대기 목록 그리드 | DataTable | notificationApi.getKakaoQueue |
| KAKAO-D04 | 필터 체크박스 3개 | Checkbox x 3 | UI 로컬 상태 |

---

## 5. 구현 명세

### 5.1 Bridge Command

| Command | 요청 payload | 응답 payload | 비고 |
|---|---|---|---|
| NOTIFICATION:SEND_KAKAO | `{ customerIds[], templateType }` | `{ success, sentCount }` | 알림톡 발송 |

### 5.2 UseCase

| UseCase | 책임 | 트랜잭션 | Ledger | Outbox |
|---|---|---|---|---|
| SendKakaoAlimUseCase | ExternalBridge/Fooding API를 통해 알림톡 발송 | O | - | 재전송 대상 아님 (실시간 외부 거래) |

### 5.3 Domain/Manager

| Manager | 메서드 | 책임 |
|---|---|---|
| CustMgr | GetKakaoQueue() | 대기 목록 조회 |
| CustMgr | DeleteFromQueue() | 대기 목록 삭제 |

### 5.4 Infrastructure

| 모듈 | 파일 | 책임 |
|---|---|---|
| Network/HTTP | - | API 호출 |
| ExternalBridge/Fooding | - | 카카오 알림톡 API |
| Tables/Customer/CustCrud | SQLite | 고객 정보 |

### 5.5 RTK Query 연동

| Endpoint | 태그 | 비고 |
|---|---|---|
| notificationApi.getKakaoQueue | `KakaoQueue` | 대기 목록 |
| notificationApi.getKakaoQuota | `KakaoQuota` | 잔여 횟수 |

### 5.6 PosRealTime 이벤트

해당 없음.

---

## 6. 테스트

| ID | 시나리오 | 기대 결과 |
|---|---|---|
| KAKAO-T01 | 호출하기 클릭 (온라인) | 알림톡 발송 + 대기 목록 갱신 |
| KAKAO-T02 | 호출하기 클릭 (오프라인) | 발송 불가 에러 표시 |
| KAKAO-T03 | 선택 삭제 | 선택된 항목 삭제 |
| KAKAO-T04 | 필터 체크박스 토글 | 목록 필터링 |

---

## 7. 완료 기준

- [ ] 알림톡 발송이 온라인 필수이며, 오프라인 시 진입/발송 차단된다
- [ ] Outbox 재전송 대상이 아니다 (실시간 외부 거래 규칙)
- [ ] SendKakaoAlimUseCase가 ExternalBridge/Fooding API를 통해 발송한다
- [ ] MFCGridCtrl 1개가 React 테이블로 대체된다
- [ ] 체험 버튼 2개는 숨김 상태이며 테스트 목적으로만 사용한다

---

## 8. 작업 명단

| 작업 | 대상 파일 경로 | 상태 |
|---|---|---|
| Organism 구현 | `BrandPosApp/PosUi/src/shared/ui/organisms/KakaoAlimModal.tsx` | TODO |
| Bridge Command | `BrandPosApp/Presentation/CEF/InternalBridge/PosRequestActions/Notification/NotificationActions.cpp` | TODO |
| UseCase | `BrandPosApp/UseCases/Notification/SendKakaoAlimUseCase.cpp` | TODO |
| Domain | `BrandPosApp/Domain/Customer/CustMgr.cpp` | TODO |
| ExternalBridge | `BrandPosApp/Infrastructure/ExternalBridge/Fooding/` | TODO |
| RTK Query | `BrandPosApp/PosUi/src/store/api/notificationApi.ts` | TODO |
| Screen Shell | `BrandPosApp/PosUi/src/screens/PaymentScreen/components/KakaoAlimDialog.tsx` | DONE (shell) |

---

## Appendix: 레거시 참조

### 레거시 다이얼로그 정보

| 항목 | 값 |
|---|---|
| 다이얼로그 ID | IDD_KAKAOTALK_ALIM |
| 리소스 값 | 331 |
| 크기 (DLU) | 450 x 337 |
| 소스 파일 | Restaurant.rc |
| 총 UI 요소 수 | 14 (버튼 8, 라벨 2, 입력 3, 그리드 1) |

### 레거시 컨트롤 -> 신규 매핑

| 레거시 컨트롤 | 신규 대응 |
|---|---|
| IDC_BTN_CALL | 호출하기 버튼 |
| IDC_BTN_REFRESH | 새로고침 버튼 |
| IDC_BTN_SELDEL | 선택삭제 버튼 |
| IDC_BTN_ALLDEL | 전체삭제 버튼 |
| IDCANCEL | 닫기 버튼 |
| IDC_BTN_EXPERIENCE1/2 (숨김) | 체험 버튼 (조건부) |
| IDC_GRID (MFCGridCtrl) | DataTable (대기 목록) |
| IDC_CHK_SELL1/2/3 | Checkbox (필터) |
| IDC_STA_WAITCNT | 대기건수 Label |
| IDC_STA_REMAIN | 잔여횟수 Label |
