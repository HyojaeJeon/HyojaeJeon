# ExternalBridge

`경로`: `/BrandPosApp/Infrastructure/ExternalBridge`

## 역할

- 외부 payload를 내부 DTO로 변환해 `UseCases`로 넘긴다.

## 반드시 지킬 규칙

- 전달자 역할만 한다.
- 직접 DB 저장을 하지 않는다.
- 직접 UI 송신을 하지 않는다.
- 외부 requestId가 없으면 수신 시 requestId를 생성한다.
