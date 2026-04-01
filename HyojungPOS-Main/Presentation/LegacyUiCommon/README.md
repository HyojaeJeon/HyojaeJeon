# 레거시 UI 공통

`경로 / Đường dẫn`: `/HyojungPOS-Main/Presentation/LegacyUiCommon`

## 한국어

### 역할
- 레거시 MFC UI에서 공통으로 쓰이는 UI 지원 코드를 모아둔 영역이다.

### 담당 범위
- Control, GridCtrl 등 기존 UI 공통 코드

### 규칙
- 레거시 호환성 유지를 위한 최소 수정만 한다.
- 새 공용 UI 원본은 PosUI design-system 쪽에 쌓는다.

### 해도 되는 것
- 기존 컨트롤과 그리드 공통 코드를 안정적으로 유지한다.
- 필요한 호환성 패치와 버그 수정을 수행한다.

### 하면 안 되는 것
- 새 UI 디자인 시스템 컴포넌트를 여기에 추가하지 않는다.
- 비즈니스 규칙을 UI 공통 코드에 숨겨 넣지 않는다.

## Tiếng Việt

### Vai trò
- Đây là vùng tập hợp mã hỗ trợ UI dùng chung của MFC legacy.

### Phạm vi phụ trách
- Control, GridCtrl và các mã UI common cũ

### Quy tắc
- Chỉ sửa ở mức tối thiểu để giữ tương thích legacy.
- Nguồn gốc UI common mới phải được xây ở design-system của PosUI.

### Được phép làm
- Duy trì ổn định các control và grid dùng chung cũ.
- Thực hiện patch tương thích và sửa lỗi cần thiết.

### Không được làm
- Không thêm component của design system mới vào đây.
- Không giấu logic nghiệp vụ trong mã UI common.
