# AppHost

`경로`: `/BrandPosApp/AppHost`
상위 규칙: `../CLAUDE.md`

## 역할
- 실행 진입점과 composition root다.

## 구현 규칙
- 객체 조립, 초기화, 서비스 등록만 한다.
- 업무 규칙과 UI 흐름은 넣지 않는다.
- 하위 계층을 우회 호출하지 않는다.
