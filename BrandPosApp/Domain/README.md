# Domain

`경로`: `/BrandPosApp/Domain`

## 역할

- 순수 업무 규칙과 상태 계산을 담당한다.

## 반드시 지킬 규칙

- UI 송신을 직접 수행하지 않는다.
- 외부 ACK, 브라우저 상태, sync 정책을 결정하지 않는다.
- `PosRealTimeSender`를 직접 호출하지 않는다.
- 상위 계층 오케스트레이션을 구현하지 않는다.
