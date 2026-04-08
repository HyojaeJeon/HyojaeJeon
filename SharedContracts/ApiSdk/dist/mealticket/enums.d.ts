/**
 * MealTicket domain enums.
 *
 * 원본은 이 파일 하나다. CentralApi / Portal / EdgePos 는 여기서 import 한다.
 * SharedContracts 단일 원본 규칙 준수.
 */
export declare const MEAL_TICKET_WALLET_STATUS: {
    readonly ACTIVE: "ACTIVE";
    readonly SUSPENDED: "SUSPENDED";
    readonly FROZEN: "FROZEN";
    readonly CLOSED: "CLOSED";
};
export type MealTicketWalletStatus = (typeof MEAL_TICKET_WALLET_STATUS)[keyof typeof MEAL_TICKET_WALLET_STATUS];
export declare const MEAL_TICKET_WALLET_FUNDING_SOURCE_TYPE: {
    readonly COMPANY_ALLOWANCE: "COMPANY_ALLOWANCE";
    readonly PERSONAL_TOP_UP: "PERSONAL_TOP_UP";
};
export type MealTicketWalletFundingSourceType = (typeof MEAL_TICKET_WALLET_FUNDING_SOURCE_TYPE)[keyof typeof MEAL_TICKET_WALLET_FUNDING_SOURCE_TYPE];
export declare const MEAL_TICKET_WALLET_FUNDING_STATUS: {
    readonly PENDING: "PENDING";
    readonly POSTED: "POSTED";
    readonly REVERSED: "REVERSED";
};
export type MealTicketWalletFundingStatus = (typeof MEAL_TICKET_WALLET_FUNDING_STATUS)[keyof typeof MEAL_TICKET_WALLET_FUNDING_STATUS];
export declare const MEAL_TICKET_FUNDING_MODEL: {
    readonly PREPAID_DEPOSIT: "PREPAID_DEPOSIT";
    readonly CREDIT_NET15: "CREDIT_NET15";
    readonly CREDIT_NET30: "CREDIT_NET30";
};
export type MealTicketFundingModel = (typeof MEAL_TICKET_FUNDING_MODEL)[keyof typeof MEAL_TICKET_FUNDING_MODEL];
export declare const MEAL_TICKET_LOOP_TYPE: {
    readonly OPEN_LOOP: "OPEN_LOOP";
    readonly CLOSED_LOOP: "CLOSED_LOOP";
};
export type MealTicketLoopType = (typeof MEAL_TICKET_LOOP_TYPE)[keyof typeof MEAL_TICKET_LOOP_TYPE];
export declare const MEAL_TICKET_AUTH_METHOD: {
    readonly APP_QR: "APP_QR";
    readonly DYNAMIC_BARCODE: "DYNAMIC_BARCODE";
    readonly RFID_BADGE: "RFID_BADGE";
    readonly BIOMETRIC_FACE: "BIOMETRIC_FACE";
    readonly BIOMETRIC_FINGERPRINT: "BIOMETRIC_FINGERPRINT";
};
export type MealTicketAuthMethod = (typeof MEAL_TICKET_AUTH_METHOD)[keyof typeof MEAL_TICKET_AUTH_METHOD];
export declare const MEAL_TICKET_TXN_STATUS: {
    readonly PENDING: "PENDING";
    readonly APPROVED: "APPROVED";
    readonly DECLINED: "DECLINED";
    readonly REVERSED: "REVERSED";
    readonly SETTLED: "SETTLED";
};
export type MealTicketTxnStatus = (typeof MEAL_TICKET_TXN_STATUS)[keyof typeof MEAL_TICKET_TXN_STATUS];
export declare const MEAL_TICKET_DECLINE_REASON: {
    readonly INSUFFICIENT_BALANCE: "INSUFFICIENT_BALANCE";
    readonly OUT_OF_POLICY_WINDOW: "OUT_OF_POLICY_WINDOW";
    readonly MERCHANT_INACTIVE: "MERCHANT_INACTIVE";
    readonly EMPLOYEE_INACTIVE: "EMPLOYEE_INACTIVE";
    readonly DAILY_LIMIT_EXCEEDED: "DAILY_LIMIT_EXCEEDED";
    readonly FRAUD_SUSPECTED: "FRAUD_SUSPECTED";
    readonly OFFLINE_NOT_ALLOWED: "OFFLINE_NOT_ALLOWED";
};
export type MealTicketDeclineReason = (typeof MEAL_TICKET_DECLINE_REASON)[keyof typeof MEAL_TICKET_DECLINE_REASON];
export declare const MEAL_TICKET_SETTLEMENT_STATUS: {
    readonly OPEN: "OPEN";
    readonly MATCHING: "MATCHING";
    readonly MATCHED: "MATCHED";
    readonly EXCEPTION: "EXCEPTION";
    readonly PAID: "PAID";
};
export type MealTicketSettlementStatus = (typeof MEAL_TICKET_SETTLEMENT_STATUS)[keyof typeof MEAL_TICKET_SETTLEMENT_STATUS];
export declare const MEAL_TICKET_EINVOICE_STATUS: {
    readonly DRAFT: "DRAFT";
    readonly SIGNED: "SIGNED";
    readonly SUBMITTED_GDT: "SUBMITTED_GDT";
    readonly ACCEPTED_GDT: "ACCEPTED_GDT";
    readonly REJECTED_GDT: "REJECTED_GDT";
    readonly VOIDED: "VOIDED";
};
export type MealTicketEInvoiceStatus = (typeof MEAL_TICKET_EINVOICE_STATUS)[keyof typeof MEAL_TICKET_EINVOICE_STATUS];
