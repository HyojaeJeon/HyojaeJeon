# Store

`경로`: `/BrandPosApp/PosUi/src/store`

## 역할

- RTK Query와 Redux Toolkit을 묶는 상태 관리 루트다.

## 반드시 지킬 규칙

- 서버 상태와 UI 상태의 소유권을 분리한다.
- 서버 상태는 `RTK Query`, UI 상태는 `slice`로만 관리한다.
- `React Query`를 병행 사용하지 않는다.
- 조회 데이터를 slice로 복제 저장하지 않는다.
