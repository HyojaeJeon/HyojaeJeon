# SharedUI

`경로 / Đường dẫn`: `/SharedUI`

## 한국어

### 역할
- Platform 전반의 공용 웹 UI 패턴 원본이다.
- `BrandPosApp`을 제외한 모든 웹 기반 프로젝트가 이 원본을 소비한다.
- 앱별 화면은 이 패턴을 조합해서 쓰고, 앱 내부에서 별도 디자인 패턴을 다시 만들지 않는다.

### 디렉토리 구조

```text
SharedUI/
├── CLAUDE.md
├── README.md
└── src/
    ├── foundation/
    │   ├── theme.ts
    │   └── tokens.ts
    ├── primitives/
    │   ├── button.tsx
    │   ├── card.tsx
    │   └── data-table.tsx
    ├── composites/
    │   ├── page-header.tsx
    │   ├── section-card.tsx
    │   └── summary-strip.tsx
    ├── templates/
    │   ├── dashboard-page.tsx
    │   ├── detail-page.tsx
    │   └── list-page.tsx
    └── index.ts
```

### 소비 원칙
- `Foundation` 은 색상/간격/반경/그림자/타이포그래피 같은 토큰을 정의한다.
- `Primitives` 는 Button/Card/DataTable 같은 낮은 수준의 공용 UI다.
- `Composites` 는 PageHeader/SectionCard/SummaryStrip 같은 반복 패턴이다.
- `Templates` 는 List/Detail/Dashboard 같은 화면 골격이다.
- 앱별 고유 스타일은 토큰의 범위를 넘지 않는다.

## Tiếng Việt

### Vai trò
- Đây là nguồn gốc mẫu UI web dùng chung cho toàn bộ Platform.
- Tất cả web app, trừ `BrandPosApp`, phải tiêu thụ nguồn này.

### Cấu trúc thư mục

```text
SharedUI/
├── CLAUDE.md
├── README.md
└── src/
    ├── foundation/
    ├── primitives/
    ├── composites/
    ├── templates/
    └── index.ts
```

