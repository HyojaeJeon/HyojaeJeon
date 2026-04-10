# PosUi

`경로`: `/BrandPosApp/PosUi`
`로컬 dev port`: `3002`

## 역할

- EdgePos용 Next.js(TypeScript) 프론트엔드다.

## 반드시 지킬 규칙

- 서버 상태는 `RTK Query`만 사용한다.
- slice는 UI 상태만 가진다.
- 화면 컴포넌트에서 `window.cefQuery`를 직접 호출하지 않는다.
- 재사용 UI 원본은 `src/shared/ui`에 둔다.
- `app/design-system`과 `app/design-docs`는 원본 UI를 소비하는 preview/documentation route다.
- mock transport로 C++ 없이 UI 개발 가능해야 한다.
