# ORDER_PLUSET 화면 문서

## 0. 문서 정보
| 항목 | 값 |
|---|---|
| 화면명 | `ORDER_PLUSET` |
| 화면 ID | `IDD_ORDER_PLUSET` |
| 원본 파일 | `order-pluset.md` |
| 전환 우선순위 | `P2` |
| 담당 계층 | `PosUi / Domain / Infrastructure` |
| 상태 | `TODO` |

## 1. 화면 개요
- **화면 목적**: 주문 화면의 PLU(메뉴 버튼) 표시 설정을 관리하는 보조 다이얼로그이다. 메뉴 행 수, 이미지/텍스트 비율, 이미지 크기 비율을 설정한다.
- **해결하는 사용자 문제**: 매장 환경에 맞게 메뉴 버튼의 레이아웃을 커스터마이징한다.
- **진입 경로**: 설정 화면(SetupScreen)에서 PLU 설정 메뉴로 진입한다.
- **종료 경로**: 저장(IDC_BTN_SAVE) 후 자동 닫힘 또는 닫기(IDCANCEL)로 설정 화면 복귀한다.
- **관련 운영 주체**: 매장 관리자 (설정 담당)

## 2. 상위 기준 연결
| 기준 | 연결 문서 | 비고 |
|---|---|---|
| 전체 아키텍처 | `00-Platform-최종-아키텍처-기준서.md` | 필수 |
| Edge POS 설계 | `04-Edge-POS-아키텍처-설계서.md` | 필수 |
| 전체 흐름 | `05-Edge-POS-전체-흐름-AZ-가이드.md` | 필수 |
| DB 설계 | `DB설계/` | 시스템 설정 테이블 |
| 화면 인벤토리 | `_index.md` | 필수 |

## 3. 화면 기능 목록
| ID | 기능명 | 설명 | 사용자 액션 | 우선순위 |
|---|---|---|---|---|
| FN-001 | PLU 설정 저장 | 메뉴 행 수, 이미지/텍스트 비율, 이미지 크기 비율을 저장 | 저장 버튼 터치 | P2 |
| FN-002 | PLU 설정 닫기 | 설정 다이얼로그를 닫고 설정 화면으로 복귀 | X 닫기 버튼 터치 | P2 |
| FN-003 | 확인 (숨김) | 레거시 확인 버튼, 모달 닫기 흐름에 통합 | - | P2 |
| FN-004 | 메뉴 행 수 선택 | PLU 그리드의 행 수를 선택 | 드롭다운 선택 | P2 |
| FN-005 | 이미지 텍스트 비율 선택 | 메뉴 버튼 내 이미지/텍스트 비율 설정 | 드롭다운 선택 | P2 |
| FN-006 | 이미지 크기 비율 선택 | 메뉴 버튼 이미지 크기 비율 설정 | 드롭다운 선택 | P2 |

## 4. UI 구조
### 4.1 화면 구성
- **상단**: 저장 버튼, X 닫기 버튼
- **본문**: 메뉴 행 수 ComboBox, 이미지/텍스트 비율 ComboBox, 이미지 크기 비율 ComboBox
- **하단**: 숨김 처리된 확인 버튼 (레거시)

### 4.2 재사용 UI
| 컴포넌트 | 위치 | props로 바뀌는 값 | 비고 |
|---|---|---|---|
| Select | `shared/ui/atoms/Select` | options, value, onChange | ComboBox 3개 모두 대체 |

## 5. 구현 명세
### 5.1 상태 소유권
| 상태 | 소유 계층 | 원본 | 비고 |
|---|---|---|---|
| PLU 설정값 (행 수, 비율) | RTK Query 캐시 | systemApi.getPluSettings | 서버 상태 |
| 폼 입력 임시값 | UI 로컬 상태 | - | 저장 전까지 임시 |

### 5.2 Bridge 계약
| Command | Request | Response | Error | Idempotency | 비고 |
|---|---|---|---|---|---|
| SYSTEM:SAVE_PLU_SETTINGS | `{ menuLineCount, imageTextRatio, imageRate }` | `{ success: true }` | `INVALID_SETTING_VALUE` | - | 단순 설정 저장. ITEM:REGISTER와 분리 — PLU 설정은 시스템 설정 도메인 |

### 5.3 UseCase 계약
| UseCase | Trigger | Input | Transaction | Lock | Output | 실패 규칙 |
|---|---|---|---|---|---|---|
| - | SYSTEM:SAVE_PLU_SETTINGS | PLU 설정값 | SQLite 단일 트랜잭션 | - | success | 단순 CRUD, UseCase 분리 불필요. 유효하지 않은 값(범위 초과): INVALID_SETTING_VALUE → 거부. 오프라인: 로컬 DB만 사용, 정상 동작 |

### 5.4 Domain / Manager / Store
| 항목 | 책임 | 파일 / 모듈 | 비고 |
|---|---|---|---|
| SystemMgr | 시스템 설정 읽기/쓰기 | `Domain/System/SystemMgr` | PLU 설정 관리 |
| ItemMgr | 메뉴 항목 관련 설정 | `Domain/Item/ItemMgr` | 메뉴 행 수 등 |

### 5.5 DB / CentralApi / Sync / Realtime
| 연동 대상 | 역할 | 데이터 흐름 | 비고 |
|---|---|---|---|
| SQLite (System 설정) | PLU 설정 영속화 | SystemMgr → SystemCrud → SQLite | Offline-First |
| CentralApi | PLU 설정은 Sync 대상 아님 | - | 로컬 전용 설정, 매장별 독립 |

### 5.6 i18n / Error / Permission
| 항목 | 규칙 | 비고 |
|---|---|---|
| i18n | `BrandPosApp/PosUi/src/i18n/locales/` 기반 msgKey | 드롭다운 라벨 등 |
| Error | `INVALID_SETTING_VALUE` (범위 초과 값 입력 시) | 코드 기반, msgKey로 UI 표시 |
| Permission — PLU 설정 변경 | 관리자 권한 필요. 미충족 시 PERMISSION_DENIED | 설정 화면 자체가 관리자 전용 진입 |

## 6. 테스트
| 테스트 항목 | 범위 | 기대 결과 | 유형 |
|---|---|---|---|
| PLU 설정 저장 | PluSettingPanel + SystemMgr | SYSTEM:SAVE_PLU_SETTINGS 호출 → 설정값 SQLite 저장 성공, systemApi 캐시 무효화 | 통합 |
| 설정 불러오기 | systemApi.getPluSettings | 진입 시 기존 설정값이 3개 드롭다운에 정확히 표시 | UI |
| OrderScreen 반영 | MenuGrid | PLU 설정 변경 후 OrderScreen 재진입 시 메뉴 그리드 레이아웃(행 수, 비율) 변경 반영 | 통합 |
| 잘못된 설정값 | PluSettingPanel validation | 범위 초과 값 입력 시 INVALID_SETTING_VALUE 에러, 저장 불가 | UI |

## 7. 완료 기준
- [ ] UI: screens/SetupScreen/components/PluSettingPanel 구현
- [ ] Bridge: ITEM:REGISTER (PLU 설정 경로) 구현
- [ ] RTK Query: systemApi.getPluSettings endpoint 구현
- [ ] i18n: PLU 설정 관련 키 등록
- [ ] 테스트: 설정 저장/반영 테스트
- [ ] 문서 DONE

## 8. 작업 명단
| 작업 | 파일 | 상태 |
|---|---|---|
| PluSettingPanel | `BrandPosApp/PosUi/src/screens/SetupScreen/components/PluSettingPanel.tsx` | TODO |
| systemApi (getPluSettings) | `BrandPosApp/PosUi/src/store/api/systemApi.ts` | TODO |
| SystemMgr (PLU 설정) | `BrandPosApp/Domain/System/SystemMgr.cpp/.h` | TODO |
| SystemCrud (설정 CRUD) | `BrandPosApp/Infrastructure/Persistence/SQLite/Tables/System/SystemCrud.cpp/.h` | TODO |

## 9. 작업 진행 기록
| 날짜 | 범위 | 상태 | 완료 범위 | 남은 범위 | 내용 |
|---|---|---|---|---|---|
| 2026-04-05 | Shell 구현 | 완료 | 레이아웃+로컬상태+stub | Bridge/UseCase 연동 | PLUSetDialog.tsx shell 구현 완료. Modal, Button, select 요소 사용. 메뉴 행 수/이미지텍스트비율/이미지크기비율 3개 드롭다운 + 저장 stub. |

---
## Appendix: 레거시 UI 요소 참조

### 기본 정보

| 항목 | 값 |
|------|---|
| 다이얼로그 ID | IDD_ORDER_PLUSET |
| 리소스 값 | 401 |
| 크기 (DLU) | 400 x 300 |
| 다이얼로그 타입 | DIALOGEX |
| 스타일 | DS_SETFONT \| WS_POPUP \| WS_SYSMENU |
| 폰트 | 10, "System", 400, 0, 0x81 |
| 소스 파일 | Restaurant.rc |
| 총 UI 요소 수 | 6 |

### UI 요소 목록

#### 버튼 (3개)

| ID | 라벨 | 위치 (x,y) | 크기 (w x h) | 숨김 | 스타일 | 용도 추정 |
|---|---|---|---|---|---|---|
| IDOK | 확인 | (7,259) | 50 x 14 | **TRUE** | NOT WS_VISIBLE \| WS_DISABLED | 확인/완료 버튼 |
| IDCANCEL | X | (349,11) | 40 x 22 | FALSE | BS_OWNERDRAW \| WS_TABSTOP | 닫기/취소 버튼 |
| IDC_BTN_SAVE | 저장 | (270,11) | 54 x 22 | FALSE | BS_OWNERDRAW \| WS_TABSTOP | 저장 버튼 |

#### 입력 필드 (3개)

| ID | 타입 | 위치 (x,y) | 크기 (w x h) | 숨김 | 스타일 | 용도 추정 |
|---|---|---|---|---|---|---|
| IDC_CB_MENULINE | ComboBox | (85,76) | 70 x 104 | FALSE | CBS_DROPDOWNLIST \| WS_VSCROLL \| WS_TABSTOP | 메뉴 행 수 선택 |
| IDC_CB_IMGTEXPER | ComboBox | (85,107) | 70 x 105 | FALSE | CBS_DROPDOWNLIST \| WS_VSCROLL \| WS_TABSTOP | 이미지/텍스트 비율 선택 |
| IDC_CB_IMGRATE | ComboBox | (85,138) | 90 x 91 | FALSE | CBS_DROPDOWNLIST \| WS_VSCROLL \| WS_TABSTOP | 이미지 크기 비율 선택 |

### 요소 통계

| 유형 | 개수 |
|------|------|
| 버튼 | 3 |
| 텍스트/라벨 | 0 |
| 입력 필드 | 3 |
| 그리드/리스트 | 0 |
| 기타 | 0 |
| **합계** | **6** |
