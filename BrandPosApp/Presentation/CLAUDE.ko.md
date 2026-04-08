# Presentation

`경로`: `/BrandPosApp/Presentation`
상위 규칙: `../CLAUDE.md`

## 역할
- CEF 호스팅과 JS ↔ C++ 입출구다.

## 구현 규칙
- 요청 파싱, 검증, `success / error` 응답 정규화까지만 한다.
- 트랜잭션, idempotency, ledger, outbox 판단은 하지 않는다.
- 실제 업무 실행은 `UseCases`로 넘긴다.
