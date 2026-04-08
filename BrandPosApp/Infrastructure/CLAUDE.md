# Infrastructure

`경로`: `/BrandPosApp/Infrastructure`
상위 규칙: `../CLAUDE.md`

## 역할
- persistence, sync, external bridge, device, observability의 기술 구현 계층이다.

## 구현 규칙
- 기술 구현만 가진다.
- 업무 성공 여부를 판정하지 않는다.
- UI 상태나 화면 흐름을 결정하지 않는다.
- sync 재전송과 외부 승인 재실행을 혼동하지 않는다.
