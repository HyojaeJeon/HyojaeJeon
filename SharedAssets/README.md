# SharedAssets

`경로 / Đường dẫn`: `/SharedAssets`

## 한국어

### 역할
- 모든 플랫폼이 공통으로 소비하는 버전 관리된 정적 자산 원본이다.
- 이 폴더는 공유 런타임 서버가 아니라, 빌드 시 각 플랫폼 산출물로 복사되는 원본 저장소다.

### 담당 범위
- 공용 static asset
- font, icon, image, template fragment

### 규칙
- 각 플랫폼의 `build artifact` 안에 복사된 자산은 배포 산출물이지 원본이 아니다.
- 업무 로직, API 코드, DB 코드는 이곳에 넣지 않는다.

### 해도 되는 것
- 아이콘, 폰트, 이미지, 템플릿 fragment 같은 공용 정적 자산을 표준화한다.
- 플랫폼별 빌드 파이프라인에서 정적 자산을 복사하도록 정의한다.

### 하면 안 되는 것
- 여러 플랫폼이 같은 파일 시스템을 직접 공유하는 런타임 서버처럼 사용하지 않는다.
- 기능 코드나 domain 로직을 섞지 않는다.

### 소비 방식
- `BrandAdminPortal`, `RegionalDistributorPortal`, `SuperAdmin/Portal`은 Next.js 빌드 시 static asset 을 포함한다.
- `BrandPosApp`은 Setup/Maintenance 및 POS UI 빌드에서 static asset 을 포함한다.
- C++ 네이티브 계층은 필요 시 공용 정적 리소스를 읽는다.

## Tiếng Việt

### Vai trò
- Đây là nguồn tài sản tĩnh được version hóa mà mọi platform cùng tiêu thụ.
- Thư mục này không phải shared runtime server; nó là nơi chứa nguồn để copy vào artifact của từng platform khi build.

### Phạm vi phụ trách
- static asset dùng chung
- font, icon, image, template fragment

### Quy tắc
- Asset đã được copy vào `build artifact` của từng platform là artifact triển khai, không phải nguồn gốc.
- Không đặt business logic, API code hoặc DB code vào đây.

### Được phép làm
- Chuẩn hóa tài nguyên icon/font/image/template fragment dùng chung.
- Định nghĩa việc copy static assets trong pipeline build của từng platform.

### Không được làm
- Không dùng như một shared runtime server mà nhiều platform cùng mount trực tiếp filesystem.
- Không trộn code chức năng hoặc domain logic vào đây.

### Cách sử dụng
- `BrandAdminPortal`, `RegionalDistributorPortal`, `SuperAdmin/Portal` sẽ nhúng static asset trong build Next.js.
- `BrandPosApp` sẽ nhúng static asset trong build của POS UI và mode Setup/Maintenance.
- Tầng C++ native có thể đọc công용 static asset khi cần.
