import { Injectable } from '@nestjs/common';
import { RealtimeService } from '../realtime.service';
import { RealtimeTopics } from '../topics/realtime-topics';

export interface CorporateChangedPayload {
  requestId: string;
  corporateId: string;
  status: 'UPDATED';
}

export interface CorporateWalletChangedPayload {
  requestId: string;
  corporateId: string;
  status: 'UPDATED';
  balance?: number;
}

export interface CorporateTransactionChangedPayload {
  requestId: string;
  corporateId: string;
  transactionId: string;
  status: 'AUTHORIZED' | 'REVERSED' | 'SETTLED';
}

export interface CorporateSettlementChangedPayload {
  requestId: string;
  corporateId: string;
  settlementBatchId: string;
  status: 'RUNNING' | 'COMPLETED' | 'FAILED';
}

export interface CorporateMerchantChangedPayload {
  requestId: string;
  corporateId: string;
  merchantId: string;
  status: 'UPDATED';
}

export interface CorporateEInvoiceChangedPayload {
  requestId: string;
  corporateId: string;
  eInvoiceId: string;
  status: 'UPDATED' | 'ISSUED' | 'CANCELLED';
}

@Injectable()
export class CorporateRealtimePublisher {
  constructor(private readonly realtime: RealtimeService) {}

  publishProfileChanged(payload: CorporateChangedPayload): void {
    this.realtime.publish(RealtimeTopics.corporate.profile.changed(payload.corporateId), payload);
  }

  publishWalletChanged(payload: CorporateWalletChangedPayload): void {
    this.realtime.publish(RealtimeTopics.corporate.wallet.changed(payload.corporateId), payload);
  }

  publishTransactionChanged(payload: CorporateTransactionChangedPayload): void {
    this.realtime.publish(RealtimeTopics.corporate.transaction.changed(payload.corporateId), payload);
  }

  publishSettlementChanged(payload: CorporateSettlementChangedPayload): void {
    this.realtime.publish(RealtimeTopics.corporate.settlement.changed(payload.corporateId), payload);
  }

  publishMerchantChanged(payload: CorporateMerchantChangedPayload): void {
    this.realtime.publish(RealtimeTopics.corporate.merchant.changed(payload.corporateId), payload);
  }

  publishEInvoiceChanged(payload: CorporateEInvoiceChangedPayload): void {
    this.realtime.publish(RealtimeTopics.corporate.einvoice.changed(payload.corporateId), payload);
  }
}

