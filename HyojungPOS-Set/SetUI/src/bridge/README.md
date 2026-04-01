# 브릿지

`경로 / Đường dẫn`: `/HyojungPOS-Set/SetUI/src/bridge`

## 한국어

### 역할
- 브릿지 관련 구조와 책임을 담는 폴더다.

### 담당 범위
- 브릿지 범위의 코드, 자산, 문서 또는 보조 구성요소

### 규칙
- 상위 설계서와 CLAUDE.md에서 정의한 계층 경계를 따른다.
- 이 폴더의 책임을 벗어나는 구현은 적절한 상위/하위 계층으로 이동한다.

### 해도 되는 것
- 이 폴더 책임에 맞는 구현과 문서를 정리한다.
- 이름과 구조가 드러내는 역할을 유지한다.

### 하면 안 되는 것
- 편의상 다른 계층 책임을 끌어오지 않는다.
- 임시 구현을 장기 구조처럼 방치하지 않는다.

## Tiếng Việt

### Vai trò
- Đây là thư mục chứa cấu trúc và trách nhiệm liên quan đến bridge.

### Phạm vi phụ trách
- Mã, tài sản, tài liệu hoặc thành phần hỗ trợ thuộc phạm vi bridge

### Quy tắc
- Tuân theo ranh giới tầng được định nghĩa trong tài liệu thiết kế và CLAUDE.md.
- Nếu implementation vượt quá trách nhiệm của thư mục này thì phải chuyển sang tầng phù hợp.

### Được phép làm
- Tổ chức mã và tài liệu đúng với trách nhiệm của thư mục.
- Giữ vai trò mà tên thư mục và cấu trúc đang thể hiện.

### Không được làm
- Không kéo trách nhiệm của tầng khác vào chỉ vì tiện.
- Không để implementation tạm thời tồn tại như cấu trúc dài hạn.
