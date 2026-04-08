/**
 * MealTicket DTOs (field naming: camelCase per platform rule).
 */
import type { MealTicketAuthMethod, MealTicketDeclineReason, MealTicketEInvoiceStatus, MealTicketFundingModel, MealTicketLoopType, MealTicketSettlementStatus, MealTicketTxnStatus, MealTicketWalletFundingSourceType, MealTicketWalletFundingStatus, MealTicketWalletStatus } from './enums.js';
/**
 * Corporate = 식권 플랫폼 B2B 고객 기업. 기준서 §2.1 신규 계층.
 * BrandHQ 와 무관한 독립 엔티티다. Branch/Menu/Inventory 를 소유하지 않는다.
 */
export interface MealTicketCorporate {
    tenantId: string;
    corporateId: string;
    companyName: string;
    taxCode: string;
    fundingModel: MealTicketFundingModel;
    monthlyBudgetVnd: number;
    depositBalanceVnd: number;
    creditLimitVnd: number;
}
/**
 * MerchantEnrollment = BrandHQ(제휴식당) 가 식권 플랫폼에 참여한 레코드.
 * BrandHQ 엔티티에 1:1 attach 되는 보조 엔티티이며, BrandHQ 자체를 대체하지 않는다.
 */
export interface MealTicketMerchantEnrollment {
    tenantId: string;
    brandHqId: string;
    enrollmentId: string;
    isActive: boolean;
    loopType: MealTicketLoopType;
    enrolledAt: string;
    contractEndsAt?: string | null;
}
export interface MealTicketMerchantCommissionRate {
    brandHqId: string;
    effectiveFrom: string;
    effectiveTo?: string | null;
    baseRatePct: number;
    specialZoneRatePct?: number | null;
    franchiseFlatRatePct?: number | null;
}
export interface MealTicketMerchantSettlementAccount {
    brandHqId: string;
    bankCode: string;
    bankAccountNumber: string;
    bankAccountHolder: string;
    taxCode: string;
}
export interface MealTicketWallet {
    walletId: string;
    tenantId?: string | null;
    corporateId: string;
    employeeId: string;
    badgeRfid?: string | null;
    status: MealTicketWalletStatus;
    balanceVnd: number;
    companyAllowanceVnd: number;
    personalTopUpVnd: number;
    dailyLimitVnd: number;
    createdAt: string;
    updatedAt: string;
}
export interface MealTicketWalletFundingEntry {
    fundingEntryId: string;
    walletId: string;
    sourceType: MealTicketWalletFundingSourceType;
    status: MealTicketWalletFundingStatus;
    amountVnd: number;
    sourceBatchId?: string | null;
    sourceReferenceId?: string | null;
    note?: string | null;
    postedAt?: string | null;
    reversedAt?: string | null;
    createdAt: string;
}
export interface MealTicketPolicyWindow {
    daysOfWeek: number[];
    startTime: string;
    endTime: string;
}
export interface MealTicketPolicy {
    policyId: string;
    tenantId: string;
    corporateId: string;
    name: string;
    appliesToDepartmentIds: string[];
    appliesToRoleIds: string[];
    windows: MealTicketPolicyWindow[];
    maxPerTransactionVnd: number;
    dailyLimitVnd: number;
    allowSplitPayment: boolean;
    allowedMerchantCategoryIds: string[];
}
/**
 * 식권 결제가 실제로 수신되는 매장(=BrandHQ 의 Branch) 뷰.
 * Merchant 는 별도 엔티티가 아니라 Branch + Enrollment 의 조합으로 파생된다.
 */
export interface MealTicketMerchantBranchView {
    tenantId: string;
    brandHqId: string;
    branchId: string;
    displayName: string;
    loopType: MealTicketLoopType;
    effectiveCommissionRatePct: number;
    isEnrolled: boolean;
    isActive: boolean;
}
export interface MealTicketTransaction {
    transactionId: string;
    tenantId: string;
    walletId: string;
    brandHqId: string;
    branchId: string;
    terminalId?: string | null;
    loopType: MealTicketLoopType;
    authMethod: MealTicketAuthMethod;
    requestedAmountVnd: number;
    approvedAmountVnd: number;
    companyShareVnd: number;
    employeeShareVnd: number;
    status: MealTicketTxnStatus;
    declineReason?: MealTicketDeclineReason | null;
    idempotencyKey: string;
    authorizedAt?: string | null;
    settledAt?: string | null;
    createdAt: string;
}
export interface MealTicketSettlementBatch {
    batchId: string;
    tenantId: string;
    periodStart: string;
    periodEnd: string;
    status: MealTicketSettlementStatus;
    grossAmountVnd: number;
    commissionAmountVnd: number;
    netPayableVnd: number;
    threeWayMismatchCount: number;
}
export interface MealTicketConsolidatedEInvoice {
    invoiceId: string;
    tenantId: string;
    corporateId: string;
    periodStart: string;
    periodEnd: string;
    totalAmountVnd: number;
    vatAmountVnd: number;
    status: MealTicketEInvoiceStatus;
    gdtReceiptNo?: string | null;
    xmlPayloadRef?: string | null;
}
