# PAY_MGR 화면 문서

## 0. 문서 정보

| 항목 | 값 |
|---|---|
| 화면명 | `PAY_MGR` |
| 화면 ID | `IDD_PAY_MGR` |
| 원본 파일 | `set-pay-mgr.md` |
| 전환 우선순위 | `P0` |
| 담당 계층 | `PosUi` |
| 상태 | `Shell 구현 완료` |

## 1. 화면 개요

- **화면 목적**: 결제 관련 설정의 네비게이션 허브 역할을 하며, 5개 하위 탭(PAY설정/결제계산서/세금계산서물품대/PAY4/PAY5)으로 구성된다.
- **해결하는 사용자 문제**: 매장 관리자가 결제 설정 카테고리를 탭으로 전환하며 각 설정 화면에 접근한다. POS 번호도 상단에 표시한다.
- **화면 진입 경로**: SetupScreen(설정 메인) → 결제 관리 선택
- **화면 종료 경로**: 닫기(IDCANCEL) → SetupScreen 복귀
- **관련 운영 주체**: 매장 관리자
- **운영 모드**: Setup/Maintenance mode

## 2. 상위 기준 연결

| 기준 | 연결 문서 | 비고 |
|---|---|---|
| 전체 아키텍처 | `00-Platform-최종-아키텍처-기준서.md` | 필수 |
| Edge POS 설계 | `04-Edge-POS-아키텍처-설계서.md` | 필수 |
| 화면 인벤토리 | `_index.md` | 필수 |

## 3. 화면 기능 목록

| ID | 기능명 | 설명 | 사용자 액션 | 우선순위 |
|---|---|---|---|---|
| F-001 | PAY(결제)설정 탭 이동 | 결제사 설정 하위 화면 표시 | PAY설정 탭 클릭 | P0 |
| F-002 | 결제계산서 설정 탭 이동 | 결제계산서 설정 하위 화면 표시 | 결제계산서 탭 클릭 | P1 |
| F-003 | 세금계산서/물품대 탭 이동 | 세금/물품대 설정 하위 화면 표시 | 세금 탭 클릭 | P1 |
| F-004 | PAY4 탭 이동 (예약) | 향후 확장용 탭 | PAY4 탭 클릭 | P2 |
| F-005 | PAY5 탭 이동 (예약) | 향후 확장용 탭 | PAY5 탭 클릭 | P2 |
| F-006 | 닫기 | 설정 화면 종료 | 닫기 버튼 클릭 | P2 |

## 4. UI 구조

### 4.1 화면 구성

- **상단 영역**: 타이틀(PAY 관리), POS 번호 표시, 닫기 버튼
- **탭 영역**: 5개 탭 버튼 + 활성 탭 인디케이터
- **본문 영역**: 선택된 탭에 따른 하위 화면 렌더링

### 4.2 재사용 UI

| 컴포넌트 | 위치 | props로 바뀌는 값 | 비고 |
|---|---|---|---|
| TabGroup | shared/ui/molecules/TabGroup | tabs, selectedTab, onSelect | 결제 설정 탭 네비게이션 |
| PageTitle | shared/ui/atoms/PageTitle | title | 화면 타이틀 |
| Label | shared/ui/atoms/Label | text | POS 번호 표시 |

## 5. 구현 명세

### 5.1 상태 소유권

| 상태 | 소유 계층 | 원본 | 비고 |
|---|---|---|---|
| 선택된 탭 | 로컬 컴포넌트 상태 | useState | UI 상태 |
| POS 번호 | RTK Query 캐시 | systemApi.getConfig | 서버 상태 |

### 5.2 Bridge 계약

Bridge 계약 없음. 순수 네비게이션 허브.

### 5.3 UseCase 계약

UseCase 없음. 하위 탭 화면에서 각자 UseCase 호출.

### 5.4 Domain / Manager / Store

해당 없음.

### 5.5 DB / CentralApi / Sync / Realtime

해당 없음.

### 5.6 i18n / Error / Permission

| 항목 | 규칙 | 비고 |
|---|---|---|
| i18n | `SharedAssets/i18n/locales/{ko,vi,en}/setup.json` | msgKey: setup.payMgr.* |
| Error | 해당 없음 | |
| Permission | TODO: 관리자 권한 레벨 확인 필요 | |

## 6. 테스트

| 테스트 항목 | 범위 | 기대 결과 | 유형 |
|---|---|---|---|
| 탭 전환 시 하위 화면 렌더링 | SetupScreen/PaymentManager | 선택 탭의 하위 화면 표시 | unit |
| POS 번호 표시 | SetupScreen/PaymentManager | 현재 POS 번호 표시 | integration |

## 7. 완료 기준

- [ ] UI 구현 완료 (screens/SetupScreen/PaymentManager)
- [ ] 탭 전환 + 하위 화면 렌더링 완료
- [ ] i18n 적용 완료
- [ ] 테스트 완료
- [ ] 문서 상태 `DONE`

## 8. 작업 명단

| 작업 | 파일 | 상태 |
|---|---|---|
| Screen 구현 | `BrandPosApp/PosUi/src/screens/SetupScreen/PaymentManager/index.tsx` | TODO |
| TabGroup 컴포넌트 | `BrandPosApp/PosUi/src/shared/ui/molecules/TabGroup.tsx` | TODO |
| PaymentCompanyConfig 탭 연동 | `BrandPosApp/PosUi/src/screens/SetupScreen/PaymentCompanyConfig/index.tsx` | TODO |
| TaxRefConfig 탭 연동 | `BrandPosApp/PosUi/src/screens/SetupScreen/TaxRefConfig/index.tsx` | TODO |

---

## Appendix: 레거시 UI 요소 참조

### 기본 정보

| 항목 | 값 |
|------|---|
| 다이얼로그 ID | IDD_PAY_MGR |
| 리소스 값 | 232 |
| 크기 (DLU) | 512 x 384 |
| 다이얼로그 타입 | DIALOGEX |
| 스타일 | DS_SETFONT \| WS_POPUP |
| 소스 파일 | RestaurantSet.rc |
| 총 UI 요소 수 | 10 |

### 요소 통계

| 유형 | 개수 |
|------|------|
| 버튼 | 7 |
| 텍스트/라벨 | 3 |
| **합계** | **10** |

### 마이그레이션 노트 (원본)

- PAY_MGR은 결제 관련 설정의 네비게이션 허브이며, 실제 내용은 하위 탭에서 처리한다.
- PAY4, PAY5 탭은 현재 예약 상태이며, 향후 확장을 위해 탭 구조만 유지한다.
- PRINT_MGR과 동일한 패턴으로 React Router 또는 탭 컴포넌트로 전환한다.
- IDOK 숨김 버튼은 레거시 호환용이므로 신규 UI에서 제거한다.
