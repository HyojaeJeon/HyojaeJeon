# 레지스트리

`경로 / Đường dẫn`: `/PosUI/src/design-system/registry`

## 한국어

### 역할
- PosUI 공용 UI 원본과 디자인 토큰을 담는 디자인 시스템 영역이다.

### 담당 범위
- tokens, atoms, molecules, organisms, templates, registry

### 규칙
- 공용 UI의 진실의 원천은 design-system이다.
- shared는 POS 문맥이 섞인 조합물이고 design-system 원본을 대체하지 않는다.

### 해도 되는 것
- 토큰, 공용 컴포넌트, 템플릿, 카탈로그 메타데이터를 정리한다.
- 여러 화면에서 재사용할 UI 원본을 유지한다.

### 하면 안 되는 것
- 완성 후 shared에 복사해 옮기고 원본을 삭제하지 않는다.
- 화면별 비즈니스 규칙을 디자인 시스템에 섞지 않는다.

## Tiếng Việt

### Vai trò
- Đây là vùng design system chứa nguồn gốc của UI dùng chung và token thiết kế của PosUI.

### Phạm vi phụ trách
- tokens, atoms, molecules, organisms, templates và registry

### Quy tắc
- Nguồn sự thật của UI dùng chung là design-system.
- shared chỉ chứa tổ hợp mang ngữ cảnh POS, không thay thế nguồn gốc design-system.

### Được phép làm
- Chuẩn hóa token, component dùng chung, template và metadata catalog.
- Giữ nguồn UI tái sử dụng cho nhiều màn hình.

### Không được làm
- Không copy sang shared rồi xóa nguồn design-system.
- Không trộn quy tắc nghiệp vụ theo từng màn hình vào design system.
