# 도메인

`경로 / Đường dẫn`: `/HyojungPOS-Main/Domain`

## 한국어

### 역할
- 비즈니스 규칙과 상태 계산을 담는 도메인 계층의 루트다.

### 담당 범위
- 도메인 규칙, 상태 전이, Manager 구현, UseCases에 전달할 결과 모델

### 규칙
- 순수한 도메인 계산을 우선한다.
- UI 송신, 외부 ACK, 브라우저 상태 제어는 여기서 결정하지 않는다.

### 해도 되는 것
- 도메인 규칙과 상태 계산을 모듈화한다.
- UseCases가 사용할 결과 모델과 Manager API를 정리한다.

### 하면 안 되는 것
- PosRealTimeSender를 직접 호출하지 않는다.
- 상위 계층 오케스트레이션이나 화면 렌더링을 구현하지 않는다.

## Tiếng Việt

### Vai trò
- Đây là thư mục gốc của tầng domain chứa quy tắc nghiệp vụ và tính toán trạng thái.

### Phạm vi phụ trách
- Quy tắc domain, chuyển trạng thái, triển khai Manager và mô hình kết quả cho UseCases

### Quy tắc
- Ưu tiên giữ logic domain ở trạng thái thuần túy.
- Không quyết định gửi UI, ACK bên ngoài hay trạng thái trình duyệt tại đây.

### Được phép làm
- Mô-đun hóa quy tắc domain và tính toán trạng thái.
- Chuẩn hóa Manager API và mô hình kết quả để UseCases dùng.

### Không được làm
- Không gọi PosRealTimeSender trực tiếp.
- Không triển khai orchestration tầng trên hay render UI.
