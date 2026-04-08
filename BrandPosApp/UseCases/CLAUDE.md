# UseCases

`경로`: `/BrandPosApp/UseCases`
상위 규칙: `../CLAUDE.md`

## 역할
- 요청 단위 업무를 조정하는 오케스트레이션 계층이다.

## 구현 규칙
- 트랜잭션, idempotency, lock, ledger, outbox를 여기서 결정한다.
- UI 이벤트와 `PosRealTimeSender` 호출 권한은 여기만 가진다.
- 화면 렌더링과 CEF 세부 구현은 넣지 않는다.
