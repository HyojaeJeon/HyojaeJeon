/**
 * 한국어: EInvoice leaf 모듈 — generic 전자세금계산서 도메인.
 *
 *   provider 구현체 (`_internal/wetax.*`) 는 본 모듈에서만 wiring 한다.
 *   외부 모듈은 `EInvoiceModule` 의 `EInvoiceService` 만 사용해야 하며,
 *   `_internal/` 의 어떤 심볼도 import 하지 않는다.
 *
 * Tiếng Việt: Module leaf EInvoice — wiring provider WeTax.
 */
import { Module } from '@nestjs/common';
import { EInvoiceService } from './einvoice.service';
import { EInvoiceResolver } from './einvoice.resolver';
import { WeTaxClient } from './_internal/wetax.client';
import { WeTaxProvider } from './_internal/wetax.provider';
import { KycLookupService } from './_internal/kyc-lookup';

@Module({
  providers: [
    EInvoiceService,
    EInvoiceResolver,
    // Provider 추상화 (1차 구현: WeTax)
    WeTaxClient,
    KycLookupService,
    WeTaxProvider,
  ],
  exports: [EInvoiceService],
})
export class EInvoiceModule {}
