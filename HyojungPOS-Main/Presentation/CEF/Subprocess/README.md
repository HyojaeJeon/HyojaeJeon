# CEF 서브프로세스

`경로 / Đường dẫn`: `/HyojungPOS-Main/Presentation/CEF/Subprocess`

## 한국어

### 역할
- CEF 렌더러 서브프로세스 실행 파일과 진입점을 관리한다.

### 담당 범위
- CefSubprocess 프로젝트, renderer 진입점, 프로세스별 설정

### 규칙
- 메인 프로세스와 렌더러 프로세스 책임을 분리한다.
- 렌더러는 브라우저 런타임 역할에 집중한다.

### 해도 되는 것
- 렌더러 서브프로세스 프로젝트 설정과 진입점을 관리한다.
- CEF 프로세스별 실행 파일 구성을 유지한다.

### 하면 안 되는 것
- 업무 UseCase를 여기서 실행하지 않는다.
- 메인 앱 오케스트레이션을 렌더러 진입점에 두지 않는다.

## Tiếng Việt

### Vai trò
- Thư mục này quản lý file thực thi renderer subprocess và entry point của CEF.

### Phạm vi phụ trách
- Project CefSubprocess, entry point renderer và cấu hình theo process

### Quy tắc
- Tách biệt trách nhiệm giữa main process và renderer process.
- Renderer chỉ tập trung vào vai trò runtime của trình duyệt.

### Được phép làm
- Quản lý cấu hình project subprocess và entry point renderer.
- Giữ cấu trúc file thực thi theo từng process của CEF.

### Không được làm
- Không chạy UseCase nghiệp vụ tại đây.
- Không đặt orchestration của app chính vào entry point renderer.
