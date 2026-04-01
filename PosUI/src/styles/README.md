# 스타일

`경로 / Đường dẫn`: `/PosUI/src/styles`

## 한국어

### 역할
- 디자인 토큰, 전역 스타일, 레이아웃 기준을 담는 스타일 영역이다.

### 담당 범위
- globals.css, colors, spacing, typography, shadow 같은 시각 기준

### 규칙
- 1024x768 POS 고정 해상도와 터치 UX 기준을 반영한다.
- 토큰과 전역 스타일은 디자인 시스템과 일관되게 맞춘다.

### 해도 되는 것
- 전역 CSS, 토큰, 테마 변수, 타이포그래피 기준을 관리한다.
- 브라우저 기본 스크롤 차단과 POS 전용 레이아웃 규칙을 유지한다.

### 하면 안 되는 것
- 화면별 임시 스타일을 무분별하게 전역에 쌓지 않는다.
- 디자인 토큰 없이 매직 넘버를 남발하지 않는다.

## Tiếng Việt

### Vai trò
- Đây là vùng style chứa token thiết kế, style toàn cục và chuẩn layout.

### Phạm vi phụ trách
- globals.css, màu sắc, khoảng cách, typography, shadow và các chuẩn thị giác

### Quy tắc
- Phải phản ánh chuẩn POS 1024x768 cố định và UX cảm ứng.
- Token và style toàn cục phải nhất quán với design system.

### Được phép làm
- Quản lý CSS toàn cục, token, biến theme và chuẩn typography.
- Giữ quy tắc khóa scroll mặc định và layout chuyên dụng cho POS.

### Không được làm
- Không dồn các style tạm thời theo từng màn hình vào global một cách vô tội vạ.
- Không lạm dụng magic number mà không có token thiết kế.
