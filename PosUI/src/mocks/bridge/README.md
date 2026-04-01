# 브릿지

`경로 / Đường dẫn`: `/PosUI/src/mocks/bridge`

## 한국어

### 역할
- C++ 연동 전 UI 개발과 화면 검증을 위한 mock 데이터/핸들러 영역이다.

### 담당 범위
- fixture, mock response, fake router, 화면별 샘플 데이터

### 규칙
- mock 구조는 실제 계약을 흉내 내야 하고 임의 포맷을 만들지 않는다.
- 실제 설계 계약이 바뀌면 mock도 함께 갱신한다.

### 해도 되는 것
- 디자인 시스템과 스크린 프리뷰에 필요한 mock 데이터를 만든다.
- request/response envelope을 반영한 가짜 응답을 유지한다.

### 하면 안 되는 것
- 실제 프로덕션 로직을 mock 데이터에 의존하게 만들지 않는다.
- 계약과 어긋난 임시 JSON을 장기적으로 유지하지 않는다.

## Tiếng Việt

### Vai trò
- Đây là vùng mock data/handler dùng cho phát triển UI và kiểm tra màn hình trước khi tích hợp C++.

### Phạm vi phụ trách
- Fixture, mock response, router giả và dữ liệu mẫu theo màn hình

### Quy tắc
- Cấu trúc mock phải bám theo contract thật, không tạo format tùy tiện.
- Khi contract thật thay đổi thì mock cũng phải cập nhật cùng lúc.

### Được phép làm
- Tạo dữ liệu mock cho design system và preview màn hình.
- Duy trì phản hồi giả phản ánh đúng envelope request/response.

### Không được làm
- Không để logic production phụ thuộc vào dữ liệu mock.
- Không giữ lâu dài JSON tạm thời lệch chuẩn contract.
