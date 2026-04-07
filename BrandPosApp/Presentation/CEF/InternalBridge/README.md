# InternalBridge

`경로`: `/BrandPosApp/Presentation/CEF/InternalBridge`

## 역할

- JS ↔ C++ 요청/응답과 실시간 이벤트의 단일 입출구다.

## 반드시 지킬 규칙

- thin router로 유지한다.
- 요청 파싱, 필수 필드 검증, envelope 정규화까지만 담당한다.
- 실제 업무 실행은 `UseCases`로 넘긴다.
- Action에서 직접 SQL을 실행하지 않는다.
- Manager나 ExternalBridge가 `PosRealTimeSender`를 직접 호출하게 하지 않는다.
