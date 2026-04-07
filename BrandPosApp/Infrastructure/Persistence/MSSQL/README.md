# MSSQL

`경로`: `/BrandPosApp/Infrastructure/Persistence/MSSQL`

## 역할

- 레거시 HJ-POS 호환 및 일회성 마이그레이션 참고용 persistence 영역이다.

## 반드시 지킬 규칙

- 신규 기능의 기본 persistence로 사용하지 않는다.
- 신규 스키마 설계 기준으로 사용하지 않는다.
- 레거시 테이블/컬럼 해석과 마이그레이션 매핑에만 사용한다.
- 업무 성공 여부, UI 상태, sync 성공 여부를 여기서 판정하지 않는다.
