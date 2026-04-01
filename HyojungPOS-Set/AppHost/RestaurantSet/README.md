# RestaurantSet

`경로 / Đường dẫn`: `/HyojungPOS-Set/AppHost/RestaurantSet`

## 한국어

### 역할
- 실행 프로젝트 자체를 담는 호스트 하위 영역이다.

### 담당 범위
- vcxproj, 앱 진입점, 프로세스 초기화, 종료 루틴

### 규칙
- 앱 수명주기와 진입점 코드는 유지하되, 업무 규칙은 다른 계층으로 이동한다.
- CEF 초기화와 종료 순서는 문서 기준을 따른다.

### 해도 되는 것
- 프로세스 시작/종료, 전역 초기화, 호스트 설정을 정리한다.
- 빌드 대상 프로젝트 설정을 관리한다.

### 하면 안 되는 것
- UseCase/Domain 규칙을 이 프로젝트 루트에 쌓아두지 않는다.
- 화면별 세부 동작을 앱 진입점에 직접 구현하지 않는다.

## Tiếng Việt

### Vai trò
- Đây là vùng con chứa chính project thực thi của ứng dụng.

### Phạm vi phụ trách
- vcxproj, điểm vào ứng dụng, khởi tạo tiến trình và quy trình 종료

### Quy tắc
- Giữ mã vòng đời ứng dụng và entry point tại đây, còn nghiệp vụ phải tách sang tầng khác.
- Tuân thủ thứ tự khởi tạo và shutdown CEF theo tài liệu.

### Được phép làm
- Sắp xếp start/stop tiến trình, khởi tạo toàn cục và cấu hình host.
- Quản lý cấu hình project build.

### Không được làm
- Không dồn logic UseCase/Domain vào gốc project thực thi.
- Không viết trực tiếp hành vi chi tiết của từng màn hình trong entry point.
