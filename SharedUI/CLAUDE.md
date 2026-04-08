# SharedUI

`경로`: `/SharedUI`
상위 규칙: `../CLAUDE.md`

## 역할
- Platform 전체의 공용 웹 UI 원본이다.
- `BrandPosApp`만 예외적으로 자체 `PosUi/src/shared/ui` 패턴을 유지한다.

## 구현 규칙
- `BrandPosApp`을 제외한 Next.js / React 웹 앱은 이 원본을 소비한다.
- `Foundation / Primitives / Composites / Templates` 4층만 사용한다.
- 앱별 전용 디자인 패턴, inline 스타일 분기, 임시 UI 변형은 넣지 않는다.
- 디자인 토큰은 `foundation` 에만 둔다.
- primitive 는 Button, Card, DataTable 같은 기본 UI만 둔다.
- composite 는 PageHeader, SectionCard, SummaryStrip 같은 반복 패턴만 둔다.
- template 는 ListPage, DetailPage, DashboardPage 같은 화면 골격만 둔다.
- 도메인 비즈니스 로직, GraphQL 호출, 라우트 처리, i18n 번역은 넣지 않는다.
- `index.ts` 는 public export 용도로만 사용한다.
- 내부 feature 묶음용 barrel 파일은 만들지 않는다.

