# CEF SDK

`경로 / Đường dẫn`: `/HyojungPOS-Main/Presentation/CEF/SDK`

## 한국어

### 역할
- CEF SDK 바이너리와 헤더를 보관하는 런타임 자산 영역이다.

### 담당 범위
- CEF 헤더, DLL, 리소스, 래퍼 라이브러리

### 규칙
- 버전과 아키텍처(x86/x64)를 명확히 관리한다.
- 애플리케이션 로직을 이 폴더에 두지 않는다.

### 해도 되는 것
- CEF 배포 자산과 헤더를 구조적으로 정리한다.
- 아키텍처별 배포 파일을 명확히 구분한다.

### 하면 안 되는 것
- 업무 코드나 임시 스크립트를 여기 넣지 않는다.
- 런타임 파일을 수동으로 섞어 배치하지 않는다.

## Tiếng Việt

### Vai trò
- Đây là vùng lưu binary runtime và header của CEF SDK.

### Phạm vi phụ trách
- Header CEF, DLL, resource và thư viện wrapper

### Quy tắc
- Quản lý rõ ràng version và kiến trúc x86/x64.
- Không đặt logic ứng dụng trong thư mục này.

### Được phép làm
- Sắp xếp có cấu trúc các asset phát hành và header của CEF.
- Phân biệt rõ file phát hành theo từng kiến trúc.

### Không được làm
- Không đặt mã nghiệp vụ hoặc script tạm thời tại đây.
- Không trộn lẫn file runtime bằng thao tác thủ công.
