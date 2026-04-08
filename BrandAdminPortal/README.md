# BrandAdminPortal

`경로 / Đường dẫn`: `/BrandAdminPortal`

## 한국어

### 역할
- 브랜드 본사 운영자가 여러 지점과 공통 마스터를 관리하는 Web 포털이다.
- 브랜드 계층의 조회/관리 화면을 담당하며, 공급사 운영과 매장 실행은 여기서 분리한다.

### 기술 스택
- `Next.js(TypeScript) + App Router + Apollo Client`
- 서버 상태는 GraphQL-first로 가져오고, UI 상태는 `Redux Toolkit`으로 분리한다.
- 공용 UI 패턴 원본은 `SharedUI` 이다.

### 담당 범위
- 브랜드 사용자 관리, 지점 설정, 메뉴/가격/프로모션 배포, 리포트 조회
- GraphQL-first 조회 화면, 브랜드 정책 편집, 지점별 override 관리
- 다국어 UI, 공통 알림, 감사 가능 운영 화면
- **식권 플랫폼 참여 브랜드(제휴식당) 전용 기능** — 아래 §식권 라우트 참고

### Capability 기반 기능 노출 규칙

BrandHQ 는 **POS / MEAL_TICKET 두 가지 capability 를 독립적으로 구독**할 수 있다.
어떤 capability 가 활성인지는 `SuperAdmin/Portal` 이 관리하며, 그 결과는
`BrandHq.activeCapabilities` 에 반영된다.

본 포털은 **로그인 직후 `currentSession` (또는 `me`) 쿼리에서 `activeCapabilities` 를
받아서** 다음과 같이 UI 를 토글한다.

- `<CapabilityProvider capabilities={...}>` 을 루트에 두고, 하위 컴포넌트는 `useCapability('POS')`, `useCapability('MEAL_TICKET')` 훅으로 참조한다.
- 사이드바/메뉴 항목에 `requires: 'POS' | 'MEAL_TICKET' | undefined` 메타를 부여하고, capability 없는 항목은 렌더 자체를 생략한다.
- Next.js App Router 의 `(pos)/`, `(mealticket)/` route group 의 `layout.tsx` 에서 capability 가드. 없으면 `/upgrade` 로 리다이렉트(또는 upgrade CTA 페이지).
- `/upgrade` 페이지는 "이 기능은 구독 후 이용 가능합니다 — SuperAdmin 에 문의" CTA 를 제공한다. 403 이 아니라 UX 페이지로 처리한다.

**보안 원칙**:
- UI 에서 숨기는 것만으로는 권한 제어가 되지 않는다. 모든 실제 enforcement 는
  `CentralApi/modules/entitlement/EntitlementService.requireCapability()` 가
  **service layer 에서** 담당한다. 포털은 UX 목적의 gating 만 한다.
- Capability 는 BrandHQ 에 붙는 것이고 user 에 붙는 것이 아니다. 직원 개별 권한(RBAC)은 기존 role 시스템과 **교집합**으로 계산된다.
  즉 `실제 가용 권한 = BrandHq.activeCapabilities ∩ User.roles.permissions` 이다.
- Capability revoke 시에는 Redis pub/sub 으로 session invalidate 이벤트가 발행되며, 포털은 다음 request 에서 `me` 를 재조회해 UI 를 갱신한다.

**SharedContracts 단일 원본**:
- `BrandHqCapability`, `BrandHqEntitlementStatus`, `ENTITLEMENT_ERROR_CODE` 는 `SharedContracts/ApiSdk/src/entitlement` 에서만 import 한다.

### 식권 플랫폼 참여 시 추가 라우트 (Merchant 관점)

기준서 §99 에 따라, 제휴식당(프랜차이즈 또는 단일 매장) 은 `BrandHQ` 계층에 해당하며
본 포털의 **식권 참여 여부 플래그** 가 true 인 경우에만 아래 라우트가 노출된다.
라우트와 상태는 `SharedContracts/ApiSdk/src/mealticket` 의 DTO/enum 을 단일 원본으로 한다.

```
/mealticket/enrollment         식권 플랫폼 참여 신청 / 계약 상태
/mealticket/inbox              실시간 승인 요청 인박스 (Open Loop QR)
/mealticket/transactions       승인/거절/환불 내역
/mealticket/settlement         정산 스케줄, 수수료 차감, 입금 상태
/mealticket/invoices           플랫폼이 발행한 수수료 전자세금계산서
/mealticket/account            정산 은행계좌, 세금코드
```

규칙:
- 식권 기능은 `MealTicketMerchantEnrollment.isActive === true` 일 때만 메뉴에 노출한다.
- `Corporate`(고객 기업) 도메인을 본 포털이 다루지 않는다. 고객 기업 전용은 `CorporatePortal` 이다.
- 결제 승인 로직은 여기 두지 않는다 — `CentralApi/modules/mealticket/transaction` 이 담당한다.

### 규칙
- 공급사 운영 권한이나 SuperAdmin 범위는 여기 두지 않는다.
- Edge POS 로컬 DB를 직접 전제로 기능을 설계하지 않는다.
- 서버 상태는 `Apollo Client`로 다루고, UI 상태는 `Redux Toolkit`으로 분리한다.
- 다국어 원본은 이 프로젝트 내부 `src/i18n`을 따른다.

### 해도 되는 것
- 브랜드 기본 정책과 지점 단위 override 관리
- 브랜드 관점 운영 대시보드와 배포 화면 설계
- 번역 키와 locale bundle을 공통 계약에 맞춰 사용

### 하면 안 되는 것
- 슈퍼관리자 기능을 혼합하지 않는다.
- 매장 업무 트랜잭션을 직접 처리하는 UI를 두지 않는다.
- 로컬 설정 도구나 장치 커미셔닝 기능을 여기에 흡수하지 않는다.

### i18n/다국어
- UI 문자열과 메시지는 이 프로젝트 내부 `src/i18n`에서 가져온다.
- 기본 지원 언어는 `ko`, `vi`, `en`이다.
- 번역 키는 화면 내부가 아니라 공통 계약과 자산 패키지 기준으로 관리한다.

### 소비하는 공용 패키지
- `SharedContracts` = GraphQL/DTO/type 계약
- `SharedAssets` = static asset 원본
- `SharedUI` = 공용 웹 UI 패턴 원본

## Tiếng Việt

### Vai trò
- Đây là cổng web để bộ phận vận hành của từng thương hiệu quản lý nhiều chi nhánh và master chung.
- Phụ trách các màn hình quản lý/tra cứu của tầng brand; tách biệt với vận hành cấp nhà cung cấp và thực thi tại cửa hàng.

### Stack kỹ thuật
- `Next.js(TypeScript) + App Router + Apollo Client`
- Trạng thái server theo GraphQL-first; trạng thái UI tách riêng bằng `Redux Toolkit`.

### Phạm vi phụ trách
- Quản lý người dùng brand, cấu hình chi nhánh, phân phối menu/giá/khuyến mãi, xem báo cáo
- Màn hình truy vấn GraphQL-first, chỉnh sửa policy của brand, quản lý override theo chi nhánh
- UI đa ngôn ngữ, thông báo dùng chung, màn hình có thể audit

### Quy tắc
- Không đặt quyền vận hành cấp nhà cung cấp hay phạm vi SuperAdmin ở đây.
- Không thiết kế tính năng dựa trên giả định truy cập trực tiếp DB local của Edge POS.
- Trạng thái server dùng `Apollo Client`; trạng thái UI tách riêng bằng `Redux Toolkit`.
- Nguồn bản dịch phải theo `src/i18n` nội bộ của project này.

### Được phép làm
- Quản lý policy mặc định của brand và override theo chi nhánh
- Thiết kế dashboard vận hành và màn hình phân phối theo góc nhìn brand
- Sử dụng khóa dịch và bundle locale theo contract chung

### Không được làm
- Không trộn chức năng của Super Admin vào đây.
- Không đưa giao dịch nghiệp vụ của cửa hàng vào UI này.
- Không nhập luôn tính năng cài đặt local hay commissioning thiết bị.

### Đa ngôn ngữ / i18n
- Chuỗi UI và message phải lấy từ `src/i18n` nội bộ của project này.
- Bộ ngôn ngữ mặc định: `ko`, `vi`, `en`.
- Khóa dịch phải được quản lý theo contract và asset package dùng chung, không hardcode trong screen.

### Gói dùng chung mà app này tiêu thụ
- `SharedContracts` = contract type/DTO/GraphQL
- `SharedAssets` = static asset 원본
- `SharedUI` = 공용 웹 UI 패턴 원본
