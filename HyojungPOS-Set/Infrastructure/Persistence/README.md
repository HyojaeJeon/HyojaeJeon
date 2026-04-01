# 영속 계층

`경로 / Đường dẫn`: `/HyojungPOS-Set/Infrastructure/Persistence`

## 한국어

### 역할
- 영속 저장소 접근과 저장소 구현을 담는 인프라 하위 계층이다.

### 담당 범위
- MSSQL 연결, store 구현, 영속화 보조 코드

### 규칙
- store는 저장/조회 책임에 집중하고 비즈니스 흐름은 UseCases에서 조정한다.
- 트랜잭션 경계 자체는 UseCases/TransactionRunner 기준을 따른다.

### 해도 되는 것
- DB 연결과 store 구현을 정리한다.
- 로컬 MSSQL 원본과 Ledger/Outbox 영속 구조를 유지한다.

### 하면 안 되는 것
- UseCase 오케스트레이션을 여기서 직접 처리하지 않는다.
- UI용 응답 포맷을 저장소에서 직접 만들지 않는다.

## Tiếng Việt

### Vai trò
- Đây là tầng con của hạ tầng phụ trách truy cập persistence và triển khai store kỹ thuật.

### Phạm vi phụ trách
- Kết nối MSSQL, store kỹ thuật và mã hỗ trợ persistence

### Quy tắc
- Store tap trung vao trach nhiem luu/doc, con luong nghiep vu do UseCases dieu phoi.
- Ranh giới transaction phải theo UseCases/TransactionRunner.

### Được phép làm
- To chuc ket noi DB va trien khai store.
- Duy trì cấu trúc local MSSQL, Ledger và Outbox như nguồn lưu trữ gốc.

### Không được làm
### Không được làm
- Khong tu xu ly orchestration cua UseCase tai day.
- Khong tao truc tiep dinh dang response cho UI tu store.
