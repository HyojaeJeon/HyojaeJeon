# AppHost

`경로`: `/BrandPosApp/AppHost`

## 역할

- 실행 파일 진입점과 composition root를 담당한다.

## 반드시 지킬 규칙

- 객체 조립과 초기화만 담당한다.
- 업무 규칙을 구현하지 않는다.
- 하위 계층을 임의로 우회 호출하지 않는다.
