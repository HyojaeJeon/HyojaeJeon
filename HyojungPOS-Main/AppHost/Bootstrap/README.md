# 부트스트랩

`경로 / Đường dẫn`: `/HyojungPOS-Main/AppHost/Bootstrap`

## 한국어

### 역할
- 서비스 구성과 앱 조립 순서를 명시하는 부트스트랩 영역이다.

### 담당 범위
- ServiceRegistry, composition root, 의존성 등록 규칙

### 규칙
- 객체 생성과 wiring만 담당하고 실행 중 업무 판단은 하지 않는다.
- 레이어 경계를 무너뜨리는 직접 참조를 등록 단계에서 만들지 않는다.

### 해도 되는 것
- 생성 순서와 서비스 의존성을 문서화한다.
- 공통 서비스 등록 규칙을 중앙에서 정리한다.

### 하면 안 되는 것
- UseCase나 Manager 로직을 여기에 넣지 않는다.
- 임시 테스트용 wiring을 장기 구조에 남기지 않는다.

## Tiếng Việt

### Vai trò
- Đây là vùng bootstrap dùng để mô tả việc đăng ký service và ghép nối ứng dụng.

### Phạm vi phụ trách
- ServiceRegistry, composition root và quy tắc đăng ký dependency

### Quy tắc
- Chỉ tạo đối tượng và wiring, không đưa ra quyết định nghiệp vụ khi chạy.
- Không tạo tham chiếu trực tiếp làm vỡ ranh giới tầng ngay từ bước đăng ký.

### Được phép làm
- Tài liệu hóa thứ tự khởi tạo và phụ thuộc giữa các service.
- Chuẩn hóa quy tắc đăng ký service dùng chung tại một nơi.

### Không được làm
- Không đặt logic UseCase hoặc Manager tại đây.
- Không để wiring tạm thời cho test tồn tại trong cấu trúc dài hạn.
