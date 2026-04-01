# HyojungPOSApp

`경로 / Đường dẫn`: `/`

## 한국어

### 역할
- 프로젝트 전체의 구조 기준과 하위 애플리케이션의 책임 경계를 설명하는 저장소 루트다.

### 담당 범위
- POS 메인, 설정 프로그램, PosUI, SharedCpp, Shared, Docs 전체 구조

### 규칙
- 설계 문서와 CLAUDE.md를 최우선 기준으로 삼는다.
- 루트는 조정과 설명의 위치이지, 하위 계층 책임을 구현하는 위치가 아니다.

### 해도 되는 것
- 저장소 수준 문서와 공통 운영 규칙을 정리한다.
- 상위 구조와 폴더 책임을 설명하는 README를 유지한다.

### 하면 안 되는 것
- 임시 실험 구조를 루트에 무분별하게 추가하지 않는다.
- 특정 계층의 구현 책임을 루트에 직접 배치하지 않는다.

## Tiếng Việt

### Vai trò
- Đây là thư mục gốc mô tả chuẩn cấu trúc và ranh giới trách nhiệm của toàn bộ dự án.

### Phạm vi phụ trách
- Toàn bộ cấu trúc của POS chính, chương trình cấu hình, PosUI, SharedCpp, Shared và Docs

### Quy tắc
- Luôn lấy tài liệu thiết kế và CLAUDE.md làm chuẩn ưu tiên cao nhất.
- Thư mục gốc chỉ dùng để điều phối và mô tả, không dùng để triển khai trách nhiệm của các tầng con.

### Được phép làm
- Tổ chức tài liệu cấp repository và quy tắc vận hành dùng chung.
- Duy trì README mô tả cấu trúc tổng thể và trách nhiệm từng vùng.

### Không được làm
- Không thêm cấu trúc thử nghiệm tạm thời vào thư mục gốc một cách tùy tiện.
- Không đặt trực tiếp mã triển khai của từng tầng vào thư mục gốc.
