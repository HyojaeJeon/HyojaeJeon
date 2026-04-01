# 프로바이더

`경로 / Đường dẫn`: `/PosUI/src/providers`

## 한국어

### 역할
- 프론트엔드 전역 Provider와 실시간 이벤트 수신기를 배치하는 영역이다.

### 담당 범위
- StoreProvider, PosRealTimeReceiver, 전역 context/provider

### 규칙
- PosRealTimeReceiver는 RTK Query 캐시와 UI slice 갱신의 단일 안테나다.
- Provider는 전역 wiring을 담당하고 화면별 비즈니스 규칙을 담지 않는다.

### 해도 되는 것
- 스토어 주입, 실시간 이벤트 수신, 전역 context 조립을 수행한다.
- 이벤트 타입별 invalidate/update 흐름을 정리한다.

### 하면 안 되는 것
- 실제 business rule을 provider 안에 숨겨 넣지 않는다.
- 컴포넌트별 로컬 상태를 전부 provider로 끌어올리지 않는다.

## Tiếng Việt

### Vai trò
- Đây là vùng đặt provider toàn cục của frontend và bộ nhận sự kiện realtime.

### Phạm vi phụ trách
- StoreProvider, PosRealTimeReceiver và các provider/context toàn cục

### Quy tắc
- PosRealTimeReceiver phải là ăng-ten duy nhất để cập nhật RTK Query cache và UI slice.
- Provider chỉ phụ trách wiring toàn cục, không chứa quy tắc nghiệp vụ của từng màn hình.

### Được phép làm
- Thực hiện inject store, nhận sự kiện realtime và ghép context toàn cục.
- Chuẩn hóa luồng invalidate/update theo từng loại sự kiện.

### Không được làm
- Không giấu business rule thực sự trong provider.
- Không kéo toàn bộ local state của component lên provider.
