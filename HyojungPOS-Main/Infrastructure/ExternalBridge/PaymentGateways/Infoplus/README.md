# Infoplus

`경로 / Đường dẫn`: `/HyojungPOS-Main/Infrastructure/ExternalBridge/PaymentGateways/Infoplus`

## 한국어

### 역할
- Infoplus 외부 결제 연동 구현을 담당한다.

### 담당 범위
- Infoplus API 통신, 응답 파싱, 어댑터 구현

### 규칙
- 실시간 승인형 거래는 온라인 상태에서만 수행한다.
- 이 영역은 기술 통신을 담당하고 거래 성공 최종 판정은 UseCases가 한다.

### 해도 되는 것
- 외부 결제 API 호출, 응답 변환, 오류 코드 매핑을 구현한다.
- UseCases가 사용할 결제 어댑터 인터페이스를 제공한다.

### 하면 안 되는 것
- 오프라인 backlog에서 과거 승인 요청을 자동 재실행하지 않는다.
- UI 상태나 영수증 흐름을 직접 결정하지 않는다.

## Tiếng Việt

### Vai trò
- Thư mục này phụ trách triển khai tích hợp thanh toán bên ngoài Infoplus.

### Phạm vi phụ trách
- Giao tiếp API Infoplus, parse phản hồi và triển khai adapter

### Quy tắc
- Giao dịch cần phê duyệt realtime chỉ được thực hiện khi đang online.
- Vùng này chỉ xử lý giao tiếp kỹ thuật; quyết định thành công cuối cùng thuộc về UseCases.

### Được phép làm
- Triển khai gọi API thanh toán ngoài, chuyển đổi phản hồi và map mã lỗi.
- Cung cấp interface adapter thanh toán để UseCases sử dụng.

### Không được làm
- Không tự động chạy lại yêu cầu phê duyệt cũ từ backlog offline.
- Không trực tiếp quyết định trạng thái UI hay luồng in hóa đơn.
