# Platform

`경로 / Đường dẫn`: `/`

## 한국어

### 역할
- 프로젝트 전체의 구조 기준과 하위 애플리케이션의 책임 경계를 설명하는 저장소 루트다.

### 담당 범위
- `BrandPosApp`(Setup/Maintenance mode 포함), `BrandAdminPortal`, `SuperAdmin`, `SharedKernel`, `SharedContracts`, `SharedAssets`, `1.Docs` 전체 구조
- `SuperAdmin` 아래에는 `Portal`, `CentralApi`, `SyncWorkers`가 있다.
- 공용 자산 원본과 공통 계약은 빌드 산출물과 분리해서 관리한다.

### 규칙
- 설계 문서와 CLAUDE.md를 최우선 기준으로 삼는다.
- 루트는 조정과 설명의 위치이지, 하위 계층 책임을 구현하는 위치가 아니다.
- 다국어 원본은 `SharedAssets/i18n/locales`를 따라야 하며, 각 앱은 빌드 산출물에 포함해 사용한다.

### 해도 되는 것
- 저장소 수준 문서와 공통 운영 규칙을 정리한다.
- 상위 구조와 폴더 책임을 설명하는 README를 유지한다.
- top-level 디렉토리 역할과 명명 규칙을 명확히 정리한다.
- shared package와 platform 앱의 배포 경계를 문서화한다.

### 하면 안 되는 것
- 임시 실험 구조를 루트에 무분별하게 추가하지 않는다.
- 특정 계층의 구현 책임을 루트에 직접 배치하지 않는다.
- 공용 자산을 공유 런타임 서버처럼 오해하게 만들지 않는다.

## Tiếng Việt

### Vai trò
- Đây là thư mục gốc mô tả chuẩn cấu trúc và ranh giới trách nhiệm của toàn bộ dự án.

### Phạm vi phụ trách
- Toàn bộ cấu trúc của `BrandPosApp`(bao gồm mode Setup/Maintenance), `BrandAdminPortal`, `SuperAdmin`, `SharedKernel`, `SharedContracts`, `SharedAssets` và `1.Docs`
- Bên trong `SuperAdmin` có các thư mục `Portal`, `CentralApi`, `SyncWorkers`.
- Nguồn tài sản chung và contract chung phải được quản lý tách khỏi artifact build.

### Quy tắc
- Luôn lấy tài liệu thiết kế và CLAUDE.md làm chuẩn ưu tiên cao nhất.
- Thư mục gốc chỉ dùng để điều phối và mô tả, không dùng để triển khai trách nhiệm của các tầng con.
- Nguồn đa ngôn ngữ phải theo `SharedAssets/i18n/locales`; từng app chỉ sử dụng qua artifact build của chính nó.

### Được phép làm
- Tổ chức tài liệu cấp repository và quy tắc vận hành dùng chung.
- Duy trì README mô tả cấu trúc tổng thể và trách nhiệm từng vùng.
- Làm rõ vai trò và quy tắc đặt tên của các thư mục top-level.
- Tài liệu hóa ranh giới triển khai giữa shared package và platform app.

### Không được làm
- Không thêm cấu trúc thử nghiệm tạm thời vào thư mục gốc một cách tùy tiện.
- Không đặt trực tiếp mã triển khai của từng tầng vào thư mục gốc.
- Không mô tả shared assets như một shared runtime server dùng chung trực tiếp.
