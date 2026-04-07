# PRINT_MGR 화면 문서

## 0. 문서 정보

| 항목 | 값 |
|---|---|
| 화면명 | `PRINT_MGR` |
| 화면 ID | `IDD_PRINT_MGR` |
| 원본 파일 | `set-print-mgr.md` |
| 전환 우선순위 | `P1` |
| 담당 계층 | `PosUi` |
| 상태 | `Shell 구현 완료` |

## 1. 화면 개요

- **화면 목적**: 프린터 관련 설정의 네비게이션 허브 역할을 하며, 4개 하위 탭(주문프린터/일반영수증/계산서/프린터등록)으로 구성된다.
- **해결하는 사용자 문제**: 매장 관리자가 프린터 설정 카테고리를 탭으로 전환하며 각 설정 화면에 접근한다.
- **화면 진입 경로**: SetupScreen(설정 메인) → 프린터 관리 선택
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
| F-001 | 주문프린터 설정 탭 이동 | 주문프린터 설정 하위 화면 표시 | 주문프린터 탭 클릭 | P1 |
| F-002 | 일반영수증 설정 탭 이동 | 일반영수증 설정 하위 화면 표시 | 일반영수증 탭 클릭 | P1 |
| F-003 | 계산서(간이주문서) 설정 탭 이동 | 계산서 설정 하위 화면 표시 | 계산서 탭 클릭 | P1 |
| F-004 | 프린터등록 설정 탭 이동 | 프린터등록 설정 하위 화면 표시 | 프린터등록 탭 클릭 | P2 |
| F-005 | 닫기 | 설정 화면 종료 | 닫기 버튼 클릭 | P2 |

## 4. UI 구조

### 4.1 화면 구성

- **상단 영역**: 닫기 버튼
- **탭 영역**: 4개 탭 버튼(주문프린터/일반영수증/계산서/프린터등록) + 활성 탭 인디케이터
- **본문 영역**: 선택된 탭에 따른 하위 화면 렌더링 (탭 패널)

### 4.2 재사용 UI

| 컴포넌트 | 위치 | props로 바뀌는 값 | 비고 |
|---|---|---|---|
| TabGroup | shared/ui/molecules/TabGroup | tabs, selectedTab, onSelect | 프린터 설정 탭 네비게이션 |

## 5. 구현 명세

### 5.1 상태 소유권

| 상태 | 소유 계층 | 원본 | 비고 |
|---|---|---|---|
| 선택된 탭 | 로컬 컴포넌트 상태 | useState | UI 상태 |

### 5.2 Bridge 계약

Bridge 계약 없음. 순수 네비게이션 허브로 탭 전환만 처리.

### 5.3 UseCase 계약

UseCase 없음. 하위 탭 화면에서 각자 UseCase 호출.

### 5.4 Domain / Manager / Store

해당 없음.

### 5.5 DB / CentralApi / Sync / Realtime

해당 없음.

### 5.6 i18n / Error / Permission

| 항목 | 규칙 | 비고 |
|---|---|---|
| i18n | `SharedAssets/i18n/locales/{ko,vi,en}/setup.json` | msgKey: setup.printMgr.* |
| Error | 해당 없음 | |
| Permission | TODO: 관리자 권한 레벨 확인 필요 | |

## 6. 테스트

| 테스트 항목 | 범위 | 기대 결과 | 유형 |
|---|---|---|---|
| 탭 전환 시 하위 화면 렌더링 | SetupScreen/PrintManager | 선택 탭의 하위 화면 표시 | unit |
| 활성 탭 인디케이터 | SetupScreen/PrintManager | 선택된 탭 스타일 변경 | unit |

## 7. 완료 기준

- [ ] UI 구현 완료 (screens/SetupScreen/PrintManager)
- [ ] 탭 전환 + 하위 화면 렌더링 완료
- [ ] i18n 적용 완료
- [ ] 테스트 완료
- [ ] 문서 상태 `DONE`

## 8. 작업 명단

| 작업 | 파일 | 상태 |
|---|---|---|
| Screen 구현 | `BrandPosApp/PosUi/src/screens/SetupScreen/PrintManager/index.tsx` | TODO |
| TabGroup 컴포넌트 | `BrandPosApp/PosUi/src/shared/ui/molecules/TabGroup.tsx` | TODO |
| PrintBillConfig 탭 연동 | `BrandPosApp/PosUi/src/screens/SetupScreen/PrintBillConfig/index.tsx` | TODO |
| PrintReceiptConfig 탭 연동 | `BrandPosApp/PosUi/src/screens/SetupScreen/PrintReceiptConfig/index.tsx` | TODO |
| PrintRegConfig 탭 연동 | `BrandPosApp/PosUi/src/screens/SetupScreen/PrintRegConfig/index.tsx` | TODO |

---

## Appendix: 레거시 UI 요소 참조

### 기본 정보

| 항목 | 값 |
|------|---|
| 다이얼로그 ID | IDD_PRINT_MGR |
| 리소스 값 | 213 |
| 크기 (DLU) | 512 x 384 |
| 다이얼로그 타입 | DIALOGEX |
| 스타일 | DS_SETFONT \| WS_POPUP |
| 소스 파일 | RestaurantSet.rc |
| 총 UI 요소 수 | 7 |

### 요소 통계

| 유형 | 개수 |
|------|------|
| 버튼 | 6 |
| 텍스트/라벨 | 1 |
| **합계** | **7** |

### 마이그레이션 노트 (원본)

- PRINT_MGR은 네비게이션 허브 역할이며, 실제 설정 내용은 각 하위 탭에서 처리한다.
- 신규 UI에서는 React Router 또는 탭 컴포넌트로 전환하며, 각 하위 화면을 탭 패널로 렌더링한다.
- IDOK 숨김 버튼은 레거시 호환용이므로 신규 UI에서 제거한다.
- IDC_STA_PRINT0("=") 텍스트는 레거시 탭 인디케이터 역할이며, 신규 UI에서는 활성 탭 스타일로 대체한다.
