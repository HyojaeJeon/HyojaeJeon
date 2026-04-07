# 기초 공용

`경로 / Đường dẫn`: `/SharedKernel/Foundation`

## 한국어

### 역할
- 기초 공용 관련 공용 C++ 자산을 제공하는 영역이다.

### 담당 범위
- 기초 공용 범주의 공용 유틸, 계약, 관측성, 테스트 또는 빌드 지원

### 규칙
- 여기는 공용 기반 계층이며 개별 앱의 도메인 구현을 넣지 않는다.
- Main/Set이 함께 써야 하는 규칙만 남긴다.

### 해도 되는 것
- 공용 계약, 유틸리티, 테스트 자산, 빌드 지원 코드를 정리한다.
- 앱 간 중복되는 기반 코드를 표준화한다.

### 하면 안 되는 것
- 특정 앱 전용 기능을 SharedKernel에 넣지 않는다.
- 레이어 책임을 흐리는 business implementation을 추가하지 않는다.

## Tiếng Việt

### Vai trò
- Đây là vùng cung cấp tài sản C++ dùng chung liên quan đến nền tảng dùng chung.

### Phạm vi phụ trách
- Tiện ích, contract, observability, test hoặc build support thuộc nhóm nền tảng dùng chung

### Quy tắc
- Đây là tầng nền tảng dùng chung, không đặt triển khai domain của từng ứng dụng.
- Chỉ giữ lại những quy tắc thật sự phải dùng chung giữa Main và Set.

### Được phép làm
- Chuẩn hóa contract, tiện ích, tài sản test và mã hỗ trợ build dùng chung.
- Giảm trùng lặp ở lớp nền tảng giữa các ứng dụng.

### Không được làm
- Không đặt chức năng chỉ dành cho một ứng dụng vào SharedKernel.
- Không thêm business implementation làm mờ ranh giới kiến trúc.
