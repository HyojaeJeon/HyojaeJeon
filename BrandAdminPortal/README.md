# BrandAdminPortal

`경로 / Đường dẫn`: `/BrandAdminPortal`

## 한국어

### 역할
- 브랜드 본사 운영자가 여러 지점과 공통 마스터를 관리하는 Web 포털이다.
- 브랜드 계층의 조회/관리 화면을 담당하며, 공급사 운영과 매장 실행은 여기서 분리한다.

### 기술 스택
- `Next.js(TypeScript) + App Router + Apollo Client`
- 서버 상태는 GraphQL-first로 가져오고, UI 상태는 `Redux Toolkit`으로 분리한다.

### 담당 범위
- 브랜드 사용자 관리, 지점 설정, 메뉴/가격/프로모션 배포, 리포트 조회
- GraphQL-first 조회 화면, 브랜드 정책 편집, 지점별 override 관리
- 다국어 UI, 공통 알림, 감사 가능 운영 화면

### 규칙
- 공급사 운영 권한이나 SuperAdmin 범위는 여기 두지 않는다.
- Edge POS 로컬 DB를 직접 전제로 기능을 설계하지 않는다.
- 서버 상태는 `Apollo Client`로 다루고, UI 상태는 `Redux Toolkit`으로 분리한다.
- 다국어 원본은 `SharedAssets/i18n/locales`를 따른다.

### 해도 되는 것
- 브랜드 기본 정책과 지점 단위 override 관리
- 브랜드 관점 운영 대시보드와 배포 화면 설계
- 번역 키와 locale bundle을 공통 계약에 맞춰 사용

### 하면 안 되는 것
- 슈퍼관리자 기능을 혼합하지 않는다.
- 매장 업무 트랜잭션을 직접 처리하는 UI를 두지 않는다.
- 로컬 설정 도구나 장치 커미셔닝 기능을 여기에 흡수하지 않는다.

### i18n/다국어
- UI 문자열과 메시지는 `SharedAssets/i18n/locales`에서 가져온다.
- 기본 지원 언어는 `ko`, `vi`, `en`이다.
- 번역 키는 화면 내부가 아니라 공통 계약과 자산 패키지 기준으로 관리한다.

### 소비하는 공용 패키지
- `SharedContracts` = GraphQL/DTO/type 계약
- `SharedAssets` = locale/static asset 원본

## Tiếng Việt

### Vai trò
- Đây là cổng web để bộ phận vận hành của từng thương hiệu quản lý nhiều chi nhánh và master chung.
- Phụ trách các màn hình quản lý/tra cứu của tầng brand; tách biệt với vận hành cấp nhà cung cấp và thực thi tại cửa hàng.

### Stack kỹ thuật
- `Next.js(TypeScript) + App Router + Apollo Client`
- Trạng thái server theo GraphQL-first; trạng thái UI tách riêng bằng `Redux Toolkit`.

### Phạm vi phụ trách
- Quản lý người dùng brand, cấu hình chi nhánh, phân phối menu/giá/khuyến mãi, xem báo cáo
- Màn hình truy vấn GraphQL-first, chỉnh sửa policy của brand, quản lý override theo chi nhánh
- UI đa ngôn ngữ, thông báo dùng chung, màn hình có thể audit

### Quy tắc
- Không đặt quyền vận hành cấp nhà cung cấp hay phạm vi SuperAdmin ở đây.
- Không thiết kế tính năng dựa trên giả định truy cập trực tiếp DB local của Edge POS.
- Trạng thái server dùng `Apollo Client`; trạng thái UI tách riêng bằng `Redux Toolkit`.
- Nguồn bản dịch phải theo `SharedAssets/i18n/locales`.

### Được phép làm
- Quản lý policy mặc định của brand và override theo chi nhánh
- Thiết kế dashboard vận hành và màn hình phân phối theo góc nhìn brand
- Sử dụng khóa dịch và bundle locale theo contract chung

### Không được làm
- Không trộn chức năng của Super Admin vào đây.
- Không đưa giao dịch nghiệp vụ của cửa hàng vào UI này.
- Không nhập luôn tính năng cài đặt local hay commissioning thiết bị.

### Đa ngôn ngữ / i18n
- Chuỗi UI và message phải lấy từ `SharedAssets/i18n/locales`.
- Bộ ngôn ngữ mặc định: `ko`, `vi`, `en`.
- Khóa dịch phải được quản lý theo contract và asset package dùng chung, không hardcode trong screen.

### Gói dùng chung mà app này tiêu thụ
- `SharedContracts` = contract type/DTO/GraphQL
- `SharedAssets` = nguồn locale/static asset
