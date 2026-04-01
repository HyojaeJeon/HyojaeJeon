# Stores

`경로 / Duong dan`: `/HyojungPOS-Main/Infrastructure/Persistence/MSSQL/Stores`

## 한국어

### 역할
- 운영 상태를 영속화하는 전용 store를 둔다.

### 담당 범위
- `RequestLedgerStore`, `OutboxStore`, `SyncStateStore`

### 규칙
- 도메인 테이블 전체를 repository 패턴으로 분리하지 않는다.
- 운영용 상태만 store로 분리한다.

## Tieng Viet

### Vai tro
- Chua cac store rieng de luu trang thai van hanh.

### Pham vi phu trach
- `RequestLedgerStore`, `OutboxStore`, `SyncStateStore`

### Quy tac
- Khong tach toan bo bang domain theo repository pattern.
- Chi tach store cho trang thai van hanh.
