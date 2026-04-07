# Providers

`경로`: `/BrandPosApp/PosUi/src/providers`

## 역할

- 전역 provider와 실시간 이벤트 수신기를 둔다.

## 반드시 지킬 규칙

- `PosRealTimeReceiver`는 RTK Query 캐시와 UI slice 갱신의 단일 안테나다.
- provider는 전역 wiring만 담당한다.
- 화면별 business rule을 provider에 넣지 않는다.
