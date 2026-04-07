# Shared

`경로`: `/BrandPosApp/PosUi/src/shared`

## 역할

- 여러 화면에서 재사용하는 공용 UI와 유틸을 둔다.

## 반드시 지킬 규칙

- 재사용 UI 원본은 `src/shared/ui`에 둔다.
- `app/design-system`은 원본 UI를 문서화/미리보기하는 route다.
- 같은 컴포넌트를 `screens`마다 복제하지 않는다.
- 특정 화면 전용 구현을 무리하게 shared로 올리지 않는다.
