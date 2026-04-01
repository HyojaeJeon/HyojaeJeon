# 디자인 시스템

`경로 / Đường dẫn`: `/PosUI/src/app/design-system`

## 한국어

### 역할
- 디자인 시스템 카탈로그와 화면 프리뷰를 보여주는 App Router 전용 영역이다.

### 담당 범위
- 컴포넌트 미리보기, 스크린 프리뷰, 사이드바 카탈로그 라우트

### 규칙
- 여기는 디자인 시스템을 보여주는 곳이지 원본 컴포넌트를 저장하는 곳이 아니다.
- 실제 컴포넌트 원본은 design-system 또는 screens에서 가져와 렌더링한다.

### 해도 되는 것
- 사이드바 메뉴, 프리뷰 레이아웃, mock 기반 화면 검증 라우트를 만든다.
- 디자인 검토와 공용 UI 확인 흐름을 지원한다.

### 하면 안 되는 것
- 원본 UI 컴포넌트를 여기에 중복 복사하지 않는다.
- 실제 앱 로직과 별개인 가짜 구현을 장기적으로 유지하지 않는다.

## Tiếng Việt

### Vai trò
- Đây là vùng App Router dùng để hiển thị catalog design system và preview màn hình.

### Phạm vi phụ trách
- Preview component, preview screen và route catalog có sidebar

### Quy tắc
- Nơi này chỉ dùng để hiển thị design system, không phải nơi lưu component gốc.
- Component thật phải được import từ design-system hoặc screens rồi render tại đây.

### Được phép làm
- Tạo sidebar menu, layout preview và route kiểm tra màn hình bằng mock.
- Hỗ trợ review thiết kế và kiểm tra UI dùng chung.

### Không được làm
- Không sao chép và duy trì component gốc trùng lặp tại đây.
- Không giữ lâu dài các implementation giả tách rời khỏi app thật.
