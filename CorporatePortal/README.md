# CorporatePortal

식권 플랫폼의 **B2B 고객 기업(Corporate) 전용 관리 포털**이다.
기준서 `00-Platform-최종-아키텍처-기준서.md §2.1` 에 신설된 `Corporate` 계층의 단독 UI 프로젝트이며, `BrandHQPortal`(= 프랜차이즈/제휴식당용) 과는 **별도의 독립 프로젝트**다.

## 스택

- Next.js (TypeScript)
- Apollo Client (GraphQL only)
- 공통 계약은 `SharedContracts/ApiSdk/src/mealticket` 단일 원본
- 공용 UI 는 `SharedAssets` 디자인 시스템 또는 프로젝트 내 `src/shared/ui` 사용
- i18n 원본은 이 프로젝트 내부 `src/i18n`

## 책임 범위

- `Corporate` 엔티티(고객 기업) 의 관리자 포털
- 관리하는 리소스:
  - 부서(Department) / 임직원(Employee)
  - 임직원 디지털 지갑(Wallet) 발급·회수·잔액 조회
  - 식대 정책(MealPolicy): 부서/직급/시간대/한도/Split Payment
  - 예산(FundingAccount): Prepaid Deposit / Credit Net15·Net30
  - 허용 머천트 풀(AllowedMerchantPool)
  - 월간 통합 전자세금계산서(ConsolidatedEInvoice) 수령/다운로드
  - HRIS 연동 상태 (Base.vn / SAP / Workday)

## 책임이 아닌 범위

본 프로젝트는 아래를 다루지 않는다. 해당 리소스는 각각 다른 프로젝트가 소유한다.

| 리소스 | 소유 프로젝트 |
|---|---|
| 메뉴 / 지점 / 재고 / 직원 / 영업시간 | `BrandHQPortal` (제휴식당) |
| 가맹 계약 · 수수료율 정책 엔진 | `SuperAdmin/Portal` |
| 실시간 결제 승인 | `CentralApi/modules/mealticket/transaction` |
| Closed Loop 단말 | `EdgePos/Device` 의 `MealTicketClosedLoopTerminal` |

## 라우트(초안)

```
/dashboard                     예산 소진 / 부서별 리포트
/departments                   부서 트리
/employees                     임직원 / Wallet / 배지(RFID) 매핑
/policies                      정책 빌더 (시간대·부서·한도·Split)
/budget                        충전, 자동 할당, 소멸 정책
/merchants                     허용 머천트 화이트리스트 편집
/invoices                      월간 통합 전자세금계산서
/integrations                  HRIS 연동
/settings                      회사 정보, 세금코드, 관리자 계정
```

## 규칙

1. GraphQL 루트는 `Query.meal*`, `Mutation.meal*` 네임스페이스만 사용한다.
2. DTO / enum / event 는 `SharedContracts/ApiSdk/src/mealticket` 에서만 import 한다.
3. 멀티테넌트 스코프는 CentralApi 서비스 레이어가 강제한다.
4. `BrandHQPortal` 의 코드/엔티티/라우트를 import 하거나 공유하지 않는다. 공유되는 것은 `shared/ui` 와 `SharedContracts` 뿐이다.
