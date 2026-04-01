# 지원 코드

`경로 / Đường dẫn`: `/HyojungPOS-Set/Infrastructure/Support`

## 한국어

### 역할
- 레거시 공용 유틸리티와 지원 코드를 묶는 인프라 보조 영역이다.

### 담당 범위
- Utilz, File, Excel 등 비UI 공통 지원 코드

### 규칙
- 기존 호환성 유지를 위한 공통 보조 코드만 둔다.
- 새 구조의 핵심 책임은 여기로 도피시키지 않는다.

### 해도 되는 것
- 파일 I/O, 범용 유틸, 레거시 지원 기능을 유지한다.
- 호환성 목적의 정리와 최소 리팩토링을 수행한다.

### 하면 안 되는 것
- 새 비즈니스 규칙을 편의상 여기에 넣지 않는다.
- UI 공통 컴포넌트나 UseCase 오케스트레이션을 두지 않는다.

## Tiếng Việt

### Vai trò
- Đây là vùng hỗ trợ hạ tầng gom các tiện ích legacy và mã dùng chung không phải UI.

### Phạm vi phụ trách
- Utilz, File, Excel và mã hỗ trợ legacy dùng chung

### Quy tắc
- Chỉ giữ mã hỗ trợ chung để đảm bảo tương thích legacy.
- Không dùng nơi này như chỗ trốn cho trách nhiệm chính của kiến trúc mới.

### Được phép làm
- Duy trì file I/O, tiện ích chung và 기능 hỗ trợ legacy.
- Thực hiện dọn dẹp tối thiểu phục vụ tương thích.

### Không được làm
- Không đặt logic nghiệp vụ mới vào đây cho tiện.
- Không đặt component UI common hay orchestration UseCase tại đây.
