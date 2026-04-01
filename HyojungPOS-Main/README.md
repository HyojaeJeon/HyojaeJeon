# POS 메인

`경로 / Đường dẫn`: `/HyojungPOS-Main`

## 한국어

### 역할
- 실제 매장에서 동작하는 메인 POS 애플리케이션의 최상위 폴더다.

### 담당 범위
- AppHost, Presentation, UseCases, Domain, Infrastructure, Build

### 규칙
- 단방향 계층 흐름 UI/Bridge → UseCases → Domain/Manager → Infrastructure를 지킨다.
- Offline-First와 로컬 MSSQL 원본 원칙을 기준으로 개발한다.

### 해도 되는 것
- 도메인별 기능을 각 계층 책임에 맞게 배치한다.
- 운영 안정화와 점진 전환을 고려한 구조 개선을 수행한다.

### 하면 안 되는 것
- 레이어 책임을 섞어서 한 폴더에 몰아넣지 않는다.
- 외부 승인형 거래를 Outbox 재전송 대상으로 취급하지 않는다.

## Tiếng Việt

### Vai trò
- Đây là thư mục cấp cao nhất của ứng dụng POS chính chạy thực tế tại cửa hàng.

### Phạm vi phụ trách
- AppHost, Presentation, UseCases, Domain, Infrastructure và Build

### Quy tắc
- Giữ luồng tầng một chiều: UI/Bridge → UseCases → Domain/Manager → Infrastructure.
- Phát triển theo nguyên tắc Offline-First và local MSSQL là nguồn dữ liệu gốc.

### Được phép làm
- Đặt từng chức năng theo đúng trách nhiệm của từng tầng.
- Cải tiến cấu trúc theo hướng migration dần và ổn định vận hành.

### Không được làm
- Không trộn trách nhiệm của nhiều tầng vào cùng một thư mục.
- Không coi giao dịch cần phê duyệt realtime bên ngoài là đối tượng retry của Outbox.
