# Bridge

`경로`: `/BrandPosApp/PosUi/src/bridge`

## 역할

- PosUi와 C++ 사이의 저수준 transport 계층이다.

## 반드시 지킬 규칙

- 컴포넌트는 `window.cefQuery`를 직접 호출하지 않는다.
- 브릿지는 transport만 제공하고 상태 원본을 소유하지 않는다.
- RTK Query baseQuery/queryFn이 재사용하는 단일 transport 창구를 유지한다.
- 도메인 캐시 정책이나 화면 전용 UI 상태를 여기에 넣지 않는다.
