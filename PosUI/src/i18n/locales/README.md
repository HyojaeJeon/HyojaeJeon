# 로케일

`경로 / Đường dẫn`: `/PosUI/src/i18n/locales`

## 한국어

### 역할
- PosUI의 다국어 초기화와 번역 로딩을 담당한다.

### 담당 범위
- i18next 초기화, locale 로딩, 공용 번역 자산 연결

### 규칙
- 번역의 진실의 원천은 Shared/i18n/locales이고 이곳은 소비자 계층이다.
- 코드 기반 msgKey/msgParams 규칙을 따른다.

### 해도 되는 것
- i18next 설정, 네임스페이스 연결, locale 소비 로직을 관리한다.
- 공통 번역 키 사용 규칙을 유지한다.

### 하면 안 되는 것
- PosUI 쪽 복사본을 원본처럼 직접 운영하지 않는다.
- 브릿지 payload에 완성 문장을 원본 계약으로 넣지 않는다.

## Tiếng Việt

### Vai trò
- Thư mục này phụ trách khởi tạo đa ngôn ngữ và nạp bản dịch cho PosUI.

### Phạm vi phụ trách
- Khởi tạo i18next, nạp locale và liên kết tài sản dịch dùng chung

### Quy tắc
- Nguồn sự thật của bản dịch là Shared/i18n/locales; nơi này chỉ là tầng tiêu thụ.
- Phải tuân theo quy tắc msgKey/msgParams dạng mã.

### Được phép làm
- Quản lý cấu hình i18next, namespace và logic tiêu thụ locale.
- Giữ quy tắc sử dụng key dịch dùng chung.

### Không được làm
- Không vận hành bản sao của PosUI như nguồn gốc bản dịch.
- Không đặt câu hoàn chỉnh trong payload bridge như contract gốc.
