# 앱 호스트

`경로 / Đường dẫn`: `/HyojungPOS-Main/AppHost`

## 한국어

### 역할
- 실행 파일과 부트스트랩 조립을 담당하는 호스트 계층이다.

### 담당 범위
- 프로세스 진입점, 서비스 조립, 초기화 순서, 앱 구성 루트

### 규칙
- 의존성 조립과 초기화만 담당하고 업무 규칙은 하위 계층에 둔다.
- 프로세스 시작 순서를 문서화된 방식으로 고정한다.

### 해도 되는 것
- 서비스 등록, 앱 시작 순서, 종료 순서를 정리한다.
- 실행 호스트 수준 설정과 composition root를 관리한다.

### 하면 안 되는 것
- 업무 로직이나 화면 동작 규칙을 여기서 구현하지 않는다.
- 하위 계층의 세부 구현을 임의로 우회 호출하지 않는다.

## Tiếng Việt

### Vai trò
- Đây là tầng host phụ trách file thực thi và phần bootstrap của ứng dụng.

### Phạm vi phụ trách
- Điểm vào tiến trình, lắp ghép service, thứ tự khởi tạo và composition root

### Quy tắc
- Chỉ phụ trách lắp ghép dependency và khởi tạo, còn nghiệp vụ phải nằm ở tầng dưới.
- Cố định thứ tự khởi động theo đúng tài liệu thiết kế.

### Được phép làm
- Tổ chức đăng ký service, thứ tự start/stop của ứng dụng.
- Quản lý cấu hình cấp host và composition root.

### Không được làm
- Không triển khai logic nghiệp vụ hoặc quy tắc màn hình ở đây.
- Không tự ý bypass và gọi tắt sang chi tiết tầng dưới.
