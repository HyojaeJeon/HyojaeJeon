# UseCases

`경로`: `/BrandPosApp/UseCases`

## 역할

- 요청 단위 업무를 조정하는 오케스트레이션 계층이다.

## 반드시 지킬 규칙

- 트랜잭션, idempotency, lock, ledger, outbox를 여기서 조정한다.
- UI 이벤트 결정권과 `PosRealTimeSender` 호출 권한은 여기만 가진다.
- 업무 데이터와 ledger/outbox를 같은 작업 단위로 처리한다.
- 화면 렌더링이나 CEF 세부 구현을 넣지 않는다.
