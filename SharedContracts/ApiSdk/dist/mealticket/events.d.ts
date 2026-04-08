/**
 * MealTicket domain events (for CentralApi → SyncWorkers / Subscriptions).
 */
import type { MealTicketDeclineReason, MealTicketEInvoiceStatus, MealTicketSettlementStatus, MealTicketTxnStatus } from './enums.js';
export type { MealTicketTxnStatus } from './enums.js';
export declare const MEAL_TICKET_EVENT: {
    readonly WALLET_FUNDED: "mealticket.wallet.funded";
    readonly TRANSACTION_AUTHORIZED: "mealticket.transaction.authorized";
    readonly TRANSACTION_DECLINED: "mealticket.transaction.declined";
    readonly TRANSACTION_REVERSED: "mealticket.transaction.reversed";
    readonly SETTLEMENT_BATCH_MATCHED: "mealticket.settlement.batch.matched";
    readonly SETTLEMENT_EXCEPTION_RAISED: "mealticket.settlement.exception.raised";
    readonly EINVOICE_SUBMITTED: "mealticket.einvoice.submitted";
    readonly EINVOICE_STATUS_CHANGED: "mealticket.einvoice.status.changed";
};
export type MealTicketEventName = (typeof MEAL_TICKET_EVENT)[keyof typeof MEAL_TICKET_EVENT];
export interface MealTicketEventMessage<TName extends MealTicketEventName, TPayload> {
    eventId: string;
    eventName: TName;
    tenantId: string;
    occurredAt: string;
    payload: TPayload;
}
export type MealTicketWalletFundedEvent = MealTicketEventMessage<typeof MEAL_TICKET_EVENT.WALLET_FUNDED, {
    walletId: string;
    amountVnd: number;
    sourceBatchId: string;
}>;
export type MealTicketTransactionAuthorizedEvent = MealTicketEventMessage<typeof MEAL_TICKET_EVENT.TRANSACTION_AUTHORIZED, {
    transactionId: string;
    walletId: string;
    brandHqId: string;
    branchId: string;
    approvedAmountVnd: number;
    status: MealTicketTxnStatus;
}>;
export type MealTicketTransactionDeclinedEvent = MealTicketEventMessage<typeof MEAL_TICKET_EVENT.TRANSACTION_DECLINED, {
    transactionId: string;
    walletId: string;
    brandHqId: string;
    branchId: string;
    requestedAmountVnd: number;
    declineReason: MealTicketDeclineReason;
}>;
export type MealTicketSettlementBatchMatchedEvent = MealTicketEventMessage<typeof MEAL_TICKET_EVENT.SETTLEMENT_BATCH_MATCHED, {
    batchId: string;
    status: MealTicketSettlementStatus;
    netPayableVnd: number;
    mismatchCount: number;
}>;
export type MealTicketEInvoiceStatusChangedEvent = MealTicketEventMessage<typeof MEAL_TICKET_EVENT.EINVOICE_STATUS_CHANGED, {
    invoiceId: string;
    corporateId: string;
    status: MealTicketEInvoiceStatus;
    gdtReceiptNo?: string | null;
}>;
