# HTTP

`경로 / Đường dẫn`: `/HyojungPOS-Main/Infrastructure/Network/HTTP`

## 한국어

### 역할
- 네트워크 통신 보조 구현을 담당하는 인프라 영역이다.

### 담당 범위
- HTTP/MQTT 네트워크 클라이언트, 연결 유틸, 통신 보조 코드

### 규칙
- 네트워크 계층은 전송을 담당하고 비즈니스 판정은 하지 않는다.
- 온라인 여부는 단일 bool이 아니라 세분화된 연결 상태로 다룬다.

### 해도 되는 것
- 통신 클라이언트와 재시도/연결 보조 로직을 구현한다.
- 상위 계층이 사용할 네트워크 어댑터를 제공한다.

### 하면 안 되는 것
- 화면 상태나 거래 성공 여부를 네트워크 계층이 직접 판정하지 않는다.
- 외부 payload를 검증 없이 그대로 넘기지 않는다.

## Tiếng Việt

### Vai trò
- Đây là vùng hạ tầng phụ trách triển khai truyền thông mạng.

### Phạm vi phụ trách
- Client HTTP/MQTT, tiện ích kết nối và mã hỗ trợ giao tiếp

### Quy tắc
- Tầng mạng chỉ phụ trách truyền tải, không được ra quyết định nghiệp vụ.
- Trạng thái online không phải một bool duy nhất mà phải tách thành nhiều kết nối con.

### Được phép làm
- Triển khai client giao tiếp và logic hỗ trợ retry/kết nối.
- Cung cấp adapter mạng cho các tầng trên sử dụng.

### Không được làm
- Không để tầng mạng tự quyết định thành công giao dịch hay trạng thái màn hình.
- Không chuyển tiếp payload ngoài khi chưa kiểm tra.
