# 공용 자산

`경로 / Đường dẫn`: `/HyojungPOS-Main/UseCases/Shared`

## 한국어

### 역할
- UseCases 전반에서 공통으로 쓰는 요청 컨텍스트와 실행 보조 요소를 담는다.

### 담당 범위
- RequestContext, TransactionRunner, OperationLockService, IdempotencyService, UseCaseResult

### 규칙
- 유스케이스 공통 추상화는 여기서 재사용하고, 도메인 규칙은 각 도메인 UseCase로 둔다.
- 중복 방지와 락 정책은 설계서 기준을 따른다.

### 해도 되는 것
- 공통 request context, lock, transaction 유틸을 정리한다.
- 유스케이스 표준 결과 모델을 통일한다.

### 하면 안 되는 것
- 개별 화면 전용 규칙을 여기에 넣지 않는다.
- UI 상태나 브라우저 객체를 직접 의존하지 않는다.

## Tiếng Việt

### Vai trò
- Thư mục này chứa các thành phần dùng chung cho toàn bộ UseCases.

### Phạm vi phụ trách
- RequestContext, TransactionRunner, OperationLockService, IdempotencyService và UseCaseResult

### Quy tắc
- Chỉ đặt các abstraction dùng chung của UseCase ở đây; quy tắc miền cụ thể phải nằm tại từng UseCase miền.
- Chính sách chống trùng và lock phải bám theo tài liệu thiết kế.

### Được phép làm
- Chuẩn hóa request context, lock và tiện ích transaction dùng chung.
- Thống nhất mô hình kết quả chuẩn cho use case.

### Không được làm
- Không đặt quy tắc chỉ dành cho một màn hình cụ thể tại đây.
- Không phụ thuộc trực tiếp vào UI state hay đối tượng trình duyệt.
