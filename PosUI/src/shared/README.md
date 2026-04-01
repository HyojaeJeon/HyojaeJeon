# 공용 UI

`경로 / Đường dẫn`: `/PosUI/src/shared`

## 한국어

### 역할
- 여러 화면에서 공통으로 재사용되는 POS 문맥형 UI 조합물을 담는다.

### 담당 범위
- 공통 컴포넌트, POS 특화 조합 UI, 공용 유틸

### 규칙
- 공용 원자/토큰 원본은 design-system에 두고, shared에는 조합물을 둔다.
- 같은 컴포넌트를 screens마다 복제하지 않는다.

### 해도 되는 것
- 여러 화면에서 쓰는 POS 공용 UI 조합을 추출한다.
- 도메인 문맥이 섞인 공통 컴포넌트를 정리한다.

### 하면 안 되는 것
- design-system 원본을 shared로 옮긴 뒤 삭제하지 않는다.
- 특정 화면 한 곳에서만 쓰는 구현을 무리하게 shared로 올리지 않는다.

## Tiếng Việt

### Vai trò
- Đây là vùng chứa các tổ hợp UI mang ngữ cảnh POS được tái sử dụng ở nhiều màn hình.

### Phạm vi phụ trách
- Component dùng chung, UI ghép mang ngữ cảnh POS và tiện ích chung

### Quy tắc
- Nguồn atom/token gốc phải ở design-system, còn shared chỉ chứa tổ hợp.
- Không sao chép cùng một component vào từng màn hình.

### Được phép làm
- Trích xuất UI dùng chung của POS được dùng ở nhiều màn hình.
- Sắp xếp component công cộng có kèm ngữ cảnh domain.

### Không được làm
- Không chuyển design-system gốc sang shared rồi xóa nguồn.
- Không đẩy lên shared những implementation chỉ dùng ở một màn hình duy nhất.
