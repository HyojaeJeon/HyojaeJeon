# Kế hoạch chuyển đổi kiến trúc POS: Sciter/MFC → CEF + Next.js
(POS 아키텍처 전환 계획서: Sciter/MFC → CEF + Next.js)

> **Ngày tạo**: 2026-03-31
> (작성일)
> **Dự án**: HyojungPOSApp (tên cũ: RestaurantGLB V2)
> (프로젝트: HyojungPOSApp (기존: RestaurantGLB V2))
> **Mục đích**: Chuyển đổi UI sang CEF + Next.js + Redux Toolkit + RTK Query, C++ chuyên trách logic nghiệp vụ/DB/giao tiếp server/thiết bị ngoại vi
> (목적: UI를 CEF + Next.js + Redux Toolkit + RTK Query로 전환, C++은 비즈니스 로직/DB/서버통신/주변기기 전담)
> **Tính chất tài liệu**: Đây không phải tài liệu mô phỏng cấu trúc code hiện tại, mà là tài liệu tiêu chuẩn thiết kế định nghĩa kiến trúc mục tiêu và tiêu chuẩn vận hành
> (문서 성격: 현행 코드 구조를 답습하는 문서가 아니라, 목표 아키텍처와 운영 기준을 정의하는 설계 기준서)

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
| Ngôn ngữ | JavaScript thuần (không dùng TypeScript) |
| └ 언어 | └ 순수 JavaScript (TypeScript 미사용) |
| Mô hình vận hành | Offline-First. MSSQL cục bộ là nguồn dữ liệu nghiệp vụ, hệ thống từ xa là đối tượng đồng bộ |
| └ 운영 모델 | └ Offline-First. 로컬 MSSQL이 업무 데이터 원본, 원격 시스템은 동기화 대상 |
| Quản lý trạng thái | Thống nhất RTK Query. Dữ liệu truy vấn dùng cache RTK Query, Redux slice chỉ cho trạng thái UI |
| └ 상태 관리 | └ RTK Query 단일화. 조회 데이터는 RTK Query 캐시, Redux slice는 UI 상태만 |
| Vòng đời trình duyệt | Duy trì một instance CefBrowser chính, chuyển màn hình qua React state/routing |
| └ 브라우저 생명주기 | └ 메인 CefBrowser 단일 인스턴스 유지, 화면 전환은 React 상태/라우팅으로 처리 |
| Nguyên tắc tầng | UI/Bridge → UseCases → DB/Manager → Infra một chiều |
| └ 계층 원칙 | └ UI/Bridge → UseCases → DB/Manager → Infra 단방향 |
| Nguyên tắc lưu trữ | Không áp dụng Repository toàn phần theo từng Manager. Giữ cấu trúc Manager 중심, chỉ tách các kho vận hành dưới dạng `*Store` trong `Infrastructure/Persistence` |
| └ 영속화 원칙 | └ Manager별 Repository 전면 도입은 하지 않는다. `Manager 중심 + Infrastructure/Persistence + 운영 저장소만 *Store`로 분리 |
| Xử lý trùng lặp | Thanh toán/Đặt món đảm bảo tính idempotent theo `requestId` + `idempotencyKey` (bảng MSSQL IdempotencyLedger) |
| └ 중복 처리 | └ 결제/주문은 `requestId` + `idempotencyKey` 기준 멱등성 보장 (MSSQL IdempotencyLedger 테이블) |
| Mục tiêu UI cuối cùng | Loại bỏ hoàn toàn MFC UI. Tất cả màn hình hội tụ về CEF + Next.js |
| └ 최종 UI 목표 | └ MFC UI는 완전 제거하고, 모든 화면은 CEF + Next.js로 수렴 |
| Điều khiển chuyển màn hình | Chỉ dùng CEF shell đơn + React routing. Không có MFC fallback trong cấu trúc đích |
| └ 화면 전환 제어 | └ CEF 단일 셸 + React 라우팅만 사용한다. 목표 구조에 MFC fallback은 없다 |
| Môi trường phát triển | Catalog thiết kế `app/design-system/` + Mock transport tích hợp. Phát triển UI/màn hình không cần C++ với `next dev` |
| └ 개발 환경 | └ `app/design-system/` 디자인 카탈로그 + Mock transport 내장. `next dev`로 C++ 없이 UI/화면 개발 가능 |
| Nguyên tắc cefQuery | Khi tải màn hình, yêu cầu dữ liệu bulk bằng một cefQuery duy nhất. Truy vấn từng mục chỉ khi có hành động người dùng |
| └ cefQuery 원칙 | └ 화면 로드 시 단일 cefQuery로 벌크 데이터 요청. 개별 항목 조회는 사용자 액션에만 |
| Độ ổn định CEF | CefLifeSpanHandler phát hiện crash → Tự động tái tạo trình duyệt → Tái hydrate bootstrap dựa trên MSSQL cục bộ |
| └ CEF 안정성 | └ CefLifeSpanHandler에서 크래시 감지 → 브라우저 자동 재생성 → 로컬 MSSQL 기반 bootstrap 재수화 |

---

## 2. Cấu trúc thư mục dự án sau chuyển đổi
└ 전환 후 프로젝트 디렉토리 구조

### 2.1 Cấu hình Monorepo
└ 모노레포 구성

Bao gồm 2 dự án Main (POS) và Set (Cài đặt) trong 1 kho Git duy nhất.
Mỗi dự án có thể **build/chạy độc lập**, không tham chiếu lẫn nhau trong runtime.
Chương trình cài đặt lưu dữ liệu Config/Item/Table vào MSSQL, POS chính đọc và sử dụng.
└ 1개 Git 저장소에 Main(POS)과 Set(설정) 2개 프로젝트를 포함.
└ 각 프로젝트는 독립적으로 빌드/실행 가능하며, 런타임에 서로 참조하지 않음.
└ 설정 프로그램이 MSSQL에 저장한 Config/Item/Table 등의 데이터를 메인 POS가 읽어서 사용.

```
HyojungPOSApp (Kho Git duy nhất / 단일 Git 저장소)
├── HyojungPOS-Main/       RestaurantD.exe    (Build/chạy độc lập / 독립 빌드/실행)
├── HyojungPOS-Set/        RestaurantSet.exe  (Build/chạy độc lập / 독립 빌드/실행)
├── SharedCpp/             Module C++ dùng chung (Foundation, Contracts, Observability, BuildSupport)
│                          └ 공유 C++ 기반 모듈
└── Shared/                Tài nguyên dùng chung (i18n JSON, v.v.)
                           └ 공유 리소스 (i18n JSON 등)
```

Quan hệ kết nối / 연결 관계:
```
HyojungPOS-Set (Cài đặt/설정)         HyojungPOS-Main (POS chính/메인)
    │                                      │
    └──── MSSQL DB (Config, Item, ────────┘
           Table, Cust, v.v./등)
```
- Set lưu cài đặt vào DB → Main đọc cài đặt từ DB
- └ Set이 DB에 설정 저장 → Main이 DB에서 설정 읽기
- Không phụ thuộc ở cấp code (không tham chiếu dự án, không chia sẻ DLL)
- └ 코드 레벨 의존 없음 (프로젝트 참조 없음, DLL 공유 없음)
- `SharedCpp/` không phải thư mục triển khai DB để sao chép, chỉ chứa hợp đồng chung, tiện ích chung, hỗ trợ build
- └ `SharedCpp/`는 복사용 DB 구현 폴더가 아니라 공통 계약, 공통 유틸, 빌드 지원만 보관
- Triển khai theo domain (`OrderMgr`, `SaleMgr`, `Fooding`, v.v.) đặt bên trong mỗi dự án Main/Set
- └ 도메인별 구현(`OrderMgr`, `SaleMgr`, `Fooding` 등)은 Main/Set 각 프로젝트 내부에 둔다

---

### 2.2 Cấu trúc Layer mục tiêu
└ 목표 레이어 구조

| Tầng | Trách nhiệm | Đối tượng bao gồm |
|------|------|------|
| `Presentation` | Màn hình, CEF shell, hosting trình duyệt | `PosUI/`, `CEF/Handlers/`, `Shell/` |
| └ | └ 화면, CEF 셸, 브라우저 호스팅 | |
| `InternalBridge` | Định tuyến yêu cầu, xác thực tham số, định dạng phản hồi | `PosRequestResponder`, `PosRequestActions`, `PosRealTimeSender` |
| └ | └ 요청 라우팅, 파라미터 검증, 응답 포맷 | |
| `UseCases` | Điều phối use case, giao dịch, idempotency, khóa, hậu xử lý | `SelectTableUseCase`, `CreateOrderUseCase`, `ExecutePaymentUseCase`, `ReceiveDeliveryOrderUseCase` |
| └ | └ 유스케이스 오케스트레이션, 트랜잭션, 멱등성, 락, 후처리 | |
| `Domain/Manager` | Quy tắc nghiệp vụ, tính toán, thao tác dữ liệu | `TableMgr`, `OrderMgr`, `SaleMgr`, `CustMgr`, `ItemMgr` |
| └ | └ 비즈니스 규칙, 계산, 데이터 조작 | |
| `Infrastructure` | Kết nối MSSQL cục bộ, đồng bộ, liên kết bên ngoài, thiết bị, mạng, logging | `DBAccess`, `AdoWraper`, `ExternalBridge`, `Device`, `Network`, `Sync` |
| └ | └ 로컬 MSSQL 연결, 동기화, 외부 연동, 장치, 네트워크, 로깅 | |

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

### 2.3 Cấu trúc thư mục tích hợp mục tiêu (tiêu chuẩn cuối cùng)
└ 통합 목표 디렉토리 구조 (최종 기준)

Tiêu chuẩn cấu trúc thư mục trong tài liệu này là **cấu trúc tích hợp duy nhất** dưới đây.
└ 이 문서에서 디렉토리 구조의 기준은 아래 단일 통합 구조다.

```text
HyojungPOSApp/                                                  # Thư mục gốc kho Git duy nhất / 단일 Git 저장소 루트
├── HyojungPOS-Main/                                            # Chương trình POS chính / POS 메인 프로그램
│   ├── HyojungPOS-Main.sln                                     # Solution VS POS chính / POS 메인 VS 솔루션
│   ├── AppHost/                                                # Tầng host thực thi/bootstrap / 실행 호스트/부트스트랩 계층
│   │   ├── RestaurantGLB/                                      # Dự án RestaurantGLB hiện tại / 기존 RestaurantGLB 프로젝트
│   │   │   ├── RestaurantGLB.vcxproj                           # Dự án file thực thi POS chính / POS 메인 실행 파일 프로젝트
│   │   │   └── Restaurant.cpp/h                                # Điểm vào ứng dụng và khởi tạo CEF / 앱 진입점과 CEF 초기화
│   │   └── Bootstrap/                                          # Code lắp ráp dependency/bootstrap / 의존성 조립/부트스트랩 코드
│   │       ├── ServiceRegistry.h                               # Quy ước đăng ký service / 서비스 등록 규약
│   │       └── AppCompositionRoot.cpp                          # Gốc tổ hợp ứng dụng / 앱 조합 루트
│   ├── Presentation/                                           # Tầng trình bày màn hình/trình duyệt/UI / 화면/브라우저/UI 표현 계층
│   │   ├── CEF/                                                # Engine UI dựa trên CEF / CEF 기반 UI 엔진
│   │   │   ├── SDK/                                            # CEF SDK và binary / CEF SDK 및 바이너리
│   │   │   │   ├── include/                                    # Header CEF / CEF 헤더
│   │   │   │   ├── Release/                                    # DLL runtime CEF / CEF 런타임 DLL
│   │   │   │   ├── Resources/                                  # File tài nguyên CEF / CEF 리소스 파일
│   │   │   │   └── libcef_dll_wrapper/                         # Thư viện wrapper CEF / CEF 래퍼 라이브러리
│   │   │   ├── Subprocess/                                     # Dự án subprocess renderer CEF / CEF 렌더러 서브프로세스 프로젝트
│   │   │   │   ├── CefSubprocess.vcxproj                       # File build subprocess renderer / 렌더러 서브프로세스 빌드 파일
│   │   │   │   └── main.cpp                                    # Điểm vào subprocess renderer / 렌더러 서브프로세스 진입점
│   │   │   ├── Handlers/                                       # Vòng đời/hosting trình duyệt CEF / CEF 브라우저 수명주기/호스팅
│   │   │   │   ├── CefAppHandler.h/cpp                         # Khởi tạo ứng dụng và handler tiến trình / 앱 초기화 및 프로세스 핸들러
│   │   │   │   ├── CefBrowserHost.h/cpp                        # Hosting CEF trong native shell / 네이티브 셸 CEF 호스팅
│   │   │   │   ├── CefSchemeHandler.h/cpp                      # Ánh xạ scheme app://pos/ / app://pos/ 스킴 매핑
│   │   │   │   └── BrowserRecoveryManager.h/cpp                # Giám sát/phục hồi renderer crash / renderer crash 감시/복구
│   │   │   └── InternalBridge/                                 # Cầu nối nội bộ JS ↔ C++ / JS ↔ C++ 내부 브릿지
│   │   │       ├── PosRequestResponder.h/cpp                   # Đầu vào yêu cầu UI/định dạng phản hồi / UI 요청 입구/응답 포맷
│   │   │       ├── PosRealTimeSender.h/cpp                     # Gửi sự kiện thời gian thực đến UI / UI 실시간 이벤트 송신
│   │   │       └── PosRequestActions/                          # Tập hợp action cho định tuyến bridge / 브릿지 라우팅용 액션 집합
│   │   │           ├── Table/                                  # Action yêu cầu bàn / 테이블 요청 액션
│   │   │           │   ├── TableActions.h/cpp                  # Định tuyến yêu cầu bàn / 테이블 요청 라우팅
│   │   │           │   └── TableTypes.h                        # Cấu trúc DTO/phân tích yêu cầu bàn / 테이블 요청 DTO/파싱 구조
│   │   │           ├── Order/                                  # Action yêu cầu đặt món / 주문 요청 액션
│   │   │           │   ├── OrderActions.h/cpp                  # Định tuyến yêu cầu đặt món / 주문 요청 라우팅
│   │   │           │   └── OrderTypes.h                        # Cấu trúc DTO/phân tích yêu cầu đặt món / 주문 요청 DTO/파싱 구조
│   │   │           ├── Payment/                                # Action yêu cầu thanh toán / 결제 요청 액션
│   │   │           │   ├── PaymentActions.h/cpp                # Định tuyến yêu cầu thanh toán / 결제 요청 라우팅
│   │   │           │   └── PaymentTypes.h                      # Cấu trúc DTO/phân tích yêu cầu thanh toán / 결제 요청 DTO/파싱 구조
│   │   │           └── System/                                 # Action yêu cầu hệ thống / 시스템 요청 액션
│   │   │               ├── SystemActions.h/cpp                 # Định tuyến yêu cầu hệ thống / 시스템 요청 라우팅
│   │   │               └── SystemTypes.h                       # Cấu trúc DTO/phân tích yêu cầu hệ thống / 시스템 요청 DTO/파싱 구조
│   │   └── Shell/                                              # Native shell chỉ dành cho CEF / CEF 전용 네이티브 셸
│   │       ├── PosMainWindow.h/cpp                             # Cửa sổ chính POS / POS 메인 네이티브 윈도우
│   │       └── SplashWindow.h/cpp                              # Shell khởi động/loading / 부트스트랩/로딩 셸
│   ├── UseCases/                                               # Tầng use case/giao dịch / 유스케이스/트랜잭션 계층
│   │   ├── Table/                                              # Tập hợp use case bàn / 테이블 유스케이스 집합
│   │   │   ├── SelectTableUseCase.h/cpp                        # Use case chọn bàn / 테이블 선택 유스케이스
│   │   │   └── RefreshTablesUseCase.h/cpp                      # Use case làm mới danh sách bàn / 테이블 목록 갱신 유스케이스
│   │   ├── Order/                                              # Tập hợp use case đặt món / 주문 유스케이스 집합
│   │   │   ├── CreateOrderUseCase.h/cpp                        # Use case tạo đơn hàng / 주문 생성 유스케이스
│   │   │   └── CancelOrderUseCase.h/cpp                        # Use case hủy đơn hàng / 주문 취소 유스케이스
│   │   ├── Payment/                                            # Tập hợp use case thanh toán / 결제 유스케이스 집합
│   │   │   ├── ExecutePaymentUseCase.h/cpp                     # Use case thanh toán đơn / 단일 결제 유스케이스
│   │   │   └── ExecuteSplitPaymentUseCase.h/cpp                # Use case thanh toán chia / 분할 결제 유스케이스
│   │   ├── Delivery/                                           # Tập hợp use case giao hàng / 배달 유스케이스 집합
│   │   │   ├── ReceiveDeliveryOrderUseCase.h/cpp               # Use case nhận đơn giao hàng / 배달 주문 수신 유스케이스
│   │   │   └── AckDeliveryUseCase.h/cpp                        # Use case ACK giao hàng / 배달 ACK 유스케이스
│   │   ├── System/                                             # Use case khởi tạo hệ thống / 시스템 초기화 유스케이스
│   │   │   └── LoadBootstrapDataUseCase.h/cpp                  # Tải dữ liệu bootstrap / 부트스트랩 데이터 로드
│   │   └── Shared/                                             # ***Thành phần chung use case*** / ***유스케이스 공통 구성요소***
│   │       ├── RequestContext.h                                # Context requestId/người gọi / requestId/호출자 컨텍스트
│   │       ├── TransactionRunner.h/cpp                         # Wrapper thực thi giao dịch / 트랜잭션 실행 래퍼
│   │       ├── OperationLockService.h/cpp                      # Dịch vụ khóa đơn vị công việc / 작업 단위 락 서비스
│   │       ├── IdempotencyService.h/cpp                        # Dịch vụ kiểm tra idempotency / 멱등성 검사 서비스
│   │       └── UseCaseResult.h                                 # Mô hình kết quả tiêu chuẩn use case / 유스케이스 표준 결과 모델
│   ├── Domain/                                                 # Tầng quy tắc nghiệp vụ/manager / 비즈니스 규칙/매니저 계층
│   │   ├── Table/                                              # Domain bàn / 테이블 도메인
│   │   │   └── TableMgr.h/cpp                                  # Quy tắc nghiệp vụ/thay đổi trạng thái bàn / 테이블 업무 규칙/상태 변경
│   │   ├── Order/                                              # Domain đặt món / 주문 도메인
│   │   │   └── OrderMgr.h/cpp                                  # Quy tắc nghiệp vụ/thay đổi trạng thái đặt món / 주문 업무 규칙/상태 변경
│   │   ├── Payment/                                            # Domain thanh toán / 결제 도메인
│   │   │   └── SaleMgr.h/cpp                                   # Quy tắc nghiệp vụ thanh toán/bán hàng / 결제/판매 업무 규칙
│   │   ├── Customer/                                           # Domain khách hàng / 고객 도메인
│   │   │   └── CustMgr.h/cpp                                   # Quản lý dữ liệu khách hàng/giao hàng / 고객 데이터/배달 고객 관리
│   │   ├── Item/                                               # Domain sản phẩm / 상품 도메인
│   │   │   └── ItemMgr.h/cpp                                   # Quản lý sản phẩm/menu / 상품/메뉴 관리
│   │   ├── Staff/                                              # Domain nhân viên / 직원 도메인
│   │   │   └── WorkMgr.h/cpp                                   # Quản lý nhân viên/ca làm / 직원/근무 관리
│   │   ├── Accounting/                                         # Domain thu chi / 입출금 도메인
│   │   │   └── InOutMgr.h/cpp                                  # Quản lý thu chi / 입출금 관리
│   │   └── System/                                             # Domain hệ thống / 시스템 도메인
│   │       ├── SystemInfo.h/cpp                                # Thông tin cài đặt/vận hành hệ thống / 시스템 설정/운영 정보
│   │       └── LanguageMgr.h/cpp                               # Quản lý tải/dịch đa ngôn ngữ / 다국어 로딩/번역 관리
│   ├── Infrastructure/                                         # Tầng lưu trữ/đồng bộ/liên kết/quan sát / 영속/동기화/연동/관측성 계층
│   │   ├── Persistence/                                        # Tầng truy cập kho lưu trữ / 영속 저장소 접근 계층
│   │   │   ├── MSSQL/                                          # Cấu trúc DB mục tiêu được tạo từ reverse engineering / 역설계로 정착될 목표 DB 구조
│   │   │   │   ├── DBAccess.h/cpp                              # Kết nối ADO MSSQL chung / 공통 MSSQL ADO 연결
│   │   │   │   ├── AdoWraper.h/cpp                             # Wrapper ADO / ADO 래퍼
│   │   │   │   ├── Schema/                                     # Định nghĩa hằng số table/column / 테이블/컬럼 상수 정의
│   │   │   │   │   ├── Table/                                  # Schema domain bàn / 테이블 도메인 스키마
│   │   │   │   │   ├── Order/                                  # Schema domain 주문 / 주문 도메인 스키마
│   │   │   │   │   ├── Payment/                                # Schema domain 결제 / 결제 도메인 스키마
│   │   │   │   │   ├── Customer/                               # Schema domain 고객 / 고객 도메인 스키마
│   │   │   │   │   ├── Item/                                   # Schema domain 상품 / 상품 도메인 스키마
│   │   │   │   │   ├── System/                                 # Schema domain 시스템 / 시스템 도메인 스키마
│   │   │   │   │   └── Common/                                 # Schema dùng chung / 공통 스키마 상수
│   │   │   │   ├── Rows/                                       # Struct row vật lý DB / DB 물리 row 구조체
│   │   │   │   │   ├── Table/                                  # Row 구조체: 테이블
│   │   │   │   │   ├── Order/                                  # Row 구조체: 주문
│   │   │   │   │   ├── Payment/                                # Row 구조체: 결제
│   │   │   │   │   ├── Customer/                               # Row 구조체: 고객
│   │   │   │   │   ├── Item/                                   # Row 구조체: 상품
│   │   │   │   │   ├── System/                                 # Row 구조체: 시스템
│   │   │   │   │   └── Common/                                 # 공통 row 구조체
│   │   │   │   ├── Mappers/                                    # Chuyển đổi Recordset/DataRow <-> Row struct / Recordset/DataRow <-> Row struct 변환
│   │   │   │   │   ├── Table/                                  # Mapper: 테이블
│   │   │   │   │   ├── Order/                                  # Mapper: 주문
│   │   │   │   │   ├── Payment/                                # Mapper: 결제
│   │   │   │   │   ├── Customer/                               # Mapper: 고객
│   │   │   │   │   ├── Item/                                   # Mapper: 상품
│   │   │   │   │   ├── System/                                 # Mapper: 시스템
│   │   │   │   │   └── Common/                                 # 공통 mapper helper
│   │   │   │   ├── Sql/                                        # Helper SQL/query theo domain / 도메인별 SQL/query helper
│   │   │   │   │   ├── Table/                                  # SQL helper: 테이블
│   │   │   │   │   ├── Order/                                  # SQL helper: 주문
│   │   │   │   │   ├── Payment/                                # SQL helper: 결제
│   │   │   │   │   ├── Customer/                               # SQL helper: 고객
│   │   │   │   │   ├── Item/                                   # SQL helper: 상품
│   │   │   │   │   ├── System/                                 # SQL helper: 시스템
│   │   │   │   │   └── Common/                                 # 공통 SQL helper
│   │   │   │   ├── Migration/                                  # Nâng cấp schema DB / DB 스키마 마이그레이션
│   │   │   │   │   ├── DataBaseUpdate.h/cpp                    # Điểm vào migration legacy / 레거시 migration 진입점
│   │   │   │   │   ├── SchemaVersion.h/cpp                     # Quản lý phiên bản schema / 스키마 버전 관리
│   │   │   │   │   └── Versions/                               # Script migration theo phiên bản / 버전별 migration 단위
│   │   │   │   └── Stores/                                     # Store dùng riêng cho trạng thái vận hành / 운영 상태 전용 Store
│   │   │   │       ├── RequestLedgerStore.h/cpp                # Store Ledger idempotency / 멱등성 Ledger Store
│   │   │   │       ├── OutboxStore.h/cpp                       # Store Outbox đồng bộ server trung tâm / 중앙 서버 동기화 Outbox Store
│   │   │   │       └── SyncStateStore.h/cpp                    # Store trạng thái đồng bộ / 동기화 상태 Store
│   │   ├── Sync/                                               # Tầng worker đồng bộ/gửi lại / 동기화/재전송 워커 계층
│   │   │   ├── ConnectivityService.h/cpp                       # Tính toán trạng thái online/offline / 온라인/오프라인 상태 계산
│   │   │   ├── OutboxDispatcher.h/cpp                          # Bộ thực thi gửi Outbox / Outbox 전송 실행기
│   │   │   └── SyncWorker.h/cpp                                # Worker gửi lại hàng loạt / 배치 재전송 워커
│   │   ├── ExternalBridge/                                     # Ánh xạ ExternalBridge/ hiện tại / 기존 ExternalBridge/ 매핑
│   │   │   ├── Fooding/                                        # Liên kết MQTT Fooding / Fooding MQTT 연동
│   │   │   │   ├── FoodingConnectionManager.h/cpp              # Quản lý kết nối Fooding / Fooding 연결 관리
│   │   │   │   ├── FoodingMQTTPublisher.h/cpp                  # Xử lý phát hành Fooding / Fooding 발행 처리
│   │   │   │   ├── FoodingIncomingHandler.h/cpp                # Xử lý nhận Fooding / Fooding 수신 처리
│   │   │   │   └── FoodingEventHook.h/cpp                      # Hook sự kiện Fooding / Fooding 이벤트 훅
│   │   │   └── PaymentGateways/                                # Liên kết nhà thanh toán bên ngoài / 외부 결제사 연동
│   │   │       ├── BCCard/                                     # Liên kết VAN BCCard / BC카드 VAN 연동
│   │   │       ├── HJVietPay/                                  # Liên kết thanh toán NAPAS, v.v. / NAPAS 등 결제 연동
│   │   │       ├── Infoplus/                                   # Liên kết QR InfoPlus / InfoPlus QR 연동
│   │   │       ├── ZaloPay/                                    # Liên kết ZaloPay / ZaloPay 연동
│   │   │       ├── BIDV/                                       # Liên kết ngân hàng BIDV / BIDV 은행 연동
│   │   │       └── WeTax/                                      # Liên kết module thuế / 세금 모듈 연동
│   │   ├── Device/                                             # Ánh xạ Device/ hiện tại / 기존 Device/ 매핑
│   │   │   ├── Printer/                                        # Máy in hóa đơn/bếp / 영수증/주방 프린터
│   │   │   ├── Scanner/                                        # Máy quét mã vạch / 바코드 스캐너
│   │   │   ├── Scale/                                          # Cân / 저울
│   │   │   └── CardReader/                                     # Đầu đọc thẻ / 카드 리더기
│   │   ├── Network/                                            # Ánh xạ Network/ hiện tại / 기존 Network/ 매핑
│   │   │   └── HTTP/                                           # Truyền thông mạng MQTT/HTTP / MQTT/HTTP 네트워크 통신
│   │   ├── Observability/                                      # Quan sát log/crash / 로그/크래시 관측성
│   │   │   ├── Logger.h/cpp                                    # Bộ ghi log vận hành / 운영 로그 기록기
│   │   │   └── CrashReporter.h/cpp                             # Bộ báo cáo crash / 크래시 리포터
│   │   └── Support/                                            # Code hỗ trợ phi-UI dùng chung / 비UI 공통 지원 코드
│   │       ├── Utilz/                                          # Bộ sưu tập hàm tiện ích / 유틸리티 함수 모음
│   │       ├── File/                                           # Tiện ích I/O file / 파일 I/O 유틸리티
│   │       └── Excel/                                          # Tiện ích tự động hóa Excel / 엑셀 자동화 유틸리티
│   └── Build/                                                  # Sản phẩm build chương trình chính / 메인 프로그램 빌드 산출물
│       ├── RestaurantD.exe                                     # File thực thi POS chính / 메인 POS 실행 파일
│       ├── CefSubprocess.exe                                   # Subprocess renderer CEF / CEF 렌더러 서브프로세스
│       ├── libcef.dll                                          # Thư viện runtime CEF / CEF 런타임 라이브러리
│       ├── (Các file tài nguyên CEF)                           # Tài nguyên bổ sung CEF / CEF 추가 리소스
│       ├── PosUI/out/                                          # Sản phẩm build tĩnh Next.js / Next.js 정적 빌드 산출물
│       ├── Build/locales/                                      # Bản sao i18n cho C++ / C++용 i18n 복사본
│       ├── fooding-mqtt.ini                                    # File cài đặt MQTT/Fooding / MQTT/Fooding 설정 파일
│       └── Log/                                                # Thư mục xuất log vận hành / 운영 로그 출력 폴더
│
├── PosUI/                                                      # UI Next.js POS chính / POS 메인 Next.js UI
│   ├── package.json                                            # Định nghĩa gói frontend / 프론트엔드 패키지 정의
│   ├── next.config.js                                          # Cài đặt build Next.js / Next.js 빌드 설정
│   ├── jsconfig.json                                           # Bí danh đường dẫn/cài đặt JS / JS 경로 별칭/설정
│   ├── tailwind.config.js                                      # Cài đặt Tailwind / Tailwind 설정
│   ├── public/                                                 # Tài sản public tĩnh / 정적 퍼블릭 자산
│   │   └── fonts/                                              # Tài sản font / 폰트 자산
│   ├── src/                                                    # Thư mục gốc nguồn frontend / 프론트엔드 소스 루트
│   │   ├── app/                                                # Đầu vào App Router / App Router 엔트리
│   │   │   ├── layout.js                                       # Layout toàn cục / 전역 레이아웃
│   │   │   └── page.js                                         # Trang khởi đầu / 초기 진입 페이지
│   │   │   └── design-system/                                  # Route catalog hệ thống thiết kế / 디자인 시스템 카탈로그 라우트
│   │   │       ├── layout.js                                   # Layout chung sidebar/preview / 사이드바/프리뷰 공통 레이아웃
│   │   │       ├── page.js                                     # Trang chủ hệ thống thiết kế / 디자인 시스템 홈
│   │   │       ├── components/                                 # Route preview component chung / 공용 컴포넌트 프리뷰 라우트
│   │   │       │   └── [slug]/page.js                          # Preview chi tiết atoms/molecules/organisms / 상세 미리보기
│   │   │       └── screens/                                    # Route preview màn hình thực tế / 실제 화면 프리뷰 라우트
│   │   │           └── [slug]/page.js                          # Preview mockup/thiết kế toàn màn hình / 화면 전체 목업/디자인 미리보기
│   │   ├── design-system/                                      # Thư viện UI thuần/hệ thống thiết kế / 순수 UI 라이브러리/디자인 시스템
│   │   │   ├── tokens/                                         # Token màu/khoảng cách/typography / 색상/간격/타이포 토큰
│   │   │   ├── atoms/                                          # Button/Input/Badge/Icon
│   │   │   ├── molecules/                                      # FormRow/MenuItem/ModalHeader
│   │   │   ├── organisms/                                      # Keypad/OrderList/GlobalNavigation
│   │   │   ├── templates/                                      # MainLayout/SplitScreenLayout
│   │   │   └── registry/                                       # Metadata menu sidebar / 사이드바 메뉴 메타데이터
│   │   │       ├── components.js                               # Định nghĩa catalog component / 컴포넌트 카탈로그 정의
│   │   │       └── screens.js                                  # Định nghĩa catalog màn hình / 화면 카탈로그 정의
│   │   ├── screens/                                            # UI tự hoàn chỉnh theo màn hình / 화면별 자기완결형 UI
│   │   │   ├── TableScreen/                                    # Màn hình bàn / 테이블 화면
│   │   │   │   ├── index.js                                    # Điểm vào màn hình bàn / 테이블 화면 진입점
│   │   │   │   ├── hooks/                                      # Hook chuyên UI màn hình bàn / 테이블 화면 UI 전용 훅
│   │   │   │   ├── components/                                 # Component chuyên màn hình bàn / 테이블 화면 전용 컴포넌트
│   │   │   │   └── constants.js                                # Hằng số màn hình bàn / 테이블 화면 상수
│   │   │   ├── OrderScreen/                                    # Màn hình đặt món / 주문 화면
│   │   │   │   ├── index.js                                    # Điểm vào màn hình đặt món / 주문 화면 진입점
│   │   │   │   ├── hooks/                                      # Hook chuyên UI màn hình đặt món / 주문 화면 UI 전용 훅
│   │   │   │   ├── components/                                 # Component chuyên màn hình đặt món / 주문 화면 전용 컴포넌트
│   │   │   │   └── constants.js                                # Hằng số màn hình đặt món / 주문 화면 상수
│   │   │   └── PaymentScreen/                                  # Màn hình thanh toán / 결제 화면
│   │   │       ├── index.js                                    # Điểm vào màn hình thanh toán / 결제 화면 진입점
│   │   │       ├── hooks/                                      # Hook chuyên UI màn hình thanh toán / 결제 화면 UI 전용 훅
│   │   │       ├── components/                                 # Component chuyên màn hình thanh toán / 결제 화면 전용 컴포넌트
│   │   │       └── constants.js                                # Hằng số màn hình thanh toán / 결제 화면 상수
│   │   ├── store/                                              # Kho Redux Toolkit + RTK Query / Redux Toolkit + RTK Query 저장소
│   │   │   ├── index.js                                        # Đầu vào tạo store / store 생성 엔트리
│   │   │   ├── rootReducer.js                                  # Kết hợp root reducer / 루트 리듀서 조합
│   │   │   ├── api/                                            # Tầng API RTK Query / RTK Query API 계층
│   │   │   │   ├── posApi.js                                   # createApi gốc/tagTypes chung/baseQuery
│   │   │   │   ├── tableApi.js                                 # injectEndpoints query/mutation bàn / 테이블
│   │   │   │   ├── orderApi.js                                 # injectEndpoints query/mutation đặt món / 주문
│   │   │   │   ├── paymentApi.js                               # injectEndpoints query/mutation thanh toán / 결제
│   │   │   │   ├── syncApi.js                                  # injectEndpoints query trạng thái sync/connectivity
│   │   │   │   ├── systemApi.js                                # injectEndpoints query bootstrap/config/system
│   │   │   │   └── index.js                                    # Re-export hook theo domain / 도메인별 훅 re-export
│   │   │   └── slices/                                         # Slice trạng thái UI/client / UI/클라이언트 상태 slice
│   │   │       └── uiSlice.js                                  # Trạng thái UI: isProcessing/modal/tab / UI 상태
│   │   ├── bridge/                                             # Tầng transport giao tiếp C++ / C++ 통신 transport 계층
│   │   │   ├── PosRequestSender.js                             # Transport cấp thấp cho RTK Query/baseQuery
│   │   │   ├── adapters/                                       # Adapter chuyển đổi CEF/Mock transport
│   │   │   │   ├── cefTransport.js                             # Transport CEF/cefQuery thực tế / 실제 CEF/cefQuery transport
│   │   │   │   └── mockTransport.js                            # Mock transport cho hệ thống thiết kế/phát triển / 개발용 mock transport
│   │   │   └── commands/                                       # Wrapper command thiết bị/imperative / 장치/imperative command 래퍼
│   │   ├── mocks/                                              # Tầng dữ liệu cho mockup/preview / 목업/프리뷰용 데이터 계층
│   │   │   ├── bridge/                                         # Mock handler dạng phản hồi C++
│   │   │   │   └── index.js                                    # Mock request router
│   │   │   ├── screens/                                        # Dữ liệu fixture/kịch bản theo màn hình / 화면별 fixture/시나리오 데이터
│   │   │   └── fixtures/                                       # Fixture/dữ liệu mẫu chung / 공통 fixture/샘플 데이터
│   │   ├── shared/                                             # Component/tiện ích chung giữa màn hình / 화면 공통 컴포넌트/유틸
│   │   ├── i18n/                                               # Tầng đa ngôn ngữ frontend / 프론트엔드 다국어 계층
│   │   │   ├── index.js                                        # Khởi tạo i18next / i18next 초기화
│   │   │   └── locales → Shared/i18n/locales                   # Liên kết locales chung / 공용 locales 연결
│   │   ├── providers/                                          # Tầng React Provider / React Provider 계층
│   │   │   ├── StoreProvider.js                                # Redux Store Provider
│   │   │   └── PosRealTimeReceiver.js                          # Bộ nhận sự kiện thời gian thực C++ / C++ 실시간 이벤트 수신기
│   │   └── styles/                                             # Tài sản style/token thiết kế / 스타일/디자인 토큰 자산
│   │       ├── globals.css                                     # Style toàn cục và đầu vào Tailwind / 전역 스타일 및 Tailwind 진입점
│   │       └── tokens/                                         # Định nghĩa token thiết kế / 디자인 토큰 정의
│   │           ├── colors.js                                   # Token màu / 색상 토큰
│   │           └── spacing.js                                  # Token khoảng cách/mục tiêu chạm / 간격/터치 타깃 토큰
│   └── out/                                                    # Đầu ra build tĩnh / 정적 빌드 출력
│
├── HyojungPOS-Set/                                             # Chương trình cài đặt POS / POS 설정 프로그램
│   ├── HyojungPOS-Set.sln                                      # Solution VS chương trình cài đặt / 설정 프로그램 VS 솔루션
│   ├── AppHost/                                                # Host thực thi chương trình cài đặt / 설정 프로그램 실행 호스트
│   │   └── RestaurantSet/                                      # Dự án RestaurantSet hiện tại / 기존 RestaurantSet 프로젝트
│   │       └── RestaurantSet.vcxproj                           # Dự án file thực thi chương trình cài đặt / 설정 프로그램 실행 파일 프로젝트
│   ├── Presentation/                                           # Tầng trình bày chương trình cài đặt / 설정 프로그램 표현 계층
│   │   ├── CEF/                                                # Engine CEF cho cài đặt / 설정용 CEF 엔진
│   │   └── Shell/                                              # Native shell cài đặt chỉ dành cho CEF / 설정용 CEF 전용 네이티브 셸
│   │       └── SetMainWindow.h/cpp                             # Cửa sổ chính chương trình cài đặt / 설정 메인 네이티브 윈도우
│   ├── Infrastructure/                                         # Tầng hạ tầng chương trình cài đặt / 설정 프로그램 인프라 계층
│   │   ├── Persistence/                                        # Tầng truy cập DB cài đặt / 설정 DB 접근 계층
│   │   │   └── MSSQL/                                          # Ánh xạ RestaurantSet/DB/ hiện tại / 기존 RestaurantSet/DB/ 매핑
│   │   └── Support/                                            # Code hỗ trợ chung cài đặt / 설정 공통 지원 코드
│   │       └── Common/                                         # Ánh xạ RestaurantSet/Common/ hiện tại / 기존 RestaurantSet/Common/ 매핑
│   ├── SetUI/                                                  # UI Next.js cho cài đặt / 설정용 Next.js UI
│   │   ├── package.json                                        # Định nghĩa gói UI cài đặt / 설정 UI 패키지 정의
│   │   ├── src/                                                # Thư mục gốc nguồn UI cài đặt / 설정 UI 소스 루트
│   │   │   ├── app/                                            # App Router UI cài đặt / 설정 UI App Router
│   │   │   ├── screens/                                        # Tập hợp màn hình cài đặt / 설정 화면 집합
│   │   │   │   ├── BasicSetScreen/                             # Màn hình cài đặt cơ bản / 기본 설정 화면
│   │   │   │   ├── ItemSetScreen/                              # Màn hình cài đặt sản phẩm / 상품 설정 화면
│   │   │   │   └── ...                                         # Màn hình cài đặt khác / 기타 설정 화면
│   │   │   ├── store/                                          # Kho trạng thái/RTK Query UI cài đặt / 설정 UI 상태/RTK Query 저장소
│   │   │   ├── bridge/                                         # Transport/command cấp thấp UI cài đặt / 설정 UI 저수준 transport/command
│   │   │   └── shared/                                         # Thành phần chung UI cài đặt / 설정 UI 공통 요소
│   │   └── out/                                                # Đầu ra build tĩnh UI cài đặt / 설정 UI 정적 빌드 출력
│   └── Build/                                                  # Sản phẩm build chương trình cài đặt / 설정 프로그램 빌드 산출물
│       ├── RestaurantSet.exe                                   # File thực thi chương trình cài đặt / 설정 프로그램 실행 파일
│       └── Log/                                                # Thư mục log chương trình cài đặt / 설정 프로그램 로그 폴더
│
├── SharedCpp/                                                  # Module C++ dùng chung Main/Set / Main/Set 공용 C++ 모듈
│   ├── Foundation/                                             # Tiện ích cơ sở dùng chung / 공용 기초 유틸리티
│   ├── Contracts/                                              # Hợp đồng/DTO/hằng số dùng chung / 공용 계약/DTO/상수
│   ├── Observability/                                          # Công cụ quan sát dùng chung / 공용 관측성 도구
│   ├── Testing/                                                # Fixture/dummy test / 테스트 fixture/더미
│   └── BuildSupport/                                           # Hỗ trợ build/sao chép/codegen / 빌드/복사/codegen 지원
│
├── Shared/                                                     # Tài sản runtime dùng chung Main/Set / Main/Set 공용 런타임 자산
│   └── i18n/                                                   # Tài sản đa ngôn ngữ gốc / 다국어 원본 자산
│       └── locales/                                            # Thư mục gốc locale chung / 공용 locale 루트
│           ├── ko/                                             # Locale tiếng Hàn / 한국어 locale
│           │   ├── common.json                                 # Bản dịch chung / 공통 번역
│           │   ├── table.json                                  # Bản dịch màn hình bàn / 테이블 화면 번역
│           │   ├── order.json                                  # Bản dịch màn hình đặt món / 주문 화면 번역
│           │   ├── payment.json                                # Bản dịch màn hình thanh toán / 결제 화면 번역
│           │   └── system.json                                 # Bản dịch hệ thống / 시스템 번역
│           ├── vi/                                             # Locale tiếng Việt / 베트남어 locale
│           └── en/                                             # Locale tiếng Anh / 영어 locale
│
└── Docs/                                                       # Thư mục gốc tài liệu dự án / 프로젝트 문서 루트
    └── Kế hoạch và Thiết kế/                                   # Thư mục tài liệu kế hoạch/thiết kế / 기획/설계 문서 폴더
```

### 2.4 Nguyên tắc áp dụng chuyển đổi dần
└ 점진 전환 적용 원칙

`2.3 Cấu trúc thư mục tích hợp mục tiêu` ở trên là **cấu trúc tiêu chuẩn duy nhất của tài liệu**.
Trong quá trình chuyển đổi, việc di chuyển thư mục vật lý có thể diễn ra theo từng giai đoạn, nhưng mọi quyết định thiết kế và triển khai mới đều dựa trên cấu trúc tích hợp này.
└ 위 `2.3 통합 목표 디렉토리 구조`가 문서의 유일한 기준 구조다.
└ 전환 과정에서는 물리적 폴더 이동이 단계적으로 이뤄질 수 있지만, 설계 판단과 신규 구현은 모두 이 통합 구조를 기준으로 한다.

- Các phần tử từ `DB/` hiện tại cuối cùng sẽ hội tụ tách thành `Domain/*Mgr` và `Infrastructure/Persistence/MSSQL`
- └ 기존 `DB/`의 요소는 최종적으로 `Domain/*Mgr`와 `Infrastructure/Persistence/MSSQL`로 분리 수렴
- Không tách đồng loạt thành `*Repository` theo từng Manager; chỉ tách `*Store` cho Ledger/Outbox/SyncState và giữ phần còn lại theo hướng Manager 중심
- └ `*Repository`를 Manager별로 전면 분리하지 않는다. Ledger/Outbox/SyncState만 `*Store`로 분리하고 나머지는 Manager 중심으로 유지한다
- `Dlg/` hiện tại chỉ là nguồn để trích xuất logic; sau khi chuyển màn hình, mã MFC UI bị xóa khỏi product tree
- └ 기존 `Dlg/`는 로직 추출을 위한 마이그레이션 소스일 뿐이며, 화면 전환 완료 후 MFC UI 코드는 제품 트리에서 제거한다
- `Common/Control`, `Common/GridCtrl` hiện tại không được mang sang cấu trúc đích; pattern UI cần được hấp thụ vào `PosUI/src/design-system/` hoặc `PosUI/src/shared/`
- └ 기존 `Common/Control`, `Common/GridCtrl`은 목표 구조로 가져가지 않고, 필요한 UI 패턴만 `PosUI/src/design-system/` 또는 `PosUI/src/shared/`로 흡수한다
- `Common/Utilz`, `Common/File`, `Common/Excel` hiện tại hội tụ thành `Infrastructure/Support/`
- └ 기존 `Common/Utilz`, `Common/File`, `Common/Excel`은 `Infrastructure/Support/`로 수렴
- Các phần tử từ `CEF/`, `ExternalBridge/`, `Device/`, `Network/` hiện tại dù tên thay đổi cũng đều được bao gồm trong cấu trúc cuối cùng
- └ 기존 `CEF/`와 `ExternalBridge/`, `Device/`, `Network/`의 요소는 이름이 바뀌어도 모두 최종 구조에 포함
- Kết quả reverse engineering như catalog table thựcDB, inventory SQL, ma trận owner không được nhúng trực tiếp vào tài liệu này; tài liệu này chỉ cố định **cấu trúc mã nguồn đích** sẽ được tạo ra từ reverse engineering
- └ 실DB 테이블 카탈로그, SQL 인벤토리, owner 매트릭스 같은 역설계 결과표는 이 문서 본문에 직접 넣지 않고, 역설계 이후 코드로 정착될 **목표 디렉토리 구조**만 이 문서에 반영한다
- Điều quan trọng không phải là “giữ nguyên tên thư mục hiện tại” mà là **hội tụ tất cả phần tử hiện có vào cấu trúc cuối cùng mà không bỏ sót**
- └ 중요한 것은 “현재 폴더명 유지”가 아니라 **모든 기존 요소를 빠짐없이 포함한 최종 구조로 수렴시키는 것**이다

---

## 3. Tóm tắt vai trò từng thư mục
└ 폴더별 역할 요약

### 3.1 Tầng C++ (bên trong mỗi repository)
└ C++ 계층 (각 저장소 내부)

| Thư mục | Vai trò | Tính chất | Thay đổi |
|------|------|------|------|
| `DB/` | Truy cập MSSQL, lớp Manager | Logic nghiệp vụ | Giữ nguyên |
| └ | └ MSSQL 접근, Manager 클래스 | └ 비즈니스 로직 | └ 유지 |
| `CEF/SDK/` | Binary/thư viện CEF | UI engine | ★ Mới (tích hợp Cef/ gốc) |
| └ | └ CEF 바이너리/라이브러리 | └ UI 엔진 | └ ★ 신규 (기존 루트 Cef/ 통합) |
| `CEF/Handlers/` | Vận hành CEF (App, Browser, Scheme) | UI engine | ★ Mới |
| └ | └ CEF 구동 (App, Browser, Scheme) | └ UI 엔진 | └ ★ 신규 |
| `CEF/InternalBridge/` | PosRequestResponder(đầu vào) + PosRealTimeSender(đầu ra) + PosRequestActions/(phần thực thi) | UI engine | ★ Mới |
| └ | └ PosRequestResponder(입구) + PosRealTimeSender(출구) + PosRequestActions/(실행부) | └ UI 엔진 | └ ★ 신규 |
| `UseCases/` | Điều phối use case, ranh giới transaction, tính idempotent, quản lý lock | Tầng ứng dụng | ★ Mới |
| └ | └ 유스케이스 오케스트레이션, 트랜잭션 경계, 멱등성, 락 관리 | └ 응용 계층 | └ ★ 신규 |
| `Infrastructure/` | Lưu trữ Ledger/Outbox, Sync worker, trạng thái kết nối, observability, báo cáo crash | Tầng hạ tầng | ★ Mới |
| └ | └ Ledger/Outbox 영속화, Sync worker, 연결 상태, 관측성, 크래시 리포팅 | └ 인프라 계층 | └ ★ 신규 |
| `ExternalBridge/Fooding/` | Giao tiếp Fooding MQTT | Liên kết bên ngoài | Di chuyển từ FoodingBridge/ |
| └ | └ Fooding MQTT 통신 | └ 외부 연동 | └ 기존 FoodingBridge/ 이동 |
| `ExternalBridge/PaymentGateways/` | API đối tác thanh toán (BCCard, ZaloPay, v.v.) | Liên kết bên ngoài | Tích hợp các thư mục phân tán |
| └ | └ 결제사 API (BCCard, ZaloPay 등) | └ 외부 연동 | └ 기존 흩어진 폴더 통합 |
| `Device/` | Máy in, máy quét, cân, đầu đọc thẻ | Thiết bị ngoại vi | Tách/tích hợp Print/CxCom |
| └ | └ 프린터, 스캐너, 저울, 카드리더기 | └ 주변기기 | └ 기존 Print/CxCom 분리·통합 |
| `Network/HTTP/` | MQTT client, giao tiếp web | Mạng | Di chuyển từ HTTP/ |
| └ | └ MQTT 클라이언트, 웹 통신 | └ 네트워크 | └ 기존 HTTP/ 이동 |
| `Common/` | Tiện ích phi UI, File I/O, Excel | Chung | Phần UI được hấp thụ vào PosUI design system / shared |
| └ | └ 비UI 유틸리티, 파일 I/O, 엑셀 | └ 공통 | └ UI 성격 코드는 PosUI design system / shared로 흡수 |

### 3.2 Frontend (Next.js)
└ 프론트엔드 (Next.js)

| Thư mục | Vai trò | Thuộc về |
|------|------|------|
| `PosUI/` | POS UI chính (JavaScript thuần) | HyojungPOS-Main |
| └ | └ POS 메인 UI (순수 JavaScript) | └ |
| `SetUI/` | UI cài đặt (tương lai) | HyojungPOS-Set |
| └ | └ 설정 UI (향후) | └ |

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

### 3.4 Tái định nghĩa SharedCpp / Shared
└ SharedCpp / Shared 재정의

`SharedCpp/` không phải thư mục sao chép đơn giản mà được phân chia tính chất như sau.
└ `SharedCpp/`는 단순 복사용 폴더가 아니라 아래와 같이 성격을 나눈다.

```text
SharedCpp/
├── Foundation/          # CString util, đối tượng kết quả chung, thời gian/UUID / CString 유틸, 공통 결과 객체, 시간/UUID
├── Contracts/           # Envelope, DTO, mã lỗi, hằng số chung / Envelope, DTO, 에러 코드, 공통 상수
├── Observability/       # Giao diện logging, correlation helpers / 로깅 인터페이스, correlation helpers
├── Testing/             # Dummy, sample payload, contract fixtures / 더미, 샘플 payload, contract fixtures
└── BuildSupport/        # Script sao chép/đồng bộ, codegen, schema validator / 복사/동기화 스크립트, codegen, schema validator
```

Nguyên tắc:
└ 원칙:
- `SharedCpp/Foundation` có thể được tham chiếu từ bất kỳ đâu trong Main/Set
- └ `SharedCpp/Foundation`은 Main/Set 어디서나 참조 가능
- `SharedCpp/Contracts` là nguồn gốc hợp đồng chung của tầng UI bridge và UseCases
- └ `SharedCpp/Contracts`는 UI 브릿지와 UseCases 계층의 공통 계약 원본
- Không đặt triển khai theo domain của `DB/Manager`, `ExternalBridge` vào `SharedCpp/`
- └ `DB/Manager`, `ExternalBridge`의 도메인별 구현은 `SharedCpp/`에 넣지 않는다
- `Shared/` chỉ lưu trữ tài sản runtime như i18n, tài nguyên tĩnh, JSON dùng chung
- └ `Shared/`는 i18n, 정적 리소스, 공용 JSON 같은 런타임 자산만 보관한다

### 3.5 Quy tắc file bên trong `Infrastructure/Persistence/MSSQL`
└ `Infrastructure/Persistence/MSSQL` 하위 파일 규칙

Các thư mục dưới `MSSQL/` không chỉ tồn tại ở cấp tên; phải cố định quy tắc file theo vai trò rõ ràng.
└ `MSSQL/` 아래 폴더는 이름만 두지 않고, 역할별 파일 규칙까지 고정해야 한다.

#### `Schema/`
└ `Schema/`

- Chứa **hằng số tên table/column/index**. Không chứa logic nghiệp vụ hay SQL hoàn chỉnh
- └ **테이블/컬럼/인덱스 이름 상수**만 둔다. 비즈니스 로직이나 완성 SQL은 두지 않는다
- Mỗi table vật lý một file header
- └ 물리 테이블 단위로 header 파일을 하나씩 둔다
- Quy tắc tên file:
- └ 파일명 규칙:
  - `Table/TableSchema.h`
  - `Table/TableStatusHistorySchema.h`
  - `Order/OrderSlipSchema.h`
  - `Order/OrderItemSchema.h`
  - `Payment/SellSlipSchema.h`
  - `Payment/SellDetailSchema.h`
  - `Payment/WaitPaymentSchema.h`
  - `Payment/UserPaymentSchema.h`

#### `Rows/`
└ `Rows/`

- Chứa **struct biểu diễn 1 row vật lý** trong DB
- └ DB의 **물리 row 1건을 표현하는 struct**를 둔다
- Mỗi table vật lý một file header
- └ 물리 테이블 단위로 header 파일을 하나씩 둔다
- Quy tắc tên file:
- └ 파일명 규칙:
  - `Table/TableRow.h`
  - `Table/TableStatusHistoryRow.h`
  - `Order/OrderSlipRow.h`
  - `Order/OrderItemRow.h`
  - `Payment/SellSlipRow.h`
  - `Payment/SellDetailRow.h`
  - `Payment/WaitPaymentRow.h`
  - `Payment/UserPaymentRow.h`

#### `Mappers/`
└ `Mappers/`

- Chứa helper chuyển đổi giữa `CADORecordset`/field DB và `*Row`
- └ `CADORecordset`/DB field와 `*Row` 사이 변환 helper를 둔다
- Mỗi table vật lý một mapper
- └ 물리 테이블 단위로 mapper를 둔다
- Quy tắc tên file:
- └ 파일명 규칙:
  - `Table/TableRowMapper.h/cpp`
  - `Table/TableStatusHistoryRowMapper.h/cpp`
  - `Order/OrderSlipRowMapper.h/cpp`
  - `Order/OrderItemRowMapper.h/cpp`
  - `Payment/SellSlipRowMapper.h/cpp`
  - `Payment/SellDetailRowMapper.h/cpp`
  - `Payment/WaitPaymentRowMapper.h/cpp`
  - `Payment/UserPaymentRowMapper.h/cpp`

#### `Sql/`
└ `Sql/`

- Chứa helper tạo SQL/query template theo **domain hoặc aggregate**, không phải nơi quyết định nghiệp vụ
- └ **도메인 또는 aggregate 기준** SQL/query helper를 두고, 비즈니스 판단은 넣지 않는다
- Không tạo file SQL cho từng màn hình MFC cũ
- └ 기존 MFC 화면 단위 SQL 파일은 만들지 않는다
- Quy tắc tên file:
- └ 파일명 규칙:
  - `Table/TableSql.h/cpp`
  - `Order/OrderSql.h/cpp`
  - `Payment/PaymentSql.h/cpp`
  - `Customer/CustomerSql.h/cpp`
  - `Item/ItemSql.h/cpp`
  - `System/SystemSql.h/cpp`
  - `Common/PagingSql.h/cpp`
  - `Common/AuditSql.h/cpp`

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

#### Quy tắc cấm
└ 금지 규칙

- Không tạo `Schema.cpp`
- └ `Schema.cpp` 파일을 만들지 않는다
- Không trộn nhiều table không liên quan vào một file `Rows`/`Mappers`
- └ 관련 없는 여러 테이블을 하나의 `Rows`/`Mappers` 파일에 섞지 않는다
- Không để SQL string rải rác lại trong `UseCases`, `ExternalBridge`, `PosRequestActions`
- └ SQL 문자열을 다시 `UseCases`, `ExternalBridge`, `PosRequestActions`에 흩뿌리지 않는다
- Không tạo `TableRepository`, `OrderRepository`, `PaymentRepository`
- └ `TableRepository`, `OrderRepository`, `PaymentRepository`는 만들지 않는다

---

## 4. Quy tắc thư mục PosUI
└ PosUI 폴더 규칙

### 4.1 Quy tắc phân tách Design System / Mockup / Màn hình thực tế
└ 디자인 시스템 / 목업 / 실제 화면 분리 규칙

`PosUI` phân tách 3 phần sau.
└ `PosUI`는 아래 3가지를 분리한다.

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
- Không tạo lại "màn hình giả" riêng cho Mock. Chỉ thay đổi dữ liệu bằng `src/mocks/` và `mockTransport`
- └ Mock 전용으로 별도 "가짜 화면"을 다시 만들지 않는다. 데이터만 `src/mocks/`와 `mockTransport`로 바꾼다
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
├── index.js           # Điểm vào screen (component chính) / 스크린 진입점 (메인 컴포넌트)
├── hooks/             # Custom hook chỉ dùng trong screen này / 이 스크린에서만 사용하는 커스텀 훅
├── components/        # UI component chỉ dùng trong screen này / 이 스크린에서만 사용하는 UI 컴포넌트
└── constants.js       # Hằng số của screen này (kích thước grid, khoảng timer, v.v.) / 이 스크린의 상수 (그리드 크기, 타이머 간격 등)
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

- `PosUI/src/store/api/posApi.js` chỉ chịu trách nhiệm `createApi` gốc của RTK Query
- └ `PosUI/src/store/api/posApi.js`는 RTK Query의 루트 `createApi`만 담당한다
- `tableApi.js`, `orderApi.js`, `paymentApi.js`, `syncApi.js`, `systemApi.js` được tách theo phương thức `posApi.injectEndpoints(...)`
- └ `tableApi.js`, `orderApi.js`, `paymentApi.js`, `syncApi.js`, `systemApi.js`는 `posApi.injectEndpoints(...)` 방식으로 분리한다
- `PosUI/src/store/api/index.js` re-export hook theo domain
- └ `PosUI/src/store/api/index.js`는 도메인별 hook을 re-export 한다
- RTK Query `baseQuery` hoặc `queryFn` sử dụng `PosUI/src/bridge/PosRequestSender.js` làm transport cấp thấp
- └ RTK Query `baseQuery` 또는 `queryFn`은 `PosUI/src/bridge/PosRequestSender.js`를 저수준 transport로 사용한다
- Dữ liệu truy vấn được component đăng ký trực tiếp bằng hook dạng `useQuery` từ `store/api/*Api.js`
- └ 조회성 데이터는 컴포넌트가 `store/api/*Api.js`의 `useQuery` 계열 훅으로 직접 구독한다
- Thao tác thay đổi sử dụng `useMutation` hoặc command wrapper, sau khi thành công cập nhật RTK Query cache bằng `invalidateTags` hoặc `updateQueryData`
- └ 변경 작업은 `useMutation` 또는 command wrapper를 사용하고, 성공 후 RTK Query 캐시를 `invalidateTags` 또는 `updateQueryData`로 갱신한다
- Slice chỉ duy trì trạng thái UI và trạng thái tương tác local
- └ slice는 오직 UI 상태와 로컬 상호작용 상태만 유지한다

Nguyên tắc một dòng:
└ 한 줄 원칙:

> Giao dữ liệu server cho RTK Query cache, chỉ giữ trạng thái UI trong Redux slice.
> └ 서버 데이터는 RTK Query 캐시에 맡기고, Redux slice에는 UI 상태만 남긴다.

### 4.4 Quy tắc Offline-First + lấy MSSQL local làm trung tâm
└ Offline-First + 로컬 MSSQL 중심 규칙

**Nguồn dữ liệu nghiệp vụ thực tế** của POS này không phải server internet mà là **MSSQL local bên trong thiết bị POS của khách hàng**.
Do đó, ngay cả khi offline, nghiệp vụ cốt lõi phải hoạt động bình thường dựa trên MSSQL local.
└ 이 POS의 **실질적인 업무 데이터 원본**은 인터넷 서버가 아니라 **고객사 POS 기기 내부의 로컬 MSSQL**이다.
└ 따라서 오프라인 상태에서도 핵심 업무는 로컬 MSSQL 기준으로 정상 동작해야 한다.

#### Nguyên tắc
└ 원칙

- Nguồn truy vấn ưu tiên là đường dẫn `PosRequestSender → C++ → MSSQL local` thay vì API remote
- └ 조회의 원본은 가능하면 원격 API가 아니라 `PosRequestSender → C++ → 로컬 MSSQL` 경로다
- Thay đổi đơn hàng/thanh toán/bàn **ưu tiên commit MSSQL local trước khi gửi remote**
- └ 주문/결제/테이블 변경은 **원격 전송보다 로컬 MSSQL 커밋이 먼저**다
- Hệ thống bên ngoài (MQTT, trụ sở, đối tác giao hàng, đối tác thanh toán) không phải nguồn nghiệp vụ mà là **đối tượng đồng bộ hậu kỳ**
- └ 외부 시스템(MQTT, 본사, 배달사, 결제사)은 업무 원본이 아니라 **후행 동기화 대상**이다
- Lưu local thành công và đồng bộ remote thành công không có cùng ý nghĩa
- └ 로컬 저장 성공과 원격 동기화 성공은 같은 의미가 아니다
- Phục hồi offline dựa trên **MSSQL local + Ledger + Outbox** chứ không phải RTK Query cache
- └ 오프라인 복구는 RTK Query 캐시가 아니라 **로컬 MSSQL + Ledger + Outbox**를 기준으로 수행한다
- Lỗi internet có thể là `degraded mode`, nhưng lỗi MSSQL local được xem là ngừng nghiệp vụ cốt lõi
- └ 인터넷 장애는 `degraded mode`일 수 있지만, 로컬 MSSQL 장애는 핵심 업무 중단으로 본다

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

### 4.5 Chiến lược offline RTK Query
└ RTK Query 오프라인 전략

Dự án này **chỉ sử dụng RTK Query** cho tầng query. Không sử dụng song song React Query.
└ 이 프로젝트는 query 계층을 **RTK Query 하나로만** 사용한다. React Query는 병행 사용하지 않는다.

#### Vai trò của RTK Query
└ RTK Query의 역할

- **Tầng cache kết quả truy vấn nghiệp vụ** đọc từ MSSQL local
- └ 로컬 MSSQL에서 읽어온 **업무 조회 결과의 캐시 계층**
- **Model đọc màn hình** chịu trách nhiệm invalidate/cập nhật một phần sau khi nhận sự kiện thời gian thực
- └ 실시간 이벤트 수신 후 무효화/부분 업데이트를 담당하는 **화면 읽기 모델**
- **Model đọc trạng thái vận hành** như trạng thái đồng bộ, số backlog, thời điểm sync cuối
- └ 동기화 상태, backlog 수, 마지막 sync 시각 같은 **운영 상태 읽기 모델**

#### Quy tắc transport
└ transport 규칙

- `posApi.js` là API gốc chỉ chứa `baseQuery/tagTypes` chung
- └ `posApi.js`는 공통 `baseQuery/tagTypes`만 가진 루트 API다
- `tableApi.js`, `orderApi.js`, `paymentApi.js`, `syncApi.js`, `systemApi.js` đăng ký query/mutation theo domain bằng `injectEndpoints()`
- └ `tableApi.js`, `orderApi.js`, `paymentApi.js`, `syncApi.js`, `systemApi.js`는 `injectEndpoints()`로 도메인별 query/mutation을 등록한다
- RTK Query `baseQuery` hoặc `queryFn` sử dụng `PosRequestSender.js` làm transport thay vì `fetch`
- └ RTK Query `baseQuery` 또는 `queryFn`은 `fetch` 대신 `PosRequestSender.js`를 transport로 사용한다
- `PosRequestSender.js` chọn transport phù hợp với môi trường giữa `bridge/adapters/cefTransport.js` và `bridge/adapters/mockTransport.js` bên trong
- └ `PosRequestSender.js`는 내부에서 `bridge/adapters/cefTransport.js`와 `bridge/adapters/mockTransport.js` 중 환경에 맞는 transport를 선택한다
- Do đó `useQuery` ưu tiên truy vấn **bridge local + MSSQL local** hoặc mock transport thay vì internet
- └ 따라서 `useQuery`는 인터넷이 아니라 **로컬 브릿지 + 로컬 MSSQL** 또는 mock transport를 우선 조회한다
- `refetchOnReconnect` không chỉ dựa vào sự kiện mạng trình duyệt, mà sử dụng kết hợp với sự kiện trạng thái kết nối được tính toán bởi `ConnectivityService`
- └ `refetchOnReconnect`는 브라우저 네트워크 이벤트에만 기대지 않고, `ConnectivityService`에서 계산한 연결 상태 이벤트와 함께 사용한다

#### Chiến lược truy vấn
└ 조회 전략

- Các hook truy vấn như `useGetTablesQuery`, `useGetOrderQuery`, `useGetPaymentStatusQuery` cache kết quả truy vấn MSSQL local
- └ `useGetTablesQuery`, `useGetOrderQuery`, `useGetPaymentStatusQuery` 같은 조회성 훅은 로컬 MSSQL 조회 결과를 캐시한다
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
│   ├── CefBrowserHost      #   Host CEF trong native shell / 네이티브 셸에 CEF 호스팅
│   ├── CefSchemeHandler    #   Ánh xạ file local app://pos/ / app://pos/ 로컬 파일 매핑
│   └── BrowserRecoveryManager
└── InternalBridge/            # Giao tiếp nội bộ JS ↔ C++ / JS ↔ C++ 내부 통신
    ├── PosRequestResponder     #   [Đầu vào] Nhận và phân luồng yêu cầu UI (Router) / [입구] UI 요청 수신 및 분기 (Router)
    ├── PosRealTimeSender      #   [Đầu ra] Gửi sự kiện thời gian thực đến UI (Broadcaster) / [출구] UI 실시간 이벤트 송출 (Broadcaster)
    └── PosRequestActions/     #   [Phần thực thi] Logic chi tiết theo domain / [실행부] 도메인별 상세 로직
        ├── Table/             #     TableActions + TableTypes
        ├── Order/             #     OrderActions + OrderTypes
        ├── Payment/           #     PaymentActions + PaymentTypes
        └── System/            #     SystemActions + SystemTypes
```

### 5.2 Thư mục UseCases — Bộ điều phối use case
└ UseCases 폴더 — 유스케이스 조정자

`PosRequestActions/` được duy trì như thin router, và **trách nhiệm điều phối use case** gộp nhiều Manager/thiết bị/phản hồi bên ngoài được tập trung vào `UseCases/`.
└ `PosRequestActions/`는 얇은 라우터로 유지하고, 여러 Manager/장치/외부 응답을 묶는 **유스케이스 조정 책임**은 `UseCases/`에 집중시킨다.

```
UseCases/
├── Table/                  # SelectTableUseCase, RefreshTablesUseCase
├── Order/                  # CreateOrderUseCase, CancelOrderUseCase
├── Payment/                # ExecutePaymentUseCase, ExecuteSplitPaymentUseCase
├── Delivery/               # ReceiveDeliveryOrderUseCase, AckDeliveryUseCase
├── System/                 # LoadBootstrapDataUseCase
└── Shared/
    ├── RequestContext      # requestId, timestamp, operator, device
    ├── TransactionRunner   # Đảm bảo đơn vị tác vụ DB / DB 작업 단위 보장
    ├── OperationLockService# Lock theo đơn vị tác vụ (payment/order/print) / 작업 단위별 락 (payment/order/print)
    ├── IdempotencyService  # Ngăn chặn yêu cầu trùng lặp / 중복 요청 방지
    └── UseCaseResult       # Trả về thành công/thất bại chuẩn / 표준 성공/실패 반환
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
├── Fooding/                # Giao tiếp Fooding MQTT (nhận/gửi đơn hàng) / Fooding MQTT 통신 (주문 수신/전송)
│   ├── FoodingConnectionManager
│   ├── FoodingMQTTPublisher
│   ├── FoodingIncomingHandler
│   └── FoodingEventHook
│
│
└── PaymentGateways/        # Liên kết API đối tác thanh toán Việt Nam / 베트남 결제사 API 연동
    ├── BCCard/             #   BC카드 VAN
    ├── HJVietPay/          #   NAPAS, v.v. / NAPAS 등
    ├── Infoplus/           #   InfoPlus QR
    ├── ZaloPay/            #   ZaloPay
    ├── BIDV/               #   Ngân hàng BIDV / BIDV 은행
    └── WeTax/              #   Module thuế / 세금 모듈
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
| **Cấm** | `TableMgr` → Gọi lại `ExecutePaymentUseCase` | Cấm tầng dưới gọi tầng trên |
| └ **금지** | └ `TableMgr` → `ExecutePaymentUseCase` 재호출 | └ 하위 계층이 상위 계층 호출 금지 |
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
- Hoạt động trên nền `Infrastructure/Persistence/MSSQL` mà không cần Repository toàn diện theo domain / 도메인별 전면 Repository 없이 `Infrastructure/Persistence/MSSQL` 기반으로 동작

Không được làm:
└ 하지 말 것:
- Gọi trực tiếp `PosRealTimeSender` / `PosRealTimeSender` 직접 호출
- Quyết định việc gửi sync ACK server trung tâm / đồng bộ hậu kỳ / 중앙 서버 sync ACK / 후행 동기화 발송 여부 결정
- Quyết định trực tiếp trạng thái chuyển trình duyệt/màn hình / 브라우저/화면 전환 상태 직접 결정

#### Persistence / Store

- `Infrastructure/Persistence/MSSQL` chịu trách nhiệm kết nối DB chung và nền tảng lưu trữ bền vững
- └ `Infrastructure/Persistence/MSSQL`은 공통 DB 연결과 영속화 기반을 담당
- Bên trong `MSSQL/`, kết quả reverse engineering phải được cố định thành các thư mục `Schema/`, `Rows/`, `Mappers/`, `Sql/`, `Migration/`, `Stores/`
- └ `MSSQL/` 내부는 역설계 결과를 `Schema/`, `Rows/`, `Mappers/`, `Sql/`, `Migration/`, `Stores/` 구조로 정착시켜야 한다
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
| Layout UI, thiết kế nút, vẽ Grid | `PosUI/src/design-system/` + `PosUI/src/screens/` (Next.js) | Tạo UI dùng chung và tổ hợp màn hình thực tế |
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
- Kết nối để khi click nút gọi wrapper cefQuery của `bridge/PosRequestSender.js`
- └ 버튼 클릭 시 `bridge/PosRequestSender.js`의 cefQuery 래퍼를 호출하도록 연결
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
[1] TableScreen/index.js     Người dùng click bàn → posQuery("SELECT_TABLE", {id: 1})
                              └ 사용자 테이블 클릭 → posQuery("SELECT_TABLE", {id: 1})
          ↓
[2] TableActions.cpp          Nhận yêu cầu → Kiểm tra tham số → SelectTableUseCase::Run(1)
                              └ 요청 수신 → 파라미터 검증 → SelectTableUseCase::Run(1)
          ↓
[3] SelectTableUseCase.cpp    Phán đoán lock/hậu xử lý → g_TableMgr->SelectTable(1)
                              └ 락/후처리 판단 → g_TableMgr->SelectTable(1)
          ↓
[4] TableMgr.cpp              Thực hiện cập nhật DB → Trả về thành công
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
- **Rollback** được thực hiện bằng việc quay về gói phát hành CEF trước đó, không phải quay lại MFC fallback
- └ **롤백**은 이전 CEF 릴리스 패키지로 되돌리는 방식이며, MFC fallback으로 되돌아가는 구조가 아니다

### 7.5 Thứ tự triển khai tầng
└ 계층 도입 순서

#### Giai đoạn 1 / 1단계

- Triển khai `UseCases/Shared` / `UseCases/Shared` 도입
- Thêm `RequestContext`, `UseCaseResult`, `OperationLockService` / `RequestContext`, `UseCaseResult`, `OperationLockService` 추가
- Triển khai `Infrastructure/Persistence/MSSQL/Stores` / `Infrastructure/Persistence/MSSQL/Stores` 도입
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
- Mô tả tất cả hằng số Action + spec tham số/phản hồi bằng JSDoc tại `PosUI/src/bridge/PosRequestSender.js`
- └ `PosUI/src/bridge/PosRequestSender.js`에 모든 Action 상수 + 파라미터/응답 스펙을 JSDoc으로 기술
- Duy trì chú thích interface tương tự tại `PosRealTimeSender.h` phía C++ để đồng bộ spec hai bên
- └ C++ 측 `PosRealTimeSender.h`에도 동일한 인터페이스 주석을 유지하여 양쪽 스펙 동기화
- Định nghĩa Envelope và field chung quản lý bằng tài liệu `SharedCpp/Contracts/` riêng, chú thích triển khai giữ bằng JSDoc
- └ 봉투(Envelope)와 공통 필드 정의는 별도 `SharedCpp/Contracts/` 문서로 관리하고, 구현 주석은 JSDoc으로 유지

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
- **Nguồn đơn nhất (Source of Truth)**: `Shared/i18n/locales/` — Chỉ JSON tại đây là nguồn gốc duy nhất
- └ **단일 소스 (Source of Truth)**: `Shared/i18n/locales/` — 이곳의 JSON만이 유일한 원본
- Phía Next.js: Build script sao chép `Shared/i18n/locales/` sang `PosUI/src/i18n/locales/` → Load bằng `i18next`
- └ Next.js 측: 빌드 스크립트가 `Shared/i18n/locales/`를 `PosUI/src/i18n/locales/`로 복사 → `i18next`로 로드
- Phía C++: Build script sao chép `Shared/i18n/locales/` sang `Build/locales/` → Parse bằng `nlohmann/json`
- └ C++ 측: 빌드 스크립트가 `Shared/i18n/locales/`를 `Build/locales/`로 복사 → `nlohmann/json`으로 파싱
- **Nguyên tắc**: Sửa dịch chỉ ở `Shared/i18n/locales/`. locales của PosUI hay Build chỉ là sản phẩm (bản sao) chứ không phải nguồn gốc
- └ **원칙**: 번역 수정은 반드시 `Shared/i18n/locales/`에서만. PosUI나 Build의 locales는 산출물(복사본)일 뿐 원본이 아님

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
- Nội dung hiển thị cho người dùng được giải thích từ nguồn dịch `Shared/i18n/locales/` theo `msgKey`
- └ 사용자에게 보이는 문구는 `Shared/i18n/locales/`의 번역 원본에서 `msgKey` 기준으로 해석한다
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
- `msgKey`: Khóa dịch theo chuẩn `Shared/i18n/locales/` / `Shared/i18n/locales/` 기준 번역 키
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
- Lưu trữ bền vững Ledger/Outbox/SyncState được tách thành `*Store` dưới `Infrastructure/Persistence/MSSQL/Stores/`
- └ Ledger/Outbox/SyncState 영속화는 `Infrastructure/Persistence/MSSQL/Stores/` 아래 `*Store`로 분리한다
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

- POS lấy **Offline-First** làm tiền đề, ngay cả khi lỗi internet, nghiệp vụ cốt lõi dựa trên MSSQL local phải tiếp tục hoạt động
- └ POS는 **Offline-First**를 전제로 하며, 인터넷 장애 시에도 로컬 MSSQL 기반 핵심 업무는 계속 수행 가능해야 한다
- Chỉ rõ chức năng cho phép và chức năng chặn khi lỗi thanh toán bên ngoài/MQTT/internet
- └ 외부 결제/MQTT/인터넷 장애 시 허용 기능과 차단 기능을 명시한다
- Trạng thái MSSQL local bình thường nhưng chỉ mất kết nối bên ngoài được xem là chế độ `DEGRADED`
- └ 로컬 MSSQL이 정상이고 외부 연결만 끊긴 상태는 `DEGRADED` 모드로 본다
- Khi MSSQL local bất thường, chặn giao dịch cốt lõi và cảnh báo ngay cho người vận hành
- └ 로컬 MSSQL이 비정상이면 핵심 거래를 차단하고 운영자에게 즉시 경고한다
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
- Không duy trì `MFC fallback` trong kiến trúc vận hành. Rollback chỉ thực hiện ở cấp gói phát hành CEF
- └ 운영 아키텍처에 `MFC fallback`은 두지 않는다. 롤백은 CEF 릴리스 패키지 단위로만 수행한다
- Tiêu chí rollback:
- └ 롤백 기준:
  - Vượt ngưỡng bộ nhớ / 메모리 임계치 초과
  - Không khớp thanh toán / 결제 불일치
  - Thiếu sync ACK server trung tâm / 중앙 서버 sync ACK 누락
  - Tỷ lệ lỗi thiết bị tăng đột biến / 장치 오류율 급증
- UI mới triển khai theo thứ tự **cửa hàng thí điểm → mở rộng nhóm**, không triển khai đồng loạt toàn bộ cửa hàng
- └ 새 UI는 전 매장 일괄 전개가 아니라 **파일럿 매장 → 그룹 확대** 순서로 배포한다

### 8.16 Gate test và release
└ 테스트와 릴리스 게이트

- Hạng mục kiểm tra bắt buộc:
- └ 필수 검증 항목:
  - Bridge contract test
  - Test đơn vị UseCase / UseCase 단위 테스트
  - Test tái gửi idempotency thanh toán/đặt hàng / 결제/주문 멱등성 재전송 테스트
  - Kiểm tra hoạt động đặt hàng/thanh toán tiền mặt/xuất chỉ với MSSQL local trong trạng thái cắt internet
  - └ 인터넷 차단 상태에서 로컬 MSSQL만으로 주문/현금결제/출력 동작 검증
  - Test tái gửi tự động khi kết nối lại sau tích lũy Outbox backlog
  - └ Outbox backlog 누적 후 재연결 시 자동 재전송 테스트
  - Test chuyển trạng thái `SYNC_PENDING`, `SYNC_FAILED_RETRYING`, `ACKED`
  - └ `SYNC_PENDING`, `SYNC_FAILED_RETRYING`, `ACKED` 상태 전이 테스트
  - Test phục hồi sau khi buộc tắt process / 프로세스 강제 종료 후 복구 테스트
  - Snapshot test độ phân giải 1024x768 / 1024x768 해상도 snapshot test
  - Soak test bộ nhớ x86 dài hạn / x86 메모리 장시간 soak test
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

**Vị trí file**: `PosUI/src/providers/PosRealTimeReceiver.js`
└ **파일 위치**: `PosUI/src/providers/PosRealTimeReceiver.js`

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

Khi gửi từ UI đến C++ phải đi qua **cổng duy nhất gọi là `PosRequestSender.js`**. Đây là kênh **hỏi và đáp** cho thao tác có chủ đích của người dùng (truy vấn, lưu, thanh toán).
└ UI에서 C++로 보낼 때 **`PosRequestSender.js`라는 단일 창구**를 거친다. 사용자의 의도적 조작(조회, 저장, 결제)에 대한 **질문과 답변** 채널이다.

**Vị trí file**: `PosUI/src/bridge/PosRequestSender.js`
└ **파일 위치**: `PosUI/src/bridge/PosRequestSender.js`

**Nguyên lý hoạt động:**
└ **동작 원리:**
```
Component TableScreen → gọi selectTable(id)
└ TableScreen 컴포넌트 → selectTable(id) 호출
    ↓
bridge/PosRequestSender.js → đóng gói { v: 1, requestId: "...", timestamp: "...", cmd: "TABLE:SELECT", params: { id } }
└ bridge/PosRequestSender.js → { v: 1, requestId: "...", timestamp: "...", cmd: "TABLE:SELECT", params: { id } } 포장
    ↓
window.cefQuery (Promise)
    ↓
PosRequestResponder(router) → Actions/Table/ → UseCases/Table/SelectTableUseCase → DB/TableMgr
└ PosRequestResponder(라우터) → Actions/Table/ → UseCases/Table/SelectTableUseCase → DB/TableMgr
    ↓
C++ phản hồi JSON { v, requestId, timestamp, ok, code, data } → Promise resolve → component nhận kết quả
└ C++ 응답 JSON { v, requestId, timestamp, ok, code, data } → Promise resolve → 컴포넌트 결과 수신
```

**3 trách nhiệm của actions.js:**
└ **actions.js의 3가지 책임:**
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
- Dữ liệu truy vấn ưu tiên dùng RTK Query hook từ `store/api/*Api.js`, `PosRequestSender.js` được tái sử dụng làm transport nội bộ
- └ 조회성 데이터는 가능하면 `store/api/*Api.js`의 RTK Query hook을 사용하고, `PosRequestSender.js`는 그 내부 transport로 재사용한다
- Tác vụ lệnh sử dụng hàm wrapper theo domain của `bridge/PosRequestSender.js` hoặc RTK Query mutation wrapper
- └ 명령성 작업은 `bridge/PosRequestSender.js`의 도메인별 래퍼 함수 또는 RTK Query mutation wrapper 사용
- Định dạng yêu cầu cố định: `{ "v": number, "requestId": string, "timestamp": string, "cmd": string, "params": object, "idempotencyKey"?: string }`
- └ 요청 포맷: `{ "v": number, "requestId": string, "timestamp": string, "cmd": string, "params": object, "idempotencyKey"?: string }` 고정
- Định dạng phản hồi cố định: `{ "v": number, "requestId": string, "timestamp": string, "ok": boolean, "code": string, "data"?: object, "error"?: object }`
- └ 응답 포맷: `{ "v": number, "requestId": string, "timestamp": string, "ok": boolean, "code": string, "data"?: object, "error"?: object }` 고정

---

### 9.4 Hệ thống cổng đơn hai chiều (tóm tắt toàn bộ)
└ 양방향 단일 창구 체계 (전체 요약)

#### Quy cách đặt tên
└ 네이밍 규격

| Kênh | Tính chất | File JS | File C++ |
|------|------|---------|---------|
| **PosRequest** | Yêu cầu/phản hồi (hội thoại khứ hồi) | `PosRequestSender.js` | `PosRequestResponder.cpp` |
| └ | └ 요청/응답 (왕복 대화) | └ | └ |
| **PosRealTime** | Sự kiện thời gian thực (phát sóng một chiều) | `PosRealTimeReceiver.js` | `PosRealTimeSender.cpp` |
| └ | └ 실시간 이벤트 (단방향 방송) | └ | └ |

#### Luồng giao tiếp
└ 통신 흐름

| Hướng | Phía UI | Phía C++ | Phương thức |
|------|------|--------|------|
| **UI → C++ (Request)** | `PosRequestSender.js` | `PosRequestResponder.cpp` → Actions/ → UseCases/ | cefQuery (Promise khứ hồi / Promise 왕복) |
| **C++ → UI (RealTime)** | `PosRealTimeReceiver.js` | `PosRealTimeSender.cpp` | CustomEvent (phát sóng một chiều / 단방향 방송) |

#### Sơ đồ toàn bộ
└ 전체 다이어그램

```
┌──────────────────── UI (Next.js) ────────────────────┐
│                                                       │
│  [Kênh PosRequest — Yêu cầu/Phản hồi]                │
│  └ [PosRequest 채널 — 요청/응답]                       │
│  PosRequestSender.js ──cefQuery──→ PosRequestResponder │
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

#### Quy tắc sử dụng constants.js
└ constants.js 활용 규칙

Định nghĩa loại message sử dụng trong màn hình đó tại `constants.js` của mỗi thư mục Screen, được tham chiếu từ cả hai phía `PosRequestSender` và `PosRealTimeReceiver`.
└ 각 Screen 폴더의 `constants.js`에 해당 화면에서 사용하는 메시지 타입을 정의하여, `PosRequestSender`와 `PosRealTimeReceiver` 양쪽에서 참조한다.

```
screens/TableScreen/constants.js
├── REQUEST_TYPES: { SELECT_TABLE, LOAD_TABLES, CHANGE_FLOOR }  → Dùng làm cmd trong PosRequestSender / PosRequestSender에서 cmd로 사용
└── REALTIME_TYPES: { TABLE_REFRESH, TABLE_STATUS }             → Khớp type trong PosRealTimeReceiver / PosRealTimeReceiver에서 type 매칭
```

- Đặt hằng số bên trong Screen để duy trì **tính tự hoàn chỉnh**
- └ 상수를 Screen 내부에 두어 **자기완결성** 유지
- `PosRequestSender` tham chiếu bằng `import { REQUEST_TYPES } from '@screens/TableScreen/constants'`
- └ `PosRequestSender`는 `import { REQUEST_TYPES } from '@screens/TableScreen/constants'`로 참조
- `PosRealTimeReceiver` tập hợp `REALTIME_TYPES` từ các Screen để tạo bảng mapping toàn cục
- └ `PosRealTimeReceiver`는 각 Screen의 `REALTIME_TYPES`를 모아서 글로벌 매핑 테이블 구성

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
Local MSSQL
    ↓
RTK Query Cache
```

- Dữ liệu truy vấn nạp **kết quả truy vấn MSSQL local** vào RTK Query cache chứ không phải internet
- └ 조회성 데이터는 인터넷이 아니라 **로컬 MSSQL 조회 결과**를 RTK Query 캐시에 적재한다
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
Local MSSQL Commit
    ├── Business Data
    ├── Idempotency Ledger
    └── Outbox Record
    ↓
RTK Query invalidate/update
```

- Tiêu chí thành công của tác vụ lưu trữ là **commit MSSQL local thành công**
- └ 저장 작업의 성공 기준은 **로컬 MSSQL 커밋 성공**이다
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
- Hoàn thành kiểm tra hoạt động 3 màn hình cốt lõi truy vấn/đặt hàng/thanh toán tiền mặt chỉ với MSSQL local
- └ 로컬 MSSQL만으로 핵심 3개 화면 조회/주문/현금결제 동작 검증 완료
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

- `02-P0-P1-설계-보완-체크리스트.md`
- `03-테스트-계획서.md` (21 đường test dựa trên review kỹ thuật / 엔지니어링 리뷰 기반 21개 테스트 경로)

---

## 11. Build pipeline (bổ sung review kỹ thuật)
└ 빌드 파이프라인 (엔지니어링 리뷰 추가)

> Ngày bổ sung: 2026-04-01 (review kỹ thuật ARCH-4)
> └ 추가일: 2026-04-01 (엔지니어링 리뷰 ARCH-4)

### 11.1 Thứ tự build
└ 빌드 순서

```
1. Build PosUI / PosUI 빌드
   cd PosUI && npm run build
   → Tạo HTML/JS/CSS tĩnh trong thư mục out/ / out/ 폴더에 정적 HTML/JS/CSS 생성

2. Build C++ (VS2022 / MSBuild) / C++ 빌드 (VS2022 / MSBuild)
   MSBuild HyojungPOS-Main.sln /p:Configuration=Release /p:Platform=x64
   → Tạo RestaurantD.exe + CefSubprocess.exe / RestaurantD.exe + CefSubprocess.exe 생성

3. Triển khai tích hợp / 통합 배포
   VS2022 Post-Build Event hoặc build script / VS2022 Post-Build Event 또는 빌드 스크립트:
   - Build/PosUI/out/ ← Sao chép PosUI/out/ / PosUI/out/ 복사
   - Build/ ← Sao chép binary CEF SDK (libcef.dll, tài nguyên, v.v.) / CEF SDK 바이너리 (libcef.dll, 리소스 등) 복사
   - Build/ ← Sao chép Shared/i18n/locales/ / Shared/i18n/locales/ 복사
```

### 11.2 Dual build (x86/x64)
└ 듀얼 빌드 (x86/x64)

- x64: `Platform=x64` + binary CEF x64 / CEF x64 바이너리
- x86: `Platform=Win32` + binary CEF x86 / CEF x86 바이너리
- PosUI chia sẻ cùng kết quả build (JavaScript không phụ thuộc kiến trúc)
- └ PosUI는 동일 빌드 결과물 공유 (JavaScript는 아키텍처 무관)

### 11.3 Môi trường phát triển (Mock Bridge)
└ 개발 환경 (Mock Bridge)

- Phải có thể xác nhận trực tiếp trên browser component dùng chung và mockup toàn bộ màn hình tại route `app/design-system/`
- └ `app/design-system/` 라우트에서 공용 컴포넌트와 화면 전체 목업을 브라우저로 직접 확인할 수 있어야 한다
- `PosRequestSender.js` phát hiện môi trường và chọn giữa `cefTransport` và `mockTransport`
- └ `PosRequestSender.js`는 환경을 감지해 `cefTransport`와 `mockTransport` 중 하나를 선택한다
- Khi không phải môi trường CEF, Mock transport được kích hoạt và trả về dữ liệu `src/mocks/`
- └ CEF 환경이 아니면 Mock transport가 활성화되어 `src/mocks/` 데이터를 반환한다
- Có thể phát triển design system/màn hình trên browser thông thường bằng `next dev` (không cần C++/VS2022)
- └ `next dev`로 일반 브라우저에서 디자인 시스템/화면 개발 가능 (C++/VS2022 불필요)
- Dữ liệu Mock và fixture được lưu tách biệt tại `PosUI/src/mocks/bridge/`, `PosUI/src/mocks/screens/`, `PosUI/src/mocks/fixtures/`
- └ Mock 데이터와 fixture는 `PosUI/src/mocks/bridge/`, `PosUI/src/mocks/screens/`, `PosUI/src/mocks/fixtures/`에 분리 보관한다

```javascript
// PosUI/src/bridge/PosRequestSender.js (ví dụ chế độ phát triển / 개발 모드 예시)
const isCefEnvironment = typeof window !== 'undefined' && typeof window.cefQuery === 'function';
const transport = isCefEnvironment
  ? () => import('./adapters/cefTransport')
  : () => import('./adapters/mockTransport');

export async function posQuery(cmd, params) {
  const { send } = await transport();
  return send({ v: 1, cmd, params, requestId: crypto.randomUUID() });
}
```

---

## 12. Bản ghi quyết định review kỹ thuật (2026-04-01)
└ 엔지니어링 리뷰 결정 기록 (2026-04-01)

| ID | Vấn đề | Quyết định |
|---|---|---|
| ARCH-1 | Chọn nền tảng | Dual build x86/x64, cả hai đều bao gồm CEF |
| └ | └ 플랫폼 선택 | └ x86/x64 듀얼 빌드, 양쪽 모두 CEF 포함 |
| ARCH-2 | Cơ chế loại bỏ MFC UI | Cố định CEF shell đơn + React routing, không duy trì MFC fallback |
| └ | └ MFC UI 제거 방식 | └ CEF 단일 셸 + React 라우팅으로 고정, MFC fallback은 유지하지 않음 |
| ARCH-3 | Môi trường phát triển | Catalog `app/design-system/` + Mock transport tích hợp |
| └ | └ 개발 환경 | └ `app/design-system/` 카탈로그 + Mock transport 내장 |
| ARCH-4 | Build pipeline | Tích hợp VS2022 Post-Build Event + npm script |
| └ | └ 빌드 파이프라인 | └ VS2022 Post-Build Event + npm script 통합 |
| ARCH-5 | Hiệu suất cefQuery | Nguyên tắc ưu tiên bulk (yêu cầu đơn khi load màn hình) |
| └ | └ cefQuery 성능 | └ 벌크 우선 원칙 (화면 로드 시 단일 요청) |
| ARCH-7 | Phục hồi crash CEF | CefLifeSpanHandler phát hiện crash → Tự động tái tạo |
| └ | └ CEF 크래시 복구 | └ CefLifeSpanHandler 크래시 감지 → 자동 재생성 |
| ARCH-8 | Kho lưu trữ idempotency | Bảng IdempotencyLedger trong DB MSSQL local |
| └ | └ 멱등성 저장소 | └ MSSQL 로컬 DB에 IdempotencyLedger 테이블 |
