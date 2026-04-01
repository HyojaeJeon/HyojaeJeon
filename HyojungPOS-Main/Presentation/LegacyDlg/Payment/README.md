# 결제

`경로 / Đường dẫn`: `/HyojungPOS-Main/Presentation/LegacyDlg/Payment`

## 한국어

### 역할
- 결제 레거시 화면을 유지하는 대화상자 영역이다.

### 담당 범위
- 기존 화면 유지, feature flag 기반 fallback, 점진 전환 대응

### 규칙
- 레거시 화면은 유지하되 새 규칙은 가능한 한 UseCases와 공통 계층으로 이동한다.
- CEF 화면과 MFC fallback의 handoff 계약을 지킨다.

### 해도 되는 것
- 기존 운영 화면을 안전하게 유지하고 점진 전환을 지원한다.
- fallback 시 필요한 최소 컨텍스트 복원 경로를 유지한다.

### 하면 안 되는 것
- 새 비즈니스 규칙을 대화상자 코드에 계속 누적하지 않는다.
- 브라우저 전환 이후에도 레거시 코드에 신규 오케스트레이션을 추가하지 않는다.

## Tiếng Việt

### Vai trò
- Đây là vùng dialog legacy dùng để duy trì màn hình thanh toán.

### Phạm vi phụ trách
- Duy trì màn hình cũ, fallback bằng feature flag và hỗ trợ migrate dần

### Quy tắc
- Giữ màn hình legacy để vận hành, nhưng logic mới phải được chuyển dần vào tầng chung/UseCases.
- Tuân thủ hợp đồng handoff giữa màn hình CEF và fallback MFC.

### Được phép làm
- Duy trì an toàn màn hình vận hành cũ và hỗ trợ chuyển đổi dần.
- Giữ đường khôi phục tối thiểu cho context cần thiết khi fallback.

### Không được làm
- Không tiếp tục tích lũy quy tắc nghiệp vụ mới trong code dialog.
- Không thêm orchestration mới vào code legacy sau khi đã có cấu trúc bridge/UseCase.
