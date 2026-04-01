# 고객

`경로 / Đường dẫn`: `/HyojungPOS-Main/Domain/Customer`

## 한국어

### 역할
- 고객 도메인의 업무 규칙, 상태 계산, Manager 구현을 담당한다.

### 담당 범위
- 고객 상태 전이, 계산 로직, Manager API, 도메인 결과 모델

### 규칙
- 도메인 규칙은 순수하게 유지하고 외부 부수효과는 상위 계층으로 올린다.
- 영속화 세부 구현과 UI 송신은 이 계층의 책임이 아니다.

### 해도 되는 것
- 도메인 계산, 상태 변경 규칙, Manager 정리를 수행한다.
- UseCases가 조합하기 좋은 입력/출력 인터페이스를 제공한다.

### 하면 안 되는 것
- 직접 UI 이벤트를 발송하지 않는다.
- 외부 ACK, 브라우저 복구, 동기화 정책을 여기서 결정하지 않는다.

## Tiếng Việt

### Vai trò
- Thư mục này phụ trách quy tắc nghiệp vụ, tính toán trạng thái và triển khai Manager cho miền khách hàng.

### Phạm vi phụ trách
- Chuyển trạng thái khách hàng, logic tính toán, Manager API và mô hình kết quả domain

### Quy tắc
- Giữ quy tắc domain ở dạng thuần, đẩy side effect ra tầng trên.
- Chi tiết persistence và gửi UI không thuộc trách nhiệm của tầng này.

### Được phép làm
- Triển khai tính toán domain, quy tắc đổi trạng thái và sắp xếp Manager.
- Cung cấp interface đầu vào/đầu ra dễ phối hợp cho UseCases.

### Không được làm
- Không phát sự kiện UI trực tiếp.
- Không quyết định ACK bên ngoài, phục hồi browser hay chính sách sync tại đây.
