# CorporatePortal 충전 현황 상세 작업계획서

> 작성일: 2026-04-14
> 최종 검증: 2026-04-14 (v6 — 키 관리 + 원장 멱등성 + 대사 운영 + break-glass 확정)
> 범위: CorporatePortal `/budget/funding` + SuperAdmin 결제수단 설정 + CentralApi 백엔드
> 상태: **기획 확정 — 개발 착수 가능**

---

## 1. 설계 원칙

| 원칙 | 설명 |
|------|------|
| **Push vs Pull 분리** | Push(이체/QR): 기업 주도 → 한도 없음. Pull(카드): 플랫폼 주도 → 한도 필수 |
| **원자성** | 승인/증액/원장기록은 **단일 DB 트랜잭션**. 부분 성공 허용 안 함 |
| **멱등성** | 동일 참조번호/거래ID 재처리 시 중복 증액 차단. 이미 완료된 건은 재실행 무시 |
| **원장 중심** | `depositBalanceVnd`는 캐시성 현재값. **CorporateFundingLedger가 진실의 원천** |
| **Maker-Checker** | 요청자(CorporateAdmin) ≠ 승인자(SuperAdmin). 동일인 요청-승인 금지 |
| **Corporate scope 강제** | JWT ctx에서 corporateId 추출. 입력값 신뢰 안 함 |
| **Source of truth 단일화** | 파생 boolean 없음. 관계 ID 유무로 상태 판단 |
| **월 예산 read-only** | `monthlyBudgetVnd`는 SuperAdmin 설정 값. 충전과 별개 |

---

## 2. 결제수단 관리 아키텍처

### 2.1 SuperAdmin → 결제수단 옵션 활성/비활성

SuperAdmin Portal 설정 페이지(`/settings/payment-methods`)에서 각 결제수단의 전역 활성/비활성을 관리한다.

```
SuperAdmin 설정 페이지
┌─────────────────────────────────────────────┐
│ 결제수단 관리                                 │
│                                             │
│ [Toggle] 은행 이체 (BANK_TRANSFER)    활성    │
│ [Toggle] VietQR (VIETQR)             활성    │
│ [Toggle] NAPAS QR (NAPAS_QR)         활성    │
│ [Toggle] 법인카드 (CORPORATE_CARD)    비활성   │
│                                             │
│ ⚠️ 비활성화된 결제수단은 모든 기업 포털에서     │
│   즉시 숨겨집니다.                            │
└─────────────────────────────────────────────┘
```

### 2.2 데이터 흐름

```
SuperAdmin이 결제수단 ON/OFF 설정
  ↓ DB: PlatformPaymentMethodConfig
  ↓
CorporatePortal이 /budget/funding 렌더 시 query로 활성 수단 조회
  ↓ query: enabledPaymentMethods
  ↓
활성화된 결제수단만 카드형 UI로 렌더링
```

### 2.3 DB: 기존 PlatformPolicy 테이블 활용

> 결제수단 전용 테이블을 만들지 않는다. 기존 `PlatformPolicy` 범용 설정 테이블을 사용한다.

```
policyKey:       "payment_methods"
scopeType:       "GLOBAL"
scopeId:         null
policyValueJson: {
  "BANK_TRANSFER":   { "enabled": true,  "displayOrder": 1 },
  "VIETQR":          { "enabled": true,  "displayOrder": 2 },
  "NAPAS_QR":        { "enabled": true,  "displayOrder": 3 },
  "CORPORATE_CARD":  { "enabled": false, "displayOrder": 4 }
}
```

기존 스키마 (`10-superadmin-governance.prisma`):
```prisma
model PlatformPolicy {
  id              String   @id @default(uuid()) @db.Uuid
  policyKey       String   @db.VarChar(120)  // "payment_methods"
  scopeType       String   @db.VarChar(30)   // "GLOBAL"
  scopeId         String?  @db.Uuid          // null (전역)
  policyValueJson Json     @default("{}")
  version         Int      @default(1)
  isActive        Boolean  @default(true)
  ...
  @@unique([policyKey, scopeType, scopeId, version])
}
```

### 2.4 API

```graphql
# SuperAdmin: 결제수단 설정 조회/변경 (기존 PlatformPolicy API 재사용)
query platformPolicy(policyKey: "payment_methods", scopeType: "GLOBAL")
mutation platformPolicyUpdate(policyKey: "payment_methods", scopeType: "GLOBAL", policyValueJson: {...})

# CorporatePortal: 활성화된 수단만 조회
query enabledPaymentMethods: EnabledPaymentMethodListResponse
# → 서버에서 PlatformPolicy("payment_methods") 조회 → enabled=true 항목만 반환
```

---

## 3. 지원 결제수단 (4가지)

| # | 방법 | 방식 | 한도 | 코드 | 우선순위 |
|---|------|------|------|------|---------|
| 1 | **은행 이체** | Push | 없음 | `BANK_TRANSFER` | P0 |
| 2 | **VietQR** | Push | 없음 | `VIETQR` | P0 |
| 3 | **NAPAS QR** | Push | 없음 | `NAPAS_QR` | P0 |
| 4 | **법인카드 정기결제** | Pull | 있음 | `CORPORATE_CARD` | P1 |

### 3.1 은행 이체 (BANK_TRANSFER)

```
기업 관리자 → 수탁 계좌로 이체 → "입금 확인 요청" 제출
  → CorporateDepositRequest (PENDING)
  → SuperAdmin 승인 (MANUALLY_APPROVED) → 원장 기록 + 잔액 증액
```

### 3.2 VietQR (VIETQR)

```
mutation corporateVietQrCreate → intent 생성 (30분 유효)
  → QR 코드 표시 (수탁계좌+금액+참조코드)
  → 뱅킹앱에서 스캔 후 이체 → 확인 요청 or 자동 매칭
```

### 3.3 NAPAS QR (NAPAS_QR)

> VietQR과 동일한 기술 기반 (EMVCo + NAPAS 24/7). 차이점은 **결제 시점의 인터뱅크 QR 표준 준수**.
> 실질적으로 VietQR intent 생성 로직을 공유하되, `method` 필드를 `NAPAS_QR`로 구분.

```
mutation corporateNapasQrCreate → intent 생성 (30분 유효)
  → NAPAS 표준 QR 코드 생성 (VietQR 사양 동일)
  → 모든 은행/e-wallet 앱에서 스캔 가능
```

**NAPAS QR vs VietQR 구분 이유:**
- VietQR: 은행 계좌 기반 이체용 QR (계좌번호 + 금액 인코딩)
- NAPAS QR: 인터뱅크 결제 표준 QR (가맹점 결제용으로도 사용, 더 넓은 호환성)
- 둘 다 NAPAS 인프라 기반이지만, SuperAdmin이 별도로 활성/비활성할 수 있어야 함

### 3.4 법인카드 (CORPORATE_CARD) — P1

```
카드 등록 (PG 위젯 → billingKey)
  → 자동 충전 규칙 설정
  → SyncWorkers 크론 → PG 과금 실행
  → CorporateAutoChargeExecution 로그
```

---

## 4. 상태 모델

### 4.1 CorporateDepositRequest (Push — 수동 입금 확인)

| 저장값 | UI 표시 (ko) | 설명 |
|--------|-------------|------|
| `PENDING` | 대기 중 | 확인 대기 |
| `MANUALLY_APPROVED` | 확인 완료 (수동) | SuperAdmin 직접 확인 |
| `AUTO_MATCHED` | 확인 완료 (자동) | 가상계좌/참조코드 매칭 |
| `REJECTED` | 거절 | SuperAdmin 거절 |
| `EXPIRED` | 만료 | 7일 미처리 |

### 4.2 CorporateAutoChargeExecution (Pull — 자동 충전)

| 저장값 | 설명 |
|--------|------|
| `EXECUTING` | PG 과금 진행 중 |
| `SUCCESS` | 과금 성공 + 원장 기록 + 잔액 증액 |
| `FAILED` | 과금 실패 |
| `RETRYING` | 24h 후 재시도 대기 |

### 4.3 CorporateVietQrIntent 매칭 판단

`depositRequestId != null` → 매칭 완료 (유일한 source of truth, boolean 없음)

---

## 5. 보안 통제

### 5.1 원자성 + 멱등성 + 중복 방지

| 규칙 | 설명 |
|------|------|
| **원자적 증액** | approve/auto-match/auto-charge success → `상태 변경 + 원장 기록 + depositBalanceVnd 증액 + AuditLog`를 **단일 Prisma `$transaction`**으로 수행 |
| **재처리 차단** | 이미 `MANUALLY_APPROVED` / `AUTO_MATCHED` 된 요청은 재승인 시 **즉시 무시** (no-op 반환) |
| **멱등성 키** | 아래 참조 |

**멱등성 키 상세:**

| 대상 | 멱등성 키 | 설명 |
|------|----------|------|
| 수동 입금 확인 | `@@unique([corporateId, referenceNo])` | DB 레벨 중복 차단 |
| 자동 매칭 (webhook) | `WebhookInboundLog.providerEventId` unique | provider event ID dedupe |
| 자동 충전 (scheduled) | 스케줄러가 실행 시도마다 `executionRequestId` (UUID) 생성 → `CorporateAutoChargeExecution.id`에 선삽입. PG 호출 전에 row 생성(EXECUTING). 중복 실행 시 이미 존재 → no-op | 내부 execution id가 1차 방어 |
| 자동 충전 (threshold) | 동일 — `executionRequestId` 선삽입 + cooldown 24h. threshold는 한 달에 여러 번 정상 발생 가능하므로 월+trigger 기준이 아닌 **실행 단위 고유 ID** 사용 | cooldown이 빈도 제어, execution id가 중복 방지 |
| PG 과금 | `pgTransactionId` unique. PG 응답 수신 후 execution row에 기록. PG가 최종 기준 | provider idempotency key도 PG 요청 시 전달 |
| **참조번호 unique** | `@@unique([corporateId, referenceNo])` — DB 레벨 강제 |

### 5.2 Webhook / Casso 진위 검증 (Phase 2)

| 항목 | 조치 |
|------|------|
| **서명 검증** | webhook payload의 HMAC-SHA256 서명을 shared secret으로 검증 |
| **IP 허용 대역** | Casso/은행 webhook은 허용 IP 대역만 수신 |
| **Timestamp 검증** | webhook timestamp와 서버 시각 차이 5분 이내만 허용 (replay 방지) |
| **원본 payload 저장** | 수신한 webhook payload를 append-only 로그 테이블에 원문 저장 |
| **검증 실패 시** | 자동 증액 **금지**. 수동 검토 큐 이동 + SuperAdmin 알림 |
| **Event dedupe** | `WebhookInboundLog.providerEventId` unique 제약. 이미 처리된 event ID는 no-op 반환 |
| **처리 상태 기록** | `WebhookInboundLog.status`: `RECEIVED` → `PROCESSED` / `DUPLICATE` / `REJECTED` |

### 5.3 Maker-Checker (업무 분리)

| 규칙 | 설명 |
|------|------|
| **요청자 ≠ 승인자** | CorporateAdmin이 요청, SuperAdmin이 승인. 동일인 금지 |
| **자기 승인 금지** | 서버에서 `request.createdBy !== approver.userId` 검증 |
| **승인 감사 기록** | 승인/거절 시: 실행자, 시각, 이전 상태, 사유를 AuditLog에 기록 |
| **고액 입금** | 기준액(예: ₫500,000,000) 이상 → 2인 승인 또는 추가 확인 (P2) |

### 5.4 자동 충전 보안 잠금

| 규칙 | 설명 |
|------|------|
| **연속 실패 잠금** | 연속 3회 실패 → 자동 충전 **자동 비활성화** + 관리자 알림 |
| **결제수단 변경 시** | billingKey 삭제/변경 → 기존 자동 충전 설정 **자동 중지** |
| **이상 징후 감지** | threshold 충전이 24시간 내 3회 이상 → 이상 징후 알림 |
| **설정 변경 감사** | 자동 충전 설정 변경은 모두 AuditLog 기록 |

### 5.5 참조코드 추측 방지

```
형식: CORP-{기업코드}-{YYYYMMDD}-{6자리 랜덤 영숫자}
예시: CORP-VN001-20260414-A7K2X9

내부 식별자: UUID (DB PK)
사용자 노출: 참조코드 (위 형식)

자동 매칭 시 검증 조건 (참조코드 단독 신뢰 금지):
  - corporateId 일치
  - amount **정확 일치** (오차 허용 안 함 — 금액 불일치는 수동 검토)
  - 시간창: intent 생성 후 24시간 이내
  - 3가지 모두 충족해야 자동 증액. 하나라도 불일치 → PENDING + 수동 검토
```

### 5.6 민감정보 노출 정책

| 항목 | 정책 |
|------|------|
| 은행 계좌번호 | 마스킹: `1901-****-0123` |
| billingKey | DB: AES-256-GCM. UI/API 응답에 **노출 금지** |
| 카드번호 | PG 위젯만 (서버 미전달). UI: `****4567` |
| PG 오류 메시지 | 원문 UI 노출 금지. 코드 기반 번역 메시지만 표시 |
| webhook payload | 원문 로그 저장, 관리자 UI에서 마스킹 표시 |
| 참조번호 | 전체 표시 (기업 관리자), 마스킹 (외부 리포트) |
| 다운로드/CSV | 계좌번호, 카드정보 제외. 참조번호+금액+상태만 포함. **다운로드 자체를 AuditLog에 기록** (who, when, what range) |

---

## 6. 원장 (Ledger) 설계

### 6.1 원칙

> `depositBalanceVnd`는 캐시성 현재값. **CorporateFundingLedger가 진실의 원천**.
> 모든 잔액 증감은 원장 이벤트로 기록. 잔액 불일치 시 원장 기준으로 복구.

### 6.2 CorporateFundingLedger (append-only)

```prisma
model CorporateFundingLedger {
  id              String    @id @default(uuid()) @db.Uuid
  corporateId     String    @db.Uuid
  eventType       String    @db.VarChar(30)
                  // DEPOSIT_APPROVED | DEPOSIT_AUTO_MATCHED | AUTO_CHARGE_SUCCESS
                  // WALLET_FUND_DEDUCTED | DEPOSIT_REJECTED_REVERSAL | ADJUSTMENT
  amountVnd       BigInt                     // 양수: 증액, 음수: 차감
  balanceAfterVnd BigInt                     // 이벤트 후 잔액 스냅샷
  referenceType   String    @db.VarChar(30)  // DEPOSIT_REQUEST | AUTO_CHARGE | WALLET_FUND | MANUAL
  referenceId     String    @db.Uuid         // 관련 레코드 ID
  actorId         String    @db.Uuid         // 실행자
  actorType       String    @db.VarChar(30)  // SUPER_ADMIN | CORPORATE_ADMIN | SYSTEM
  note            String?   @db.Text
  createdAt       DateTime  @default(now()) @db.Timestamptz()

  // append-only: UPDATE / DELETE 금지. 수정은 역분개(reversal) 이벤트로 처리.
  @@unique([referenceType, referenceId, eventType])  // 원장 이벤트 중복 방지 (business unique key)
  @@index([corporateId, createdAt(sort: Desc)])
  @@index([referenceType, referenceId])
}
```

### 6.3 이벤트 타입

| eventType | 방향 | 설명 |
|-----------|------|------|
| `DEPOSIT_APPROVED` | + | 수동 입금 승인 → 잔액 증액 |
| `DEPOSIT_AUTO_MATCHED` | + | 자동 매칭 입금 → 잔액 증액 |
| `AUTO_CHARGE_SUCCESS` | + | 법인카드 자동 충전 성공 → 잔액 증액 |
| `WALLET_FUND_DEDUCTED` | - | 직원 지갑 충전 시 예치금 차감 |
| `DEPOSIT_REJECTED_REVERSAL` | - | 잘못 승인된 입금 역분개 |
| `ADJUSTMENT` | ±  | 관리자 수동 조정 (사유 필수) |

---

## 7. 감사 로그 (AuditLog)

### 7.1 불변 로그 요구사항

| 항목 | 필수 여부 |
|------|----------|
| before / after 값 (상태, 금액) | ✅ |
| actor role + actor id | ✅ |
| source IP + user agent + request id | ✅ |
| 외부 거래 ID (PG txn ID, bank webhook ID) | ✅ |
| 수정 불가 append-only | ✅ |
| 관리자 UI에서 전체 조회 가능 | ✅ |

### 7.2 기록 대상

- 입금 확인 요청 생성
- 승인 / 거절 / 만료
- 자동 매칭 실행
- 자동 충전 실행 / 성공 / 실패
- 결제수단 등록 / 삭제
- 자동 충전 설정 변경
- 잔액 수동 조정

---

## 8. 예외 처리 규칙

### 8.1 자동 매칭 + 수동 요청 중복

```
Case A: PENDING 요청 존재 + webhook 도착
  → 같은 (corporateId, referenceNo)의 PENDING을 AUTO_MATCHED로 update
  → 금액 불일치: amountMismatch=true, PENDING 유지 → SuperAdmin 수동 검토

Case B: webhook 먼저 도착, 수동 요청 없음
  → DepositRequest 자동 생성 (AUTO_MATCHED) + 원장 기록 + 잔액 증액

Case C: 이미 완료된 참조번호로 재요청
  → @@unique 제약으로 차단
```

### 8.2 Intent 만료 후 늦은 입금

```
만료된 VietQR/NAPAS QR intent로 입금 도착
  → 자동 증액 금지
  → DepositRequest 생성 (PENDING) → 수동 검토 큐
  → SuperAdmin 알림: "만료된 QR 참조코드로 입금 도착. 수동 확인 필요."
```

### 8.3 자동 충전 실행 규칙

| 규칙 | 정책 |
|------|------|
| 월간 한도 계산 | scheduled + threshold 누적. 실패 건 제외 |
| cooldown | 성공 후 24시간 재실행 차단 |
| scheduled + threshold 동시 | threshold로 이미 충전 → scheduled 시점에 잔액 재평가 → 불필요하면 건너뜀 |
| 실패 재시도 | 24h 후 1회만. 재실패 시 해당 월 포기 + 알림 |
| 연속 실패 | 3회 연속 → 자동 충전 비활성화 + 관리자 알림 |

---

## 9. DB 스키마 (전체)

### 9.1 결제수단 설정 — 기존 PlatformPolicy 활용

> 전용 테이블 없음. `PlatformPolicy(policyKey="payment_methods", scopeType="GLOBAL")` 사용. §2.3 참조.

### 9.2 CorporateDepositRequest (Push 수동 확인)

```prisma
model CorporateDepositRequest {
  id              String    @id @default(uuid()) @db.Uuid
  corporateId     String    @db.Uuid
  method          String    @db.VarChar(30) // BANK_TRANSFER | VIETQR | NAPAS_QR
  amountVnd       BigInt
  referenceNo     String    @db.VarChar(100)
  transferredAt   DateTime? @db.Timestamptz()
  status          String    @default("PENDING") @db.VarChar(30)
                  // PENDING | MANUALLY_APPROVED | AUTO_MATCHED | REJECTED | EXPIRED
  amountMismatch  Boolean   @default(false)
  actualAmountVnd BigInt?
  approvedBy      String?   @db.Uuid
  approvedAt      DateTime? @db.Timestamptz()
  rejectedReason  String?   @db.Text
  createdBy       String    @db.Uuid
  createdAt       DateTime  @default(now()) @db.Timestamptz()

  @@unique([corporateId, referenceNo])
  @@index([corporateId, status])
}
```

### 9.3 CorporateVietQrIntent (QR 충전 intent)

```prisma
model CorporateVietQrIntent {
  id               String    @id @default(uuid()) @db.Uuid
  corporateId      String    @db.Uuid
  qrType           String    @db.VarChar(20) // VIETQR | NAPAS_QR
  amountVnd        BigInt
  referenceCode    String    @unique @db.VarChar(60)
  expiresAt        DateTime  @db.Timestamptz()
  depositRequestId String?   @db.Uuid  // source of truth (matched = not null)
  createdAt        DateTime  @default(now()) @db.Timestamptz()

  @@index([referenceCode])
  @@index([corporateId, createdAt(sort: Desc)])
}
```

### 9.4 CorporateFundingLedger (원장 — append-only)

```prisma
model CorporateFundingLedger {
  id              String    @id @default(uuid()) @db.Uuid
  corporateId     String    @db.Uuid
  eventType       String    @db.VarChar(30)
  amountVnd       BigInt
  balanceAfterVnd BigInt
  referenceType   String    @db.VarChar(30)
  referenceId     String    @db.Uuid
  actorId         String    @db.Uuid
  actorType       String    @db.VarChar(30)
  note            String?   @db.Text
  createdAt       DateTime  @default(now()) @db.Timestamptz()

  @@index([corporateId, createdAt(sort: Desc)])
  @@index([referenceType, referenceId])
}
```

### 9.5 CorporatePaymentMethod (P1)

```prisma
model CorporatePaymentMethod {
  id          String   @id @default(uuid()) @db.Uuid
  corporateId String   @db.Uuid
  methodType  String   @db.VarChar(30)
  provider    String   @db.VarChar(30)
  billingKey  String   @db.VarChar(200) // AES-256-GCM
  last4       String   @db.VarChar(4)
  cardBrand   String   @db.VarChar(20)
  expiryMonth Int?
  expiryYear  Int?
  isDefault   Boolean  @default(false)
  status      String   @default("ACTIVE") @db.VarChar(20)
  createdAt   DateTime @default(now()) @db.Timestamptz()

  @@index([corporateId, status])
}
```

### 9.6 CorporateAutoChargeConfig + Execution (P1)

```prisma
model CorporateAutoChargeConfig {
  id                  String    @id @default(uuid()) @db.Uuid
  corporateId         String    @unique @db.Uuid
  enabled             Boolean   @default(false)
  paymentMethodId     String?   @db.Uuid
  chargeAmountVnd     BigInt    @default(10000000)
  chargeDay           Int       @default(1)
  maxMonthlyChargeVnd BigInt    @default(200000000)
  balanceThresholdVnd BigInt    @default(5000000)
  cooldownHours       Int       @default(24)
  consecutiveFailures Int       @default(0)  // 연속 실패 카운터 (3회 시 자동 비활성화)
  lastChargedAt       DateTime? @db.Timestamptz()
  createdAt           DateTime  @default(now()) @db.Timestamptz()
  updatedAt           DateTime  @updatedAt @db.Timestamptz()
}

model CorporateAutoChargeExecution {
  id              String   @id @default(uuid()) @db.Uuid
  corporateId     String   @db.Uuid
  paymentMethodId String   @db.Uuid
  trigger         String   @db.VarChar(20) // SCHEDULED | THRESHOLD
  amountVnd       BigInt
  status          String   @db.VarChar(20) // EXECUTING | SUCCESS | FAILED | RETRYING
  pgTransactionId String?  @db.VarChar(200)
  errorCode       String?  @db.VarChar(50)
  errorMessage    String?  @db.Text
  retryOf         String?  @db.Uuid
  executedAt      DateTime @default(now()) @db.Timestamptz()

  @@index([corporateId, executedAt(sort: Desc)])
  @@index([corporateId, status])
}
```

### 9.7 WebhookInboundLog (Phase 2 — 원본 보존)

```prisma
model WebhookInboundLog {
  id              String    @id @default(uuid()) @db.Uuid
  source          String    @db.VarChar(30) // CASSO | TECHCOMBANK | MB_BANK
  providerEventId String    @db.VarChar(200) // provider 이벤트 고유 ID (dedupe 키)
  endpoint        String    @db.VarChar(100)
  payloadCipher   String   @db.Text           // 원문 AES-256-GCM 암호화 저장 (필수)
  payloadKeyVer   Int      @default(1)        // 암호화 키 버전
  signatureOk     Boolean
  sourceIp        String    @db.VarChar(45)
  status          String    @default("RECEIVED") @db.VarChar(20)
                  // RECEIVED | PROCESSED | DUPLICATE | REJECTED
  processedAt     DateTime? @db.Timestamptz()
  createdAt       DateTime  @default(now()) @db.Timestamptz()

  @@unique([source, providerEventId])  // event dedupe
  @@index([source, createdAt(sort: Desc)])
}
```

---

## 10. 권한 설계

| 기능 | 권한 키 | 대상 |
|------|---------|------|
| 충전 현황/이력 조회 | `funding:read` | CorporateAdmin |
| 입금 확인 요청 제출 | `funding:request` | CorporateAdmin |
| 결제수단/자동충전 설정 | `funding:manage` | CorporateAdmin |
| 입금 요청 승인/거절 | `funding:approve` | **SuperAdmin 전용** |
| 결제수단 전역 설정 | `platform:payment-config` | **SuperAdmin 전용** |

---

## 11. 구현 우선순위

### P0 — 즉시

| # | 항목 |
|---|------|
| 1 | `PlatformPolicy("payment_methods")` seed + SuperAdmin 설정 UI (기존 테이블 활용) |
| 2 | `enabledPaymentMethods` query + CorporatePortal 조건부 렌더링 |
| 3 | `CorporateDepositRequest` 테이블 + CRUD API |
| 4 | `CorporateVietQrIntent` 테이블 (VIETQR + NAPAS_QR 공용) |
| 5 | `CorporateFundingLedger` append-only 원장 테이블 |
| 6 | 계좌이체 모달 + VietQR 모달 + NAPAS QR 모달 |
| 7 | `corporateVietQrCreate` / `corporateNapasQrCreate` mutation |
| 8 | SuperAdmin 입금 승인/거절 + 원자적 트랜잭션 (상태+원장+잔액) |
| 9 | 충전 이력 테이블 (5가지 상태) |
| 10 | 참조코드 랜덤 suffix + 3중 매칭 검증 (corp+amount+time) |

### P1 — 다음 스프린트

| # | 항목 |
|---|------|
| 11 | 법인카드 등록 (PG 위젯 토큰화) |
| 12 | 자동 충전 설정 + 실행 + 잠금 |
| 13 | 가상계좌 자동 매칭 (Casso + webhook 검증) |
| 14 | WebhookInboundLog 원본 저장 |

### P2 — 향후

| # | 항목 |
|---|------|
| 15 | 은행 Webhook 직접 연동 |
| 16 | 고액 입금 2인 승인 + step-up auth |
| 17 | 충전 리포트/통계 |
| 18 | 결제수단 전역 토글 예약 반영 |

---

## 13. 결제 보안 및 내부통제 운영 규칙

### 13.1 동시성 제어

| 규칙 | 구현 |
|------|------|
| **잔액 갱신은 DB increment만 사용** | `depositBalanceVnd: { increment: amountVnd }`. 읽어서 재계산 금지 |
| **Row-level lock** | 승인/자동매칭/자동충전 트랜잭션 내에서 `MealCorporate` row를 `SELECT ... FOR UPDATE`로 잠금 |
| **원장 기록 후 snapshot** | `balanceAfterVnd`는 같은 트랜잭션 내 increment 후 값. 별도 조회 없음 |
| **동시 승인 방지** | `status = 'PENDING'` 조건으로 update. affected rows = 0이면 이미 처리된 것 → no-op |

```typescript
// Pseudo-code: 원자적 승인 + 증액 + 원장
await prisma.$transaction(async (tx) => {
  // 1. Lock corporate row + increment
  const corp = await tx.$queryRaw`
    SELECT * FROM "MealCorporate" WHERE id = ${corporateId} FOR UPDATE`;
  
  // 2. 상태 전환 (PENDING → MANUALLY_APPROVED). 이미 변경됐으면 0 rows.
  const updated = await tx.corporateDepositRequest.updateMany({
    where: { id: requestId, status: 'PENDING' },
    data: { status: 'MANUALLY_APPROVED', approvedBy: actorId, approvedAt: new Date() },
  });
  if (updated.count === 0) return; // 이미 처리됨 — no-op (멱등)

  // 3. 잔액 increment
  await tx.mealCorporate.update({
    where: { id: corporateId },
    data: { depositBalanceVnd: { increment: amountVnd } },
  });

  // 4. 원장 append
  const afterBalance = corp.depositBalanceVnd + amountVnd;
  await tx.corporateFundingLedger.create({
    data: { corporateId, eventType: 'DEPOSIT_APPROVED', amountVnd, balanceAfterVnd: afterBalance, ... },
  });

  // 5. AuditLog
  await tx.auditLog.create({ ... });
});
```

### 13.2 Webhook Event Dedupe

```
webhook 수신 시:
  1. WebhookInboundLog에 INSERT (providerEventId)
  2. @@unique([source, providerEventId]) 위반 → DUPLICATE → 200 OK 반환 (no-op)
  3. 서명 검증 실패 → status: REJECTED → 200 OK (재전송 방지)
  4. 서명 OK + 신규 → status: RECEIVED → 비즈니스 로직 실행 → PROCESSED
```

### 13.3 고위험 액션 보호

| 액션 | 보호 수준 |
|------|----------|
| `funding:approve` (입금 승인) | SuperAdmin 전용. 요청자≠승인자 검증 |
| `platform:payment-config` (결제수단 ON/OFF) | SuperAdmin 전용. AuditLog (before/after) + 관리자 알림 |
| `ADJUSTMENT` (수동 잔액 조정) | **별도 권한 키: `funding:adjust`**. 사유 필수. 첨부 근거 필수(P2). AuditLog |
| 고액 승인 (₫500M 이상) | 2인 승인 (P2) |
| 결제수단/자동충전 설정 변경 | Step-up auth / MFA 재인증 (P2) |

> **ADJUSTMENT는 가장 위험한 기능**.

| 통제 | 설명 |
|------|------|
| 별도 권한 | `funding:adjust` — 승인/요청 권한과 완전 분리 |
| 직접 잔액 수정 금지 | ADJUSTMENT는 `depositBalanceVnd` 직접 SET이 아니라 **원장 조정 이벤트**만 생성. 잔액은 원장 합계로 재계산 |
| 사유 필수 | 모든 조정에 사유 텍스트 필수 |
| 고액 조정 2인 승인 | ₫100M 이상 조정은 2인 승인 (P2) |
| 첨부 근거 | P2에서 스크린샷/은행 확인서 첨부 필수화 |
| 자동 알림 | 조정 실행 시 재무팀/감사 담당자에게 즉시 알림 |
| 월말 리포트 | ADJUSTMENT 이벤트만 별도 리포트 자동 생성 |

### 13.4 정기 대사 (Reconciliation)

> 원장은 기록이고, 대사는 통제이다.

| 대사 | 주기 | 방법 | 불일치 시 |
|------|------|------|----------|
| **잔액 대사** | 매시간 | `SUM(CorporateFundingLedger.amountVnd)` vs `MealCorporate.depositBalanceVnd` | 알림 + 운영자 검토 큐 |
| **PG 대사** | 일 1회 | PG 정산 데이터 vs `AUTO_CHARGE_SUCCESS` 원장 건수/금액 | 알림 + 수동 조정 대상 |
| **Webhook 대사** | 일 1회 | `WebhookInboundLog(PROCESSED)` vs `DepositRequest(AUTO_MATCHED)` 건수 | 알림 + 누락 건 수동 처리 |
| **전체 감사 대사** | 주 1회 | 원장 합계 vs 은행 입출금 내역 (수동 또는 API) | 재무팀 검토 |

**대사 운영 규칙:**

| 항목 | 규칙 |
|------|------|
| **기준 시점** | UTC 기준. 매시간 대사는 정각(XX:00) 기준, 일 대사는 00:00 UTC |
| **배치 실패 재시도** | 실패 시 15분 후 1회 재시도. 재실패 시 운영자 알림 + 다음 주기까지 대기 |
| **자동 보정 금지** | 불일치 발견 시 자동 증액/차감 절대 금지. 수동 조정(ADJUSTMENT)만 허용 |
| **불일치 시 자동 충전 일시 정지** | 해당 기업의 자동 충전을 일시 정지하고 운영자가 검토 후 재개 |

```
대사 배치 실행 흐름:
  SyncWorkers 크론 (매시간, UTC 정각)
    → 기업별 원장 합계: SUM(CorporateFundingLedger.amountVnd)
    → depositBalanceVnd와 비교
    → 일치: OK
    → 불일치 발견 시:
        1. ReconciliationAlert 레코드 생성 (차액, 원장합계, 현재잔액)
        2. 해당 기업 자동 충전 일시 정지
        3. SuperAdmin 알림 (이메일 + 포털)
        4. 운영자가 원인 파악 후:
           a. 원장 누락 → ADJUSTMENT 이벤트 생성
           b. 잔액 오류 → depositBalanceVnd를 원장 합계로 재설정
           c. 자동 충전 재개
```

### 13.5 결제수단 설정 변경 통제 (PlatformPolicy "payment_methods")

| 항목 | 규칙 |
|------|------|
| 변경 시 AuditLog | 실행자, 이전값, 이후값, 변경 사유 기록 |
| 즉시 반영 | 비활성화 시 모든 기업 포털에서 즉시 숨김 |
| 영향 알림 | 활성→비활성 변경 시 해당 수단 사용 중인 기업 관리자에게 알림 (P2) |
| 예약 반영 | 향후: 특정 날짜/시각에 예약 변경 (P2) |

### 13.6 WebhookInboundLog 보안

| 항목 | 규칙 |
|------|------|
| payload 저장 | 원문 JSON — 은행 메모/계좌 등 민감정보 포함 가능 |
| 접근 제한 | SuperAdmin 중 `system:webhook-log` 권한 보유자만 조회 |
| 보관 기간 | 24개월 (법무 검토 후 확정) |
| 조회 시 마스킹 | 계좌번호, 개인명 자동 마스킹. 원문 열람은 break-glass만 |

---

## 14. 암호화 키 관리 및 운영 보안

### 14.1 핵심 원칙

| 원칙 | 설명 |
|------|------|
| **키와 데이터 분리** | 민감 데이터와 암호화 키는 동일 저장소에 두지 않음 |
| **앱 설정값 의존 금지** | `.env`에 장기 키 직접 저장 금지 |
| **KMS/Secret Manager 우선** | 운영 키는 KMS/HSM 또는 Secret Manager에서 관리 |
| **최소 권한** | 서비스/운영자는 필요한 키에만 접근 |
| **회전 가능성 내장** | 모든 암호화 레코드에 `keyVersion` 필드 |
| **평문 노출 금지** | 로그, 에러, UI, export에 비밀값 노출 안 함 |
| **break-glass 통제** | 원문 열람은 예외 절차 + 감사 기록 하에서만 |

### 14.2 보호 대상 분류

| 등급 | 대상 | 저장 | 암호화 |
|------|------|------|--------|
| **Level 1** (고위험) | billingKey, webhook secret, 은행 API credential | Secret Manager / DB 암호화 | ✅ 필수 + rotation |
| **Level 2** (민감) | webhook payload, 원본 계좌, 은행 메모 | DB 암호화 | ✅ 필수 + 접근 제한 |
| **Level 3** (제한적) | 참조코드, PG txn ID | DB | 전체 저장, 외부 노출 최소화 |

### 14.3 Envelope Encryption 구조

```
[Master Key / KEK]  ← KMS/HSM 관리. 데이터 직접 암호화에 사용 안 함
        ↓
[Data Encryption Key / DEK]  ← 레코드/배치 단위 데이터 암호화
        ↓
[민감 데이터] billingKey / webhook payload / provider secret
```

- **KEK**: KMS/HSM에서만 관리. 앱이 평문 보관 안 함
- **DEK**: 실제 데이터 암호화. 암호화된 상태로 DB 저장 가능
- **모든 암호화 레코드**: `keyVersion` 필드 필수 (rotation 시 버전 식별)

### 14.4 저장 규칙

| 대상 | 규칙 |
|------|------|
| **billingKey** | AES-256-GCM 암호화. 평문은 PG 호출 시점에만 메모리 존재. API/UI/로그 노출 금지 |
| **webhook payload** | 암호화 저장 **필수** (권장이 아님). `payloadCipher` + `payloadKeyVer` 필드 |
| **API Secret** | Secret Manager 저장. 코드/CI 로그 기록 금지. 로컬 dev secret ≠ 운영 secret |

### 14.5 키 회전 (Rotation)

| 대상 | 주기 | 방식 |
|------|------|------|
| KEK (Master Key) | 6~12개월 | KMS 버전 교체 |
| webhook secret | 90일 | 이중 유효기간 후 교체 |
| 은행/PG API secret | 90~180일 | Secret Manager 갱신 |
| DEK | KEK 회전 시 | 백그라운드 배치 점진적 재암호화 |

**회전 원칙:**
1. 신규 쓰기부터 새 `keyVersion` 사용
2. 기존 데이터는 백그라운드 배치로 점진적 재암호화
3. 재암호화 완료 전까지 구/신 버전 병행 복호화
4. 회전 작업도 AuditLog 기록
5. 회전 실패 시 자동 롤백 아니라 **중단 + 경고 + 운영자 개입**

### 14.6 접근 통제

| 자산 | 접근 주체 | 권한 |
|------|----------|------|
| billingKey 복호화 | 결제 실행 서비스 계정 | 제한적 |
| webhook payload 원문 | `system:webhook-log` SuperAdmin | break-glass만 |
| Secret Manager | 인프라/백엔드 운영 계정 | 최소 인원 |
| 원장/감사 로그 | SuperAdmin / 감사 담당자 | 읽기 |

### 14.7 Break-Glass 절차

> 사고 조사, 법무 대응, 금융기관 분쟁 등 **불가피한 경우에만** 원문 접근 허용.

```
1. 운영자가 원문 열람 요청 (사유 입력 필수)
2. 보안 책임자 또는 상위 SuperAdmin 승인
3. 제한 시간 일회성 접근 토큰 발급
4. 열람 종료 후 자동 만료
5. 전체 과정을 AuditLog에 append-only 기록
   (요청자, 승인자, 대상 레코드 ID, 사유, 시간, source IP, export 여부)
```

### 14.8 보안 이벤트 알림

| 이벤트 | 알림 |
|--------|------|
| webhook 서명 실패 연속 3회 | 즉시 |
| 동일 corporate threshold auto-charge 24h 내 3회 | 즉시 |
| break-glass 원문 열람 | 즉시 |
| key rotation 실패 | 즉시 |
| 복호화 실패 / 잘못된 keyVersion | 즉시 |
| 대사 불일치 | 즉시 |

### 14.9 백업 및 복구

| 항목 | 규칙 |
|------|------|
| DB 백업 | 암호화 저장 |
| 원장/AuditLog 무결성 | 백업 복원 후에도 유지 |
| KMS 메타데이터 정합성 | DB 백업 버전과 키 버전 일치 확인 |
| 복원 테스트 | 분기 1회 |
| 복원 후 대사 | 원장 합계 vs depositBalanceVnd 재검증 |
| 복원 환경 secret | 운영 secret 직접 사용 금지 |

### 14.10 구현 우선순위

| P | 항목 |
|---|------|
| P0 | Secret/Key 평문 저장 금지, webhook payload 암호화 필수, `keyVersion` 필드 도입 |
| P1 | KMS 연동, billingKey envelope encryption, rotation 배치 |
| P2 | break-glass 승인 워크플로우, 복원 훈련 자동화 |

### 14.11 체크리스트

- [ ] 모든 민감 결제 비밀값은 KMS/Secret Manager로 관리
- [ ] billingKey와 webhook payload는 저장 시 암호화
- [ ] 모든 암호화 레코드는 `keyVersion` 보유
- [ ] 운영자 UI는 기본 마스킹, 원문은 break-glass만
- [ ] 키 회전 및 재암호화 절차 지원
- [ ] 로그/CSV/export에 평문 비밀값 미포함
- [ ] 백업/복구 후 원장 대사 수행
