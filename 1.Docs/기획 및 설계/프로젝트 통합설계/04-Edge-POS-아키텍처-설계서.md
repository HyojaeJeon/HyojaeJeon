# Kế hoạch chuyển đổi kiến trúc Edge POS: Legacy MSSQL → CEF + Next.js + SQLite
(Edge POS 아키텍처 전환 계획서: Legacy MSSQL → CEF + Next.js + SQLite)

> **Ngày tạo**: 2026-03-31
> (작성일)
> **Dự án**: Platform (nguồn tham chiếu legacy: `HJ-POS-TEST`)
> (프로젝트: Platform (레거시 참조 원본: `HJ-POS-TEST`))
> **Stack căn cứ**: `00-Platform-최종-아키텍처-기준서.md`
> (스택 기준: `00-Platform-최종-아키텍처-기준서.md`)
> **Mục đích**: Chuyển đổi UI của Edge POS cài tại từng chi nhánh sang CEF + Next.js (TypeScript) + Redux Toolkit + RTK Query, C++ chuyên trách logic nghiệp vụ/SQLite local DB/giao tiếp server/thiết bị ngoại vi
> (목적: 각 지점에 설치되는 Edge POS의 UI를 CEF + Next.js(TypeScript) + Redux Toolkit + RTK Query로 전환하고, C++은 비즈니스 로직/SQLite 로컬 DB/서버통신/주변기기 전담으로 유지)
> **Tính chất tài liệu**: Đây là tài liệu tiêu chuẩn thiết kế cho **Edge POS tại cửa hàng/EdgePos**, không phải tài liệu của HQ platform hay Super Admin platform
> (문서 성격: 이 문서는 **매장/단말 Edge POS** 설계 기준서이며, 본사 플랫폼이나 슈퍼관리자 플랫폼 설계서를 대체하지 않는다)

> **Phạm vi tài liệu**: Mỗi instance POS trong tài liệu này luôn hoạt động trong ngữ cảnh `RegionalDistributorId + BrandHQId + BranchId + EdgePosId`
> (문서 범위: 이 문서의 POS 인스턴스는 항상 `RegionalDistributorId + BrandHQId + BranchId + EdgePosId` 문맥 안에서 동작한다)

> **Ghi chú**
> - Mọi lựa chọn stack trong tài liệu này phải ưu tiên `00-Platform-최종-아키텍처-기준서.md`.
> - Văn bản bên dưới là tài liệu triển khai/diễn giải chi tiết của Edge POS, không phải nguồn chuẩn tối cao của stack toàn platform.
> - (주의) 이 문서의 모든 스택 선택은 `00-Platform-최종-아키텍처-기준서.md`를 우선한다. 아래 내용은 Edge POS의 상세 구현/설명 문서이며 전체 플랫폼 스택의 최상위 기준은 아니다.

---

## 1. Các quyết định
(결정사항)

| Hạng mục | Quyết định |
|------|------|
| Nền tảng | Build kép x86/x64 (cả hai đều bao gồm CEF). Triển khai theo môi trường khách hàng |
| └ 플랫폼 | └ x86/x64 듀얼 빌드 (양쪽 모두 CEF 포함). 고객 환경에 따라 배포 |
| Phạm vi chuyển đổi | Ưu tiên 3 màn hình chính (Bàn, Đặt món, Thanh toán) |
| └ 전환 범위 | └ 핵심 3개 화면 우선 (테이블, 주문, 결제) |
| Phục vụ Next.js | Build tĩnh (`next build` + `output: 'export'`) + CEF Custom Scheme (`app://pos/`) |
| └ Next.js 서빙 | └ 정적 빌드 (`next build` + `output: 'export'`) + CEF Custom Scheme (`app://pos/`) |
| Thiết bị ngoại vi | Giữ nguyên C++ (CxCom, CPrinter) → Gọi từ JS qua cefQuery |
| └ 주변기기 | └ C++ 유지 (CxCom, CPrinter) → cefQuery로 JS에서 호출 |
| Ngôn ngữ | TypeScript là mặc định cho UI/bridge; C++ dùng cho native host và thiết bị ngoại vi |
| └ 언어 | └ UI/브릿지는 TypeScript가 기본이며, C++은 네이티브 호스트와 주변기기용으로 사용 |
| Mô hình vận hành | Offline-First. local DB là nguồn dữ liệu nghiệp vụ, hệ thống từ xa là đối tượng đồng bộ |
| └ 운영 모델 | └ Offline-First. 로컬 DB가 업무 데이터 원본, 원격 시스템은 동기화 대상 |
| Quản lý trạng thái | Thống nhất RTK Query. Dữ liệu truy vấn dùng cache RTK Query, Redux slice chỉ cho trạng thái UI |
| └ 상태 관리 | └ RTK Query 단일화. 조회 데이터는 RTK Query 캐시, Redux slice는 UI 상태만 |
| Vòng đời trình duyệt | Duy trì một instance CefBrowser chính, chuyển màn hình qua React state/routing |
| └ 브라우저 생명주기 | └ 메인 CefBrowser 단일 인스턴스 유지, 화면 전환은 React 상태/라우팅으로 처리 |
| Nguyên tắc tầng | UI/Bridge → UseCases → DB/Manager → Infra một chiều |
| └ 계층 원칙 | └ UI/Bridge → UseCases → DB/Manager → Infra 단방향 |
| Nguyên tắc lưu trữ | Không áp dụng Repository toàn phần theo từng Manager. Giữ cấu trúc Manager 중심, chỉ tách các kho vận hành dưới dạng `*Store` trong `Infrastructure/Persistence` |
| └ 영속화 원칙 | └ Manager별 Repository 전면 도입은 하지 않는다. `Manager 중심 + Infrastructure/Persistence + 운영 저장소만 *Store`로 분리 |
| Xử lý trùng lặp | Thanh toán/Đặt món đảm bảo tính idempotent theo `requestId` + `idempotencyKey` (bảng Ledger local) |
| └ 중복 처리 | └ 결제/주문은 `requestId` + `idempotencyKey` 기준 멱등성 보장 (로컬 Ledger 테이블) |
| Mục tiêu UI cuối cùng | Loại bỏ hoàn toàn MFC UI. Tất cả màn hình hội tụ về CEF + Next.js |
| └ 최종 UI 목표 | └ MFC UI는 완전 제거하고, 모든 화면은 CEF + Next.js로 수렴 |
| Điều khiển chuyển màn hình | Chỉ dùng CEF shell đơn + React routing. Không duy trì nhánh UI cũ song song |
| └ 화면 전환 제어 | └ CEF 단일 셸 + React 라우팅만 사용한다. 구형 UI 병행 경로는 유지하지 않는다 |
| Môi trường phát triển | Catalog thiết kế `app/design-system/` + Mock transport tích hợp. Phát triển UI/màn hình không cần C++ với `next dev` |
| └ 개발 환경 | └ `app/design-system/` 디자인 카탈로그 + Mock transport 내장. `next dev`로 C++ 없이 UI/화면 개발 가능 |
| Nguyên tắc cefQuery | Khi tải màn hình, yêu cầu dữ liệu bulk bằng một cefQuery duy nhất. Truy vấn từng mục chỉ khi có hành động người dùng |
| └ cefQuery 원칙 | └ 화면 로드 시 단일 cefQuery로 벌크 데이터 요청. 개별 항목 조회는 사용자 액션에만 |
| Độ ổn định CEF | CefLifeSpanHandler phát hiện crash → Tự động tái tạo trình duyệt → Tái hydrate bootstrap dựa trên local DB |
| └ CEF 안정성 | └ CefLifeSpanHandler에서 크래시 감지 → 브라우저 자동 재생성 → 로컬 DB 기반 bootstrap 재수화 |
| Phạm vi nghiệp vụ | Tài liệu này chỉ định nghĩa Edge POS tại chi nhánh. Quản trị thương hiệu, quản trị đa chi nhánh và Super Admin được tách sang tài liệu platform riêng |
| └ 업무 범위 | └ 이 문서는 지점 Edge POS만 정의한다. 브랜드 관리, 다지점 통합 운영, 슈퍼관리자 기능은 별도 플랫폼 문서로 분리한다 |
| Bối cảnh tenancy | Edge POS luôn khởi động trong phạm vi một `RegionalDistributorId`, một `BrandHQId`, một `BranchId`, một `EdgePosId`; không cho phép một instance POS phục vụ đồng thời nhiều chi nhánh |
| └ 테넌시 문맥 | └ Edge POS는 항상 하나의 `RegionalDistributorId`, 하나의 `BrandHQId`, 하나의 `BranchId`, 하나의 `EdgePosId` 범위에서만 기동되며, 하나의 POS 인스턴스가 여러 지점을 동시에 서비스하지 않는다 |
| Quan hệ platform | Edge POS nhận cấu hình/chính sách/menu từ platform trung tâm và gửi dữ liệu vận hành ngược lên; thiết kế chi tiết xem tài liệu platform riêng |
| └ 플랫폼 관계 | └ Edge POS는 중앙 플랫폼에서 설정/정책/메뉴를 내려받고 운영 데이터를 상향 송신한다. 상세 설계는 별도 플랫폼 문서를 따른다 |

### 1.1 확정 스펙 / Đặc tả cố định

| 구성 | 확정 SPEC | 저장소 / 계약 | 비고 |
|---|---|---|---|
| Native Host | `C++` | local bridge / device control | Win32 실행, 장치 제어, CEF bootstrap |
| UI Shell | `CEF` | `app://pos/` custom scheme | 단일 브라우저 셸 |
| UI App | `Next.js(TypeScript)` | RTK Query + Redux Toolkit | 화면/라우팅/상태 |
| 다국어 / i18n | `SharedAssets/i18n/locales` + `i18next` | build-time copy + local parse | UI/Bridge/C++ native string 공통 원본 |
| Local DB | `SQLite` | offline-first local store | 주문/결제/테이블/복구 |
| Legacy reference DB | `MSSQL` (`HJ-POS-TEST`) | reverse-engineering source only | legacy schema/field reference |
| Bridge | `cefQuery` | request/response + realtime event | UI ↔ C++ 통신 |
| Setup/Maintenance | `BrandPosApp` 내부 mode | 같은 native host + local DB 사용 | 초기 설치/유지보수 |
| Build | x86/x64 dual | - | 고객 환경별 배포 |
| 중앙 연동 | `RegionalDistributorPortal` / `BrandHQPortal` / `SuperAdmin` | GraphQL-first API | 정책/배포/동기화 대상 |

### 1.2 Casing 규칙 (전체 프로젝트 공통)
└ Quy tắc đặt tên (chung cho toàn bộ dự án)

| 대상 / Đối tượng | 규칙 / Quy tắc | 예시 / Ví dụ |
|---|---|---|
| DB table name | PascalCase | `OrderSlip`, `SellDetail`, `RequestLedger` |
| DB column name | camelCase | `requestId`, `firstOrderDate`, `tableCode` |
| TypeScript/JavaScript 변수, 프로퍼티, 함수 | camelCase | `idempotencyKey`, `sendRequest()` |
| └ Biến, thuộc tính, hàm TS/JS | └ | └ |
| API payload / JSON / GraphQL field | camelCase | `{ requestId, dataJson, errorMessage }` |
| Type / Interface / Class (TS, C++) | PascalCase | `UseCaseResult`, `TableManager` |
| C++ struct/class 멤버 변수 / Biến thành viên | camelCase | `requestId`, `dataJson`, `retryCount` |
| C++ 메서드명 / Tên phương thức | PascalCase | `OccupyTable()`, `FindPending()` |
| 상수 / Hằng số | UPPER_SNAKE_CASE | `PROTOCOL_VERSION`, `MAX_RETRY` |

**금지 / Cấm:**
- C++ 멤버 변수에 snake_case 사용 (`request_id` → `requestId`)
- └ Sử dụng snake_case cho biến thành viên C++
- DB 컬럼명에 camelCase 사용 (`RequestId` → `requestId`)
- └ Sử dụng camelCase cho tên cột DB
- JSON payload에 snake_case 사용 (`data_json` → `dataJson`)
- └ Sử dụng snake_case cho JSON payload

**레거시 예외 / Ngoại lệ legacy:**
- HJ-POS 레거시 DB 컬럼은 현행 유지 (PascalCase). 신규 Platform 테이블만 위 규칙 적용.
- └ Giữ nguyên cột DB legacy HJ-POS (PascalCase). Chỉ áp dụng quy tắc cho bảng Platform mới.

### 1.3 중앙 플랫폼 연계 보강 현황
└ Trạng thái gia cố tích hợp platform trung tâm

- 현재 EdgePos 런타임의 핵심 경로는 계속 `C++ + CEF + Next.js(TypeScript) + RTK Query + SQLite`다.
- `@platform/api-sdk`는 `SharedContracts/ApiSdk`에 초기 패키지로 추가됐고, Setup/Maintenance mode와 Portal/Edge 도구가 CentralApi contract를 같은 타입으로 공유할 수 있는 기반을 제공한다.
- `cursor pagination`은 현재 `auditLogConnection`, `syncEventConnection`에 적용됐고, Edge의 local commit 경로를 바꾸지 않는다.
- `APQ`는 CentralApi에 실제 활성화됐으며, Edge의 `cefQuery`/bridge 경로를 바꾸지 않는다.
- persisted query allow-list는 SDK manifest 자동 생성 + CentralApi generated allow-list 강제로 구현됐고, Edge의 `cefQuery`/bridge 경로를 바꾸지 않는다.
- `Prisma multi-file schema`, `SWC builder`는 중앙 유지보수/빌드 속도 개선으로 실제 전환됐고, Edge local SQLite 모델 자체를 바꾸는 항목은 아니다.
- 결론적으로 위 항목들은 **EdgePos의 성공 기준을 바꾸지 않는다**. 성공 기준은 계속 `local SQLite commit + Outbox/Recovery`다.

- Runtime lõi của EdgePos vẫn là `C++ + CEF + Next.js(TypeScript) + RTK Query + SQLite`.
- `@platform/api-sdk` đã được thêm dưới dạng gói ban đầu tại `SharedContracts/ApiSdk`, tạo nền tảng để Setup/Maintenance mode và Portal/Edge tools dùng cùng contract của CentralApi với cùng type.
- `cursor pagination` hiện đã áp dụng cho `auditLogConnection` và `syncEventConnection`, nhưng không thay đổi đường commit local của Edge.
- `APQ` đã bật ở CentralApi, không thay đổi tuyến `cefQuery`/bridge của Edge.
- persisted query allow-list đã được triển khai bằng cách tự tạo SDK manifest và cưỡng chế generated allow-list ở CentralApi; điều này không thay đổi tuyến `cefQuery`/bridge của Edge.
- `Prisma multi-file schema` và `SWC builder` đã được chuyển đổi ở phía trung tâm, không thay đổi mô hình SQLite local của Edge.

---

## 2. Cấu trúc thư mục dự án sau chuyển đổi
└ 전환 후 프로젝트 디렉토리 구조

### 2.1 Cấu hình Monorepo
└ 모노레포 구성

Bao gồm 1 dự án BrandPosApp trong 1 kho Git duy nhất.
BrandPosApp có 2 mode: POS chính và Setup/Maintenance.
Mỗi mode dùng chung native host, bridge và local DB nhưng tách trách nhiệm UI theo route/mode.
└ 1개 Git 저장소에 BrandPosApp 1개 프로젝트만 포함한다.
└ BrandPosApp 내부에는 POS chính과 Setup/Maintenance 2개 mode가 있다.
└ 두 mode는 native host, bridge, local DB를 공유하지만 UI 책임은 route/mode 단위로 분리한다.

```
Platform (Kho Git duy nhất / 단일 Git 저장소)
├── BrandPosApp/       Ứng dụng POS chính + Setup/Maintenance mode / POS chính + 설정/유지보수 모드
├── SharedKernel/             Module C++ dùng chung (Foundation, Contracts, Observability, BuildSupport)
│                          └ 공유 C++ 기반 모듈
└── SharedAssets/                Tài nguyên dùng chung (i18n JSON, v.v.)
                           └ 공유 리소스 (i18n JSON 등)
```

Quan hệ kết nối / 연결 관계:
```
BrandPosApp (POS chính + Setup/Maintenance)
    │
    └──── Local DB (Config, Item, Table, Cust, v.v./등)
```
- Setup/Maintenance mode lưu cài đặt vào DB → POS mode đọc cài đặt từ DB
- └ Setup/Maintenance mode가 DB에 설정 저장 → POS mode가 DB에서 설정 읽기
- Không phụ thuộc ở cấp code (không tham chiếu dự án, không chia sẻ DLL)
- └ 코드 레벨 의존 없음 (프로젝트 참조 없음, DLL 공유 없음)
- `SharedKernel/` không phải thư mục triển khai DB để sao chép, chỉ chứa hợp đồng chung, tiện ích chung, hỗ trợ build
- └ `SharedKernel/`는 복사용 DB 구현 폴더가 아니라 공통 계약, 공통 유틸, 빌드 지원만 보관
- Triển khai theo domain (`OrderMgr`, `SaleMgr`, `Fooding`, v.v.) đặt bên trong BrandPosApp, tách theo mode khi cần
- └ 도메인별 구현(`OrderMgr`, `SaleMgr`, `Fooding` 등)은 BrandPosApp 내부에 두고, 필요 시 mode 단위로 분리한다

Lưu ý về phạm vi:
└ 범위 주의:

- Tài liệu này mô tả `BrandPosApp` như **Edge POS package** cài tại cửa hàng, bên trong có POS mode và Setup/Maintenance mode
- └ 이 문서는 `BrandPosApp`을 **매장 설치형 Edge POS 패키지**로 설명하며, 내부에 POS mode와 Setup/Maintenance mode가 함께 존재한다
- Các hệ thống quản trị đa chi nhánh, quản trị thương hiệu và Super Admin không được mô hình hóa trong repo này như phạm vi chính của tài liệu `01`
- └ 다지점 통합 운영, 브랜드 관리, 슈퍼관리자 시스템은 `01` 문서의 주 범위로 모델링하지 않는다

---

### 2.2 Cấu trúc Layer mục tiêu
└ 목표 레이어 구조

| Tầng | Trách nhiệm | Đối tượng bao gồm |
|------|------|------|
| `Presentation` | Màn hình, hosting trình duyệt, bridge UI theo CEF shell đơn | `PosUi/`, `Presentation/CEF/`, `AppHost/BrandPosHost/` |
| └ | └ 화면, 브라우저 호스팅, CEF 단일 셸 기준 UI 브릿지 | |
| `InternalBridge` | Định tuyến yêu cầu, xác thực tham số, định dạng phản hồi | `PosRequestResponder`, `PosRequestActions`, `PosRealTimeSender` |
| └ | └ 요청 라우팅, 파라미터 검증, 응답 포맷 | |
| `UseCases` | Điều phối use case, giao dịch, idempotency, khóa, hậu xử lý | `SelectTableUseCase`, `RefreshTablesUseCase`, `TransactionRunner`, `IdempotencyService` |
| └ | └ 유스케이스 오케스트레이션, 트랜잭션, 멱등성, 락, 후처리 | |
| `Domain/Manager` | Quy tắc nghiệp vụ, tính toán, thao tác dữ liệu | `TableManager`, `OrderMgr`, `SaleMgr`, `CustMgr`, `ItemMgr` |
| └ | └ 비즈니스 규칙, 계산, 데이터 조작 | |
| `Infrastructure` | Kết nối local DB, đồng bộ, liên kết bên ngoài, thiết bị, mạng, logging | `DBAccess`, `AdoWraper`, `ExternalBridge`, `Device`, `Network`, `Sync` |
| └ | └ 로컬 DB 연결, 동기화, 외부 연동, 장치, 네트워크, 로깅 | |

Nguyên tắc cơ bản của tài liệu này là luồng một chiều dưới đây.
└ 이 문서의 기본 원칙은 아래 단방향 흐름이다.

```text
UI / External Input (Đầu vào bên ngoài / 외부 입력)
  → InternalBridge
  → UseCases
  → Domain/Manager
  → Infrastructure
  → Chỉ hậu xử lý UI/ACK/thiết bị sau khi commit
    └ commit 이후에만 UI/ACK/장치 후처리
```

---

### 2.3 Cấu trúc thư mục tích hợp hiện tại (tiêu chuẩn theo cấu trúc repo hiện hành)
└ 현재 통합 디렉토리 구조 (현행 repo 기준)

Tiêu chuẩn cấu trúc thư mục của tài liệu này được cập nhật theo **cấu trúc repo hiện đang tồn tại**.
Các thư mục README placeholder hiện có cũng được coi là một phần của cấu trúc hiện hành.
└ 이 문서의 디렉토리 구조 기준은 **현재 실제 repo에 존재하는 구조**로 갱신한다.
└ 현재 존재하는 README placeholder 폴더도 현행 구조의 일부로 간주한다.

```text
Platform/                                                  # Thư mục gốc kho Git / Git 저장소 루트
├── BrandPosApp/                                            # Ứng dụng POS chính / POS 메인 프로그램
│   ├── BrandPosApp.sln                                     # Solution VS hiện행 / 현행 VS 솔루션
│   ├── README.md                                               # Ghi chú tầng gốc BrandPosApp / 루트 가이드
│   ├── BUILD_GUIDE.md                                          # Hướng dẫn build hiện행 / 현행 빌드 가이드
│   ├── AppHost/                                                # Host thực thi/bootstrap / 실행 호스트/부트스트랩
│   │   ├── Bootstrap/                                          # Thành phần lắp ráp service / 서비스 조립 계층
│   │   │   ├── AppCompositionRoot.cpp                          # Điểm ghép ứng dụng / 앱 조합 루트
│   │   │   ├── AppCompositionRoot.h                            # Header composition root / 조합 루트 헤더
│   │   │   ├── ServiceRegistry.h                               # Quy ước đăng ký service / 서비스 등록 규약
│   │   │   └── README.md                                       # Hướng dẫn thư mục bootstrap / 부트스트랩 설명
│   │   └── BrandPosHost/                                      # Host native hiện행 / 현재 네이티브 호스트
│   │       ├── BrandPosApp.vcxproj                              # Dự án thực thi POS hiện행 / 현행 POS 실행 프로젝트
│   │       ├── BrandPosApp.cpp                                  # Điểm vào WinMain / 앱 진입점 구현
│   │       ├── BrandPosApp.h                                    # Header điểm vào ứng dụng / 앱 진입점 헤더
│   │       ├── CefBootstrap.cpp                                # Bootstrap khởi tạo/tắt CEF / CEF 초기화/종료 부트스트랩
│   │       ├── CefBootstrap.h                                  # Header bootstrap CEF / CEF 부트스트랩 헤더
│   │       ├── resource.h                                      # Tài nguyên native / 네이티브 리소스 정의
│   │       └── README.md                                       # Ghi chú AppHost hiện행 / AppHost 설명
│   ├── Presentation/                                           # Tầng trình bày hiện행 / 현행 표현 계층
│   │   ├── CEF/                                                # Engine UI dựa trên CEF / CEF 기반 UI 엔진
│   │   │   ├── Handlers/                                       # Vòng đời/hosting CEF hiện행 / CEF 수명주기/호스팅
│   │   │   │   ├── CefAppHandler.h/cpp                         # Handler khởi tạo CEF / CEF 초기화 핸들러
│   │   │   │   ├── CefBrowserDlg.h/cpp                         # Host CEF hiện행 / 현행 CEF 호스트
│   │   │   │   ├── CefSchemeHandler.h/cpp                      # Ánh xạ app://pos/ / app://pos/ 스킴 매핑
│   │   │   │   ├── BrowserRecoveryManager.h/cpp                # Giám sát/phục hồi crash / 크래시 감시/복구
│   │   │   │   └── README.md                                   # Hướng dẫn handlers / 핸들러 설명
│   │   │   ├── InternalBridge/                                 # Cầu nối JS ↔ C++ hiện행 / JS ↔ C++ 내부 브릿지
│   │   │   │   ├── PosRequestResponder.h/cpp                   # Đầu vào request UI / UI 요청 수신 창구
│   │   │   │   ├── PosRealTimeSender.h/cpp                     # Phát sự kiện realtime / 실시간 이벤트 송신
│   │   │   │   ├── PosRequestActions/                          # Action routing hiện행 / 현재 액션 라우팅
│   │   │   │   │   ├── Table/                                  # Action bàn / 테이블 액션
│   │   │   │   │   │   ├── TableActions.h/cpp                  # Định tuyến request bàn / 테이블 요청 라우팅
│   │   │   │   │   │   ├── TableTypes.h                        # DTO request bàn / 테이블 요청 DTO
│   │   │   │   │   │   └── README.md                           # Ghi chú domain Table / 테이블 액션 설명
│   │   │   │   │   ├── System/                                 # Action hệ thống / 시스템 액션
│   │   │   │   │   │   ├── SystemActions.h/cpp                 # Định tuyến request hệ thống / 시스템 요청 라우팅
│   │   │   │   │   │   ├── SystemTypes.h                       # DTO request hệ thống / 시스템 요청 DTO
│   │   │   │   │   │   └── README.md                           # Ghi chú domain System / 시스템 액션 설명
│   │   │   │   │   ├── Order/README.md                         # Placeholder action 주문 / 주문 액션 placeholder
│   │   │   │   │   ├── Payment/README.md                       # Placeholder action 결제 / 결제 액션 placeholder
│   │   │   │   │   └── README.md                               # Ghi chú PosRequestActions / PosRequestActions 설명
│   │   │   │   └── README.md                                   # Ghi chú InternalBridge / InternalBridge 설명
│   │   │   ├── SDK/                                            # CEF SDK và binary / CEF SDK 및 바이너리
│   │   │   │   ├── include/                                    # Header CEF / CEF 헤더
│   │   │   │   ├── Release/                                    # Runtime CEF / CEF 런타임 파일
│   │   │   │   ├── Resources/                                  # Tài nguyên CEF / CEF 리소스 파일
│   │   │   │   └── libcef_dll_wrapper/                         # Wrapper CEF / CEF 래퍼 라이브러리
│   │   │   ├── Subprocess/                                     # Dự án renderer subprocess / 렌더러 서브프로세스
│   │   │   └── README.md                                       # Ghi chú Presentation/CEF / CEF 설명
│   │   └── README.md                                           # Ghi chú Presentation / Presentation 설명
│   ├── UseCases/                                               # Tầng use case hiện행 / 현행 유스케이스 계층
│   │   ├── Table/                                              # UseCase Table đã triển khai / 구현된 Table 유스케이스
│   │   │   ├── SelectTableUseCase.h/cpp                        # Use case chọn bàn / 테이블 선택 유스케이스
│   │   │   ├── RefreshTablesUseCase.h/cpp                      # Use case 조회/갱신 테이블 목록
│   │   │   └── README.md                                       # Ghi chú Table use cases / 테이블 유스케이스 설명
│   │   ├── SharedAssets/                                             # Thành phần chung use case / 유스케이스 공통 구성요소
│   │   │   ├── RequestContext.h                                # Context request / 요청 컨텍스트
│   │   │   ├── TransactionRunner.h/cpp                         # Wrapper giao dịch / 트랜잭션 래퍼
│   │   │   ├── OperationLockService.h/cpp                      # Khóa theo công việc / 작업 단위 락
│   │   │   ├── IdempotencyService.h/cpp                        # Kiểm tra idempotency / 멱등성 검사
│   │   │   ├── UseCaseResult.h                                 # Kết quả chuẩn use case / 유스케이스 표준 결과
│   │   │   └── README.md                                       # Ghi chú Shared / Shared 설명
│   │   ├── Order/README.md                                     # Placeholder use case 주문 / 주문 유스케이스 placeholder
│   │   ├── Payment/README.md                                   # Placeholder use case 결제 / 결제 유스케이스 placeholder
│   │   ├── Delivery/README.md                                  # Placeholder use case 배달 / 배달 유스케이스 placeholder
│   │   ├── System/README.md                                    # Placeholder use case 시스템 / 시스템 유스케이스 placeholder
│   │   └── README.md                                           # Ghi chú UseCases / UseCases 설명
│   ├── Domain/                                                 # Tầng domain/manager hiện행 / 현행 도메인/매니저 계층
│   │   ├── Table/                                              # Domain Table đã triển khai / 구현된 Table 도메인
│   │   │   ├── TableManager.h/cpp                                  # Manager nghiệp vụ bàn / 테이블 업무 매니저
│   │   │   └── README.md                                       # Ghi chú Table domain / 테이블 도메인 설명
│   │   ├── Order/README.md                                     # Placeholder domain 주문 / 주문 도메인 placeholder
│   │   ├── Payment/README.md                                   # Placeholder domain 결제 / 결제 도메인 placeholder
│   │   ├── Customer/README.md                                  # Placeholder domain 고객 / 고객 도메인 placeholder
│   │   ├── Item/README.md                                      # Placeholder domain 상품 / 상품 도메인 placeholder
│   │   ├── Staff/README.md                                     # Placeholder domain 직원 / 직원 도메인 placeholder
│   │   ├── Accounting/README.md                                # Placeholder domain 입출금 / 입출금 도메인 placeholder
│   │   ├── System/README.md                                    # Placeholder domain 시스템 / 시스템 도메인 placeholder
│   │   └── README.md                                           # Ghi chú Domain / Domain 설명
│   ├── Infrastructure/                                         # Tầng hạ tầng hiện행 / 현행 인프라 계층
│   │   ├── Persistence/                                        # Truy cập lưu trữ / 영속 저장소 접근 계층
│   │   │   └── MSSQL/                                          # Legacy MSSQL structure reflected from reverse engineering / 역설계를 반영한 레거시 MSSQL 구조
│   │   │       ├── DBAccess.h/cpp                              # Kết nối legacy MSSQL ADO / 레거시 MSSQL ADO 연결
│   │   │       ├── AdoWraper.h/cpp                             # Wrapper ADO / ADO 래퍼
│   │   │       ├── Core/                                       # Helper chung cho persistence / 공통 persistence helper
│   │   │       │   └── PersistenceCore.h/cpp                  # RecordsetReader, PagingQuery, AuditTrailBuilder
│   │   │       ├── Tables/                                     # File CRUD theo từng table vật lý / 물리 테이블별 CRUD 파일
│   │   │       │   ├── Table/                                  # Domain Table / 테이블 도메인
│   │   │       │   │   ├── TableCrud.h/cpp                     # Table record, columns, mapper, CRUD helper
│   │   │       │   │   └── TableStatusHistoryCrud.h/cpp       # Table status history CRUD helper
│   │   │       │   ├── Order/                                  # Domain Order / 주문 도메인
│   │   │       │   │   ├── OrderSlipCrud.h/cpp                 # Order slip CRUD helper
│   │   │       │   │   └── OrderItemCrud.h/cpp                 # Order item CRUD helper
│   │   │       │   ├── Payment/                                # Domain Payment / 결제 도메인
│   │   │       │   │   ├── SellSlipCrud.h/cpp                  # Sell slip CRUD helper
│   │   │       │   │   ├── SellDetailCrud.h/cpp                # Sell detail CRUD helper
│   │   │       │   │   ├── UserPaymentCrud.h/cpp               # User payment CRUD helper
│   │   │       │   │   └── WaitPaymentCrud.h/cpp               # Wait payment CRUD helper
│   │   │       │   ├── Customer/                               # Domain Customer / 고객 도메인
│   │   │       │   │   └── CustomerCrud.h/cpp                  # Customer CRUD helper
│   │   │       │   ├── Item/                                   # Domain Item / 상품 도메인
│   │   │       │   │   ├── ItemCrud.h/cpp                       # Item CRUD helper
│   │   │       │   │   └── ItemChangeLogCrud.h/cpp             # Item change log CRUD helper
│   │   │       │   └── System/                                 # Domain System / 시스템 도메인
│   │   │       │       ├── ClientConfigCrud.h/cpp              # Client config CRUD helper
│   │   │       │       ├── ConfigCrud.h/cpp                    # Config CRUD helper
│   │   │       │       └── StoreInfoCrud.h/cpp                 # Store info CRUD helper
│   │   │       ├── Migration/                                  # Quản lý migration schema / 스키마 마이그레이션
│   │   │       │   ├── DataBaseUpdate.h/cpp                    # Điểm vào migration / migration 진입점
│   │   │       │   ├── SchemaVersion.h/cpp                     # Quản lý phiên bản schema / 스키마 버전 관리
│   │   │       │   └── Versions/                               # Migration theo phiên bản / 버전별 migration
│   │   │       │       ├── V20250328_AddUserPayment.h/cpp      # UserPayment migration
│   │   │       │       └── V20251013_AddWaitPayment.h/cpp      # WaitPayment migration
│   │   │       ├── Stores/                                     # Store trạng thái vận hành / 운영 상태 Store
│   │   │       │   ├── RequestLedgerStore.h/cpp                # Store ledger idempotency / 멱등성 ledger store
│   │   │       │   ├── OutboxStore.h/cpp                       # Store outbox sync / outbox sync store
│   │   │       │   ├── SyncStateStore.h/cpp                    # Store trạng thái sync / sync 상태 store
│   │   │       │   └── README.md                               # Ghi chú Stores / Stores 설명
│   │   │       └── README.md                                   # Ghi chú legacy MSSQL persistence / 레거시 MSSQL persistence 설명
│   │   ├── ExternalBridge/                                     # Liên kết ngoài hiện행 / 현행 외부 연동
│   │   │   ├── Fooding/README.md                               # Placeholder Fooding bridge / Fooding bridge placeholder
│   │   │   ├── PaymentGateways/                                # Placeholder các gateway thanh toán / 결제 게이트웨이 placeholder
│   │   │   │   ├── BCCard/README.md
│   │   │   │   ├── BIDV/README.md
│   │   │   │   ├── HJVietPay/README.md
│   │   │   │   ├── Infoplus/README.md
│   │   │   │   ├── WeTax/README.md
│   │   │   │   └── ZaloPay/README.md
│   │   │   └── README.md                                       # Ghi chú ExternalBridge / ExternalBridge 설명
│   │   ├── Device/                                             # Thiết bị ngoại vi / 주변기기
│   │   │   ├── Printer/README.md                               # Placeholder máy in / 프린터 placeholder
│   │   │   ├── Scanner/README.md                               # Placeholder scanner / 스캐너 placeholder
│   │   │   ├── Scale/README.md                                 # Placeholder scale / 저울 placeholder
│   │   │   ├── CardReader/README.md                            # Placeholder card reader / 카드리더 placeholder
│   │   │   └── README.md                                       # Ghi chú Device / Device 설명
│   │   ├── Network/                                            # Mạng / 네트워크
│   │   │   ├── HTTP/README.md                                  # Placeholder giao tiếp HTTP/MQTT / HTTP/MQTT placeholder
│   │   │   └── README.md                                       # Ghi chú Network / Network 설명
│   │   ├── Observability/README.md                             # Placeholder log/crash / 로그/크래시 placeholder
│   │   ├── Sync/README.md                                      # Placeholder sync worker / sync worker placeholder
│   │   ├── Support/                                            # Hỗ trợ phi-UI / 비UI 지원 코드
│   │   │   ├── Utilz/README.md                                 # Tiện ích chung / 공통 유틸리티
│   │   │   ├── File/README.md                                  # Tiện ích file / 파일 유틸리티
│   │   │   ├── Excel/README.md                                 # Tiện ích Excel / 엑셀 유틸리티
│   │   │   └── README.md                                       # Ghi chú Support / Support 설명
│   │   └── README.md                                           # Ghi chú Infrastructure / Infrastructure 설명
│   └── Build/                                                  # Thư mục output build hiện có trong repo / repo에 존재하는 빌드 출력 디렉토리
│       ├── Build/README.md                                     # Ghi chú build runtime / 빌드 runtime 설명
│       ├── Build/locales/                                      # Thư mục copy locale cho C++ / C++ locale 복사 디렉토리
│       ├── PosUi/README.md                                     # Ghi chú copy UI output / UI output 설명
│       ├── PosUi/out/                                          # Đích copy build tĩnh PosUi / PosUi 정적 빌드 복사 대상
│       ├── Log/README.md                                       # Thư mục log / 로그 디렉토리 설명
│       └── README.md                                           # Ghi chú Build root / Build 루트 설명
│
├── PosUi/                                                      # UI Next.js + TypeScript chính / 메인 Next.js + TypeScript UI
│   ├── package.json                                            # Định nghĩa package / 패키지 정의
│   ├── package-lock.json                                       # Lockfile npm / npm lockfile
│   ├── next.config.js                                          # Cấu hình Next.js / Next.js 설정
│   ├── postcss.config.js                                       # Cấu hình PostCSS / PostCSS 설정
│   ├── tsconfig.json                                           # Bí danh đường dẫn TypeScript / TypeScript 경로 별칭
│   ├── README.md                                               # Ghi chú PosUi / PosUi 설명
│   ├── public/                                                 # Tài sản public / 퍼블릭 자산
│   │   └── fonts/                                              # Font runtime / 런타임 폰트
│   ├── src/                                                    # Mã nguồn frontend / 프론트엔드 소스
│   │   ├── app/                                                # App Router hiện행 / 현행 App Router
│   │   │   ├── layout.tsx                                      # Layout toàn cục / 전역 레이아웃
│   │   │   ├── page.tsx                                        # Trang gốc / 루트 페이지
│   │   │   ├── README.md                                       # Ghi chú app router / app router 설명
│   │   │   ├── design-system/                                  # Route catalog design system / 디자인 시스템 카탈로그 라우트
│   │   │   │   ├── layout.tsx                                  # Layout sidebar/preview / 사이드바/프리뷰 레이아웃
│   │   │   │   ├── page.tsx                                    # Trang chủ catalog / 카탈로그 홈
│   │   │   │   ├── README.md                                   # Ghi chú route design-system / design-system 라우트 설명
│   │   │   │   ├── components/                                 # Preview component / 컴포넌트 프리뷰
│   │   │   │   │   ├── ComponentPreviewClient.tsx              # Client preview component / 컴포넌트 프리뷰 클라이언트
│   │   │   │   │   └── README.md                               # Ghi chú components preview / components preview 설명
│   │   │   │   └── screens/                                    # Preview màn hình / 화면 프리뷰
│   │   │   │       ├── ScreenPreviewClient.tsx                 # Client preview màn hình / 화면 프리뷰 클라이언트
│   │   │   │       └── README.md                               # Ghi chú screens preview / screens preview 설명
│   │   │   └── pos/                                            # Route màn hình POS thực thi / 실제 POS 화면 라우트
│   │   │       ├── table/page.tsx                              # Route bàn / 테이블 라우트
│   │   │       ├── order/page.tsx                              # Route 주문 / 주문 라우트
│   │   │       └── payment/page.tsx                            # Route 결제 / 결제 라우트
│   │   ├── design-system/                                      # Thư viện UI/design system / UI 라이브러리/디자인 시스템
│   │   │   ├── tokens/                                         # Token thiết kế / 디자인 토큰
│   │   │   │   ├── colors.ts                                   # Token màu / 색상 토큰
│   │   │   │   ├── spacing.ts                                  # Token 간격 / 간격 토큰
│   │   │   │   └── README.md                                   # Ghi chú tokens / tokens 설명
│   │   │   ├── atoms/README.md                                 # Placeholder atoms
│   │   │   ├── molecules/README.md                             # Placeholder molecules
│   │   │   ├── organisms/                                      # Organism đã tạo / 생성된 organism
│   │   │   │   ├── TableCard.tsx                               # Thành phần 카드 bàn / 테이블 카드 컴포넌트
│   │   │   │   ├── MenuCard.tsx                                # Thành phần 카드 메뉴 / 메뉴 카드 컴포넌트
│   │   │   │   ├── OrderSidebar.tsx                            # Thành phần sidebar 주문 / 주문 사이드바 컴포넌트
│   │   │   │   ├── TakeoutBar.tsx                              # Thành phần 바 포장 / 포장 바 컴포넌트
│   │   │   │   └── README.md                                   # Ghi chú organisms / organisms 설명
│   │   │   ├── templates/README.md                             # Placeholder templates
│   │   │   ├── registry/README.md                              # Placeholder registry
│   │   │   └── README.md                                       # Ghi chú design-system / design-system 설명
│   │   ├── screens/                                            # Màn hình thực tế / 실제 화면 구현
│   │   │   ├── constants.ts                                    # Hằng số chung màn hình / 화면 공통 상수
│   │   │   ├── TableScreen/                                    # Màn hình bàn / 테이블 화면
│   │   │   │   ├── index.tsx                                   # Điểm vào TableScreen / TableScreen 진입점
│   │   │   │   ├── components/TableCard.tsx                    # Thành phần bàn hiện dùng / 현재 사용하는 테이블 카드
│   │   │   │   ├── components/README.md                        # Ghi chú components / components 설명
│   │   │   │   ├── hooks/README.md                             # Ghi chú hooks / hooks 설명
│   │   │   │   └── README.md                                   # Ghi chú TableScreen / TableScreen 설명
│   │   │   ├── OrderScreen/components/README.md                # Placeholder OrderScreen component
│   │   │   ├── OrderScreen/hooks/README.md                     # Placeholder OrderScreen hook
│   │   │   ├── OrderScreen/README.md                           # Placeholder OrderScreen
│   │   │   ├── PaymentScreen/components/README.md              # Placeholder PaymentScreen component
│   │   │   ├── PaymentScreen/hooks/README.md                   # Placeholder PaymentScreen hook
│   │   │   ├── PaymentScreen/README.md                         # Placeholder PaymentScreen
│   │   │   └── README.md                                       # Ghi chú screens / screens 설명
│   │   ├── store/                                              # Redux Toolkit + RTK Query store / Redux Toolkit + RTK Query 저장소
│   │   │   ├── index.ts                                        # Tạo store / store 생성
│   │   │   ├── rootReducer.ts                                  # Root reducer / 루트 리듀서
│   │   │   ├── README.md                                       # Ghi chú store / store 설명
│   │   │   ├── api/                                            # RTK Query API hiện행 / 현행 RTK Query API
│   │   │   │   ├── posApi.ts                                   # createApi gốc / 루트 createApi
│   │   │   │   ├── tableApi.ts                                 # Endpoint bàn / 테이블 endpoint
│   │   │   │   ├── orderApi.ts                                 # Endpoint 주문 / 주문 endpoint
│   │   │   │   ├── systemApi.ts                                # Endpoint 시스템 / 시스템 endpoint
│   │   │   │   ├── index.ts                                    # Re-export hook / 훅 re-export
│   │   │   │   └── README.md                                   # Ghi chú api / api 설명
│   │   │   └── slices/                                         # Slice UI / UI slice
│   │   │       ├── uiSlice.ts                                  # Slice UI chính / 주요 UI slice
│   │   │       └── README.md                                   # Ghi chú slices / slices 설명
│   │   ├── bridge/                                             # Transport C++ / C++ transport
│   │   │   ├── PosRequestSender.ts                             # Cửa sổ request UI → C++ / UI → C++ 요청 창구
│   │   │   ├── README.md                                       # Ghi chú bridge / bridge 설명
│   │   │   ├── adapters/                                       # Adapter transport / transport adapter
│   │   │   │   ├── cefTransport.ts                             # Transport CEF thực / 실제 CEF transport
│   │   │   │   ├── mockTransport.ts                            # Transport mock hiện dùng / 현재 사용하는 mock transport
│   │   │   │   └── README.md                                   # Ghi chú adapters / adapters 설명
│   │   │   ├── commands/README.md                              # Placeholder command imperative / imperative command placeholder
│   │   │   └── mocks/                                          # Mock data đang được mockTransport sử dụng / mockTransport가 사용하는 데이터
│   │   │       ├── README.md                                   # Ghi chú bridge mocks / bridge mocks 설명
│   │   │       └── screens/                                    # Mock theo màn hình / 화면별 mock 데이터
│   │   │           ├── table.json                              # Mock dữ liệu bàn / 테이블 mock 데이터
│   │   │           ├── menu.json                               # Mock dữ liệu 메뉴 / 메뉴 mock 데이터
│   │   │           └── README.md                               # Ghi chú screen mocks / screen mocks 설명
│   │   ├── mocks/                                              # Tầng mock/fixture dự phòng tách riêng / 분리형 mock/fixture 예비 계층
│   │   │   ├── README.md                                       # Ghi chú mocks / mocks 설명
│   │   │   ├── bridge/README.md                                # Placeholder bridge fixtures / bridge fixture placeholder
│   │   │   ├── screens/README.md                               # Placeholder screen fixtures / screen fixture placeholder
│   │   │   └── fixtures/README.md                              # Placeholder common fixtures / 공통 fixture placeholder
│   │   ├── i18n/                                               # Đa ngôn ngữ frontend / 프론트엔드 다국어
│   │   │   ├── index.ts                                        # Khởi tạo i18next / i18next 초기화
│   │   │   └── locales/                                        # Bản sao/link locale dùng runtime / 런타임 locale 복사본/링크
│   │   ├── providers/                                          # React provider / React provider
│   │   │   ├── StoreProvider.tsx                               # Provider Redux store
│   │   │   ├── PosRealTimeReceiver.tsx                         # Bộ nhận realtime event / 실시간 이벤트 수신기
│   │   │   └── README.md                                       # Ghi chú providers / providers 설명
│   │   ├── shared/README.md                                    # Placeholder shared UI / shared UI placeholder
│   │   └── styles/                                             # Tài sản style / 스타일 자산
│   │       ├── globals.css                                     # Style toàn cục / 전역 스타일
│   │       ├── README.md                                       # Ghi chú styles / styles 설명
│   │       └── tokens/                                         # Token style hiện행 / 현행 스타일 토큰
│   │           ├── colors.ts                                   # Token màu / 색상 토큰
│   │           ├── spacing.ts                                  # Token khoảng cách / 간격 토큰
│   │           └── README.md                                   # Ghi chú style tokens / 스타일 토큰 설명
│   └── out/                                                    # Kết quả build tĩnh / 정적 빌드 출력
│
├── BrandPosApp/PosUi/src/app/Setup/                            # UI cài đặt nội bộ / 설정 UI 내부 모드
├── BrandPosApp/PosUi/src/app/Maintenance/                      # UI bảo trì nội bộ / 유지보수 UI 내부 모드
│
├── SharedKernel/                                                  # Module C++ dùng chung / 공용 C++ 모듈
│   ├── Foundation/                                             # Tiện ích cơ sở / 공용 기초 유틸리티
│   ├── Contracts/                                              # Hợp đồng/DTO/hằng số / 공용 계약/DTO/상수
│   ├── Observability/                                          # Công cụ quan sát / 공용 관측성 도구
│   ├── Testing/                                                # Fixture/dummy test / 테스트 fixture/더미
│   └── BuildSupport/                                           # Hỗ trợ build/codegen / 빌드/codegen 지원
│
├── SharedAssets/                                                     # Tài sản runtime dùng chung / 공용 런타임 자산
│   └── i18n/                                                   # Tài sản đa ngôn ngữ gốc / 다국어 원본 자산
│       └── locales/                                            # Gốc locale / locale 루트
│           ├── ko/                                             # Locale tiếng Hàn / 한국어 locale
│           │   ├── common.json                                 # Bản dịch chung / 공통 번역
│           │   ├── table.json                                  # Bản dịch bàn / 테이블 번역
│           │   ├── order.json                                  # Bản dịch 주문 / 주문 번역
│           │   ├── payment.json                                # Bản dịch 결제 / 결제 번역
│           │   └── system.json                                 # Bản dịch 시스템 / 시스템 번역
│           ├── vi/                                             # Locale tiếng Việt / 베트남어 locale
│           └── en/                                             # Locale tiếng Anh / 영어 locale
│
└── Docs/                                                       # Thư mục tài liệu / 문서 루트
    └── Kế hoạch và Thiết kế/                                   # Tài liệu kế hoạch/thiết kế / 기획/설계 문서 폴더
```

### 2.4 Nguyên tắc áp dụng theo cấu trúc hiện hành
└ 현재 구조 반영 원칙

`2.3 Cấu trúc thư mục tích hợp hiện tại` ở trên là **cấu trúc tiêu chuẩn duy nhất của tài liệu tại thời điểm hiện tại**.
Nếu cấu trúc repo thay đổi, tài liệu cũng phải được cập nhật theo repo thực tế.
└ 위 `2.3 현재 통합 디렉토리 구조`가 **현 시점 문서의 유일한 기준 구조**다.
└ repo 구조가 바뀌면 문서도 실제 repo 기준으로 함께 갱신해야 한다.

- `AppHost/BrandPosHost/` hiện đang đóng vai trò native shell/bootstrap thực tế; chưa có `Presentation/Shell/` tách riêng
- └ 현재 실제 네이티브 셸/부트스트랩 역할은 `AppHost/BrandPosHost/`가 담당하며, 별도 `Presentation/Shell/`은 아직 없다
- `Presentation/CEF/Handlers/` hiện dùng `CefBrowserDlg` làm host CEF; tài liệu không giả định `CefBrowserHost` hay shell riêng nếu chưa tồn tại
- └ 현재 `Presentation/CEF/Handlers/`는 `CefBrowserDlg`를 CEF 호스트로 사용하며, 존재하지 않는 `CefBrowserHost`나 별도 셸을 문서에 가정하지 않는다
- Không duy trì thư mục UI legacy/MFC trong cấu trúc repo mục tiêu; nếu còn phát sinh tài sản tham chiếu thì phải tách sang tài liệu hoặc kho tham chiếu riêng
- └ 목표 repo 구조에는 레거시 UI/MFC 폴더를 유지하지 않으며, 참조용 자산이 필요하면 별도 문서나 참조 저장소로 분리한다
- `UseCases`, `Domain`, `Infrastructure/Sync`, `ExternalBridge`, `Device` hiện còn lẫn giữa phần đã triển khai và placeholder `README.md`; tài liệu phải ghi rõ trạng thái này
- └ `UseCases`, `Domain`, `Infrastructure/Sync`, `ExternalBridge`, `Device`는 구현 파일과 `README.md` placeholder가 혼재하므로, 문서도 그 상태를 명시한다
- Không tách đồng loạt thành `*Repository` theo từng Manager; chỉ dùng `*Store` cho trạng thái vận hành và giữ phần còn lại theo hướng Manager 중심
- └ `*Repository`를 Manager별로 전면 분리하지 않고, 운영 상태만 `*Store`로 분리하며 나머지는 Manager 중심으로 유지한다
- Những cấu phần chưa tồn tại nhưng được chốt là mở rộng bắt buộc kế tiếp như `Infrastructure/Persistence/SQLite/ReadModels/`, `Infrastructure/Persistence/SQLite/Stores/RecoveryStateStore`, `PosUi/src/bridge/contracts/` phải được ghi rõ trạng thái `planned`, không được viết như thể đã triển khai
- └ `Infrastructure/Persistence/SQLite/ReadModels/`, `Infrastructure/Persistence/SQLite/Stores/RecoveryStateStore`, `PosUi/src/bridge/contracts/`처럼 아직 없지만 다음 필수 확장으로 확정된 구조는 반드시 `planned` 상태로 명시하고, 구현 완료처럼 서술하지 않는다
- `PosUi/src/bridge/mocks/` là nguồn mock đang được `mockTransport` sử dụng; `PosUi/src/mocks/` hiện tồn tại như lớp fixture dự phòng riêng biệt
- └ `PosUi/src/bridge/mocks/`는 현재 `mockTransport`가 실제 사용하는 mock 소스이며, `PosUi/src/mocks/`는 분리형 fixture 예비 계층으로 존재한다
- Kết quả reverse engineering như catalog table, inventory SQL, owner matrix không nhúng trực tiếp vào tài liệu này; tài liệu chỉ cố định cấu trúc mã nguồn đã được phản ánh trong repo
- └ 테이블 카탈로그, SQL 인벤토리, owner 매트릭스 같은 역설계 결과표는 본문에 직접 넣지 않고, 현재 repo에 반영된 소스 구조만 문서에 고정한다

---

## 3. Tóm tắt vai trò từng thư mục
└ 폴더별 역할 요약

### 3.1 Tầng C++ (bên trong mỗi repository)
└ C++ 계층 (각 저장소 내부)

| Thư mục | Vai trò | Tính chất | Thay đổi |
|------|------|------|------|
| `DB/` | Truy cập legacy MSSQL, lớp Manager | Logic nghiệp vụ | Legacy reference only |
| └ | └ 레거시 MSSQL 접근, Manager 클래스 | └ 비즈니스 로직 | └ 참조 전용 |
| `CEF/SDK/` | Binary/thư viện CEF | UI engine | ★ Mới (tích hợp Cef/ gốc) |
| └ | └ CEF 바이너리/라이브러리 | └ UI 엔진 | └ ★ 신규 (기존 루트 Cef/ 통합) |
| `CEF/Handlers/` | Vận hành CEF (App, Browser, Scheme) | UI engine | ★ Mới |
| └ | └ CEF 구동 (App, Browser, Scheme) | └ UI 엔진 | └ ★ 신규 |
| `CEF/InternalBridge/` | PosRequestResponder(đầu vào) + PosRealTimeSender(đầu ra) + PosRequestActions/(phần thực thi) | UI engine | ★ Mới |
| └ | └ PosRequestResponder(입구) + PosRealTimeSender(출구) + PosRequestActions/(실행부) | └ UI 엔진 | └ ★ 신규 |
| `UseCases/` | Điều phối use case, ranh giới transaction, tính idempotent, quản lý lock | Tầng ứng dụng | ★ Mới |
| └ | └ 유스케이스 오케스트레이션, 트랜잭션 경계, 멱등성, 락 관리 | └ 응용 계층 | └ ★ 신규 |
| `Infrastructure/` | Lưu trữ SQLite local, Ledger/Outbox, Sync worker, trạng thái kết nối, observability, báo cáo crash | Tầng hạ tầng | ★ Mới |
| └ | └ SQLite 로컬 저장소, Ledger/Outbox 영속화, Sync worker, 연결 상태, 관측성, 크래시 리포팅 | └ 인프라 계층 | └ ★ 신규 |
| `ExternalBridge/Fooding/` | Giao tiếp Fooding MQTT | Liên kết bên ngoài | Di chuyển từ FoodingBridge/ |
| └ | └ Fooding MQTT 통신 | └ 외부 연동 | └ 기존 FoodingBridge/ 이동 |
| `ExternalBridge/PaymentGateways/` | API đối tác thanh toán (BCCard, ZaloPay, v.v.) | Liên kết bên ngoài | Tích hợp các thư mục phân tán |
| └ | └ 결제사 API (BCCard, ZaloPay 등) | └ 외부 연동 | └ 기존 흩어진 폴더 통합 |
| `Device/` | Máy in, máy quét, cân, đầu đọc thẻ | Thiết bị ngoại vi | Tách/tích hợp Print/CxCom |
| └ | └ 프린터, 스캐너, 저울, 카드리더기 | └ 주변기기 | └ 기존 Print/CxCom 분리·통합 |
| `Network/HTTP/` | MQTT client, giao tiếp web | Mạng | Di chuyển từ HTTP/ |
| └ | └ MQTT 클라이언트, 웹 통신 | └ 네트워크 | └ 기존 HTTP/ 이동 |
| `Common/` | Tiện ích phi UI, File I/O, Excel | Chung | Phần UI được hấp thụ vào PosUi design system / shared |
| └ | └ 비UI 유틸리티, 파일 I/O, 엑셀 | └ 공통 | └ UI 성격 코드는 PosUi design system / shared로 흡수 |

### 3.2 Frontend (Next.js + TypeScript)
└ 프론트엔드 (Next.js + TypeScript)

- Source UI chuẩn là TypeScript (`.ts` / `.tsx`); JavaScript chỉ còn dùng cho config/build output hoặc phần legacy tham chiếu khi thật sự cần
- └ UI 소스 표준은 TypeScript(`.ts` / `.tsx`)이며, JavaScript는 설정/빌드 출력 또는 꼭 필요한 레거시 참조에만 남긴다

| Thư mục | Vai trò | Thuộc về |
|------|------|------|
| `PosUi/` | POS UI chính (Next.js + TypeScript) | BrandPosApp |
| └ | └ POS 메인 UI (Next.js + TypeScript) | └ |
| `Setup/`, `Maintenance/` | UI cài đặt/bảo trì nội bộ | BrandPosApp |
| └ | └ 설정/유지보수 UI (내부 모드) | └ |

### 3.3 Khác
└ 기타

| Thư mục | Vai trò | Ghi chú |
|------|------|------|
| `CEF/SDK/` | Binary CEF | Quản lý tích hợp trong dự án |
| └ | └ CEF 바이너리 | └ 프로젝트 내 통합 관리 |
| `CEF/Subprocess/` | CEF renderer subprocess | Bên trong thư mục CEF |
| └ | └ CEF 렌더러 서브프로세스 | └ CEF 폴더 내부 |
| `Build/` | Output build | Build độc lập từng repository |
| └ | └ 빌드 출력 | └ 각 저장소 독립 빌드 |

### 3.4 Tái định nghĩa SharedKernel / Shared
└ SharedKernel / Shared 재정의

`SharedKernel/` không phải thư mục sao chép đơn giản mà được phân chia tính chất như sau.
└ `SharedKernel/`는 단순 복사용 폴더가 아니라 아래와 같이 성격을 나눈다.

```text
SharedKernel/
├── Foundation/          # CString util, đối tượng kết quả chung, thời gian/UUID / CString 유틸, 공통 결과 객체, 시간/UUID
├── Contracts/           # Envelope, DTO, mã lỗi, hằng số chung / Envelope, DTO, 에러 코드, 공통 상수
├── Observability/       # Giao diện logging, correlation helpers / 로깅 인터페이스, correlation helpers
├── Testing/             # Dummy, sample payload, contract fixtures / 더미, 샘플 payload, contract fixtures
└── BuildSupport/        # Script sao chép/đồng bộ, codegen, schema validator / 복사/동기화 스크립트, codegen, schema validator
```

Nguyên tắc:
└ 원칙:
- `SharedKernel/Foundation` có thể được tham chiếu từ cả POS mode lẫn Setup/Maintenance mode trong BrandPosApp
- └ `SharedKernel/Foundation`은 BrandPosApp의 POS mode와 Setup/Maintenance mode 어디서나 참조 가능
- `SharedContracts` là nguồn gốc hợp đồng chung của tầng UI bridge và UseCases
- └ `SharedContracts`는 UI 브릿지와 UseCases 계층의 공통 계약 원본
- Không đặt triển khai theo domain của `DB/Manager`, `ExternalBridge` vào `SharedKernel/`
- └ `DB/Manager`, `ExternalBridge`의 도메인별 구현은 `SharedKernel/`에 넣지 않는다
- `SharedAssets/` chỉ lưu trữ tài sản runtime như i18n, tài nguyên tĩnh, JSON dùng chung
- └ `SharedAssets/`는 i18n, 정적 리소스, 공용 JSON 같은 런타임 자산만 보관한다

### 3.5 Quy tắc file bên trong `Infrastructure/Persistence`
└ `Infrastructure/Persistence` 하위 파일 규칙

Các thư mục dưới `Persistence/` không chỉ tồn tại ở cấp tên; phải cố định quy tắc file theo vai trò rõ ràng.
└ `Persistence/` 아래 폴더는 이름만 두지 않고, 역할별 파일 규칙까지 고정해야 한다.

#### `Core/`
└ `Core/`

- Chứa các helper dùng chung cho persistence.
- └ persistence에서 공통으로 쓰는 helper를 둔다.
- Mỗi helper dùng chung một file header/cpp theo vai trò.
- └ 공통 helper는 역할별로 header/cpp 파일을 둔다.
- Quy tắc tên file:
- └ 파일명 규칙:
  - `PersistenceCore.h/cpp`

#### `Tables/`
└ `Tables/`

- Chứa **file CRUD theo từng table vật lý**.
- └ **물리 테이블 단위 CRUD 파일**을 둔다.
- Mỗi table vật lý một cặp file `*Crud.h/cpp`.
- └ 물리 테이블 단위로 `*Crud.h/cpp` 한 쌍을 둔다.
- Một file `*Crud.h/cpp` có thể gộp:
- └ 하나의 `*Crud.h/cpp` 파일은 다음을 함께 가질 수 있다.
  - struct record vật lý / 물리 row struct
  - hằng số cột / 컬럼 상수
  - mapper recordset / recordset 매퍼
  - helper CRUD / CRUD helper
- Quy tắc tên file:
- └ 파일명 규칙:
  - `Table/TableCrud.h/cpp`
  - `Table/TableStatusHistoryCrud.h/cpp`
  - `Order/OrderSlipCrud.h/cpp`
  - `Order/OrderItemCrud.h/cpp`
  - `Payment/SellSlipCrud.h/cpp`
  - `Payment/SellDetailCrud.h/cpp`
  - `Payment/WaitPaymentCrud.h/cpp`
  - `Payment/UserPaymentCrud.h/cpp`
  - `Customer/CustomerCrud.h/cpp`
  - `Item/ItemCrud.h/cpp`
  - `Item/ItemChangeLogCrud.h/cpp`
  - `System/ClientConfigCrud.h/cpp`
  - `System/ConfigCrud.h/cpp`
  - `System/StoreInfoCrud.h/cpp`
- Quy tắc tăng trưởng:
- └ 성장 규칙:
  - Tích hợp record/columns/mapper/CRUD trong một cặp `*Crud.h/cpp` chỉ là mặc định ban đầu
  - └ `*Crud.h/cpp` 한 쌍 안에 record/columns/mapper/CRUD를 함께 두는 것은 초기 기본값일 뿐이다
  - Nếu file vượt khoảng 400~500 dòng, hoặc bắt đầu chứa nhiều truy vấn join/list/aggregate cho hơn một màn hình, phải tách phần đọc sang `ReadModels/`
  - └ 파일이 대략 400~500줄을 넘기거나, 둘 이상의 화면을 위한 join/list/aggregate 조회가 들어가기 시작하면 읽기 로직을 `ReadModels/`로 분리해야 한다

#### `ReadModels/`
└ `ReadModels/`

- Chứa **truy vấn đọc ghép nhiều table vật lý** dùng cho danh sách, tìm kiếm, tổng hợp, dashboard, bootstrap màn hình
- └ **여러 물리 테이블을 조인하는 읽기 전용 조회**를 두며, 목록/검색/집계/대시보드/화면 bootstrap에 사용한다
- `ReadModels/` không thay thế `Tables/*Crud`; nó chỉ nhận phần đọc phức hợp vốn không phù hợp trong CRUD đơn table
- └ `ReadModels/`는 `Tables/*Crud`를 대체하지 않으며, 단일 테이블 CRUD에 맞지 않는 복합 조회만 가져간다
- Quy tắc tên file:
- └ 파일명 규칙:
  - `Table/TableListReadModel.h/cpp`
  - `Table/FloorSummaryReadModel.h/cpp`
  - `Order/OrderDetailReadModel.h/cpp`
  - `Payment/PendingPaymentReadModel.h/cpp`
  - `System/BootstrapReadModel.h/cpp`
- Quy tắc trách nhiệm:
- └ 책임 규칙:
  - Chỉ `SELECT`, không `INSERT/UPDATE/DELETE`
  - └ `SELECT`만 가지며 `INSERT/UPDATE/DELETE`는 넣지 않는다
  - Có thể trả DTO đọc riêng thay vì record vật lý 1:1
  - └ 물리 row 1:1이 아닌 읽기 전용 DTO를 반환할 수 있다

#### `Migration/`
└ `Migration/`

- Chứa code nâng cấp schema/version DB
- └ DB schema/version 업그레이드 코드를 둔다
- Quy tắc tên file:
- └ 파일명 규칙:
  - `DataBaseUpdate.h/cpp`
  - `SchemaVersion.h/cpp`
  - `Versions/V20250328_AddUserPayment.h/cpp`
  - `Versions/V20251013_AddWaitPayment.h/cpp`

#### `Stores/`
└ `Stores/`

- Chỉ chứa store cho trạng thái vận hành cần tách khỏi Manager
- └ Manager에서 분리해야 하는 운영 상태용 store만 둔다
- Quy tắc tên file:
- └ 파일명 규칙:
  - `RequestLedgerStore.h/cpp`
  - `OutboxStore.h/cpp`
  - `SyncStateStore.h/cpp`
  - `RecoveryStateStore.h/cpp`

#### Quy tắc cấm
└ 금지 규칙

- Không tạo `Schema.cpp`
- └ `Schema.cpp` 파일을 만들지 않는다
- Không trộn nhiều table không liên quan vào một file `Rows`/`Mappers`
- └ 관련 없는 여러 테이블을 하나의 `Rows`/`Mappers` 파일에 섞지 않는다
- Không để SQL string rải rác lại trong `UseCases`, `ExternalBridge`, `PosRequestActions`
- └ SQL 문자열을 다시 `UseCases`, `ExternalBridge`, `PosRequestActions`에 흩뿌리지 않는다
- Không nhét truy vấn join/list/aggregate dài hạn vào `*Crud.h/cpp`; chuyển sang `ReadModels/`
- └ 장기적으로 유지할 join/list/aggregate 조회를 `*Crud.h/cpp`에 계속 넣지 말고 `ReadModels/`로 이동한다
- Không tạo `TableRepository`, `OrderRepository`, `PaymentRepository`
- └ `TableRepository`, `OrderRepository`, `PaymentRepository`는 만들지 않는다

---

## 4. Quy tắc thư mục PosUi
└ PosUi 폴더 규칙

### 4.1 Quy tắc phân tách Design System / Mockup / Màn hình thực tế
└ 디자인 시스템 / 목업 / 실제 화면 분리 규칙

`PosUi` phân tách 3 phần sau.
└ `PosUi`는 아래 3가지를 분리한다.

- `src/design-system/`: Thư viện UI thuần túy. Lưu trữ atoms/molecules/organisms/templates và design token
- └ 순수 UI 라이브러리. atoms/molecules/organisms/templates와 디자인 토큰을 보관한다
- `src/app/design-system/`: Route catalog/preview mở trực tiếp trên trình duyệt. Có sidebar bên trái và vùng xem trước bên phải
- └ 브라우저에서 직접 띄우는 카탈로그/프리뷰 라우트. 좌측 사이드바와 우측 미리보기 영역을 가진다
- `src/screens/`: Màn hình sản phẩm thực tế. Triển khai màn hình cuối cùng tổ hợp các component design system
- └ 실제 제품 화면. 디자인 시스템 컴포넌트를 조합한 최종 화면 구현이다

Nguyên tắc:
└ 원칙:

- Catalog design system được cung cấp từ route `app/design-system/`
- └ 디자인 시스템 카탈로그는 `app/design-system/` 라우트에서 제공한다
- Các component dùng chung trong catalog sử dụng nguyên bản triển khai thực tế từ `src/design-system/`
- └ 카탈로그에서 보는 공용 컴포넌트는 `src/design-system/`의 실제 구현을 그대로 사용한다
- Xem trước toàn bộ màn hình trong catalog sử dụng nguyên component màn hình thực tế từ `src/screens/`
- └ 카탈로그에서 보는 화면 전체 미리보기는 `src/screens/`의 실제 화면 컴포넌트를 그대로 사용한다
- Không tạo lại "màn hình giả" riêng cho Mock. Hiện tại chỉ thay đổi dữ liệu bằng `src/bridge/mocks/` và `mockTransport`, đồng thời giữ `src/mocks/` như tầng fixture dự phòng
- └ Mock 전용으로 별도 "가짜 화면"을 다시 만들지 않는다. 현재는 `src/bridge/mocks/`와 `mockTransport`로 데이터만 바꾸고, `src/mocks/`는 예비 fixture 계층으로 유지한다
- Ngay cả trong giai đoạn thiết kế trước khi tích hợp C++/CEF, cũng render trong trình duyệt với cấu trúc giống ứng dụng thực tế nhất có thể
- └ C++/CEF 연동 전 디자인 작업 단계에서도 브라우저 안에서 실제 앱과 최대한 같은 구조로 렌더링한다

### 4.2 Quy tắc thư mục Screen
└ Screen 폴더 규칙

Mỗi thư mục Screen được duy trì như **tầng tổ hợp UI tự hoàn chỉnh**, tách giao tiếp dữ liệu và nguồn design system ra tầng bên ngoài.
└ 각 Screen 폴더는 **자기완결형 UI 조합 계층**으로 유지하고, 데이터 통신과 디자인 시스템 원본은 바깥 계층으로 분리한다.

Các thành phần chuyên dụng cho màn hình được chứa bên trong:
└ 해당 화면에 필요한 화면 전용 구성요소는 내부에 포함한다:

```
screens/TableScreen/
├── index.tsx          # Điểm vào screen (component chính) / 스크린 진입점 (메인 컴포넌트)
├── hooks/             # Custom hook chỉ dùng trong screen này / 이 스크린에서만 사용하는 커스텀 훅
├── components/        # UI component chỉ dùng trong screen này / 이 스크린에서만 사용하는 UI 컴포넌트
└── constants.ts       # Hằng số của screen này (kích thước grid, khoảng timer, v.v.) / 이 스크린의 상수 (그리드 크기, 타이머 간격 등)
```

- Các UI component dùng chung ở nhiều screen được đặt tại `design-system/` hoặc `shared/`
- └ 여러 스크린에서 공통으로 쓰이는 UI 컴포넌트는 `design-system/` 또는 `shared/`에 배치
- Trạng thái server do RTK Query trong `store/api/` quản lý, Redux slice chỉ quản lý **trạng thái client** tại `store/slices/`
- └ 서버 상태는 `store/api/`의 RTK Query가 관리하고, Redux slice는 `store/slices/`에서 **클라이언트 상태만** 관리한다
- `hooks/` bên trong Screen chỉ chứa hook UI chuyên dụng cho màn hình. Không đặt hook data fetching/transport
- └ Screen 내부 `hooks/`는 화면 전용 UI 훅만 둔다. 데이터 fetching/transport 훅은 두지 않는다
- Transport giao tiếp C++ được quản lý tập trung tại `bridge/`, Screen không biết trực tiếp `window.cefQuery`
- └ C++ 통신 transport는 `bridge/`에 중앙 관리하고, Screen은 직접 `window.cefQuery`를 모른다

### 4.3 Quy tắc quyền sở hữu trạng thái Redux Toolkit
└ Redux Toolkit 상태 소유권 규칙

Dữ liệu được phân tách thành **Trạng thái server (Server State)** và **Trạng thái client (Client State)** theo tính chất.
└ 데이터는 성격에 따라 **서버 상태(Server State)** 와 **클라이언트 상태(Client State)** 로 분리한다.

#### Trạng thái server → RTK Query quản lý
└ 서버 상태 → RTK Query가 관리

- Dữ liệu được lưu trong DB và truy vấn qua `PosRequestSender` hoặc API bên ngoài lấy **RTK Query cache làm nguồn gốc**
- └ DB에 저장되어 있고 `PosRequestSender` 또는 외부 API를 통해 조회되는 데이터는 **RTK Query 캐시가 원본**이다
- Ví dụ:
- └ 예:
  - Danh sách bàn / 테이블 목록
  - Chi tiết đơn hàng / 주문 상세
  - Trạng thái thanh toán / 결제 상태
  - Kết quả truy vấn khách hàng/sản phẩm/cài đặt / 고객/상품/설정 조회 결과
- Nguyên tắc:
- └ 원칙:
  - Không sao chép kết quả truy vấn lại vào Redux slice dưới dạng `dispatch(saveData(...))`
  - └ 조회 결과를 `dispatch(saveData(...))` 형태로 Redux slice에 다시 복사하지 않는다
  - Dù cần dùng cùng dữ liệu ở nhiều màn hình vẫn **gọi lại cùng query hook**
  - └ 같은 데이터를 여러 화면에서 써야 해도 **같은 query hook을 다시 호출**한다
  - RTK Query tái sử dụng cache nên không thực hiện trùng lặp yêu cầu network/bridge
  - └ RTK Query는 캐시를 재사용하므로 네트워크/bridge 요청을 중복 수행하지 않는다
  - Khi cần xử lý dữ liệu, ưu tiên dùng `selectFromResult` hoặc selector để trích xuất phần cần thiết từ cache
  - └ 데이터 가공이 필요하면 `selectFromResult` 또는 selector로 캐시에서 필요한 조각만 추출한다

#### Trạng thái client → Redux Slice quản lý
└ 클라이언트 상태 → Redux Slice가 관리

- Trạng thái UI toàn cục chỉ có ý nghĩa trong bộ nhớ trình duyệt, không liên quan đến server, do slice quản lý
- └ 서버와 무관하게 브라우저 메모리 안에서만 의미가 있는 전역 UI 상태는 slice가 관리한다
- Ví dụ:
- └ 예:
  - `isProcessing`
  - Modal/toast đang mở / 현재 열린 모달/토스트
  - Tab/filter đang chọn / 선택 중인 탭/필터
  - Giá trị form tạm thời đang nhập / 입력 중인 임시 폼 값
  - Hiển thị modal lỗi thiết bị / 장치 에러 모달 표시 여부

#### Quy tắc cấm
└ 금지 규칙

- Cấm cấu trúc chuyển kết quả truy vấn RTK Query sang slice bằng `extraReducers`
- └ RTK Query 조회 결과를 `extraReducers`로 slice에 다시 옮겨 담는 구조 금지
- Cấm cấu trúc lưu trùng lặp cùng dữ liệu server trong RTK Query cache và Redux slice
- └ RTK Query 캐시와 Redux slice에 같은 서버 데이터를 중복 저장하는 구조 금지
- Cấm cấu trúc mà con người phải tự phán đoán "bên nào là nguồn gốc mới nhất"
- └ "어느 쪽이 최신 원본인가"를 사람이 판단해야 하는 구조 금지

#### Phương thức triển khai khuyến nghị
└ 권장 구현 방식

- `PosUi/src/store/api/posApi.ts` chỉ chịu trách nhiệm `createApi` gốc của RTK Query
- └ `PosUi/src/store/api/posApi.ts`는 RTK Query의 루트 `createApi`만 담당한다
- Hiện tại `tableApi.ts`, `orderApi.ts`, `systemApi.ts` được tách theo phương thức `posApi.injectEndpoints(...)`; các domain khác sẽ mở rộng theo cùng nguyên tắc khi file thực sự được tạo
- └ 현재는 `tableApi.ts`, `orderApi.ts`, `systemApi.ts`를 `posApi.injectEndpoints(...)` 방식으로 분리하고 있으며, 다른 도메인은 실제 파일이 생성될 때 같은 규칙으로 확장한다
- `PosUi/src/store/api/index.ts` re-export hook theo domain
- └ `PosUi/src/store/api/index.ts`는 도메인별 hook을 re-export 한다
- RTK Query `baseQuery` hoặc `queryFn` sử dụng `PosUi/src/bridge/PosRequestSender.ts` làm transport cấp thấp
- └ RTK Query `baseQuery` 또는 `queryFn`은 `PosUi/src/bridge/PosRequestSender.ts`를 저수준 transport로 사용한다
- Dữ liệu truy vấn được component đăng ký trực tiếp bằng hook dạng `useQuery` từ `store/api/*Api.ts`
- └ 조회성 데이터는 컴포넌트가 `store/api/*Api.ts`의 `useQuery` 계열 훅으로 직접 구독한다
- Thao tác thay đổi sử dụng `useMutation` hoặc command wrapper, sau khi thành công cập nhật RTK Query cache bằng `invalidateTags` hoặc `updateQueryData`
- └ 변경 작업은 `useMutation` 또는 command wrapper를 사용하고, 성공 후 RTK Query 캐시를 `invalidateTags` 또는 `updateQueryData`로 갱신한다
- Slice chỉ duy trì trạng thái UI và trạng thái tương tác local
- └ slice는 오직 UI 상태와 로컬 상호작용 상태만 유지한다

Nguyên tắc một dòng:
└ 한 줄 원칙:

> Giao dữ liệu server cho RTK Query cache, chỉ giữ trạng thái UI trong Redux slice.
> └ 서버 데이터는 RTK Query 캐시에 맡기고, Redux slice에는 UI 상태만 남긴다.

### 4.4 Quy tắc Offline-First + lấy SQLite local làm trung tâm
└ Offline-First + 로컬 SQLite 중심 규칙

**Nguồn dữ liệu nghiệp vụ thực tế** của POS này không phải server internet mà là **SQLite local bên trong thiết bị POS của khách hàng**.
Do đó, ngay cả khi offline, nghiệp vụ cốt lõi phải hoạt động bình thường dựa trên SQLite local.
└ 이 POS의 **실질적인 업무 데이터 원본**은 인터넷 서버가 아니라 **고객사 POS 기기 내부의 로컬 SQLite**이다.
└ 따라서 오프라인 상태에서도 핵심 업무는 로컬 SQLite 기준으로 정상 동작해야 한다.

#### Nguyên tắc
└ 원칙

- Nguồn truy vấn ưu tiên là đường dẫn `PosRequestSender → C++ → SQLite local` thay vì API remote
- └ 조회의 원본은 가능하면 원격 API가 아니라 `PosRequestSender → C++ → 로컬 SQLite` 경로다
- Thay đổi đơn hàng/thanh toán/bàn **ưu tiên commit SQLite local trước khi gửi remote**
- └ 주문/결제/테이블 변경은 **원격 전송보다 로컬 SQLite 커밋이 먼저**다
- Hệ thống bên ngoài (MQTT, trụ sở, đối tác giao hàng, đối tác thanh toán) không phải nguồn nghiệp vụ mà là **đối tượng đồng bộ hậu kỳ**
- └ 외부 시스템(MQTT, 본사, 배달사, 결제사)은 업무 원본이 아니라 **후행 동기화 대상**이다
- Lưu local thành công và đồng bộ remote thành công không có cùng ý nghĩa
- └ 로컬 저장 성공과 원격 동기화 성공은 같은 의미가 아니다
- Phục hồi offline dựa trên **SQLite local + Ledger + Outbox** chứ không phải RTK Query cache
- └ 오프라인 복구는 RTK Query 캐시가 아니라 **로컬 SQLite + Ledger + Outbox**를 기준으로 수행한다
- Lỗi internet có thể là `degraded mode`, nhưng lỗi SQLite local được xem là ngừng nghiệp vụ cốt lõi
- └ 인터넷 장애는 `degraded mode`일 수 있지만, 로컬 SQLite 장애는 핵심 업무 중단으로 본다

#### Tiêu chí đánh giá nghiệp vụ thành công
└ 업무 성공 판정 기준

- Thay đổi trạng thái bàn, tạo đơn hàng, thanh toán tiền mặt, xuất local được đánh giá thành công khi **commit transaction local thành công**
- └ 테이블 상태 변경, 주문 생성, 현금 결제, 로컬 출력은 **로컬 트랜잭션 커밋 성공** 시 업무 성공으로 판정한다
- **Dữ liệu đồng bộ với server online trung tâm** được nạp vào `Outbox` sau commit, UI hiển thị riêng trạng thái `SYNC_PENDING` hoặc `SYNC_FAILED_RETRYING`
- └ **중앙 온라인 서버 동기화 대상**은 커밋 후 `Outbox`에 적재하고, UI에는 `SYNC_PENDING` 또는 `SYNC_FAILED_RETRYING` 상태를 별도로 표시한다
- **Các tác vụ mà giao dịch bên ngoài thời gian thực là bản chất** như thanh toán cần phê duyệt bên ngoài (thẻ/QR), phê duyệt/thay đổi trạng thái thời gian thực từ app giao hàng, không phải đối tượng cho phép offline
- └ 카드/QR처럼 외부 승인이 본질인 결제, 배달앱 실시간 승인/상태변경처럼 **실시간 외부 거래가 본질인 작업**은 오프라인 허용 대상이 아니다
- Các giao dịch bên ngoài thời gian thực trên khi offline, `UseCases` chặn ngay từ đầu vào, và sau khi phục hồi online cũng không tự động tái thực hiện yêu cầu cũ
- └ 위 실시간 외부 거래는 오프라인 시 `UseCases`가 진입 자체를 차단하며, 온라인 복구 후에도 과거 요청을 자동 재실행하지 않는다

#### Phân tách trạng thái kết nối
└ 연결 상태 분리

Online/offline không phải một bool duy nhất mà phải được xử lý như các trạng thái riêng lẻ như bên dưới.
└ 온라인/오프라인은 하나의 bool이 아니라 아래처럼 개별 상태로 다뤄야 한다.

- `dbConnected`
- `internetConnected`
- `mqttConnected`
- `paymentGatewayConnected`
- `printerConnected`
- `syncBacklogCount`

UI hiển thị khóa chức năng/cảnh báo dựa trên trạng thái này, và quyền cho phép cuối cùng do `UseCases` đảm bảo.
└ UI는 이 상태를 기반으로 기능 잠금/경고를 표시하고, 최종 허용 여부는 `UseCases`가 보장한다.

### 4.5 DB 엔진 전환 (MSSQL → SQLite)
└ Chuyển đổi DB engine (MSSQL → SQLite)

- Edge POS 신규 로컬 DB 엔진은 **SQLite**다. 레거시 HJ-POS-TEST는 MSSQL을 사용한다.
- └ DB engine local mới của Edge POS là **SQLite**. Legacy HJ-POS-TEST sử dụng MSSQL.
- 기존 매장 도입 시 **레거시 MSSQL 전체 데이터를 SQLite로 일회성 마이그레이션**한다 (마스터, 거래이력, 설정 등 95개+ 테이블 전부).
- └ Khi triển khai tại cửa hàng hiện có, **toàn bộ dữ liệu MSSQL legacy được migration một lần sang SQLite** (master, lịch sử giao dịch, cấu hình, v.v. — toàn bộ 95+ bảng).
- `Infrastructure/Persistence/MSSQL/` 코드는 마이그레이션 과도기용이며, 최종적으로 `Infrastructure/Persistence/SQLite/`로 교체된다.
- └ Code trong `Infrastructure/Persistence/MSSQL/` chỉ dành cho giai đoạn chuyển đổi, cuối cùng sẽ được thay thế bằng `Infrastructure/Persistence/SQLite/`.
- 중앙 서버 DB는 PostgreSQL로 변경 없음.
- └ DB server trung tâm là PostgreSQL, không thay đổi.

Không được làm:
└ 금지:
- Sử dụng cú pháp SQL chuyên dụng MSSQL (TOP, NOLOCK, v.v.) trong code mới / 신규 코드에서 MSSQL 전용 SQL 문법 (TOP, NOLOCK 등) 사용
- Thiết kế bảng mới theo schema MSSQL / 신규 테이블을 MSSQL 스키마로 설계

### 4.6 Chiến lược offline RTK Query
└ RTK Query 오프라인 전략

Dự án này **chỉ sử dụng RTK Query** cho tầng query. Không sử dụng song song React Query.
└ 이 프로젝트는 query 계층을 **RTK Query 하나로만** 사용한다. React Query는 병행 사용하지 않는다.

#### Vai trò của RTK Query
└ RTK Query의 역할

- **Tầng cache kết quả truy vấn nghiệp vụ** đọc từ SQLite local
- └ 로컬 SQLite에서 읽어온 **업무 조회 결과의 캐시 계층**
- **Model đọc màn hình** chịu trách nhiệm invalidate/cập nhật một phần sau khi nhận sự kiện thời gian thực
- └ 실시간 이벤트 수신 후 무효화/부분 업데이트를 담당하는 **화면 읽기 모델**
- **Model đọc trạng thái vận hành** như trạng thái đồng bộ, số backlog, thời điểm sync cuối
- └ 동기화 상태, backlog 수, 마지막 sync 시각 같은 **운영 상태 읽기 모델**

#### Quy tắc transport
└ transport 규칙

- `posApi.ts` là API gốc chỉ chứa `baseQuery/tagTypes` chung
- └ `posApi.ts`는 공통 `baseQuery/tagTypes`만 가진 루트 API다
- Hiện tại `tableApi.ts`, `orderApi.ts`, `systemApi.ts` đăng ký query/mutation theo domain bằng `injectEndpoints()`; `paymentApi.ts`, `syncApi.ts` là hướng mở rộng kế tiếp chứ chưa tồn tại trong repo hiện행
- └ 현재는 `tableApi.ts`, `orderApi.ts`, `systemApi.ts`가 `injectEndpoints()`로 도메인별 query/mutation을 등록하며, `paymentApi.ts`, `syncApi.ts`는 차기 확장 방향이지 아직 repo에는 없다
- RTK Query `baseQuery` hoặc `queryFn` sử dụng `PosRequestSender.ts` làm transport thay vì `fetch`
- └ RTK Query `baseQuery` 또는 `queryFn`은 `fetch` 대신 `PosRequestSender.ts`를 transport로 사용한다
- `PosRequestSender.ts` chọn transport phù hợp với môi trường giữa `bridge/adapters/cefTransport.ts` và `bridge/adapters/mockTransport.ts` bên trong
- └ `PosRequestSender.ts`는 내부에서 `bridge/adapters/cefTransport.ts`와 `bridge/adapters/mockTransport.ts` 중 환경에 맞는 transport를 선택한다
- Do đó `useQuery` ưu tiên truy vấn **bridge local + SQLite local** hoặc mock transport thay vì internet
- └ 따라서 `useQuery`는 인터넷이 아니라 **로컬 브릿지 + 로컬 SQLite** 또는 mock transport를 우선 조회한다
- `refetchOnReconnect` không chỉ dựa vào sự kiện mạng trình duyệt, mà sử dụng kết hợp với sự kiện trạng thái kết nối được tính toán bởi `ConnectivityService`
- └ `refetchOnReconnect`는 브라우저 네트워크 이벤트에만 기대지 않고, `ConnectivityService`에서 계산한 연결 상태 이벤트와 함께 사용한다

#### Chiến lược truy vấn
└ 조회 전략

- Các hook truy vấn như `useGetTablesQuery`, `useGetOrderQuery`, `useGetPaymentStatusQuery` cache kết quả truy vấn SQLite local
- └ `useGetTablesQuery`, `useGetOrderQuery`, `useGetPaymentStatusQuery` 같은 조회성 훅은 로컬 SQLite 조회 결과를 캐시한다
- Dù gọi cùng query hook ở nhiều màn hình, yêu cầu bridge/DB được tái sử dụng theo chính sách cache
- └ 같은 query hook을 여러 화면에서 호출해도 bridge/DB 요청은 캐시 정책에 따라 재사용된다
- Ưu tiên sử dụng `selectFromResult` để component chỉ dùng các field cần thiết
- └ 컴포넌트가 필요한 필드만 쓰도록 `selectFromResult`를 우선 사용한다

#### Chiến lược thay đổi
└ 변경 전략

- Các tác vụ lệnh như tạo/sửa/thanh toán gọi `UseCases` thông qua `useMutation` hoặc command wrapper từ `bridge/commands/`
- └ 생성/수정/결제 같은 명령성 작업은 `useMutation` 또는 `bridge/commands/`의 command wrapper로 `UseCases`를 호출한다
- `UseCases` xác nhận **dữ liệu nghiệp vụ + Ledger + Outbox** bằng transaction local trước
- └ `UseCases`는 **업무 데이터 + Ledger + Outbox**를 로컬 트랜잭션으로 먼저 확정한다
- Sau phản hồi thành công, RTK Query cập nhật cache màn hình bằng `invalidateTags` hoặc `updateQueryData`
- └ 성공 응답 후 RTK Query는 `invalidateTags` 또는 `updateQueryData`로 화면 캐시를 갱신한다
- RTK Query cache persistence là tùy chọn, có cũng chỉ **để cải thiện tốc độ khởi động**, không phải căn cứ cho chiến lược phục hồi
- └ RTK Query cache persistence는 선택 사항이며, 있어도 **부팅 속도 개선용**일 뿐 복구 전략의 근거가 아니다

#### Phạm vi Outbox
└ Outbox 범위

- `Outbox` chỉ nạp **dữ liệu đồng bộ có thể gửi đến server online trung tâm**
- └ `Outbox`는 **중앙 온라인 서버로 송출 가능한 동기화 데이터**만 적재한다
- Ví dụ:
- └ 예:
  - Upload tổng hợp doanh thu/đơn hàng / 매출/주문 집계 업로드
  - Lịch sử giao dịch để báo cáo trụ sở / 본사 보고용 거래 내역
  - Log thay đổi để đồng bộ / 동기화용 변경 로그
- Các mục sau đây không phải đối tượng nạp vào `Outbox`:
- └ 아래 항목은 `Outbox` 적재 대상이 아니다:
  - Yêu cầu phê duyệt/hủy thẻ / 카드 승인/취소 요청
  - Yêu cầu phê duyệt thanh toán QR / QR 결제 승인 요청
  - Chấp nhận/từ chối/thay đổi trạng thái đơn hàng thời gian thực từ app giao hàng / 배달앱 실시간 주문 수락/거절/상태 변경
- Các tác vụ này **chỉ có thể thực hiện khi online**, khi thất bại cần quy trình vận hành riêng hoặc xử lý thủ công thay vì hàng đợi tái gửi tự động
- └ 이런 작업은 **온라인 시점에만 실행 가능**하며, 실패 시 자동 재전송 큐가 아니라 별도 운영 절차 또는 수동 정리가 필요하다

#### Chiến lược sự kiện thời gian thực
└ 실시간 이벤트 전략

- `PosRealTimeReceiver` invalidate/update RTK Query cache theo loại sự kiện
- └ `PosRealTimeReceiver`는 이벤트 타입에 따라 RTK Query 캐시를 invalidate/update 한다
- Các sự kiện như `SYNC_STATUS_CHANGED`, `OUTBOX_BACKLOG_CHANGED`, `PAYMENT_COMPLETE`, `TABLE_REFRESH` được cập nhật theo cache tag
- └ `SYNC_STATUS_CHANGED`, `OUTBOX_BACKLOG_CHANGED`, `PAYMENT_COMPLETE`, `TABLE_REFRESH` 같은 이벤트는 cache tag 기준으로 갱신한다
- Slice chỉ duy trì **trạng thái UI** như `isProcessing`, trạng thái mở modal, tab đã chọn
- └ slice는 `isProcessing`, 모달 열림 여부, 선택 탭 같은 **UI 상태만** 유지한다

#### Quy tắc cấm
└ 금지 규칙

- Cấm sao chép kết quả RTK Query lại vào slice
- └ RTK Query 결과를 slice로 다시 복사 저장 금지
- Cấm sử dụng RTK Query cache làm nguồn phục hồi nghiệp vụ
- └ RTK Query 캐시를 업무 복구 소스로 사용하는 것 금지
- Cấm chỉ dùng `navigator.onLine` để phán đoán online/offline
- └ `navigator.onLine`만으로 온라인/오프라인 판단 금지
- Cấm coi kết quả đồng bộ remote thành công tương đương với kết quả giao dịch local thành công
- └ 원격 sync 성공 여부를 로컬 거래 성공 여부와 같은 것으로 취급 금지
- Cấm tạo bản sao UI riêng trong catalog design system rồi phân nhánh với triển khai `screens/` thực tế
- └ 디자인 시스템 카탈로그 안에서 별도 UI 사본을 만들어 실제 `screens/` 구현과 분기시키는 것 금지

---

## 5. Cấu trúc thư mục CEF / UseCases / ExternalBridge
└ CEF / UseCases / ExternalBridge 폴더 구조

### 5.1 Thư mục CEF — UI engine + bridge nội bộ
└ CEF 폴더 — UI 엔진 + 내부 브릿지

CEF không phải thư viện đơn giản mà là **'trái tim (UI Engine)'** của POS nên tập hợp code liên quan vào một nơi:
└ CEF는 단순한 라이브러리가 아니라 POS의 **'심장(UI Engine)'**이므로 관련 코드를 한곳에 모음:

```
CEF/
├── SDK/                    # Binary CEF (lib, dll, header) / CEF 바이너리 (lib, dll, 헤더)
├── Handlers/               # Logic vận hành CEF / CEF 구동 로직
│   ├── CefAppHandler       #   Khởi tạo app, BrowserProcessHandler / 앱 초기화, BrowserProcessHandler
│   ├── CefBrowserDlg       #   Host CEF hiện행 / 현행 CEF 호스트
│   ├── CefSchemeHandler    #   Ánh xạ file local app://pos/ / app://pos/ 로컬 파일 매핑
│   └── BrowserRecoveryManager
└── InternalBridge/            # Giao tiếp nội bộ JS ↔ C++ / JS ↔ C++ 내부 통신
    ├── PosRequestResponder     #   [Đầu vào] Nhận và phân luồng yêu cầu UI (Router) / [입구] UI 요청 수신 및 분기 (Router)
    ├── PosRealTimeSender      #   [Đầu ra] Gửi sự kiện thời gian thực đến UI (Broadcaster) / [출구] UI 실시간 이벤트 송출 (Broadcaster)
    └── PosRequestActions/     #   [Phần thực thi] Logic chi tiết theo domain / [실행부] 도메인별 상세 로직
        ├── Table/             #     TableActions + TableTypes đã tồn tại / 현재 구현됨
        ├── System/            #     SystemActions + SystemTypes đã tồn tại / 현재 구현됨
        ├── Order/README.md    #     Placeholder action 주문
        └── Payment/README.md  #     Placeholder action 결제
```

### 5.2 Thư mục UseCases — Bộ điều phối use case
└ UseCases 폴더 — 유스케이스 조정자

`PosRequestActions/` được duy trì như thin router, và **trách nhiệm điều phối use case** gộp nhiều Manager/thiết bị/phản hồi bên ngoài được tập trung vào `UseCases/`.
└ `PosRequestActions/`는 얇은 라우터로 유지하고, 여러 Manager/장치/외부 응답을 묶는 **유스케이스 조정 책임**은 `UseCases/`에 집중시킨다.

```
UseCases/
├── Table/                  # SelectTableUseCase, RefreshTablesUseCase đã tồn tại / 현재 구현됨
├── SharedAssets/                 # RequestContext, TransactionRunner, OperationLockService, IdempotencyService, UseCaseResult
├── Order/README.md         # Placeholder use case 주문
├── Payment/README.md       # Placeholder use case 결제
├── Delivery/README.md      # Placeholder use case 배달
├── System/README.md        # Placeholder use case 시스템
└── README.md               # Ghi chú tầng UseCases / UseCases 계층 설명
```

**Trách nhiệm của UseCases:**
└ **UseCases의 책임:**
- Thực thi một yêu cầu theo đơn vị một use case / 하나의 요청을 하나의 use case 단위로 실행
- Điều phối thứ tự gọi nhiều Manager / 여러 Manager 호출 순서 조정
- Kiểm tra idempotency và tái sử dụng phản hồi trùng lặp / 멱등성 체크 및 중복 응답 재사용
- Phân biệt ranh giới transaction và hậu xử lý / 트랜잭션 경계와 후처리 구분
- Quyết định payload sự kiện UI và gọi `PosRealTimeSender` / UI 이벤트 payload 결정 및 `PosRealTimeSender` 호출
- Quyết định tác vụ hậu xử lý ghi vào Ledger/Outbox / Ledger/Outbox에 기록할 후처리 작업 결정

### 5.3 Thư mục ExternalBridge — Kết nối với thế giới bên ngoài
└ ExternalBridge 폴더 — 외부 세계와의 연결

Đảm nhận vai trò **'nhà ngoại giao'** giao tiếp với bên ngoài POS (internet, server bên thứ ba):
└ POS 외부(인터넷, 타사 서버)와 대화하는 **'외교관'** 역할 전담:

```
ExternalBridge/
├── Fooding/README.md       # Placeholder liên kết Fooding MQTT / Fooding MQTT placeholder
├── PaymentGateways/        # Placeholder gateway thanh toán / 결제 게이트웨이 placeholder
│   ├── BCCard/README.md
│   ├── HJVietPay/README.md
│   ├── Infoplus/README.md
│   ├── ZaloPay/README.md
│   ├── BIDV/README.md
│   └── WeTax/README.md
└── README.md               # Ghi chú ExternalBridge / ExternalBridge 설명
```

---

## 6. Quy tắc tham chiếu giữa các layer
└ 레이어 간 참조 규칙

### 6.1 Actions → UseCases một chiều
└ Actions → UseCases 단방향

`PosRequestActions/` chỉ đảm nhận **routing/kiểm tra tham số/định dạng phản hồi**.
Việc thực thi use case phải chuyển cho `UseCases/`.
└ `PosRequestActions/`는 **라우팅/파라미터 검증/응답 포맷팅**만 담당한다.
└ 실제 유스케이스 실행은 반드시 `UseCases/`로 넘긴다.

| | Ví dụ | Phán định |
|---|---|---|
| **Cấm** | `#include "../Table/TableActions.h"` trong `OrderActions.cpp` | Cấm phụ thuộc trực tiếp giữa các Action |
| └ **금지** | └ `OrderActions.cpp`에서 `#include "../Table/TableActions.h"` | └ Action 간 직접 의존 금지 |
| **Cấm** | Gọi trực tiếp `g_SellSlipMgr->AddSellSlip()` trong `PaymentActions.cpp` | Action sẽ phình to nếu mang cả trách nhiệm thực thi use case |
| └ **금지** | └ `PaymentActions.cpp`에서 `g_SellSlipMgr->AddSellSlip()` 직접 호출 | └ Action이 유스케이스 실행 책임까지 가지면 비대해짐 |
| **Cho phép** | Gọi `ExecutePaymentUseCase::Run(...)` trong `PaymentActions.cpp` | Action chỉ thực hiện vai trò router |
| └ **허용** | └ `PaymentActions.cpp`에서 `ExecutePaymentUseCase::Run(...)` 호출 | └ Action은 라우터 역할만 수행 |

### 6.2 UseCases → Manager / Infra một chiều
└ UseCases → Manager / Infra 단방향

Chỉ `UseCases/` có thể tổ hợp nhiều Manager.
Ngoài ra, **quyền quyết định sự kiện UI và quyền gọi `PosRealTimeSender` chỉ thuộc về `UseCases/`.**
└ `UseCases/`만 여러 Manager를 조합할 수 있다.
└ 또한 **UI 이벤트 결정과 `PosRealTimeSender` 호출 권한은 `UseCases/`만 가진다.**

| | Ví dụ | Phán định |
|---|---|---|
| **Cho phép** | `ExecutePaymentUseCase` → `SaleMgr`, `OrderMgr`, `RequestLedgerStore`, `OutboxStore`, `PosRealTimeSender` | Điều phối một use case |
| └ **허용** | └ | └ 하나의 유스케이스 조정 |
| **Cấm** | `TableManager` → Gọi lại `ExecutePaymentUseCase` | Cấm tầng dưới gọi tầng trên |
| └ **금지** | └ `TableManager` → `ExecutePaymentUseCase` 재호출 | └ 하위 계층이 상위 계층 호출 금지 |
| **Cấm** | `Manager` gọi UI trực tiếp mà không qua `PosRealTimeSender` | Cấm phân tán đường gửi UI |
| └ **금지** | └ `Manager`가 `PosRealTimeSender` 없이 직접 UI 호출 | └ UI 송신 경로 분산 금지 |

### 6.3 ExternalBridge → UseCases một chiều
└ ExternalBridge → UseCases 단방향

Module liên kết bên ngoài chỉ parse sự kiện bên ngoài và chuyển cho `UseCases/`.
`ExternalBridge/` không trực tiếp lưu DB, gửi UI, hay xác nhận thanh toán.
└ 외부 연동 모듈은 외부 이벤트를 파싱하고 `UseCases/`에 전달만 한다.
└ `ExternalBridge/`가 직접 DB 저장, UI 송신, 결제 확정을 수행하지 않는다.

### 6.4 Điểm mạnh thiết kế
└ 설계 강점

- **Tự hoàn chỉnh**: Chỉ cần xem thư mục `PosRequestActions/Table/` là nắm được "có những yêu cầu liên quan đến bàn nào từ UI, và C++ parse như thế nào"
- └ **자기완결성**: `PosRequestActions/Table/` 폴더만 보면 "UI에서 테이블 관련 요청이 뭐가 있고, C++에서 어떻게 파싱하는지" 한눈에 파악
- **Tách biệt an toàn**: `ExternalBridge/`(internet bên ngoài), `UseCases/`(use case), `CEF/InternalBridge/`(UI nội bộ) được tách theo vai trò
- └ **안전한 분리**: `ExternalBridge/`(외부 인터넷), `UseCases/`(유스케이스), `CEF/InternalBridge/`(내부 UI)가 역할별로 분리
- **Dễ mở rộng**: Khi thêm domain mới, mở rộng `PosRequestActions/` + `UseCases/` + `Manager` theo cùng trục tên
- └ **확장 용이**: 새 도메인 추가 시 `PosRequestActions/` + `UseCases/` + `Manager`를 같은 이름 축으로 확장
- **Tốc độ compile**: File theo domain duy trì 300~500 dòng, khi sửa một file không cần recompile toàn bộ
- └ **컴파일 속도**: 도메인별 파일이 300~500줄로 유지되어, 한 파일 수정 시 전체 재컴파일 불필요

### 6.5 Tóm tắt trách nhiệm theo tầng
└ 계층별 책임 요약

#### PosRequestActions

- Parse yêu cầu / 요청 파싱
- Kiểm tra field bắt buộc / 필수 필드 검증
- Gọi `UseCases` / `UseCases` 호출
- Tạo phản hồi chuẩn / 표준 응답 생성

Không được làm:
└ 하지 말 것:
- Gọi nhiều Manager / 여러 Manager 호출
- Điều khiển transaction / 트랜잭션 제어
- Quản lý lock / 락 관리
- Thực thi SQL trực tiếp / 직접 SQL 실행

#### UseCases

- Bắt đầu/kết thúc use case / 유스케이스 시작/종료
- Kiểm tra `requestId`, `idempotencyKey` / `requestId`, `idempotencyKey` 검사
- Lấy lock theo đơn vị tác vụ / 작업 단위 락 획득
- Thực thi transaction / 트랜잭션 실행
- Gọi nhiều Manager khi cần / 필요 시 여러 Manager 호출
- Cập nhật `RequestLedgerStore`, `OutboxStore` / `RequestLedgerStore`, `OutboxStore` 갱신
- Tách biệt thực thi sự kiện/ACK/in ấn sau commit / 커밋 후 이벤트/ACK/인쇄 분리 실행
- Quyết định payload sự kiện UI và gọi `PosRealTimeSender` / UI 이벤트 payload 결정 및 `PosRealTimeSender` 호출

#### Manager

- Tính toán nghiệp vụ thuần túy / 순수 업무 계산
- Tạo/sửa DB row / DB row 생성/수정
- Tính toán trạng thái domain / 도메인 상태 계산
- Trả về kết quả domain để chuyển cho `UseCases` / `UseCases`에 전달할 도메인 결과 반환
- Không biết UI/liên kết bên ngoài nếu có thể / 가능한 한 UI/외부 연동을 모름
- Hoạt động trên nền `Infrastructure/Persistence/SQLite` (legacy: `MSSQL`) mà không cần Repository toàn diện theo domain / 도메인별 전면 Repository 없이 `Infrastructure/Persistence/SQLite` (레거시: `MSSQL`) 기반으로 동작

Không được làm:
└ 하지 말 것:
- Gọi trực tiếp `PosRealTimeSender` / `PosRealTimeSender` 직접 호출
- Quyết định việc gửi sync ACK server trung tâm / đồng bộ hậu kỳ / 중앙 서버 sync ACK / 후행 동기화 발송 여부 결정
- Quyết định trực tiếp trạng thái chuyển trình duyệt/màn hình / 브라우저/화면 전환 상태 직접 결정

#### Persistence / Store

- `Infrastructure/Persistence/SQLite`가 신규 공통 DB 연결과 영속화 기반이다. `Infrastructure/Persistence/MSSQL`은 레거시 호환/마이그레이션 과도기용이다
- └ `Infrastructure/Persistence/SQLite` là nền tảng kết nối DB chung và lưu trữ bền vững mới. `Infrastructure/Persistence/MSSQL` là tương thích legacy / giai đoạn chuyển đổi
- Bên trong persistence, kết quả reverse engineering phải được cố định thành các thư mục `Core/`, `Tables/`, `Migration/`, `Stores/`
- └ persistence 내부는 역설계 결과를 `Core/`, `Tables/`, `Migration/`, `Stores/` 구조로 정착시켜야 한다
- Tài liệu này không ghi trực tiếp kết quả reverse engineering chi tiết; nó chỉ định nghĩa nơi các kết quả đó sẽ được hiện thực thành code
- └ 이 문서는 상세 역설계 결과를 직접 담지 않고, 그 결과가 코드로 구현될 위치만 정의한다
- `RequestLedgerStore`, `OutboxStore`, `SyncStateStore` chỉ tách trạng thái bền vững cho vận hành
- └ `RequestLedgerStore`, `OutboxStore`, `SyncStateStore`는 운영용 영속 상태만 분리
- Không triển khai toàn diện Repository theo domain như `TableRepository`, `OrderRepository`, `PaymentRepository`
- └ `TableRepository`, `OrderRepository`, `PaymentRepository` 같은 도메인별 Repository는 전면 도입하지 않음

Không được làm:
└ 하지 말 것:
- Không tạo tầng `*Repository` tương ứng cho từng Manager
- └ Manager마다 대응되는 `*Repository` 계층을 새로 만들지 않는다
- Không tách trùng lặp Manager và Repository để trừu tượng hóa CRUD đơn giản
- └ 단순 CRUD 추상화를 위해 Manager와 Repository를 중복 분리하지 않는다

#### ExternalBridge

- Xác thực/kiểm tra payload bên ngoài / 외부 payload 인증/검증
- Chuyển đổi định dạng bên ngoài sang DTO nội bộ / 외부 포맷을 내부 DTO로 변환
- Gọi `UseCases` / `UseCases` 호출

Không được làm:
└ 하지 말 것:
- Thực thi SQL trực tiếp / 직접 SQL 실행
- Gửi UI trực tiếp / 직접 UI 송신
- Quyết định tùy tiện trạng thái xác nhận đơn hàng/thanh toán / 주문/결제 확정 상태 임의 결정

---

## 7. Quy tắc migration MFC Dialog
└ MFC Dialog 마이그레이션 규칙

### 7.1 Ánh xạ tách code (Migration Map)
└ 코드 분리 매핑 (Migration Map)

Code bị trộn lẫn trong một MFC Dialog(.cpp) được **tách ra 4 nơi**.
└ 기존 MFC Dialog(.cpp) 하나에 뒤섞여 있던 코드를 **4곳으로 분리**한다.

| Nội dung code MFC hiện tại | Đích di chuyển | Vai trò |
|-------------------|----------|------|
| Layout UI, thiết kế nút, vẽ Grid | `PosUi/src/design-system/` + `PosUi/src/screens/` (Next.js) | Tạo UI dùng chung và tổ hợp màn hình thực tế |
| └ UI 레이아웃, 버튼 디자인, Grid 그리기 | └ | └ 공용 UI를 만들고 실제 화면을 조합함 |
| Logic phân nhánh khi click nút (`OnBnClicked...`) | `CEF/InternalBridge/PosRequestActions/` (C++) | Nhận yêu cầu JS và quyết định gửi đến Use Case nào |
| └ 버튼 클릭 시 실행되는 분기 로직 (`OnBnClicked...`) | └ | └ JS 요청을 받아 어느 Use Case로 보낼지 결정 |
| Điều phối use case, transaction, idempotency, lock, hậu xử lý | `UseCases/` (C++) | Điều phối nhiều Manager/thiết bị/bridge thành một đơn vị tác vụ |
| └ 유스케이스 조정, 트랜잭션, 멱등성, 락, 후처리 | └ | └ 여러 Manager/장치/브릿지를 하나의 작업 단위로 조정 |
| Query DB thực tế, tính tiền, xử lý dữ liệu | `DB/` (lớp Manager) | Xử lý và lưu dữ liệu thực tế |
| └ 실제 DB 쿼리, 금액 계산, 데이터 처리 | └ `DB/` (Manager 클래스) | └ 데이터를 실질적으로 처리하고 저장 |

### 7.2 Chiến lược thực hiện 4 giai đoạn migration
└ 마이그레이션 4단계 실행 전략

Các skill khuyến nghị bên dưới dựa trên tên Codex skill, được ưu tiên sử dụng để nâng cao hiệu quả công việc, chất lượng code, hiệu suất và mức hoàn thiện vận hành ở mỗi giai đoạn.
└ 아래 추천 스킬은 Codex skill 이름 기준이며, 각 단계에서 작업 효율·코드 품질·성능·운영 완성도를 높이는 데 우선적으로 활용한다.

**Giai đoạn 1: Tách UI (Next.js)** `Skill khuyến nghị: ui-ux-pro-max, adapt, harden, optimize`
└ **1단계: UI 분리 (Next.js)** `추천 스킬: ui-ux-pro-max, adapt, harden, optimize`
- Khuyến nghị thực hiện trước: Cài đặt design context dự án 1 lần bằng `teach-impeccable`
- └ 선행 권장: `teach-impeccable`로 프로젝트 디자인 컨텍스트 1회 설정
- Tái cấu trúc màn hình từ MFC resource editor sang Tailwind CSS + Next.js
- └ 기존 MFC 리소스 편집기의 화면을 Tailwind CSS + Next.js로 재구성
- UI dùng chung xây dựng trước tại `design-system/`, kiểm tra dưới dạng catalog tại route `app/design-system/`
- └ 공용 UI는 `design-system/`에 먼저 구축하고, `app/design-system/` 라우트에서 카탈로그 형태로 검증
- Màn hình thực tế (`screens/`) triển khai bằng cách tổ hợp component design system, preview cũng tái sử dụng cùng component màn hình
- └ 실제 화면(`screens/`)은 디자인 시스템 컴포넌트를 조합해서 구현하고, 프리뷰에서도 같은 화면 컴포넌트를 재사용
- Kết nối để khi click nút gọi wrapper cefQuery của `bridge/PosRequestSender.ts`
- └ 버튼 클릭 시 `bridge/PosRequestSender.ts`의 cefQuery 래퍼를 호출하도록 연결
- Logic phòng thủ: Vào trạng thái `isProcessing` ngay khi click nút (áp dụng quy tắc 7.5)
- └ 방어 로직: 버튼 클릭 즉시 `isProcessing` 상태 진입 (7.5 규칙 적용)

**Giai đoạn 2: Tạo bridge (Actions)** `Skill khuyến nghị: code-analyzer, javascript-pro, harden, requesting-code-review`
└ **2단계: 브릿지 생성 (Actions)** `추천 스킬: code-analyzer, javascript-pro, harden, requesting-code-review`
- Tạo thư mục chuyên dụng cho màn hình bên trong `InternalBridge/PosRequestActions/` (ví dụ: `Table/`)
- └ `InternalBridge/PosRequestActions/` 안에 해당 화면 전용 폴더 생성 (예: `Table/`)
- Chỉ di chuyển **logic routing quyết định "ai sẽ thực hiện việc này"** từ MFC `OnBnClicked...()`
- └ 기존 MFC `OnBnClicked...()` 중 **"누가 이 일을 할 것인가"를 결정하는 라우팅 로직**만 이동
- **Quy tắc**: Không viết SQL trực tiếp trong Actions, phải gọi `UseCases/`
- └ **규칙**: Actions에서 직접 SQL을 쓰지 않고, 반드시 `UseCases/`를 호출

**Giai đoạn 3: Trích xuất use case (UseCases)** `Skill khuyến nghị: code-analyzer, database-design, harden, requesting-code-review`
└ **3단계: 유스케이스 추출 (UseCases)** `추천 스킬: code-analyzer, database-design, harden, requesting-code-review`
- Di chuyển điều khiển thứ tự tác vụ trong code Dialog/liên kết bên ngoài sang `UseCases/`
- └ 기존 Dialog/외부연동 코드 안의 작업 순서 제어를 `UseCases/`로 이동
- Tích hợp tiêu chí idempotency, transaction, lock, gửi sự kiện hậu kỳ tại tầng này
- └ 멱등성, 트랜잭션, 락, 후속 이벤트 발송 기준을 이 계층에서 통합

**Giai đoạn 4: Chỉnh lý logic nghiệp vụ (DB/Manager)** `Skill khuyến nghị: sql-optimization, database-design, security, requesting-code-review`
└ **4단계: 비즈니스 로직 정리 (DB/Manager)** `추천 스킬: sql-optimization, database-design, security, requesting-code-review`
- Di chuyển query `INSERT`, `UPDATE` viết trực tiếp trong source Dialog sang hàm thành viên của lớp Manager tương ứng
- └ 기존 Dialog 소스 안에 직접 작성된 `INSERT`, `UPDATE` 쿼리를 해당 Manager 클래스의 멤버 함수로 이동
- **Lợi ích**: Tái sử dụng an toàn cùng logic bất kể UI là Next.js hay kiosk trong tương lai
- └ **이점**: UI가 Next.js든, 향후 키오스크든 상관없이 동일 로직을 안전하게 재사용

### 7.3 Ví dụ migration: Click bàn
└ 마이그레이션 예시: 테이블 클릭

**Trước đây (MFC):**
└ **과거 (MFC):**
```
TableDlg.cpp → Phát hiện click → Kết nối DB trực tiếp → Thay đổi trạng thái bàn → Redraw Grid trực tiếp
└ TableDlg.cpp → 클릭 감지 → 직접 DB 연결 → 테이블 상태 변경 → 직접 Grid 리드로우
```

**Sau chuyển đổi:**
└ **전환 후:**
```
[1] TableScreen/index.tsx    Người dùng click bàn → posQuery("SELECT_TABLE", {id: 1})
                              └ 사용자 테이블 클릭 → posQuery("SELECT_TABLE", {id: 1})
          ↓
[2] TableActions.cpp          Nhận yêu cầu → Kiểm tra tham số → SelectTableUseCase::Run(1)
                              └ 요청 수신 → 파라미터 검증 → SelectTableUseCase::Run(1)
          ↓
[3] SelectTableUseCase.cpp    Phán đoán lock/hậu xử lý → g_TableManager->SelectTable(1)
                              └ 락/후처리 판단 → g_TableManager->SelectTable(1)
          ↓
[4] TableManager.cpp              Thực hiện cập nhật DB → Trả về thành công
                              └ DB 업데이트 수행 → 성공 리턴
          ↓
[5] SelectTableUseCase.cpp    Gửi sự kiện qua PosRealTimeSender khi cần
                              └ 필요 시 PosRealTimeSender로 이벤트 발송
          ↓
[6] TableActions.cpp          Trả về phản hồi JSON thành công
                              └ 성공 JSON 응답 반환
```

### 7.4 Thứ tự migration và lưu ý
└ 마이그레이션 순서 및 주의사항

- **Ưu tiên 3 màn hình cốt lõi**: Migration theo thứ tự bàn → đơn hàng → thanh toán
- └ **핵심 3개 화면 우선**: 테이블 → 주문 → 결제 순서로 마이그레이션
- Trong quá trình này, **quy cách chuẩn** của `PosRequestActions/` + `UseCases/` được xác lập
- └ 이 과정에서 `PosRequestActions/` + `UseCases/`의 **표준 규격**이 확립됨
- 108 Dialog còn lại được chuyển đổi **từng cái một dần dần** theo tiêu chuẩn đã xác lập
- └ 나머지 108개 Dialog는 확립된 표준에 맞춰 **하나씩 점진적으로** 전환
- **Không làm cùng lúc** — nhưng khi từng màn hình hoàn tất chuyển sang CEF, mã MFC UI tương ứng phải bị xóa khỏi nhánh sản phẩm
- └ **한꺼번에 하지 않는다** — 다만 각 화면의 CEF 전환이 끝나면 해당 MFC UI 코드는 제품 브랜치에서 제거한다
- **Rollback** được thực hiện bằng việc quay về gói phát hành CEF trước đó, không chuyển sang nhánh UI cũ
- └ **롤백**은 이전 CEF 릴리스 패키지로 되돌리는 방식이며, 구형 UI 경로로 전환하는 구조가 아니다

### 7.5 Thứ tự triển khai tầng
└ 계층 도입 순서

#### Giai đoạn 1 / 1단계

- Triển khai `UseCases/Shared` / `UseCases/Shared` 도입
- Thêm `RequestContext`, `UseCaseResult`, `OperationLockService` / `RequestContext`, `UseCaseResult`, `OperationLockService` 추가
- Triển khai `Infrastructure/Persistence/Stores` (hiện tại MSSQL, chuyển sang SQLite) / `Infrastructure/Persistence/Stores` 도입 (현재 MSSQL, SQLite로 전환 예정)
- Thêm `RequestLedgerStore`, `OutboxStore` / `RequestLedgerStore`, `OutboxStore` 추가

#### Giai đoạn 2 / 2단계

- Triển khai ưu tiên `ExecutePaymentUseCase`, `CreateOrderUseCase`, `ReceiveDeliveryOrderUseCase`
- └ `ExecutePaymentUseCase`, `CreateOrderUseCase`, `ReceiveDeliveryOrderUseCase` 우선 도입
- Thanh toán/đơn hàng/giao hàng là những thứ đầu tiên bắt buộc đi qua `UseCases`
- └ 결제/주문/배달은 가장 먼저 `UseCases` 경유로 강제

#### Giai đoạn 3 / 3단계

- Thu gọn `PosRequestActions` thành thin router
- └ `PosRequestActions`를 thin router로 축소
- Di chuyển logic Dialog hiện tại theo đơn vị use case
- └ 기존 Dialog 로직을 use case 단위로 이동

#### Giai đoạn 4 / 4단계

- Loại bỏ truy cập trực tiếp DB/UI của `ExternalBridge`
- └ `ExternalBridge`의 직접 DB/UI 접근 제거
- Thống nhất tất cả sự kiện bên ngoài đi qua `UseCases`
- └ 모든 외부 이벤트를 `UseCases` 경유로 통일

#### Giai đoạn 5 / 5단계

- Xóa toàn bộ mã MFC UI còn lại và hội tụ tất cả màn hình vào CEF shell duy nhất
- └ 남은 MFC UI 코드를 전부 제거하고, 모든 화면을 단일 CEF 셸로 수렴

---

## 8. Yêu cầu bắt buộc khi triển khai
└ 구현 시 필수 요구사항

### 8.1 Vòng đời CEF Browser
└ CEF Browser 생명주기

- Bắt buộc sử dụng `CefSettings.multi_threaded_message_loop = true`
- └ `CefSettings.multi_threaded_message_loop = true` 사용 필수
- **Duy trì instance CefBrowser duy nhất**: Browser chính chỉ duy trì **một** trong suốt quá trình POS chạy. Chuyển màn hình xử lý bằng trạng thái/routing React trong app Next.js
- └ **단일 CefBrowser 인스턴스 유지**: 메인 Browser는 POS 실행 중 **하나만** 유지. 화면 전환은 Next.js 앱 내에서 React 상태/라우팅으로 처리
- **Đóng Browser chỉ khi tắt POS**: Cấm gọi `CloseBrowser` khi chuyển màn hình — Ngăn White-flash, chậm loading, vấn đề focus/keyboard do khởi động lại browser
- └ **Browser 닫기는 POS 종료 시에만**: 화면 전환 시 `CloseBrowser` 호출 금지 — 브라우저 재시작에 따른 White-flash, 로딩 지연, 포커스/키보드 이슈 방지
- **Ưu tiên tính liên tục UX**: Ưu tiên tính tức thời và ổn định của chuyển màn hình hơn hiệu quả bộ nhớ
- └ **UX 연속성 우선**: 메모리 효율보다 화면 전환의 즉시성과 안정성을 우선시

### 8.2 Tài liệu hóa JSON interface C++ ↔ JS
└ C++ ↔ JS JSON 인터페이스 문서화

- Tối thiểu sử dụng **JSDoc** để định nghĩa JSON interface trao đổi qua cefQuery
- └ 최소한 **JSDoc**을 사용하여 cefQuery로 주고받는 JSON 인터페이스를 정의
- Mô tả tất cả hằng số Action + spec tham số/phản hồi bằng JSDoc tại `PosUi/src/bridge/PosRequestSender.ts`
- └ `PosUi/src/bridge/PosRequestSender.ts`에 모든 Action 상수 + 파라미터/응답 스펙을 JSDoc으로 기술
- Duy trì chú thích interface tương tự tại `PosRealTimeSender.h` phía C++ để đồng bộ spec hai bên
- └ C++ 측 `PosRealTimeSender.h`에도 동일한 인터페이스 주석을 유지하여 양쪽 스펙 동기화
- Định nghĩa Envelope và field chung quản lý bằng tài liệu `SharedContracts/` riêng, chú thích triển khai giữ bằng JSDoc
- └ 봉투(Envelope)와 공통 필드 정의는 별도 `SharedContracts/` 문서로 관리하고, 구현 주석은 JSDoc으로 유지

### 8.3 Đối ứng độ phân giải cố định 1024x768
└ 1024x768 고정 해상도 대응

**Điểm mù**: Next.js App Router được tối ưu cho môi trường web, nếu thanh cuộn mặc định browser xuất hiện ở chiều cao 768px thì POS UI sẽ bị vỡ.
└ **맹점**: Next.js App Router는 웹 환경에 최적화되어 있어, 768px 세로 폭에서 브라우저 기본 스크롤바가 생기면 POS UI가 깨짐.

**Biện pháp**:
└ **대책**:
- Chặn hoàn toàn scroll/touch hệ thống tại CSS gốc:
- └ 루트 CSS에서 시스템 스크롤/터치 원천 봉쇄:
  ```css
  html, body {
    overflow: hidden;
    touch-action: none;
    width: 1024px;
    height: 768px;
  }
  ```
- Cửa sổ CEF cũng cố định chính xác 1024x768 (`CefWindowInfo::SetAsChild` + `MoveWindow`)
- └ CEF 윈도우도 정확히 1024x768로 고정 (`CefWindowInfo::SetAsChild` + `MoveWindow`)
- Tất cả component screen quản lý vùng scroll riêng trong 1024x768 (cấm sử dụng scroll browser)
- └ 모든 스크린 컴포넌트는 1024x768 내에서 자체 스크롤 영역을 관리 (브라우저 스크롤 사용 금지)

### 8.4 Migration đa ngôn ngữ (i18n)
└ 다국어(i18n) 마이그레이션

**Hiện tại**: Có tài sản dịch hardcode quy mô lớn bên trong C++, đường dẫn sửa đổi bị phân tán.
└ **현재**: C++ 내부에 대규모 하드코딩 번역 자산이 존재하며, 수정 경로가 분산되어 있다.

**Sau chuyển đổi**:
└ **전환 후**:
- **Nguồn đơn nhất (Source of Truth)**: `SharedAssets/i18n/locales/` — Chỉ JSON tại đây là nguồn gốc duy nhất
- └ **단일 소스 (Source of Truth)**: `SharedAssets/i18n/locales/` — 이곳의 JSON만이 유일한 원본
- Phía Next.js: Build script sao chép `SharedAssets/i18n/locales/` sang `PosUi/src/i18n/locales/` → Load bằng `i18next`
- └ Next.js 측: 빌드 스크립트가 `SharedAssets/i18n/locales/`를 `PosUi/src/i18n/locales/`로 복사 → `i18next`로 로드
- Phía C++: Build script sao chép `SharedAssets/i18n/locales/` sang `Build/Build/locales/` → Parse bằng `nlohmann/json`
- └ C++ 측: 빌드 스크립트가 `SharedAssets/i18n/locales/`를 `Build/Build/locales/`로 복사 → `nlohmann/json`으로 파싱
- **Nguyên tắc**: Sửa dịch chỉ ở `SharedAssets/i18n/locales/`. locales của PosUi hay Build chỉ là sản phẩm (bản sao) chứ không phải nguồn gốc
- └ **원칙**: 번역 수정은 반드시 `SharedAssets/i18n/locales/`에서만. PosUi나 Build의 locales는 산출물(복사본)일 뿐 원본이 아님

### 8.5 Bảo vệ giao tiếp bất đồng bộ thiết bị ngoại vi/dịch vụ bên ngoài (phòng thủ 2 lớp)
└ 주변기기/외부서비스 비동기 통신 보호 (2중 방어)

**Vấn đề**: Do đặc tính giao tiếp bất đồng bộ, khi phản hồi chậm có nguy cơ thanh toán/đặt hàng trùng lặp do người dùng nhấn liên tục.
└ **문제**: 비동기 통신 특성상 응답 지연 시 사용자의 연타로 인한 중복 결제/주문 위험.

- **Phía UI (phòng thủ chủ động lớp 1)**:
- └ **UI 측 (1차 선제 방어)**:
  - Chuyển trạng thái UI slice `isProcessing: true` ngay khi click action quan trọng (thanh toán, đặt hàng, in)
  - └ 중요 액션(결제, 주문, 인쇄) 클릭 즉시 UI slice 상태 `isProcessing: true` 전환
  - Hiện overlay loading toàn cục (Spinner) để chặn vật lý mọi input touch
  - └ 전역 로딩 오버레이(Spinner)를 띄워 모든 터치 입력을 물리적으로 차단
  - Cài đặt timeout 60 giây, tự động giải phóng và thông báo lỗi khi không có phản hồi
  - └ 60초 타임아웃 설정을 통해 응답 없을 시 자동 해제 및 에러 안내
- **Phía C++ (đảm bảo cuối cùng lớp 2)**:
- └ **C++ 측 (2차 최종 보장)**:
  - Bố trí flag `std::atomic<bool>` **theo đơn vị tác vụ** — Cấm lock đơn toàn cục
  - └ **작업 단위별** `std::atomic<bool>` 플래그 배치 — 전역 단일 락 금지
  - Quản lý Payment, Order, Print bằng **lock tách biệt** (cho phép truy vấn bàn ngay cả khi đang thanh toán)
  - └ Payment, Order, Print를 **분리된 락**으로 관리 (결제 중에도 테이블 조회는 허용)
  - Nếu có thể, kiểm tra idempotency theo đơn vị `action + entityId (orderId/paymentId)` để tránh chặn quá mức
  - └ 가능하면 `action + entityId (orderId/paymentId)` 단위의 멱등성 체크로 과차단 방지
  - Nếu có yêu cầu tương tự đến trong khi đang thực thi logic, trả ngay lỗi `BUSY`
  - └ 로직 수행 중 동일한 요청이 들어오면 즉시 `BUSY` 에러 반환
  - **Nguyên tắc**: UI chặn vì trải nghiệm người dùng, C++ chặn vì tính toàn vẹn dữ liệu
  - └ **원칙**: UI는 사용자 경험을 위해 막고, C++은 데이터 무결성을 위해 막는다
- Lưu ý: `std::atomic<bool>` dùng để **kiểm soát tranh chấp trong cùng process**. Căn cứ cuối cùng cho xử lý trùng lặp vận hành là `8.10 Idempotency Ledger`.
- └ 주의: `std::atomic<bool>`는 **동일 프로세스 내 경합 제어용**이다. 운영 중복 처리의 최종 근거는 `8.10 멱등성 Ledger`이다.

### 8.6 Quy tắc liên kết dịch vụ bên ngoài và thông báo UI
└ 외부 서비스 연동 및 UI 통지 규칙

- **Luồng dữ liệu**: `ExternalBridge`(nhận/xử lý) → `UseCases`(use case) → `Manager`(logic nghiệp vụ/DB) → `InternalBridge`(thông báo UI)
- └ **데이터 흐름**: `ExternalBridge`(수신/가공) → `UseCases`(유스케이스) → `Manager`(비즈니스 로직/DB) → `InternalBridge`(UI 통지)
- **Cấm điều khiển trực tiếp**: Module liên kết bên ngoài không thực hiện SQL `INSERT/UPDATE` trực tiếp hay thao tác trực tiếp component UI
- └ **직접 제어 금지**: 외부 연동 모듈에서 직접 SQL `INSERT/UPDATE`를 수행하거나 UI 컴포넌트를 직접 조작하지 않는다
- **Phương thức thông báo UI**: Chỉ `UseCases` có thể gọi `PosRealTimeSender`. `Manager` chỉ trả về kết quả domain, không có quyền gửi UI.
- └ **UI 통지 방식**: `UseCases`만 `PosRealTimeSender`를 호출할 수 있다. `Manager`는 도메인 결과를 반환할 뿐 UI 송신권을 갖지 않는다.
- **Phương thức hậu xử lý**: Sync ACK server trung tâm, sự kiện UI, gọi in ấn/thiết bị được `UseCases` thực thi theo thứ tự sau commit
- └ **후처리 방식**: 중앙 서버 sync ACK, UI 이벤트, 인쇄/장치 호출은 `UseCases`가 커밋 이후 순서로 실행한다

### 8.7 Cưỡng chế tính một chiều của luồng dữ liệu (The Golden Rule)
└ 데이터 흐름의 단방향성 강제 (The Golden Rule)

- **Quy tắc**: `ExternalBridge`(bên ngoài) **không thể gọi trực tiếp** `PosRealTimeSender`
- └ **규칙**: `ExternalBridge`(외부)는 `PosRealTimeSender`를 **직접 호출할 수 없다**
- **Cố định đường đi**: `ExternalBridge` → `UseCases` → `DB/Manager` (hoàn thành kiểm tra/lưu trữ) → `PosRealTimeSender` → Next.js
- └ **경로 고정**: `ExternalBridge` → `UseCases` → `DB/Manager` (검증/영속화 완료) → `PosRealTimeSender` → Next.js
- **Vai trò của ExternalBridge**: Chỉ "chuyển tiếp" tín hiệu bên ngoài, gửi UI chỉ được `UseCases` thực hiện sau khi hoàn thành lưu trữ
- └ **ExternalBridge의 역할**: 외부 신호를 "전달"만 하고, UI 송신은 영속화 완료 후 `UseCases`만 수행한다
- **Lý do**: Ngăn chặn từ gốc sự cố 'dữ liệu ma' khi đơn giao hàng bên ngoài đến mà chỉ thay đổi UI mà quên lưu DB
- └ **이유**: 외부 배달 주문이 들어왔을 때 UI만 바꾸고 DB 저장을 깜빡하는 '유령 데이터' 사고 원천 차단
- **Nguyên tắc**: **"Thông tin chưa được lưu vào DB không được hiển thị trên UI"**
- └ **원칙**: **"DB에 저장되지 않은 정보는 UI에 띄우지 않는다"**

#### 8.7.1 Bổ sung: Phân loại đồng bộ/bất đồng bộ theo tốc độ thực tế
└ 보강: 실제 속도 기준 동기/비동기 분류

> Nguyên tắc "DB trước, UI sau" hoạt động vì **DB cục bộ (SQLite) chỉ mất 1–5ms cho INSERT**.
> Đây không phải round-trip đến server từ xa — mà là ghi vào ổ đĩa cùng thiết bị.
>
> └ "DB 먼저, UI 다음" 원칙이 성립하는 이유: **로컬 DB(SQLite) INSERT는 1~5ms**다.
> 원격 서버 왕복이 아니라 같은 기기 내부의 디스크 쓰기이므로 체감상 즉각적이다.

| Loại tác vụ | Phương thức | Thời gian | Lý do |
|------------|-----------|----------|------|
| **Ghi DB cục bộ** (Đơn hàng / Thanh toán / Trạng thái bàn) | **Đồng bộ — DB trước, UI sau** | 1–5 ms | Toàn vẹn dữ liệu; không cảm nhận được độ trễ |
| └ **로컬 DB 저장** (주문/결제/테이블 상태) | └ **동기 — DB 먼저, UI 다음** | └ 1~5ms | └ 데이터 무결성 보장; 체감 지연 없음 |
| **Đồng bộ lên server trung tâm** (Outbox → CentralApi) | **Bất đồng bộ — Queue nền** | 100 ms–∞ | Trễ mạng, có thể thất bại; logic retry |
| └ **중앙 서버 동기화** (Outbox → CentralApi) | └ **비동기 — 백그라운드 큐** | └ 100ms~∞ | └ 네트워크 지연, 실패 가능; 재시도 로직 |
| **In hóa đơn / Xuất QR** | **Bất đồng bộ — Hậu xử lý sau commit** | 50–500 ms | I/O thiết bị; không chặn UI |
| └ **영수증 인쇄 / QR 출력** | └ **비동기 — 커밋 후 후처리** | └ 50~500ms | └ 장치 I/O 지연; UI 블로킹 불필요 |
| **API bên ngoài** (Duyệt thẻ / QR thanh toán) | **Chờ đồng bộ — Lưu DB sau khi nhận kết quả** | 1–30 s | Không thể xác nhận nếu chưa có duyệt |
| └ **외부 API** (카드 승인 / QR 결제) | └ **동기 대기 — 결과 받은 후 DB 저장** | └ 1~30초 | └ 승인 없이 확정 불가 |

**Tóm tắt / 요약**:
- "DB trước, UI sau" = **commit cục bộ 1–5 ms**, không phải đợi server từ xa
- └ "DB 먼저, UI 다음" = **로컬 1~5ms 커밋**, 원격 서버 대기가 아님
- Đồng bộ server, in ấn, gọi thiết bị = hậu xử lý **sau commit**, chạy nền với retry
- └ 서버 동기화, 인쇄, 장치 호출 = **커밋 후 후처리**, 백그라운드에서 재시도 포함 실행
- API bên ngoài (duyệt thẻ) = **trường hợp đặc biệt**: chờ kết quả → rồi lưu DB → rồi hiển thị UI
- └ 외부 API (카드 승인) = **예외 케이스**: 결과 대기 → DB 저장 → UI 표시 순서

### 8.8 Tiêu chuẩn JSON Envelope và quản lý phiên bản
└ JSON 봉투(Envelope) 표준 및 버전 관리

Tất cả message PosRequest/PosRealTime bao gồm **header chung** sau:
└ 모든 PosRequest/PosRealTime 메시지는 아래 **공통 헤더**를 포함한다:

| Field | Mục đích | Bắt buộc |
|------|------|------|
| `v` | Phiên bản API (lỗi khi không khớp phiên bản) | Bắt buộc |
| └ | └ API 버전 (버전 불일치 시 에러) | └ 필수 |
| `requestId` | ID duy nhất để theo dõi yêu cầu (UUID) | Bắt buộc |
| └ | └ 요청 추적용 고유 ID (UUID) | └ 필수 |
| `timestamp` | Thời điểm phát sinh (ISO 8601) | Bắt buộc |
| └ | └ 발생 시각 (ISO 8601) | └ 필수 |
| `idempotencyKey` | Khóa ngăn xử lý trùng lặp (bắt buộc khi thanh toán/đặt hàng) | Có điều kiện |
| └ | └ 중복 처리 방지 키 (결제/주문 시 필수) | └ 조건부 |

- Kiểm tra phiên bản field `v` tại đầu vào `PosRequestResponder` → Lỗi `VERSION_MISMATCH` khi không khớp
- └ `PosRequestResponder` 입구에서 `v` 필드 버전 체크 → 불일치 시 `VERSION_MISMATCH` 에러
- Hệ thanh toán/đặt hàng phân biệt rõ ràng "nhấn liên tục" và "nhận lại phản hồi" bằng `idempotencyKey`
- └ 결제/주문 계열은 `idempotencyKey`로 "사용자 연타"와 "응답 재수신"을 확실히 구분
- Nếu sự kiện từ hệ thống bên ngoài không có `requestId` cấp trên, `ExternalBridge` tạo `requestId` cho sự kiện tại thời điểm nhận
- └ 외부 시스템에서 들어오는 이벤트에 상위 `requestId`가 없으면, `ExternalBridge`가 수신 시점에 이벤트용 `requestId`를 생성한다

**Ví dụ yêu cầu chuẩn (truy vấn):**
└ **표준 요청 예시 (조회):**
```json
{
  "v": 1,
  "requestId": "9f1e4b56-2f1b-4a88-95f0-8f24b84c2e52",
  "timestamp": "2026-04-01T10:15:23+07:00",
  "cmd": "TABLE:SELECT",
  "params": {
    "id": 1
  }
}
```

**Ví dụ yêu cầu chuẩn (thay đổi):**
└ **표준 요청 예시 (변경):**
```json
{
  "v": 1,
  "requestId": "2fffa2ef-3567-4da6-8f3d-5ec8f4a38556",
  "timestamp": "2026-04-01T10:16:04+07:00",
  "idempotencyKey": "PAY-20260401-ORDER-1024",
  "cmd": "PAYMENT:EXECUTE",
  "params": {
    "orderId": 1024,
    "amount": 185000
  }
}
```

**Ví dụ phản hồi chuẩn:**
└ **표준 응답 예시:**
```json
{
  "v": 1,
  "requestId": "9f1e4b56-2f1b-4a88-95f0-8f24b84c2e52",
  "timestamp": "2026-04-01T10:15:23+07:00",
  "ok": true,
  "code": "OK",
  "data": {
    "tableId": 1,
    "status": "OCCUPIED"
  }
}
```

**Ví dụ sự kiện thời gian thực chuẩn:**
└ **표준 실시간 이벤트 예시:**
```json
{
  "v": 1,
  "requestId": "evt-7c71c9a1-41b9-4f0d-92fb-2d8d2fa77f84",
  "timestamp": "2026-04-01T10:17:11+07:00",
  "type": "TABLE_REFRESH",
  "payload": {
    "floorId": 1
  }
}
```

### 8.9 Tiêu chuẩn xử lý lỗi phần cứng (Device Error Bridge)
└ 하드웨어 에러 핸들링 표준 (Device Error Bridge)

- Định nghĩa **quy cách lỗi chung** truyền lỗi phát sinh từ thư mục `Device/` (hết giấy, đầu đọc thẻ mất kết nối, v.v.) đến UI
- └ `Device/` 폴더에서 발생하는 에러(용지 없음, 카드리더기 연결 끊김 등)를 UI에 전달하는 **공통 에러 규격** 정의
- Payload lỗi truyền bằng **field dựa trên mã**, không sử dụng câu hoàn chỉnh (`msg`) làm field hợp đồng
- └ 에러 payload는 **코드 기반 필드**로 전달하고, 완성 문장(`msg`)은 계약 필드로 사용하지 않는다
- Nội dung hiển thị cho người dùng được giải thích từ nguồn dịch `SharedAssets/i18n/locales/` theo `msgKey`
- └ 사용자에게 보이는 문구는 `SharedAssets/i18n/locales/`의 번역 원본에서 `msgKey` 기준으로 해석한다
- Quy cách JSON lỗi:
- └ 에러 JSON 규격:
  ```json
  {
    "type": "DEVICE_ERROR",
    "device": "PRINTER",
    "code": "NO_PAPER",
    "msgKey": "device.printer.no_paper",
    "msgParams": {},
    "severity": "WARNING",
    "recoverable": true,
    "retryable": true,
    "action": "USER_CHECK_PAPER"
  }
  ```
- `msgKey`: Khóa dịch theo chuẩn `SharedAssets/i18n/locales/` / `SharedAssets/i18n/locales/` 기준 번역 키
- `msgParams`: Tham số thay thế chuỗi dịch / 번역 문자열 치환용 파라미터
- `severity`: INFO / WARNING / CRITICAL — Quyết định mức hiển thị UI / UI 표시 수준 결정
- `recoverable`: Khả năng phục hồi tự động / 자동 복구 가능 여부
- `retryable`: Hiển thị nút thử lại / 재시도 버튼 표시 여부
- `action`: Hướng dẫn hành động người dùng trên UI (kiểm tra giấy, kết nối lại thiết bị, v.v.) / UI에서 안내할 사용자 조치 (용지 확인, 장치 재연결 등)
- Tất cả lỗi thiết bị ngoại vi đều được truyền đến UI theo cùng quy cách — Không xử lý lỗi riêng cho từng Action (đặt hàng, thanh toán)
- └ 모든 주변기기 에러는 이 동일 규격으로 UI에 전달 — 각 Action(주문, 결제)마다 에러 처리를 따로 하지 않음
- Phía UI khi nhận `type: "DEVICE_ERROR"`, dịch `msgKey + msgParams` và hiển thị bằng modal/toast lỗi chung
- └ UI 측에서는 `type: "DEVICE_ERROR"` 수신 시 `msgKey + msgParams`를 번역하여 공통 에러 모달/토스트로 표시

### 8.10 Tiêu chuẩn Idempotency Ledger
└ 멱등성 Ledger 표준

- Thanh toán/đặt hàng/nhận giao hàng phán định trùng lặp **tại kho lưu trữ bền vững** theo `requestId` và `idempotencyKey`
- └ 결제/주문/배달 수신은 `requestId`와 `idempotencyKey` 기준으로 **영속 저장소에서** 중복 여부를 판별한다
- Lưu trữ bền vững Ledger/Outbox/SyncState được tách thành `*Store` dưới `Infrastructure/Persistence/SQLite/Stores/` (legacy: `MSSQL/Stores/`)
- └ Ledger/Outbox/SyncState 영속화는 `Infrastructure/Persistence/SQLite/Stores/` (레거시: `MSSQL/Stores/`) 아래 `*Store`로 분리한다
- `*Repository` theo domain không triển khai toàn diện, chỉ quản lý trạng thái bền vững buộc phải tách trong vận hành bằng `*Store`
- └ 도메인별 `*Repository`는 전면 도입하지 않으며, 운영상 반드시 분리해야 하는 영속 상태만 `*Store`로 관리한다
- `Outbox` giới hạn là **hàng đợi bền vững cho đồng bộ server online trung tâm**, không dùng để tái thực hiện phê duyệt thanh toán/gọi thời gian thực app giao hàng
- └ `Outbox`는 **중앙 온라인 서버 동기화용 영속 큐**로 한정하며, 결제 승인/배달앱 실시간 호출 재실행 용도로 사용하지 않는다
- Giá trị trạng thái tối thiểu Ledger:
- └ Ledger 최소 상태값:
  - `RECEIVED`
  - `PROCESSING`
  - `SUCCEEDED`
  - `FAILED`
  - `COMPENSATED`
- Giá trị trạng thái tối thiểu Outbox:
- └ Outbox 최소 상태값:
  - `PENDING`
  - `DISPATCHING`
  - `ACKED`
  - `FAILED_RETRYABLE`
  - `FAILED_TERMINAL`
- `SyncStateStore` theo dõi tối thiểu các field sau:
- └ `SyncStateStore`는 최소 아래 필드를 추적한다:
  - `channel`
  - `lastAttemptAt`
  - `lastSuccessAt`
  - `retryCount`
  - `lastErrorCode`
  - `backlogCount`
- Khi nhận lại cùng `idempotencyKey`, **trả lại kết quả hiện có** thay vì thực thi mới
- └ 동일 `idempotencyKey`가 재수신되면 신규 실행 대신 **기존 결과를 재반환**한다
- Sync ACK/phản hồi server trung tâm chỉ được gửi sau khi DB commit hoàn tất
- └ 중앙 서버 sync ACK/응답은 DB 커밋이 완료된 후에만 발송한다
- Trong một transaction `UseCase`, **dữ liệu nghiệp vụ + trạng thái Ledger + bản ghi Outbox** phải được ghi cùng nhau
- └ 하나의 `UseCase` 트랜잭션 안에서 **업무 데이터 + Ledger 상태 + Outbox 레코드**가 함께 기록되어야 한다

### 8.11 Tách biệt ranh giới transaction và hậu xử lý
└ 트랜잭션 경계와 후처리 분리

- Một `UseCase` chỉ chịu trách nhiệm một đơn vị tác vụ nghiệp vụ
- └ 하나의 `UseCase`는 하나의 비즈니스 작업 단위만 책임진다
- Lưu trữ DB và sync ACK server trung tâm, gửi UI, in ấn là **cùng trách nhiệm nhưng không cùng giai đoạn**
- └ DB 영속화와 중앙 서버 sync ACK, UI 송신, 인쇄는 **동일 책임이지만 동일 단계는 아니다**
- Nguyên tắc:
- └ 원칙:
  - Lưu DB/xác nhận trạng thái = Khu vực transaction / DB 저장/상태 확정 = 트랜잭션 구간
  - Thông báo UI/sync ACK server trung tâm = Khu vực sau commit / UI 통지/중앙 서버 sync ACK = 커밋 이후 구간
  - Gọi in ấn/thiết bị = Khu vực hậu xử lý có thể thất bại / 인쇄/장치 호출 = 실패 가능 후처리 구간
- Lỗi in ấn phải được chỉ rõ theo từng tác vụ là lý do rollback thanh toán hay lý do thử lại hậu kỳ
- └ 인쇄 실패는 결제 롤백 사유인지, 후속 재시도 사유인지 작업별로 명시한다

### 8.12 Khởi động lại process và phục hồi sự cố
└ 프로세스 재시작 및 장애 복구

- Khi POS khởi động, kiểm tra lại các tác vụ còn ở trạng thái `PROCESSING`
- └ POS 시작 시 `PROCESSING` 상태로 남아 있는 작업을 재검사한다
- Thanh toán chưa hoàn thành được truy vấn lại trạng thái bên ngoài theo `transactionId / paymentId / orderId` để xử lý
- └ 미완료 결제는 `transactionId / paymentId / orderId` 기준으로 외부 상태를 다시 조회해 정리한다
- Màn hình bàn/đơn hàng/giao hàng phải **có thể rehydrate từ DB**
- └ 테이블/주문/배달 화면은 **DB 기준으로 재수화** 가능해야 한다
- Khi kết thúc mà chưa gửi được phản hồi đồng bộ server trung tâm, sau khi khởi động lại thử lại từ hàng đợi tái gửi `Outbox`
- └ 중앙 서버 동기화 응답을 보내지 못하고 종료된 경우, 재기동 후 `Outbox` 재전송 큐에서 재시도한다
- Yêu cầu phê duyệt thẻ/QR, yêu cầu thay đổi trạng thái thời gian thực app giao hàng không tự động tái gửi sau khởi động lại. Xử lý bằng quy trình quyết toán/truy vấn/vận hành riêng
- └ 카드/QR 승인 요청, 배달앱 실시간 상태 변경 요청은 재기동 후 자동 재전송하지 않는다. 별도 정산/조회/운영 절차로 정리한다

### 8.13 Chế độ vận hành offline / cách ly sự cố
└ 오프라인 / 장애 격리 운영 모드

- POS lấy **Offline-First** làm tiền đề, ngay cả khi lỗi internet, nghiệp vụ cốt lõi dựa trên SQLite local phải tiếp tục hoạt động
- └ POS는 **Offline-First**를 전제로 하며, 인터넷 장애 시에도 로컬 SQLite 기반 핵심 업무는 계속 수행 가능해야 한다
- Chỉ rõ chức năng cho phép và chức năng chặn khi lỗi thanh toán bên ngoài/MQTT/internet
- └ 외부 결제/MQTT/인터넷 장애 시 허용 기능과 차단 기능을 명시한다
- Trạng thái SQLite local bình thường nhưng chỉ mất kết nối bên ngoài được xem là chế độ `DEGRADED`
- └ 로컬 SQLite가 정상이고 외부 연결만 끊긴 상태는 `DEGRADED` 모드로 본다
- Khi SQLite local bất thường, chặn giao dịch cốt lõi và cảnh báo ngay cho người vận hành
- └ 로컬 SQLite가 비정상이면 핵심 거래를 차단하고 운영자에게 즉시 경고한다
- Ví dụ:
- └ 예시:
  - Cho phép thanh toán tiền mặt local / 로컬 현금 결제 허용
  - Chặn truy cập thanh toán thẻ/QR / 카드/QR 결제 진입 차단
  - Hiển thị ngừng nhận đơn giao hàng bên ngoài / 외부 배달 주문 수신 중단 표시
- Các item chờ đồng bộ tích lũy trong `Outbox`, UI phải có thể hiển thị `syncBacklogCount`, `lastSuccessAt`, `lastErrorCode`
- └ 동기화 대기 건은 `Outbox`에 누적하고, UI는 `syncBacklogCount`, `lastSuccessAt`, `lastErrorCode`를 표시할 수 있어야 한다
- Khi phục hồi online, `SyncWorker` chỉ tái gửi **dữ liệu đối tượng gửi đến server online trung tâm** đã tích lũy trong DB local
- └ 온라인 복구 시 `SyncWorker`는 기존 로컬 DB에 쌓인 **중앙 온라인 서버 송출 대상 데이터만** 재전송한다
- Các yêu cầu giao dịch bên ngoài như phê duyệt thẻ/QR, gọi thời gian thực app giao hàng không tự động tái thực hiện ngay cả sau khi phục hồi online
- └ 카드/QR 승인, 배달앱 실시간 호출 같은 외부 거래형 요청은 온라인 복구 후에도 자동 재실행하지 않는다
- Sự cố được **cách ly theo đơn vị domain** mà không dừng toàn bộ màn hình
- └ 장애는 화면 전체를 멈추지 않고 **도메인 단위로 격리**한다
- Phán định online không phải giá trị đơn, mà phán đoán riêng lẻ `dbConnected`, `internetConnected`, `mqttConnected`, `paymentGatewayConnected`, `printerConnected`
- └ 온라인 판정은 단일 값이 아니라 `dbConnected`, `internetConnected`, `mqttConnected`, `paymentGatewayConnected`, `printerConnected`를 개별 판단한다

### 8.14 Observability và tiêu chuẩn log
└ 관측성(Observability)과 로그 표준

- Tất cả log yêu cầu/sự kiện bao gồm tối thiểu các field chung sau:
- └ 모든 요청/이벤트 로그는 최소 아래 필드를 공통 포함한다:
  - `requestId`
  - `idempotencyKey`
  - `orderId`
  - `tableCode`
  - `paymentId`
  - `device`
  - `elapsedMs`
- `PosRequestResponder`, `UseCases`, `ExternalBridge`, `PosRealTimeSender` phải có thể theo dõi bằng **cùng chuỗi requestId**
- └ `PosRequestResponder`, `UseCases`, `ExternalBridge`, `PosRealTimeSender`는 **같은 requestId 체인**으로 추적 가능해야 한다
- Log vận hành được tách thành `log nghiệp vụ`, `log bridge`, `log thiết bị`, `log crash`
- └ 운영 로그는 `업무 로그`, `브릿지 로그`, `장치 로그`, `크래시 로그`를 분리한다

### 8.15 Quy tắc triển khai / rollback / chuyển đổi dần
└ 배포 / 롤백 / 점진 전환 규칙

- Việc triển khai có thể được kiểm soát theo đơn vị cửa hàng/POS/release channel, nhưng renderer của sản phẩm mục tiêu luôn là CEF + Next.js
- └ 배포는 매장/포스/릴리스 채널 단위로 통제할 수 있지만, 목표 제품의 화면 렌더러는 항상 CEF + Next.js다
- Không duy trì nhánh UI cũ trong kiến trúc vận hành. Rollback chỉ thực hiện ở cấp gói phát hành CEF
- └ 운영 아키텍처에 구형 UI 분기 경로는 두지 않는다. 롤백은 CEF 릴리스 패키지 단위로만 수행한다
- Tiêu chí rollback:
- └ 롤백 기준:
  - Vượt ngưỡng bộ nhớ / 메모리 임계치 초과
  - Không khớp thanh toán / 결제 불일치
  - Thiếu sync ACK server trung tâm / 중앙 서버 sync ACK 누락
  - Tỷ lệ lỗi thiết bị tăng đột biến / 장치 오류율 급증
- UI mới triển khai theo thứ tự **cửa hàng thí điểm → mở rộng nhóm**, không triển khai đồng loạt toàn bộ cửa hàng
- └ 새 UI는 전 매장 일괄 전개가 아니라 **파일럿 매장 → 그룹 확대** 순서로 배포한다

#### Hợp đồng tương thích schema khi rollback
└ 롤백 시 스키마 호환 계약

- Mỗi release phải công bố tối thiểu `minSupportedSchemaVersion`, `targetSchemaVersion`, `maxRollbackRelease`
- └ 각 릴리스는 최소 `minSupportedSchemaVersion`, `targetSchemaVersion`, `maxRollbackRelease`를 명시해야 한다
- Rollback gói CEF chỉ được phép khi release trước đó vẫn đọc được schema hiện tại của DB local
- └ CEF 패키지 롤백은 이전 릴리스가 현재 로컬 DB 스키마를 읽을 수 있을 때만 허용한다
- Migration phải đi theo nguyên tắc `expand → dual-read/write nếu cần → contract`; cấm drop/rename phá hủy trong cùng release với việc chuyển writer
- └ 마이그레이션은 `expand → 필요 시 dual-read/write → contract` 순서를 따라야 하며, writer 전환과 같은 릴리스에서 파괴적 drop/rename을 금지한다
- Trước khi ứng dụng khởi động nghiệp vụ, phải có preflight check đối chiếu app release với schema version local; nếu không tương thích thì chặn khởi động giao dịch và báo lỗi vận hành rõ ràng
- └ 앱이 업무 모드로 기동되기 전, app release와 로컬 schema version을 대조하는 preflight check가 있어야 하며, 호환되지 않으면 거래 기동을 막고 명확한 운영 오류를 표시해야 한다
- Trong pilot rollout, phải kiểm tra tối thiểu một nhịp `forward upgrade` và một nhịp `package rollback` trên cùng DB snapshot
- └ 파일럿 롤아웃에서는 동일 DB snapshot에 대해 최소 한 번의 `forward upgrade`와 한 번의 `package rollback` 호환성을 검증해야 한다

### 8.16 Gate test và release
└ 테스트와 릴리스 게이트

- Hạng mục kiểm tra bắt buộc:
- └ 필수 검증 항목:
  - Bridge contract test
  - Test đơn vị UseCase / UseCase 단위 테스트
  - Test tái gửi idempotency thanh toán/đặt hàng / 결제/주문 멱등성 재전송 테스트
  - Kiểm tra hoạt động đặt hàng/thanh toán tiền mặt/xuất chỉ với SQLite local trong trạng thái cắt internet
  - └ 인터넷 차단 상태에서 로컬 SQLite만으로 주문/현금결제/출력 동작 검증
  - Test tái gửi tự động khi kết nối lại sau tích lũy Outbox backlog
  - └ Outbox backlog 누적 후 재연결 시 자동 재전송 테스트
  - Test chuyển trạng thái `SYNC_PENDING`, `SYNC_FAILED_RETRYING`, `ACKED`
  - └ `SYNC_PENDING`, `SYNC_FAILED_RETRYING`, `ACKED` 상태 전이 테스트
  - Test phục hồi sau khi buộc tắt process / 프로세스 강제 종료 후 복구 테스트
  - Snapshot test độ phân giải 1024x768 / 1024x768 해상도 snapshot test
  - Soak test bộ nhớ x86 dài hạn / x86 메모리 장시간 soak test
  - Test tương thích `release ↔ schema version` khi forward upgrade và rollback gói
  - └ `forward upgrade` 및 패키지 롤백 시 `release ↔ schema version` 호환성 테스트
- 3 màn hình cốt lõi chỉ chuyển sang vận hành sau khi so sánh **tính tương đương kết quả** với MFC hiện tại
- └ 핵심 3개 화면은 기존 MFC와 **결과 동등성**을 비교한 뒤에만 운영 전환한다

### 8.17 Cài đặt cache / session / persistence CEF
└ CEF 캐시 / 세션 / 영속성 설정

- Cài đặt `root_cache_path` và `cache_path` một cách rõ ràng
- └ `root_cache_path`와 `cache_path`를 명시적으로 설정한다
- Sử dụng đường cache riêng cho từng POS để ngăn xung đột đa instance
- └ POS별 고유 캐시 경로를 사용해 다중 인스턴스 충돌을 방지한다
- Cố định chính sách persistence `localStorage`, session cookie, cài đặt người dùng bằng tài liệu
- └ `localStorage`, 세션 쿠키, 사용자 설정 persistence 정책을 문서로 고정한다
- Trong môi trường vận hành, kiểm soát rõ ràng việc hiển thị remote debugging, devtools
- └ 운영 환경에서는 remote debugging, devtools 노출 여부를 명시적으로 제어한다

### 8.18 Tiêu chuẩn phục hồi CEF Renderer Crash
└ CEF Renderer Crash 복구 표준

- Triển khai `CefClient::OnRenderProcessTerminated`, `OnRenderProcessUnresponsive` để phát hiện trạng thái bất thường renderer
- └ `CefClient::OnRenderProcessTerminated`, `OnRenderProcessUnresponsive`를 구현하여 renderer 이상 상태를 감지한다
- Trạng thái browser có tối thiểu các trạng thái sau:
- └ 브라우저 상태는 최소 아래 상태를 가진다:
  - `HEALTHY`
  - `RECOVERING`
  - `DEGRADED`
  - `RESTART_REQUIRED`
- Khi crash lần đầu:
- └ 첫 crash 시:
  - Chặn input tạm thời / 입력을 일시 차단
  - Ghi log `requestId`, route hiện tại, `cmd` cuối cùng, renderer exit code
  - └ `requestId`, 현재 route, 마지막 `cmd`, renderer exit code를 로그 기록
  - Tự động phục hồi hoặc reload browser shell 1 lần
  - └ Browser shell을 1회 자동 복구 또는 reload
  - Trạng thái màn hình không được phục hồi từ bộ nhớ browser mà được tái cấu trúc từ **dữ liệu DB/UseCase bootstrap**
  - └ 화면 상태는 브라우저 메모리에서 복원하지 않고 **DB/UseCase bootstrap 데이터**로 재구성
- Nếu thỏa các điều kiện sau, coi là crash loop và xem như ứng viên yêu cầu khởi động lại toàn bộ POS:
- └ 아래 조건이면 crash loop로 간주하고 POS 전체 재기동이 필요한 상태로 본다:
  - Renderer kết thúc 2 lần trở lên trong 5 phút / 5분 내 renderer 2회 이상 종료
  - Phục hồi thất bại trong 30 giây / 30초 내 복구 실패
  - Tái phát ngay khi vào cùng màn hình / 동일 화면 진입 시 즉시 재발
- Khi phục hồi crash, **không tái thực hiện yêu cầu thay đổi đang tiến hành từ bộ nhớ browser.** Tái xử lý thanh toán/đơn hàng do `UseCases` quyết định dựa trên trạng thái Ledger
- └ crash 복구 시 **진행 중이던 변경 요청을 브라우저 메모리에서 재실행하지 않는다.** 결제/주문 재처리는 Ledger 상태를 기준으로 `UseCases`가 결정한다

### 8.19 Minh văn hóa ràng buộc Static Export
└ 정적 Export 제약사항 명문화

- Next.js build theo tiêu chuẩn `output: 'export'`
- └ Next.js는 `output: 'export'` 기준으로 빌드한다
- Cấm triển khai chức năng cần tính năng server:
- └ 서버 기능이 필요한 기능은 도입 금지:
  - Server Actions
  - Route Handler phụ thuộc Request / Request 의존 Route Handler
  - Routing phụ thuộc rewrites / redirects / rewrites / redirects 의존 라우팅
  - Loader `next/image` mặc định / 기본 `next/image` loader
- Custom scheme `app://pos/` phải cung cấp quy tắc giải thích file tĩnh ở mức `try_files`
- └ `app://pos/` custom scheme는 정적 파일 해석 규칙을 `try_files` 수준으로 제공해야 한다

### 8.20 Hợp đồng handoff phục hồi CEF-only
└ CEF 단일 셸 복구 handoff 계약

- Phục hồi browser shell hoặc khởi động lại process phải bao gồm **hợp đồng handoff trạng thái** chứ không chỉ là reload UI đơn giản
- └ 브라우저 셸 복구나 프로세스 재기동은 단순 UI reload가 아니라 **상태 handoff 계약**을 포함해야 한다
- Khi tái tạo browser shell hoặc khởi động lại process, phải có thể truyền hoặc tái cấu trúc tối thiểu các context sau:
- └ 브라우저 셸을 재생성하거나 프로세스를 재기동할 때 최소 아래 컨텍스트를 전달 또는 재구성할 수 있어야 한다:
  - `screen`
  - `requestId`
  - `operatorId`
  - `tableId`
  - `orderId`
  - `paymentSessionId`
  - `routeParams`
  - `readonlySnapshotVersion`
- Màn hình bàn/đơn hàng phải có thể rehydrate ngay từ DB theo `tableId`, `orderId`
- └ 테이블/주문 화면은 `tableId`, `orderId` 기준으로 DB에서 즉시 재수화 가능해야 한다
- Màn hình thanh toán truy vấn lại trạng thái giao dịch hiện tại theo `paymentSessionId` hoặc `orderId`, nếu `PROCESSING` thì vào trạng thái **đang phục hồi (read-only)** trước
- └ 결제 화면은 `paymentSessionId` 또는 `orderId` 기준으로 현재 거래 상태를 재조회하고, `PROCESSING`이면 **복구 중(read-only)** 상태로 먼저 진입한다
- Đường phục hồi CEF-only không tin tưởng bộ nhớ browser hay Redux snapshot. Luôn phục hồi dựa trên DB/Ledger
- └ CEF 단일 셸 복구 경로는 브라우저 메모리나 Redux snapshot을 신뢰하지 않는다. 항상 DB/Ledger 기준으로 복원한다
- Context handoff này phải được lưu bền vững tại `Infrastructure/Persistence/SQLite/Stores/RecoveryStateStore.h/cpp` (legacy: `MSSQL/Stores/`)
- └ 이 handoff 컨텍스트는 `Infrastructure/Persistence/SQLite/Stores/RecoveryStateStore.h/cpp` (레거시: `MSSQL/Stores/`)에 영속 저장해야 한다
- `RecoveryStateStore` chỉ giữ **context phục hồi tối thiểu có thể serialize**, không lưu Redux snapshot hay DOM state
- └ `RecoveryStateStore`는 **직렬화 가능한 최소 복구 컨텍스트**만 저장하며, Redux snapshot이나 DOM 상태를 저장하지 않는다
- Browser shell ghi route ổn định cuối cùng, còn `UseCases` ghi khóa nghiệp vụ như `requestId`, `operatorId`, `tableId`, `orderId`, `paymentSessionId`, `readonlySnapshotVersion`
- └ 브라우저 셸은 마지막 안정 route를 기록하고, `UseCases`는 `requestId`, `operatorId`, `tableId`, `orderId`, `paymentSessionId`, `readonlySnapshotVersion` 같은 업무 키를 기록한다
- Sau khi phục hồi thành công hoặc khi kết thúc ca/đăng xuất, record phục hồi phải được clear hoặc ghi đè theo session POS hiện tại
- └ 복구가 성공했거나 교대 종료/로그아웃이 발생하면 현재 POS 세션 기준으로 복구 레코드를 삭제하거나 덮어써야 한다
- Test rollback phải bao gồm các kịch bản sau:
- └ 롤백 테스트에는 아래 시나리오가 포함되어야 한다:
  - Tái tạo browser shell khi đang chờ phê duyệt thanh toán / 결제 승인 대기 중 browser shell 재생성
  - Phục hồi ngay sau khi nhận đơn giao hàng bên ngoài / 외부 배달 주문 수신 직후 복구
  - Khởi động lại toàn bộ POS sau renderer crash loop / renderer crash loop 후 POS 전체 재기동

---

## 9. Thiết kế tích hợp giao tiếp POS ↔ UI
└ POS ↔ UI 통신 통합 설계

### 9.1 Kênh PosRealTime — Nhận sự kiện thời gian thực (C++ → UI, một chiều)
└ PosRealTime 채널 — 실시간 이벤트 수신 (C++ → UI, 단방향)

Nhận **tín hiệu thời gian thực mà hệ thống chủ động đẩy** như đơn MQTT, lỗi thiết bị, thay đổi trạng thái bàn, v.v. tại **anten duy nhất** gọi là `PosRealTimeReceiver` để cập nhật **RTK Query cache và client slice**.
└ MQTT 주문, 장치 에러, 테이블 상태 변화 등 **시스템이 먼저 밀어주는 실시간 신호**를 `PosRealTimeReceiver`라는 **단일 안테나**에서 수신하여 **RTK Query 캐시와 client slice**를 갱신한다.

**Nguyên lý hoạt động:**
└ **동작 원리:**
```
C++ (ExecuteJavaScript)
    ↓
window.dispatchEvent(new CustomEvent('POS_NATIVE_EVENT', {
  detail: { v, requestId, timestamp, type, payload }
}))
    ↓
PosRealTimeReceiver (nhận event.detail / event.detail 수신)
    ├── Phân tích type / type 분석
    ├── ORDER_NEW       → posApi cache invalidate/update / posApi 캐시 invalidate/update
    ├── TABLE_REFRESH   → posApi cache invalidate/update / posApi 캐시 invalidate/update
    ├── PAYMENT_COMPLETE → posApi cache invalidate + uiSlice.isProcessing=false
    ├── SYNC_STATUS_CHANGED → posApi sync cache trạng thái invalidate/update / posApi sync 상태 캐시 invalidate/update
    ├── DEVICE_ERROR    → Cập nhật trạng thái lỗi uiSlice + hiển thị modal chung / uiSlice 에러 상태 갱신 + 공통 모달 표시
    └── default         → console.warn (sự kiện không xác định / 알 수 없는 이벤트)
    ↓
RTK Query cache / client slice cập nhật → React tự động re-render
└ RTK Query 캐시 / client slice 갱신 → React 자동 리렌더
```

**Vị trí file**: `PosUi/src/providers/PosRealTimeReceiver.tsx`
└ **파일 위치**: `PosUi/src/providers/PosRealTimeReceiver.tsx`

**Lợi ích thiết kế:**
└ **설계 이점:**
- **Đơn giản hóa C++**: C++ không cần biết cấu trúc UI. Chỉ cần gắn nhãn `type` và ném đi
- └ **C++ 단순화**: C++은 UI 구조를 몰라도 됨. `type` 이름표만 붙여서 던지면 끝
- **Decouple UI**: Mỗi Screen không giao tiếp trực tiếp với C++ mà chỉ subscribe RTK Query cache và client slice
- └ **UI 디커플링**: 각 Screen은 C++과 직접 대화하지 않고 RTK Query 캐시와 client slice만 구독
- **Dễ debug**: Chỉ cần thêm một `console.log` vào Provider là có thể monitor mọi dữ liệu đến từ C++
- └ **디버깅 용이**: Provider에 `console.log` 하나만 찍으면 C++에서 오는 모든 데이터 모니터링 가능
- **Tích hợp logic phòng thủ**: Khi nhận tín hiệu hoàn thành thanh toán, invalidate RTK Query cache và giải phóng `isProcessing` toàn cục đều được kiểm soát tập trung tại cổng này
- └ **방어 로직 통합**: 결제 완료 신호 수신 시 RTK Query 캐시 무효화와 전역 `isProcessing` 해제를 이 창구에서 일괄 제어
- **Dễ mở rộng**: Sử dụng phương thức handler registry (Map) — Khi thêm domain, chỉ cần đăng ký handler theo pattern `handlers[type]?.(payload)` thay vì `switch` khổng lồ
- └ **확장 용이**: 핸들러 레지스트리(Map) 방식 사용 — 거대한 `switch`문 대신 `handlers[type]?.(payload)` 패턴으로 도메인 추가 시 핸들러 등록만 추가

### 9.2 Kênh PosRealTime — Gửi sự kiện thời gian thực (phía C++)
└ PosRealTime 채널 — 실시간 이벤트 송신 (C++ 측)

Nếu anten nhận (`PosRealTimeReceiver`) chỉ có một, thì **đài phát cũng phải chỉ có một.**
**Chỉ UseCases** có thể gửi tín hiệu thời gian thực đến UI. ExternalBridge và Manager không thể gọi trực tiếp `PosRealTimeSender`, phải đi qua `UseCases` (8.7 Golden Rule).
└ 받는 안테나(`PosRealTimeReceiver`)가 하나라면, **보내는 방송국도 하나여야 한다.**
└ **UseCases만** UI에 실시간 신호를 보낼 수 있다. ExternalBridge와 Manager는 `PosRealTimeSender`를 직접 호출할 수 없으며, 반드시 `UseCases`를 거쳐야 한다 (8.7 Golden Rule).

**Vị trí file**: `CEF/InternalBridge/PosRealTimeSender.h/cpp`
└ **파일 위치**: `CEF/InternalBridge/PosRealTimeSender.h/cpp`

**Nguyên lý hoạt động:**
└ **동작 원리:**
```text
UseCases
    ↓ Xác nhận kết quả Manager/Infra / Manager/Infra 결과 확정
PosRealTimeSender::SendToUI(type, payload, requestId, timestamp)
    ↓ Serialize JSON + đảm bảo CEF UI thread / JSON 직렬화 + CEF UI 스레드 보장
window.dispatchEvent(new CustomEvent('POS_NATIVE_EVENT', {
  detail: { v, requestId, timestamp, type, payload }
}))
    ↓
PosRealTimeReceiver (cổng nhận JS / JS 수신 창구)
```

**3 trách nhiệm của PosRealTimeSender:**
└ **PosRealTimeSender의 3가지 책임:**
1. **Serialize JSON**: Chuyển đổi dữ liệu C++ sang quy cách `{ v, requestId, timestamp, type, payload }`
1. └ **JSON 직렬화**: C++ 데이터를 `{ v, requestId, timestamp, type, payload }` 규격으로 변환
2. **Đảm bảo thread-safe**: Dù được gọi từ thread MQTT/network, bên trong xử lý chuyển sang UI thread bằng `CefPostTask`
2. └ **스레드 안전 보장**: MQTT/네트워크 스레드에서 호출되어도, 내부에서 `CefPostTask`로 UI 스레드 전환 처리
3. **Ghi log**: Log mọi dữ liệu từ C++ đến UI tại một nơi — Khi debug chỉ cần kiểm tra log PosRealTimeSender
3. └ **로그 기록**: C++에서 UI로 나가는 모든 데이터를 한곳에서 로그 — 디버깅 시 PosRealTimeSender 로그만 확인하면 됨

**Quy tắc sử dụng:**
└ **사용 규칙:**
- Cấm gọi trực tiếp `CEF::ExecuteJavaScript` từ Manager/ExternalBridge
- └ Manager/ExternalBridge에서 `CEF::ExecuteJavaScript`를 직접 호출 금지
- Cấm gọi trực tiếp `PosRealTimeSender` từ Manager/ExternalBridge
- └ Manager/ExternalBridge에서 `PosRealTimeSender` 직접 호출 금지
- `UseCases` phải gọi `PosRealTimeSender::SendToUI()` hoặc wrapper theo domain (`NotifyTableChanged`, `NotifyNewOrder`, v.v.)
- └ 반드시 `UseCases`가 `PosRealTimeSender::SendToUI()` 또는 도메인별 래퍼(`NotifyTableChanged`, `NotifyNewOrder` 등)를 호출
- Định dạng dữ liệu cố định: `{ "v": number, "requestId": string, "timestamp": string, "type": string, "payload": object }`
- └ 데이터 포맷: `{ "v": number, "requestId": string, "timestamp": string, "type": string, "payload": object }` 고정

### 9.3 Kênh PosRequest — Gửi yêu cầu/phản hồi (UI → C++, khứ hồi)
└ PosRequest 채널 — 요청/응답 송신 (UI → C++, 왕복)

Khi gửi từ UI đến C++ phải đi qua **cổng duy nhất gọi là `PosRequestSender.ts`**. Đây là kênh **hỏi và đáp** cho thao tác có chủ đích của người dùng (truy vấn, lưu, thanh toán).
└ UI에서 C++로 보낼 때 **`PosRequestSender.ts`라는 단일 창구**를 거친다. 사용자의 의도적 조작(조회, 저장, 결제)에 대한 **질문과 답변** 채널이다.

**Vị trí file**: `PosUi/src/bridge/PosRequestSender.ts`
└ **파일 위치**: `PosUi/src/bridge/PosRequestSender.ts`

**Nguyên lý hoạt động:**
└ **동작 원리:**
```
Component TableScreen → gọi selectTable(id)
└ TableScreen 컴포넌트 → selectTable(id) 호출
    ↓
bridge/PosRequestSender.ts → đóng gói { v: 1, requestId: "...", timestamp: "...", cmd: "TABLE:SELECT", params: { id } }
└ bridge/PosRequestSender.ts → { v: 1, requestId: "...", timestamp: "...", cmd: "TABLE:SELECT", params: { id } } 포장
    ↓
window.cefQuery (Promise)
    ↓
PosRequestResponder(router) → Actions/Table/ → UseCases/Table/SelectTableUseCase → Domain/TableManager → Tables/TableCrud
└ PosRequestResponder(라우터) → Actions/Table/ → UseCases/Table/SelectTableUseCase → Domain/TableManager → Tables/TableCrud
    ↓
C++ phản hồi JSON { v, requestId, timestamp, ok, code, data } → Promise resolve → component nhận kết quả
└ C++ 응답 JSON { v, requestId, timestamp, ok, code, data } → Promise resolve → 컴포넌트 결과 수신
```

**3 trách nhiệm của actions.ts:**
└ **actions.ts의 3가지 책임:**
1. **Tích hợp xử lý bất đồng bộ**: Wrap cefQuery thành Promise, duy trì khả năng tái sử dụng trong RTK Query `baseQuery/queryFn`
1. └ **비동기 처리 통합**: cefQuery를 Promise로 래핑하고, RTK Query `baseQuery/queryFn`에서 재사용 가능하게 유지
2. **Điều khiển loading toàn cục**: Khi gửi action quan trọng (thanh toán, v.v.) chuyển `isProcessing: true` của UI slice → Khóa màn hình ngay
2. └ **전역 로딩 제어**: 중요 액션(결제 등) 전송 시 UI slice의 `isProcessing: true` 전환 → 화면 즉시 잠금
3. **Xử lý lỗi chung**: Bộ lọc trung gian phán đoán popup lỗi chung hay bỏ qua khi C++ trả phản hồi lỗi
3. └ **공통 에러 핸들링**: C++ 에러 응답 시 공통 에러 팝업 or 무시 판단하는 중간 필터

**Quy tắc sử dụng:**
└ **사용 규칙:**
- Cấm gọi trực tiếp `window.cefQuery` từ component
- └ 컴포넌트에서 `window.cefQuery`를 직접 호출 금지
- Dữ liệu truy vấn ưu tiên dùng RTK Query hook từ `store/api/*Api.ts`, `PosRequestSender.ts` được tái sử dụng làm transport nội bộ
- └ 조회성 데이터는 가능하면 `store/api/*Api.ts`의 RTK Query hook을 사용하고, `PosRequestSender.ts`는 그 내부 transport로 재사용한다
- Tác vụ lệnh sử dụng hàm wrapper theo domain của `bridge/PosRequestSender.ts` hoặc RTK Query mutation wrapper
- └ 명령성 작업은 `bridge/PosRequestSender.ts`의 도메인별 래퍼 함수 또는 RTK Query mutation wrapper 사용
- Định dạng yêu cầu cố định: `{ "v": number, "requestId": string, "timestamp": string, "cmd": string, "params": object, "idempotencyKey"?: string }`
- └ 요청 포맷: `{ "v": number, "requestId": string, "timestamp": string, "cmd": string, "params": object, "idempotencyKey"?: string }` 고정
- Định dạng phản hồi cố định: `{ "v": number, "requestId": string, "timestamp": string, "ok": boolean, "code": string, "data"?: object, "error"?: object }`
- └ 응답 포맷: `{ "v": number, "requestId": string, "timestamp": string, "ok": boolean, "code": string, "data"?: object, "error"?: object }` 고정

---

### 9.4 Hệ thống cổng đơn hai chiều (tóm tắt toàn bộ)
└ 양방향 단일 창구 체계 (전체 요약)

#### Quy cách đặt tên
└ 네이밍 규격

| Kênh | Tính chất | File TS/TSX | File C++ |
|------|------|---------|---------|
| **PosRequest** | Yêu cầu/phản hồi (hội thoại khứ hồi) | `PosRequestSender.ts` | `PosRequestResponder.cpp` |
| └ | └ 요청/응답 (왕복 대화) | └ | └ |
| **PosRealTime** | Sự kiện thời gian thực (phát sóng một chiều) | `PosRealTimeReceiver.tsx` | `PosRealTimeSender.cpp` |
| └ | └ 실시간 이벤트 (단방향 방송) | └ | └ |

#### Luồng giao tiếp
└ 통신 흐름

| Hướng | Phía UI | Phía C++ | Phương thức |
|------|------|--------|------|
| **UI → C++ (Request)** | `PosRequestSender.ts` | `PosRequestResponder.cpp` → Actions/ → UseCases/ | cefQuery (Promise khứ hồi / Promise 왕복) |
| **C++ → UI (RealTime)** | `PosRealTimeReceiver.tsx` | `PosRealTimeSender.cpp` | CustomEvent (phát sóng một chiều / 단방향 방송) |

#### Sơ đồ toàn bộ
└ 전체 다이어그램

```
┌──────────────────── UI (Next.js) ────────────────────┐
│                                                       │
│  [Kênh PosRequest — Yêu cầu/Phản hồi]                │
│  └ [PosRequest 채널 — 요청/응답]                       │
│  PosRequestSender.ts ──cefQuery──→ PosRequestResponder │
│         ↑                              ↓              │
│    Promise resolve              Actions/ (routing)     │
│         ↑                              ↓              │
│    Component nhận kết quả        UseCases             │
│    └ 컴포넌트 결과 수신                    ↓           │
│                                  DB/Manager (nghiệp vụ)│
│                                                       │
│  [Kênh PosRealTime — Phát sóng thời gian thực]        │
│  └ [PosRealTime 채널 — 실시간 방송]                    │
│      ExternalBridge → UseCases → DB/Manager → UseCases │
│                              ↓                        │
│                    PosRealTimeSender (đài phát / 방송국)│
│                              ↓                        │
│  PosRealTimeReceiver ←─ dispatchEvent (một chiều)      │
│         ↓                                             │
│    RTK Query cache / UI slice → React re-render        │
│                                                       │
└───────────────────────────────────────────────────────┘
```

#### Quy tắc sở hữu contract bridge
└ 브리지 계약 소유권 규칙

Định nghĩa loại message request/realtime không được thuộc sở hữu của `screens/*/constants.ts`.  
Contract bridge phải được quản lý tập trung tại `SharedContracts/` và phía frontend tại `PosUi/src/bridge/contracts/`.
└ request/realtime 메시지 타입 정의를 `screens/*/constants.ts`가 소유하면 안 된다.  
브리지 계약은 `SharedContracts/`와 프론트엔드의 `PosUi/src/bridge/contracts/`에서 중앙 관리해야 한다.

```text
SharedContracts/
└── PosBridge/
    ├── RequestTypes.ts
    ├── RealtimeTypes.ts
    └── Envelope.ts

PosUi/src/bridge/contracts/
├── requestTypes.ts
├── realtimeTypes.ts
└── envelope.ts
```

- `screens/*/constants.ts` chỉ chứa hằng số UI cục bộ như layout, timer, tab, style token theo màn hình
- └ `screens/*/constants.ts`는 화면별 레이아웃, 타이머, 탭, 스타일 토큰 같은 로컬 UI 상수만 가진다
- `PosRequestSender.ts` và `PosRealTimeReceiver.tsx` chỉ import loại message từ `bridge/contracts/`
- └ `PosRequestSender.ts`와 `PosRealTimeReceiver.tsx`는 메시지 타입을 오직 `bridge/contracts/`에서만 import한다
- Nếu cần giữ tính tự hoàn chỉnh của Screen, Screen có thể **tham chiếu** contract trung tâm nhưng không trở thành nguồn gốc của contract
- └ Screen의 자기완결성이 필요하면 중앙 계약을 **참조**할 수는 있지만, 계약의 원본이 되어서는 안 된다
- `PosUi/src/bridge/contracts/` là mở rộng bắt buộc kế tiếp; cho đến khi được tạo thực tế phải ghi trạng thái `planned`
- └ `PosUi/src/bridge/contracts/`는 다음 필수 확장 구조이며, 실제 생성 전까지는 반드시 `planned` 상태로 표기한다

### 9.5 Luồng tích hợp sự kiện từ bên ngoài
└ 외부 이벤트 유입 통합 흐름

Sự kiện từ hệ thống bên ngoài đến trước bắt buộc theo đường đi sau:
└ 외부 시스템에서 먼저 들어오는 이벤트는 아래 경로를 강제한다:

```
MQTT / Webhook / VAN Callback
    ↓
ExternalBridge
    ↓
UseCases
    ↓
DB/Manager (kiểm tra/lưu trữ / 검증/영속화)
    ↓
UseCases
    ↓
PosRealTimeSender
    ↓
Next.js UI
```

- `ExternalBridge` chỉ thực hiện parsing, xác thực, và dọn dẹp payload thô
- └ `ExternalBridge`는 파싱과 인증, 원시 payload 정리까지만 수행
- `UseCases` chịu trách nhiệm idempotency, kiểm tra trùng lặp, điều khiển thứ tự tác vụ
- └ `UseCases`는 멱등성, 중복 체크, 작업 순서 제어를 담당
- UI luôn chỉ nhận trạng thái sau khi hoàn thành lưu trữ
- └ UI는 항상 영속화 완료 이후의 상태만 수신

### 9.6 Luồng truy vấn / lưu trữ / đồng bộ Offline-First
└ Offline-First 조회 / 저장 / 동기화 흐름

#### Luồng truy vấn
└ 조회 흐름

```text
React Screen
    ↓ useQuery
RTK Query (posApi)
    ↓ baseQuery/queryFn
PosRequestSender
    ↓
PosRequestResponder → UseCases → DB/Manager
    ↓
Local SQLite
    ↓
RTK Query Cache
```

- Dữ liệu truy vấn nạp **kết quả truy vấn SQLite local** vào RTK Query cache chứ không phải internet
- └ 조회성 데이터는 인터넷이 아니라 **로컬 SQLite 조회 결과**를 RTK Query 캐시에 적재한다
- Dù dùng cùng query hook ở nhiều màn hình, RTK Query vẫn tái sử dụng cache
- └ 동일 query hook을 여러 화면에서 써도 RTK Query가 캐시를 재사용한다

#### Luồng lưu trữ
└ 저장 흐름

```text
React Screen
    ↓ useMutation / command
PosRequestSender
    ↓
PosRequestResponder → UseCases
    ↓
DB/Manager
    ↓
Local SQLite Commit
    ├── Business Data
    ├── Idempotency Ledger
    └── Outbox Record
    ↓
RTK Query invalidate/update
```

- Tiêu chí thành công của tác vụ lưu trữ là **commit SQLite local thành công**
- └ 저장 작업의 성공 기준은 **로컬 SQLite 커밋 성공**이다
- Tác vụ đối tượng gửi đến server online trung tâm được nạp vào `Outbox` rồi sync worker hậu kỳ xử lý
- └ 중앙 온라인 서버 송출 대상 작업은 `Outbox`에 적재된 후 후속 sync worker가 처리한다

#### Luồng đồng bộ
└ 동기화 흐름

```text
ConnectivityService
    ↓ Phán đoán online / degraded / online / degraded 판단
SyncWorker
    ↓
OutboxDispatcher
    ↓
Central Online Server
    ↓
ACK / Error
    ↓
SyncStateStore cập nhật / 갱신
    ↓
PosRealTimeSender (SYNC_STATUS_CHANGED)
    ↓
PosRealTimeReceiver
    ↓
RTK Query sync cache trạng thái cập nhật / 상태 캐시 갱신
```

- Khi offline, `Outbox` tích lũy ở trạng thái `PENDING`
- └ 오프라인이면 `Outbox`는 `PENDING` 상태로 누적된다
- Sau khi kết nối lại, `SyncWorker` tái gửi backlog tuần tự
- └ 재연결 후 `SyncWorker`가 backlog를 순차 재전송한다
- Backlog này chỉ bao gồm **đối tượng gửi đến server online trung tâm**
- └ 이 backlog는 **중앙 온라인 서버 송출 대상**만 포함한다
- Phê duyệt thẻ/QR, gọi thời gian thực app giao hàng không được đưa vào backlog, và không tự động tái thực hiện sau khi phục hồi online
- └ 카드/QR 승인, 배달앱 실시간 호출은 backlog에 넣지 않으며, 온라인 복구 후 자동 재실행하지 않는다
- UI phải hiển thị riêng biệt giao dịch thành công và đồng bộ thành công
- └ UI는 거래 성공과 동기화 성공을 분리해서 보여줘야 한다

---

## 10. Gate chuyển đổi vận hành
└ 운영 전환 게이트

Thiết kế này chỉ được phản ánh vào vận hành khi đáp ứng các điều kiện sau.
└ 본 설계는 아래 조건을 충족할 때만 운영 반영한다.

### 10.1 Gate P0
└ P0 게이트

- Hoàn thành triển khai Ledger idempotency thanh toán/đặt hàng / 결제/주문 멱등성 Ledger 구현 완료
- Hoàn thành kiểm tra hoạt động 3 màn hình cốt lõi truy vấn/đặt hàng/thanh toán tiền mặt chỉ với SQLite local
- └ 로컬 SQLite만으로 핵심 3개 화면 조회/주문/현금결제 동작 검증 완료
- Hoàn thành triển khai tầng `UseCases` / `UseCases` 계층 도입 완료
- Hoàn thành loại bỏ SQL trực tiếp / gửi UI trực tiếp của `ExternalBridge`
- └ `ExternalBridge`의 직접 SQL / 직접 UI 송신 제거 완료
- Hoàn thành triển khai quy trình phục hồi khởi động lại process / 프로세스 재기동 복구 절차 구현 완료
- Hoàn thành cố định cấu trúc CEF-only và loại bỏ đường MFC UI khỏi thiết kế vận hành
- └ CEF-only 구조를 고정하고 운영 설계에서 MFC UI 경로를 제거 완료

### 10.2 Gate P1
└ P1 게이트

- Hoàn thành đo lường bộ nhớ x86 và tài liệu hóa ngưỡng / x86 메모리 측정 및 임계치 문서화 완료
- Hoàn thành xác định đường cache/session CEF / CEF 캐시/세션 경로 확정 완료
- Hoàn thành tự động hóa Bridge contract test / Bridge contract test 자동화 완료
- Hoàn thành kiểm tra quy trình phục hồi renderer crash và tiêu chí crash loop
- └ renderer crash 복구 절차 및 crash loop 기준 검증 완료
- Hoàn thành kiểm tra kịch bản handoff phục hồi CEF-only / CEF-only 복구 handoff 시나리오 검증 완료
- Hoàn thành kiểm tra tích lũy/tái gửi Outbox backlog và UI trạng thái sync
- └ Outbox backlog 누적/재전송 및 sync 상태 UI 검증 완료
- Hoàn thành kiểm tra log vận hành cửa hàng thí điểm / 파일럿 매장 운영 로그 검증 완료

### 10.3 Nguyên tắc cuối cùng
└ 최종 원칙

- Duy trì `Actions` mỏng, `UseCases` rõ ràng, `Manager` thuần túy
- └ `Actions`는 얇게, `UseCases`는 명확하게, `Manager`는 순수하게 유지한다
- Input bên ngoài chỉ được gửi đến UI sau khi lưu trữ hoàn tất
- └ 외부 입력은 반드시 영속화 이후에만 UI로 보낸다
- Thanh toán/đặt hàng không được phản ánh vào vận hành mà không có chiến lược idempotency và phục hồi
- └ 결제/주문은 멱등성과 복구 전략 없이 운영 반영하지 않는다
- Cải thiện cấu trúc ưu tiên "ranh giới trách nhiệm có thể chuyển đổi dần" hơn là "tầng lý tưởng"
- └ 구조 개선은 "이상적인 계층"보다 "점진 전환 가능한 책임 경계"를 우선한다

### 10.4 Tài liệu riêng
└ 별도 문서

- `01-SuperAdmin-통합-플랫폼-설계서.md`
- `02-RegionalDistributor-통합유통-플랫폼-설계서.md`
- `03-BrandHQ-브랜드-지점-운영-플랫폼-설계서.md`
- `05-Edge-POS-전체-흐름-AZ-가이드.md`
- `06-Edge-POS-P0-P1-설계-보완-체크리스트.md`
- `05-테스트-계획서.md` (21 đường test dựa trên review kỹ thuật / 엔지니어링 리뷰 기반 21개 테스트 경로)

---

## 11. Build pipeline (bổ sung review kỹ thuật)
└ 빌드 파이프라인 (엔지니어링 리뷰 추가)

> Ngày bổ sung: 2026-04-01 (review kỹ thuật ARCH-4)
> └ 추가일: 2026-04-01 (엔지니어링 리뷰 ARCH-4)

### 11.1 Thứ tự build
└ 빌드 순서

```
1. Build PosUi / PosUi 빌드
   cd PosUi && npm run build
   → Tạo HTML/JS/CSS tĩnh trong thư mục out/ / out/ 폴더에 정적 HTML/JS/CSS 생성

2. Build C++ (VS2022 / MSBuild) / C++ 빌드 (VS2022 / MSBuild)
   MSBuild BrandPosApp.sln /p:Configuration=Release /p:Platform=x64
   → Tạo BrandPosApp.exe (Release) hoặc BrandPosAppD.exe (Debug) + CefSubprocess.exe
   → BrandPosApp.exe(Release) 또는 BrandPosAppD.exe(Debug) + CefSubprocess.exe 생성

3. Triển khai tích hợp / 통합 배포
   VS2022 Post-Build Event hoặc build script / VS2022 Post-Build Event 또는 빌드 스크립트:
   - Build/PosUi/out/ ← Sao chép PosUi/out/ / PosUi/out/ 복사
   - Build/ ← Sao chép binary CEF SDK (libcef.dll, tài nguyên, v.v.) / CEF SDK 바이너리 (libcef.dll, 리소스 등) 복사
   - Build/Build/locales/ ← Sao chép SharedAssets/i18n/locales/ / SharedAssets/i18n/locales/ 복사
```

### 11.2 Dual build (x86/x64)
└ 듀얼 빌드 (x86/x64)

- x64: `Platform=x64` + binary CEF x64 / CEF x64 바이너리
- x86: `Platform=Win32` + binary CEF x86 / CEF x86 바이너리
- PosUi chia sẻ cùng kết quả build (JavaScript không phụ thuộc kiến trúc)
- └ PosUi는 동일 빌드 결과물 공유 (JavaScript는 아키텍처 무관)

### 11.3 Môi trường phát triển (Mock Bridge)
└ 개발 환경 (Mock Bridge)

- Phải có thể xác nhận trực tiếp trên browser component dùng chung và mockup toàn bộ màn hình tại route `app/design-system/`
- └ `app/design-system/` 라우트에서 공용 컴포넌트와 화면 전체 목업을 브라우저로 직접 확인할 수 있어야 한다
- `PosRequestSender.ts` phát hiện môi trường và chọn giữa `cefTransport` và `mockTransport`
- └ `PosRequestSender.ts`는 환경을 감지해 `cefTransport`와 `mockTransport` 중 하나를 선택한다
- Khi không phải môi trường CEF, Mock transport được kích hoạt và hiện tại đọc dữ liệu chủ yếu từ `src/bridge/mocks/`
- └ CEF 환경이 아니면 Mock transport가 활성화되며, 현재는 주로 `src/bridge/mocks/` 데이터를 읽어 반환한다
- Có thể phát triển design system/màn hình trên browser thông thường bằng `next dev` (không cần C++/VS2022)
- └ `next dev`로 일반 브라우저에서 디자인 시스템/화면 개발 가능 (C++/VS2022 불필요)
- Hiện tại `mockTransport` dùng trực tiếp dữ liệu trong `PosUi/src/bridge/mocks/screens/`; `PosUi/src/mocks/bridge/`, `PosUi/src/mocks/screens/`, `PosUi/src/mocks/fixtures/` được giữ như tầng fixture dự phòng để tách rộng sau này
- └ 현재 `mockTransport`는 `PosUi/src/bridge/mocks/screens/` 데이터를 직접 사용하고, `PosUi/src/mocks/bridge/`, `PosUi/src/mocks/screens/`, `PosUi/src/mocks/fixtures/`는 이후 확장을 위한 예비 fixture 계층으로 유지한다

```typescript
// PosUi/src/bridge/PosRequestSender.ts (ví dụ gần với mã hiện행 / 현재 코드 기준 예시)
async function getTransport() {
  if (typeof window !== 'undefined' && window.cefQuery) {
    const { cefTransport } = await import('./adapters/cefTransport');
    return cefTransport;
  }

  const { mockTransport } = await import('./adapters/mockTransport');
  return mockTransport;
}

export async function sendRequest(cmd, params = {}, options = {}) {
  const transport = await getTransport();
  return transport({
    v: 1,
    requestId: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    cmd,
    params,
    ...(options.idempotencyKey ? { idempotencyKey: options.idempotencyKey } : {}),
  });
}
```

---

## 12. Bản ghi quyết định review kỹ thuật (2026-04-01)
└ 엔지니어링 리뷰 결정 기록 (2026-04-01)

| ID | Vấn đề | Quyết định |
|---|---|---|
| ARCH-1 | Chọn nền tảng | Dual build x86/x64, cả hai đều bao gồm CEF |
| └ | └ 플랫폼 선택 | └ x86/x64 듀얼 빌드, 양쪽 모두 CEF 포함 |
| ARCH-2 | Cơ chế loại bỏ MFC UI | Cố định CEF shell đơn + React routing, không duy trì nhánh UI cũ song song |
| └ | └ MFC UI 제거 방식 | └ CEF 단일 셸 + React 라우팅으로 고정, 구형 UI 병행 경로는 유지하지 않음 |
| ARCH-3 | Môi trường phát triển | Catalog `app/design-system/` + Mock transport tích hợp |
| └ | └ 개발 환경 | └ `app/design-system/` 카탈로그 + Mock transport 내장 |
| ARCH-4 | Build pipeline | Tích hợp VS2022 Post-Build Event + npm script |
| └ | └ 빌드 파이프라인 | └ VS2022 Post-Build Event + npm script 통합 |
| ARCH-5 | Hiệu suất cefQuery | Nguyên tắc ưu tiên bulk (yêu cầu đơn khi load màn hình) |
| └ | └ cefQuery 성능 | └ 벌크 우선 원칙 (화면 로드 시 단일 요청) |
| ARCH-7 | Phục hồi crash CEF | CefLifeSpanHandler phát hiện crash → Tự động tái tạo |
| └ | └ CEF 크래시 복구 | └ CefLifeSpanHandler 크래시 감지 → 자동 재생성 |
| ARCH-8 | Kho lưu trữ idempotency | Bảng IdempotencyLedger trong DB SQLite local |
| └ | └ 멱등성 저장소 | └ SQLite 로컬 DB에 IdempotencyLedger 테이블 |

## 13. HJ-POS-TEST DB 인벤토리 추출 순서 및 이식 우선순위
└ HJ-POS-TEST DB 인벤토리 추출 순서 및 이식 우선순위

이 섹션은 **기존 POS의 DB 계약을 역설계해서 현재 프로젝트로 옮기는 작업 순서**를 정의한다.  
이 문서는 역설계 결과표 자체를 보관하지 않고, **무엇을 어떤 순서로 추출하고 어떤 순서로 이식할지**만 규정한다.

### 13.1 전체 DB 인벤토리 추출 순서
└ 전체 DB 인벤토리 추출 순서

| 순서 | 추출 대상 | 기준 파일/모듈 | 산출물 | 이유 |
|---|---|---|---|---|
| 1 | DB 기반 계층 | `DBAccess`, `AdoWraper`, `DBEngine`, `Mgr`, `DataBaseUpdate` | 연결/트랜잭션/버전업 기준선 | DB 계약의 시작점이자 모든 SQL의 하위 기반 |
| 2 | 시스템/부트스트랩 | `SystemInfo`, `HSystemInfo`, `ClientConfig`, `Config`, `StoreInfo`, `LanguageMgr` | 앱 시작 시 필요한 설정/환경/언어 인벤토리 | 앱 기동과 화면 렌더링 전에 먼저 필요한 공통 데이터 |
| 3 | 테이블 도메인 | `TableMgr`, `TableStatusHistory` | 테이블 상태/이력/선택 흐름 인벤토리 | POS 메인 화면의 진입점이자 다른 업무의 기준축 |
| 4 | 주문/판매/결제 | `OrderMgr`, `SaleMgr`, `SellSlip`, `SellDetail`, `UserPayment`, `WAIT_PAYMENT` | 주문/결제 핵심 테이블 인벤토리 | 실제 매출과 직결되는 최우선 업무 흐름 |
| 5 | 고객/배달 | `CustMgr`, 배달 고객 관련 코드, `FoodingBridge` 수신 흐름 | 고객/배달 수신/주소/연락처 인벤토리 | 주문/배달 연동과 조회 화면의 핵심 참조 데이터 |
| 6 | 상품/메뉴 | `ItemMgr`, `ItemChangeLog` | 메뉴/가격/변경 이력 인벤토리 | 주문 품목 계산과 화면 표시의 기초 데이터 |
| 7 | 근태/입출금 | `WorkMgr`, `InOutMgr` | 직원/근무/현금 흐름 인벤토리 | 매장 운영과 정산에 필요한 운영 데이터 |
| 8 | 외부 연동 | `FoodingBridge`, `HTTP`, `MQTTClient`, `BIDV`, `HJVietPay`, `Infoplus`, `ZaloPay`, `WeTax`, `WebAspMgr`, `AspDataMgr` | 외부 서비스 연동/응답/재시도 인벤토리 | 온라인/오프라인, 승인/재전송 경계가 존재하는 연동 계층 |
| 9 | 보조/리포트 | `BrandConfigHost`, `Kio`, `ExcelAuto`, `FileIO`, 기타 화면 보조 코드 | 보고서/엑셀/운영 보조 인벤토리 | 핵심 거래보다 우선순위가 낮은 주변 기능 |

### 13.2 현재 프로젝트에 옮길 우선순위
└ 현재 프로젝트에 옮길 우선순위

| 우선순위 | 옮길 대상 | 현재 프로젝트 위치 | 완료 기준 |
|---|---|---|---|
| P0 | DB 기반 계층, 시스템 설정, 테이블 도메인, 주문/결제 핵심, `Ledger/Outbox/SyncState` | `Infrastructure/Persistence/SQLite/Core`, `Migration`, `Stores`, `Tables/System`, `Tables/Table`, `Tables/Order`, `Tables/Payment`, `Domain/TableManager`, `UseCases/Table` (현재 코드는 `MSSQL/` 경로, SQLite로 전환 예정) | `Table` 선택, 주문 조회, 현금 결제, 상태 변경이 현재 프로젝트에서 동작 |
| P1 | 고객/상품/근태/입출금, 테이블 상태 이력, 주문/결제 상세 인벤토리 | `Tables/Customer`, `Tables/Item`, `Tables/Table/TableStatusHistoryCrud`, `ReadModels`, 관련 `Domain/*` | 핵심 3화면 외의 조회/보조 업무가 동일한 데이터 계약으로 동작 |
| P2 | 외부 결제 연동, Fooding/MQTT/배달 수신, WebAsp/AspData 연동 | `Presentation/CEF/InternalBridge`, `ExternalBridge` 대응 계층, `UseCases` 후처리 | 외부 요청/응답/재시도가 멱등성 규칙에 맞게 분리됨 |
| P3 | 보고서/엑셀/운영 보조/레거시 화면 보조 기능 | `Shared`, `BuildSupport`, 보조 `ReadModels`, 운영 도구 | 핵심 거래 흐름과 분리된 보조 기능이 필요 시점에만 이식 |

상태 표기 규칙:
- `implemented`: 현재 repo에 실제 코드가 존재하고 빌드 대상으로 포함되는 상태
- `planned`: 설계상 필수이지만 아직 placeholder 또는 미생성인 상태
- `partial`: 디렉토리나 일부 코드는 있으나 도메인 책임/연결이 아직 완결되지 않은 상태

### 13.3 이식 원칙
└ 이식 원칙

- 먼저 **DB 계약을 수집**하고, 그 다음에 **현재 프로젝트의 코드 구조에 맞춰 이식**한다.
- 테이블 정의 없이 `UseCase`나 `Mapper`부터 만들지 않는다.
- `Core`는 공통 읽기/페이징/감사 보조만 가진다.
- `Tables/<Domain>/<Entity>Crud.h/cpp`는 물리 테이블 단위의 실제 영속 코드만 가진다.
- `ReadModels`는 조인/목록/집계 조회만 가진다.
- `Domain/*Mgr`는 업무 규칙만 가지며, persistence 계층 이름으로는 사용하지 않는다.
- 외부 연동은 P0 계약이 아니라도, `P2` 전에 최소한 mock/stub 경로는 확보한다.

### 13.4 테이블별 인벤토리 체크리스트
└ 테이블별 인벤토리 체크리스트

이 표는 HJ-POS-TEST에서 실제 SQL이 흩어져 있던 테이블군을 P0/P1/P2로 정리한 것이다.  
P0는 현재 프로젝트로 즉시 이식해야 하는 핵심 거래축, P1은 핵심 화면 보강축, P2는 외부 연동축이다.

| 테이블군 | 레거시 테이블/모듈 | 우선순위 | 현재 프로젝트 대상 | 체크 포인트 |
|---|---|---|---|---|
| Table | `TableMgr`, `TableStatusHistory`, `Printing`, `Printing2`, `Red_InOutRoom`, `TableMsg`, `SimpleReceipt` | P0 | `Domain/TableManager`, `Tables/Table/*`, `Tables/Table/TableStatusHistoryCrud.*`, `ReadModels/Table/*` | 테이블 선택/이동/해제, 테이블 이력, 출력 큐 |
| Order | `OrderSlip`, `OrderDetail`, `OrderDetailLog`, `Delivery`, `OSelectTable`, `ButtonSet`, `ReceiptMsg` | P0-P1 | `Tables/Order/*`, `UseCases/Order/*`(추가 예정), `ReadModels/Order/*` | 주문 생성/조회/이동, 주방 전달, 주문 묶음 조회 |
| Payment | `SellSlip`, `SellDetail`, `UserPayment`, `WAIT_PAYMENT`, `CardSell`, `CustSell`, `EdenredMgr`, `H_SellSendData` | P0-P2 | `Tables/Payment/*`, `UseCases/Payment/*`(추가 예정), `Stores/*` | 현금결제, 승인형 결제, 결제 이력, 송신 큐 |
| Customer | `Cust`, `CustKeepReg`, `DeliAddrGrp`, `DeliAddr`, `DeliAgency`, `DeliveryCID`, `TickMgr`, `CustVisit`, `CustItemSell` | P1 | `Tables/Customer/*`, `ReadModels/Customer/*` | 고객 조회, 배달 주소, 적립/방문 이력 |
| Item | `Item`, `ItemDetail`, `ItemChangeLog`, `Grp`, `GrpMid`, `ItemFavor`, `SaleItem`, `CourseMenu`, `Supply`, `PurchaseIn`, `PurchaseDetail`, `BasicCode`, `CSOrderDetail` | P1 | `Tables/Item/*`, `ReadModels/Item/*` | 메뉴/분류/재고/판매가/변경이력 |
| System | `ClientConfig`, `Config`, `StoreInfo`, `StoreSetWeek`, `AdditionConfig`, `ButtonSet`, `ReceiptMsg`, `BasicCode` | P0-P1 | `Tables/System/*`, `Migration/*` | 기동 설정, 매장 정보, 기본 코드, 프린터/디스플레이 설정 |
| Integration | `ViettelBuyerInfo`, `FoodingBridge`, `MQTTClient`, `WebAspMgr`, `AspDataMgr` | P2 | `ExternalBridge`, `Sync`, `UseCases` 후처리 | 외부 주문/승인/재전송/복구 |

### 13.5 현재 프로젝트 이식 매핑표
└ 현재 프로젝트 이식 매핑표

| 레거시 축 | HJ-POS-TEST 주요 파일 | 목표 구조 | 현재 상태 | 다음 단계 |
|---|---|---|---|---|
| DB core | `DBAccess.h/cpp`, `AdoWraper.h/cpp`, `DBEngine.h/cpp`, `Mgr.h/cpp` | `Infrastructure/Persistence/SQLite/Core/PersistenceCore`, `Migration/SchemaVersion` (현재 코드: `MSSQL/`) | `partial` | `DBEngine`, `Mgr` 책임을 `PersistenceCore`와 schema preflight 계약으로 명시적으로 흡수. MSSQL→SQLite 엔진 전환 |
| Schema update | `DataBaseUpdate.h/cpp` | `Infrastructure/Persistence/SQLite/Migration/DataBaseUpdate`, `Migration/Versions/*` (현재 코드: `MSSQL/`) | `implemented` | release ↔ schema version 호환 매트릭스 추가 |
| Table domain | `TableMgr.h/cpp` | `Domain/Table/TableManager`, `Infrastructure/Persistence/SQLite/Tables/Table/*`, `UseCases/Table/*`, `Presentation/CEF/InternalBridge/PosRequestActions/Table/*`, `ReadModels/Table/*` (현재 코드: `MSSQL/`) | `partial` | `ReadModels/Table/*`와 화면 bootstrap 조회 분리 |
| Order domain | `OrderMgr.h/cpp` | `Infrastructure/Persistence/SQLite/Tables/Order/*`, `UseCases/Order/*`, `ReadModels/Order/*` | `planned` | `UseCases/Order`, `Domain/Order`, `ReadModels/Order` 생성 |
| Payment domain | `SaleMgr.h/cpp` | `Infrastructure/Persistence/SQLite/Tables/Payment/*`, `UseCases/Payment/*`, `ReadModels/Payment/*`, `Stores/*` | `partial` | 결제 조회는 `ReadModels/Payment`, 승인/보류/재조회 흐름은 `UseCases/Payment`로 분리 |
| Customer domain | `CustMgr.h/cpp` | `Infrastructure/Persistence/SQLite/Tables/Customer/*`, `ReadModels/Customer/*`, `Domain/Customer/*` | `planned` | 고객 조회/주소/배달 read model 설계 및 생성 |
| Item domain | `ItemMgr.h/cpp` | `Infrastructure/Persistence/SQLite/Tables/Item/*`, `ReadModels/Item/*`, `Domain/Item/*` | `planned` | 메뉴/분류/변경이력 read model 설계 및 생성 |
| System domain | `SystemInfo.h/cpp` | `Infrastructure/Persistence/SQLite/Tables/System/*`, `UseCases/System/*`, `ReadModels/System/*` | `partial` | bootstrap/config read model, schema preflight, recovery bootstrap 연결 |
| CEF/Bridge | `Dlg/*`, `FoodingBridge/*`, `HTTP/*` | `Presentation/CEF/*`, `PosUi/src/bridge/*`, `PosUi/src/providers/*`, `PosUi/src/store/api/*`, `PosUi/src/bridge/contracts/*` | `partial` | `bridge/contracts` 중앙 계약 계층 추가 |

### 13.6 P0 대상의 실제 파일 리스트
└ P0 대상의 실제 파일 리스트

이 항목은 **현재 프로젝트에 실제 존재하는 파일**, **필수지만 아직 미생성인 파일**, **즉시 추가해야 할 구조 보강 파일**을 분리해서 적는다.  
새 기능을 만들기 전에, 먼저 이 목록을 기준으로 이식 범위와 상태를 고정한다.

#### 13.6.1 HJ-POS-TEST 원본 파일
└ HJ-POS-TEST 원본 파일

```text
/Users/hyojae/projects/fooding/HJ-POS-TEST/DB/DBAccess.h
/Users/hyojae/projects/fooding/HJ-POS-TEST/DB/DBAccess.cpp
/Users/hyojae/projects/fooding/HJ-POS-TEST/DB/AdoWraper.h
/Users/hyojae/projects/fooding/HJ-POS-TEST/DB/AdoWraper.cpp
/Users/hyojae/projects/fooding/HJ-POS-TEST/DB/DBEngine.h
/Users/hyojae/projects/fooding/HJ-POS-TEST/DB/DBEngine.cpp
/Users/hyojae/projects/fooding/HJ-POS-TEST/DB/Mgr.h
/Users/hyojae/projects/fooding/HJ-POS-TEST/DB/Mgr.cpp
/Users/hyojae/projects/fooding/HJ-POS-TEST/DB/DataBaseUpdate.h
/Users/hyojae/projects/fooding/HJ-POS-TEST/DB/DataBaseUpdate.cpp
/Users/hyojae/projects/fooding/HJ-POS-TEST/DB/TableMgr.h
/Users/hyojae/projects/fooding/HJ-POS-TEST/DB/TableMgr.cpp
/Users/hyojae/projects/fooding/HJ-POS-TEST/DB/OrderMgr.h
/Users/hyojae/projects/fooding/HJ-POS-TEST/DB/OrderMgr.cpp
/Users/hyojae/projects/fooding/HJ-POS-TEST/DB/SaleMgr.h
/Users/hyojae/projects/fooding/HJ-POS-TEST/DB/SaleMgr.cpp
/Users/hyojae/projects/fooding/HJ-POS-TEST/DB/CustMgr.h
/Users/hyojae/projects/fooding/HJ-POS-TEST/DB/CustMgr.cpp
/Users/hyojae/projects/fooding/HJ-POS-TEST/DB/ItemMgr.h
/Users/hyojae/projects/fooding/HJ-POS-TEST/DB/ItemMgr.cpp
/Users/hyojae/projects/fooding/HJ-POS-TEST/DB/SystemInfo.h
/Users/hyojae/projects/fooding/HJ-POS-TEST/DB/SystemInfo.cpp
/Users/hyojae/projects/fooding/HJ-POS-TEST/BrandConfigHost/Base.h
```

#### 13.6.2 현재 프로젝트의 실제 P0 파일
└ 현재 프로젝트의 실제 P0 파일

```text
/Users/hyojae/projects/Platform/BrandPosApp/AppHost/BrandPosHost/BrandPosApp.h
/Users/hyojae/projects/Platform/BrandPosApp/AppHost/BrandPosHost/BrandPosApp.cpp
/Users/hyojae/projects/Platform/BrandPosApp/AppHost/BrandPosHost/CefBootstrap.h
/Users/hyojae/projects/Platform/BrandPosApp/AppHost/BrandPosHost/CefBootstrap.cpp
/Users/hyojae/projects/Platform/BrandPosApp/AppHost/BrandPosHost/BrandPosApp.vcxproj
/Users/hyojae/projects/Platform/BrandPosApp/AppHost/Bootstrap/AppCompositionRoot.h
/Users/hyojae/projects/Platform/BrandPosApp/AppHost/Bootstrap/AppCompositionRoot.cpp
/Users/hyojae/projects/Platform/BrandPosApp/AppHost/Bootstrap/ServiceRegistry.h

/Users/hyojae/projects/Platform/BrandPosApp/Presentation/CEF/Handlers/CefAppHandler.h
/Users/hyojae/projects/Platform/BrandPosApp/Presentation/CEF/Handlers/CefAppHandler.cpp
/Users/hyojae/projects/Platform/BrandPosApp/Presentation/CEF/Handlers/CefBrowserDlg.h
/Users/hyojae/projects/Platform/BrandPosApp/Presentation/CEF/Handlers/CefBrowserDlg.cpp
/Users/hyojae/projects/Platform/BrandPosApp/Presentation/CEF/Handlers/CefSchemeHandler.h
/Users/hyojae/projects/Platform/BrandPosApp/Presentation/CEF/Handlers/CefSchemeHandler.cpp
/Users/hyojae/projects/Platform/BrandPosApp/Presentation/CEF/Handlers/BrowserRecoveryManager.h
/Users/hyojae/projects/Platform/BrandPosApp/Presentation/CEF/Handlers/BrowserRecoveryManager.cpp
/Users/hyojae/projects/Platform/BrandPosApp/Presentation/CEF/InternalBridge/PosRequestResponder.h
/Users/hyojae/projects/Platform/BrandPosApp/Presentation/CEF/InternalBridge/PosRequestResponder.cpp
/Users/hyojae/projects/Platform/BrandPosApp/Presentation/CEF/InternalBridge/PosRealTimeSender.h
/Users/hyojae/projects/Platform/BrandPosApp/Presentation/CEF/InternalBridge/PosRealTimeSender.cpp
/Users/hyojae/projects/Platform/BrandPosApp/Presentation/CEF/InternalBridge/PosRequestActions/Table/TableActions.h
/Users/hyojae/projects/Platform/BrandPosApp/Presentation/CEF/InternalBridge/PosRequestActions/Table/TableActions.cpp
/Users/hyojae/projects/Platform/BrandPosApp/Presentation/CEF/InternalBridge/PosRequestActions/Table/TableTypes.h
/Users/hyojae/projects/Platform/BrandPosApp/Presentation/CEF/InternalBridge/PosRequestActions/System/SystemActions.h
/Users/hyojae/projects/Platform/BrandPosApp/Presentation/CEF/InternalBridge/PosRequestActions/System/SystemActions.cpp
/Users/hyojae/projects/Platform/BrandPosApp/Presentation/CEF/InternalBridge/PosRequestActions/System/SystemTypes.h

/Users/hyojae/projects/Platform/BrandPosApp/UseCases/Shared/RequestContext.h
/Users/hyojae/projects/Platform/BrandPosApp/UseCases/Shared/UseCaseResult.h
/Users/hyojae/projects/Platform/BrandPosApp/UseCases/Shared/TransactionRunner.h
/Users/hyojae/projects/Platform/BrandPosApp/UseCases/Shared/TransactionRunner.cpp
/Users/hyojae/projects/Platform/BrandPosApp/UseCases/Shared/OperationLockService.h
/Users/hyojae/projects/Platform/BrandPosApp/UseCases/Shared/OperationLockService.cpp
/Users/hyojae/projects/Platform/BrandPosApp/UseCases/Shared/IdempotencyService.h
/Users/hyojae/projects/Platform/BrandPosApp/UseCases/Shared/IdempotencyService.cpp
/Users/hyojae/projects/Platform/BrandPosApp/UseCases/Table/SelectTableUseCase.h
/Users/hyojae/projects/Platform/BrandPosApp/UseCases/Table/SelectTableUseCase.cpp
/Users/hyojae/projects/Platform/BrandPosApp/UseCases/Table/RefreshTablesUseCase.h
/Users/hyojae/projects/Platform/BrandPosApp/UseCases/Table/RefreshTablesUseCase.cpp

/Users/hyojae/projects/Platform/BrandPosApp/Domain/Table/TableManager.h
/Users/hyojae/projects/Platform/BrandPosApp/Domain/Table/TableManager.cpp

/Users/hyojae/projects/Platform/BrandPosApp/Infrastructure/Persistence/MSSQL/DBAccess.h
/Users/hyojae/projects/Platform/BrandPosApp/Infrastructure/Persistence/MSSQL/DBAccess.cpp
/Users/hyojae/projects/Platform/BrandPosApp/Infrastructure/Persistence/MSSQL/AdoWraper.h
/Users/hyojae/projects/Platform/BrandPosApp/Infrastructure/Persistence/MSSQL/AdoWraper.cpp
/Users/hyojae/projects/Platform/BrandPosApp/Infrastructure/Persistence/MSSQL/Core/PersistenceCore.h
/Users/hyojae/projects/Platform/BrandPosApp/Infrastructure/Persistence/MSSQL/Core/PersistenceCore.cpp
/Users/hyojae/projects/Platform/BrandPosApp/Infrastructure/Persistence/MSSQL/Migration/DataBaseUpdate.h
/Users/hyojae/projects/Platform/BrandPosApp/Infrastructure/Persistence/MSSQL/Migration/DataBaseUpdate.cpp
/Users/hyojae/projects/Platform/BrandPosApp/Infrastructure/Persistence/MSSQL/Migration/SchemaVersion.h
/Users/hyojae/projects/Platform/BrandPosApp/Infrastructure/Persistence/MSSQL/Migration/SchemaVersion.cpp
/Users/hyojae/projects/Platform/BrandPosApp/Infrastructure/Persistence/MSSQL/Migration/Versions/V20250328_AddUserPayment.h
/Users/hyojae/projects/Platform/BrandPosApp/Infrastructure/Persistence/MSSQL/Migration/Versions/V20250328_AddUserPayment.cpp
/Users/hyojae/projects/Platform/BrandPosApp/Infrastructure/Persistence/MSSQL/Migration/Versions/V20251013_AddWaitPayment.h
/Users/hyojae/projects/Platform/BrandPosApp/Infrastructure/Persistence/MSSQL/Migration/Versions/V20251013_AddWaitPayment.cpp
/Users/hyojae/projects/Platform/BrandPosApp/Infrastructure/Persistence/MSSQL/Stores/RequestLedgerStore.h
/Users/hyojae/projects/Platform/BrandPosApp/Infrastructure/Persistence/MSSQL/Stores/RequestLedgerStore.cpp
/Users/hyojae/projects/Platform/BrandPosApp/Infrastructure/Persistence/MSSQL/Stores/OutboxStore.h
/Users/hyojae/projects/Platform/BrandPosApp/Infrastructure/Persistence/MSSQL/Stores/OutboxStore.cpp
/Users/hyojae/projects/Platform/BrandPosApp/Infrastructure/Persistence/MSSQL/Stores/SyncStateStore.h
/Users/hyojae/projects/Platform/BrandPosApp/Infrastructure/Persistence/MSSQL/Stores/SyncStateStore.cpp
/Users/hyojae/projects/Platform/BrandPosApp/Infrastructure/Persistence/MSSQL/Tables/Table/TableCrud.h
/Users/hyojae/projects/Platform/BrandPosApp/Infrastructure/Persistence/MSSQL/Tables/Table/TableCrud.cpp
/Users/hyojae/projects/Platform/BrandPosApp/Infrastructure/Persistence/MSSQL/Tables/Table/TableStatusHistoryCrud.h
/Users/hyojae/projects/Platform/BrandPosApp/Infrastructure/Persistence/MSSQL/Tables/Table/TableStatusHistoryCrud.cpp
/Users/hyojae/projects/Platform/BrandPosApp/Infrastructure/Persistence/MSSQL/Tables/Order/OrderSlipCrud.h
/Users/hyojae/projects/Platform/BrandPosApp/Infrastructure/Persistence/MSSQL/Tables/Order/OrderSlipCrud.cpp
/Users/hyojae/projects/Platform/BrandPosApp/Infrastructure/Persistence/MSSQL/Tables/Order/OrderItemCrud.h
/Users/hyojae/projects/Platform/BrandPosApp/Infrastructure/Persistence/MSSQL/Tables/Order/OrderItemCrud.cpp
/Users/hyojae/projects/Platform/BrandPosApp/Infrastructure/Persistence/MSSQL/Tables/Payment/SellSlipCrud.h
/Users/hyojae/projects/Platform/BrandPosApp/Infrastructure/Persistence/MSSQL/Tables/Payment/SellSlipCrud.cpp
/Users/hyojae/projects/Platform/BrandPosApp/Infrastructure/Persistence/MSSQL/Tables/Payment/SellDetailCrud.h
/Users/hyojae/projects/Platform/BrandPosApp/Infrastructure/Persistence/MSSQL/Tables/Payment/SellDetailCrud.cpp
/Users/hyojae/projects/Platform/BrandPosApp/Infrastructure/Persistence/MSSQL/Tables/Payment/UserPaymentCrud.h
/Users/hyojae/projects/Platform/BrandPosApp/Infrastructure/Persistence/MSSQL/Tables/Payment/UserPaymentCrud.cpp
/Users/hyojae/projects/Platform/BrandPosApp/Infrastructure/Persistence/MSSQL/Tables/Payment/WaitPaymentCrud.h
/Users/hyojae/projects/Platform/BrandPosApp/Infrastructure/Persistence/MSSQL/Tables/Payment/WaitPaymentCrud.cpp
/Users/hyojae/projects/Platform/BrandPosApp/Infrastructure/Persistence/MSSQL/Tables/Customer/CustomerCrud.h
/Users/hyojae/projects/Platform/BrandPosApp/Infrastructure/Persistence/MSSQL/Tables/Customer/CustomerCrud.cpp
/Users/hyojae/projects/Platform/BrandPosApp/Infrastructure/Persistence/MSSQL/Tables/Item/ItemCrud.h
/Users/hyojae/projects/Platform/BrandPosApp/Infrastructure/Persistence/MSSQL/Tables/Item/ItemCrud.cpp
/Users/hyojae/projects/Platform/BrandPosApp/Infrastructure/Persistence/MSSQL/Tables/Item/ItemChangeLogCrud.h
/Users/hyojae/projects/Platform/BrandPosApp/Infrastructure/Persistence/MSSQL/Tables/Item/ItemChangeLogCrud.cpp
/Users/hyojae/projects/Platform/BrandPosApp/Infrastructure/Persistence/MSSQL/Tables/System/ClientConfigCrud.h
/Users/hyojae/projects/Platform/BrandPosApp/Infrastructure/Persistence/MSSQL/Tables/System/ClientConfigCrud.cpp
/Users/hyojae/projects/Platform/BrandPosApp/Infrastructure/Persistence/MSSQL/Tables/System/ConfigCrud.h
/Users/hyojae/projects/Platform/BrandPosApp/Infrastructure/Persistence/MSSQL/Tables/System/ConfigCrud.cpp
/Users/hyojae/projects/Platform/BrandPosApp/Infrastructure/Persistence/MSSQL/Tables/System/StoreInfoCrud.h
/Users/hyojae/projects/Platform/BrandPosApp/Infrastructure/Persistence/MSSQL/Tables/System/StoreInfoCrud.cpp
```

#### 13.6.3 P0에 필요하지만 아직 미생성인 현재 프로젝트 파일
└ P0에 필요하지만 아직 미생성인 현재 프로젝트 파일

```text
/Users/hyojae/projects/Platform/BrandPosApp/UseCases/Order/*
/Users/hyojae/projects/Platform/BrandPosApp/UseCases/Payment/*
/Users/hyojae/projects/Platform/BrandPosApp/Domain/Order/*
/Users/hyojae/projects/Platform/BrandPosApp/Domain/Payment/*
/Users/hyojae/projects/Platform/BrandPosApp/Domain/Customer/*
/Users/hyojae/projects/Platform/BrandPosApp/Domain/Item/*
/Users/hyojae/projects/Platform/BrandPosApp/Domain/System/*
/Users/hyojae/projects/Platform/BrandPosApp/Presentation/CEF/InternalBridge/PosRequestActions/Order/*
/Users/hyojae/projects/Platform/BrandPosApp/Presentation/CEF/InternalBridge/PosRequestActions/Payment/*
/Users/hyojae/projects/Platform/BrandPosApp/Infrastructure/Persistence/MSSQL/ReadModels/*
/Users/hyojae/projects/Platform/BrandPosApp/Infrastructure/Persistence/MSSQL/Stores/RecoveryStateStore.h
/Users/hyojae/projects/Platform/BrandPosApp/Infrastructure/Persistence/MSSQL/Stores/RecoveryStateStore.cpp
/Users/hyojae/projects/Platform/PosUi/src/bridge/contracts/*
/Users/hyojae/projects/Platform/PosUi/src/store/api/paymentApi.ts
/Users/hyojae/projects/Platform/PosUi/src/store/api/syncApi.ts
/Users/hyojae/projects/Platform/PosUi/src/screens/OrderScreen/index.tsx
/Users/hyojae/projects/Platform/PosUi/src/screens/PaymentScreen/index.tsx
```
