# 로케일

`경로 / Đường dẫn`: `/Shared/i18n/locales`

## 한국어

### 역할
- 다국어 원본 locale 구조를 관리하는 최상위 폴더다.

### 담당 범위
- 공용 번역 키, 네임스페이스별 JSON, 언어별 원본 자산

### 규칙
- `Shared/i18n/locales`가 번역의 유일한 진실의 원천이다.
- 번역은 msgKey 기반으로 관리하고 payload에 완성 문장을 원본 계약으로 넣지 않는다.

### 해도 되는 것
- 공용 번역 키와 언어별 JSON을 정리한다.
- Main/Set/PosUI가 함께 사용할 번역 원본을 관리한다.

### 하면 안 되는 것
- PosUI/Build 복사본을 직접 수정하지 않는다.
- 특정 화면 코드에서만 아는 임시 번역 키를 무질서하게 추가하지 않는다.

## Tiếng Việt

### Vai trò
- Đây là thư mục gốc quản lý cấu trúc locale gốc cho đa ngôn ngữ.

### Phạm vi phụ trách
- Key dịch dùng chung, JSON theo namespace và tài sản gốc theo từng ngôn ngữ

### Quy tắc
- `Shared/i18n/locales` là nguồn sự thật duy nhất của bản dịch.
- Bản dịch phải quản lý theo msgKey; không dùng câu hoàn chỉnh trong payload làm contract gốc.

### Được phép làm
- Chuẩn hóa key dịch và JSON theo từng ngôn ngữ.
- Quản lý nguồn bản dịch dùng chung cho Main/Set/PosUI.

### Không được làm
- Không sửa trực tiếp bản sao ở PosUI/Build.
- Không thêm key dịch tạm thời thiếu kỷ luật chỉ để phục vụ một màn hình riêng lẻ.
