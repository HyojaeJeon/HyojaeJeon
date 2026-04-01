# 공용 C++

`경로 / Đường dẫn`: `/SharedCpp`

## 한국어

### 역할
- Main/Set이 함께 쓰는 공용 C++ 계약과 기반 도구를 담는 루트다.

### 담당 범위
- Foundation, Contracts, Observability, Testing, BuildSupport

### 규칙
- 도메인별 구현은 SharedCpp에 넣지 않고 공용 계약/기반만 둔다.
- 브릿지와 UseCases가 공유하는 계약 원본을 중앙에서 관리한다.

### 해도 되는 것
- 공용 DTO, 상수, 유틸리티, 테스트 fixture를 정리한다.
- 빌드 지원과 contract 검증 보조 도구를 유지한다.

### 하면 안 되는 것
- OrderMgr, SaleMgr 같은 도메인 구현을 여기 넣지 않는다.
- Main/Set 특정 실행 코드에 강하게 결합시키지 않는다.

## Tiếng Việt

### Vai trò
- Đây là thư mục gốc chứa contract và công cụ nền tảng C++ dùng chung cho Main/Set.

### Phạm vi phụ trách
- Foundation, Contracts, Observability, Testing và BuildSupport

### Quy tắc
- Không đặt triển khai theo domain vào SharedCpp; chỉ giữ contract và nền tảng dùng chung.
- Quản lý tập trung nguồn contract dùng chung giữa bridge và UseCases.

### Được phép làm
- Chuẩn hóa DTO, hằng số, tiện ích và fixture test dùng chung.
- Duy trì công cụ hỗ trợ build và kiểm tra contract.

### Không được làm
- Không đặt các triển khai domain như OrderMgr hay SaleMgr tại đây.
- Không gắn chặt SharedCpp với mã thực thi riêng của Main/Set.
