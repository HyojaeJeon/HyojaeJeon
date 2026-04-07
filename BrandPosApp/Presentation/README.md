# Presentation

`경로`: `/BrandPosApp/Presentation`

## 역할

- CEF 호스팅과 브릿지 입출력을 담당하는 표현 계층이다.

## 반드시 지킬 규칙

- 입력/출력 형식만 담당하고 업무 결정은 `UseCases`로 넘긴다.
- 트랜잭션, idempotency, 영속화 판단을 여기서 하지 않는다.
- 여러 Manager를 직접 조합해 오케스트레이션하지 않는다.
