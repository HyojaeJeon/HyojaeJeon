# 테이블

`경로 / Đường dẫn`: `/HyojungPOS-Main/Presentation/CEF/InternalBridge/PosRequestActions/Table`

## 한국어

### 역할
- 테이블 요청의 파싱, 검증, UseCase 라우팅을 담당한다.

### 담당 범위
- 테이블 요청 DTO, 필드 검증, UseCase 호출

### 규칙
- Action은 thin router로 유지한다.
- 여기서 비즈니스 최종 판단이나 트랜잭션 제어를 하지 않는다.

### 해도 되는 것
- cmd와 파라미터를 해석하고 적절한 UseCase로 위임한다.
- 공통 에러/응답 포맷을 맞춘다.

### 하면 안 되는 것
- 여러 Manager를 직접 조합해 오케스트레이션하지 않는다.
- 직접 SQL, 장치 호출, 외부 ACK 전송을 수행하지 않는다.

## Tiếng Việt

### Vai trò
- Thư mục này phụ trách phân tích, kiểm tra và định tuyến UseCase cho request bàn.

### Phạm vi phụ trách
- DTO request bàn, kiểm tra field và gọi UseCase

### Quy tắc
- Action phải luôn là thin router.
- Không xử lý quyết định nghiệp vụ cuối cùng hay transaction control tại đây.

### Được phép làm
- Phân tích cmd/params và ủy quyền đúng UseCase.
- Đồng bộ hóa định dạng lỗi và phản hồi chung.

### Không được làm
- Không trực tiếp phối hợp nhiều Manager để điều phối.
- Không thực hiện SQL, gọi thiết bị hay gửi ACK bên ngoài trực tiếp.
