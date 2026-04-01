# PosUI

`경로 / Đường dẫn`: `/PosUI`

## 한국어

### 역할
- POS 메인 Next.js 프론트엔드 애플리케이션의 루트다.

### 담당 범위
- app, screens, store, bridge, mocks, design-system, shared, i18n, providers, styles

### 규칙
- 서버 상태는 RTK Query, UI 상태는 slices, 디자인 원본은 design-system으로 분리한다.
- C++ 없이도 mock transport로 UI를 개발할 수 있어야 한다.

### 해도 되는 것
- 화면, 디자인 시스템, RTK Query, mock preview 구조를 정리한다.
- 1024x768 POS UX와 터치 기반 상호작용을 고려해 구현한다.

### 하면 안 되는 것
- 화면 컴포넌트에서 window.cefQuery를 직접 호출하지 않는다.
- design-system 원본을 shared 복사본으로 대체한 뒤 삭제하지 않는다.

## Tiếng Việt

### Vai trò
- Đây là thư mục gốc của ứng dụng frontend Next.js cho POS chính.

### Phạm vi phụ trách
- app, screens, store, bridge, mocks, design-system, shared, i18n, providers và styles

### Quy tắc
- Tách server state vào RTK Query, UI state vào slices và nguồn UI vào design-system.
- Phải có khả năng phát triển UI bằng mock transport mà không cần C++.

### Được phép làm
- Tổ chức cấu trúc màn hình, design system, RTK Query và mock preview.
- Triển khai theo UX POS 1024x768 và tương tác cảm ứng.

### Không được làm
- Không gọi window.cefQuery trực tiếp trong component màn hình.
- Không xóa design-system gốc rồi thay bằng bản sao trong shared.
