# POS 설정

`경로 / Đường dẫn`: `/HyojungPOS-Set`

## 한국어

### 역할
- 설정 프로그램의 최상위 폴더이며, Main과 분리된 독립 실행 구조를 가진다.

### 담당 범위
- 설정 프로그램 AppHost, Presentation, Infrastructure, SetUI, Build

### 규칙
- Main과 코드를 섞지 않고 독립 실행 가능 구조를 유지한다.
- 공유 계약은 SharedCpp/Shared를 통해서만 맞춘다.

### 해도 되는 것
- 설정 화면, 설정 저장, 설정 UI 전환 구조를 정리한다.
- Main이 읽을 설정 데이터를 안전하게 관리한다.

### 하면 안 되는 것
- Main 내부 구현에 직접 의존하지 않는다.
- 런타임에 Main 프로세스와 직접 결합하는 구조를 만들지 않는다.

## Tiếng Việt

### Vai trò
- Đây là thư mục cấp cao nhất của chương trình cấu hình, tách biệt và chạy độc lập với Main.

### Phạm vi phụ trách
- AppHost, Presentation, Infrastructure, SetUI và Build của chương trình cấu hình

### Quy tắc
- Giữ cấu trúc chạy độc lập, không trộn mã với Main.
- Chỉ đồng bộ contract dùng chung thông qua SharedCpp và Shared.

### Được phép làm
- Tổ chức màn hình cấu hình, lưu cấu hình và cấu trúc chuyển đổi UI cấu hình.
- Quản lý an toàn dữ liệu cấu hình để Main có thể đọc.

### Không được làm
- Không phụ thuộc trực tiếp vào triển khai nội bộ của Main.
- Không tạo cấu trúc gắn chặt runtime với tiến trình Main.
