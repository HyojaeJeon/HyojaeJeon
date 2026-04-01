# 전송 어댑터

`경로 / Đường dẫn`: `/PosUI/src/bridge/adapters`

## 한국어

### 역할
- 장치 명령 또는 transport 교체용 어댑터를 담는 브릿지 보조 영역이다.

### 담당 범위
- CEF transport, mock transport, imperative device command wrapper

### 규칙
- 화면은 저수준 transport 세부사항을 몰라야 한다.
- 장치 imperative command와 조회성 데이터 훅을 분리한다.

### 해도 되는 것
- 환경별 transport와 imperative command 래퍼를 구현한다.
- mock/CEF 전환 규칙을 한 곳에서 관리한다.

### 하면 안 되는 것
- 화면 컴포넌트에 transport 분기 코드를 흩뿌리지 않는다.
- RTK Query 캐시 정책을 여기서 대체 구현하지 않는다.

## Tiếng Việt

### Vai trò
- Đây là vùng bridge phụ trợ chứa adapter transport hoặc wrapper cho lệnh thiết bị.

### Phạm vi phụ trách
- CEF transport, mock transport và wrapper cho command thiết bị kiểu imperative

### Quy tắc
- Màn hình không được biết chi tiết transport mức thấp.
- Phải tách command thiết bị imperative khỏi hook dữ liệu truy vấn.

### Được phép làm
- Triển khai transport theo môi trường và wrapper command.
- Quản lý tập trung quy tắc chuyển đổi giữa mock và CEF.

### Không được làm
- Không rải mã phân nhánh transport vào component màn hình.
- Không thay thế chính sách cache RTK Query ở tầng này.
