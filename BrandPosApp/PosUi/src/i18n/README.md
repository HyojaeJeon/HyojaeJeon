# i18n

`경로`: `/BrandPosApp/PosUi/src/i18n`

## 역할

- PosUi 런타임 번역 초기화와 번역 소비를 담당한다.
- `PosI18nProvider`와 `usePosI18n`을 통해 화면 문자열을 읽는다.
- 실제 화면 문자열은 `src/i18n/locales/{area}/{ko,en,vi}.json`에서 관리한다.

## 반드시 지킬 규칙

- 화면 UI 문자열은 하드코딩하지 않는다.
- 화면과 공유 컴포넌트는 `usePosI18n()`으로 텍스트를 읽는다.
- `bridge` payload에는 완성 문장을 계약처럼 넣지 않는다.
- 번역 원본은 앱 런타임용 `src/i18n/locales`이고, 장기적으로 `SharedAssets/i18n/locales`와 동기화한다.
