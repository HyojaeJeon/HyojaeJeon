/**
 * 한국어: MealConsolidatedEInvoice leaf 모듈.
 *
 *   provider 구현체 (`_internal/wetax.*`) 는 본 모듈에서만 wiring 한다.
 *   외부 모듈은 `EInvoiceModule` 의 `MealEInvoiceService` 만 사용해야 하며,
 *   `_internal/` 의 어떤 심볼도 import 하지 않는다.
 *
 * Tiếng Việt: Module leaf MealConsolidatedEInvoice — wiring provider WeTax.
 */
import { Module } from '@nestjs/common';
import { MealEInvoiceService } from './einvoice.service';
import { MealEInvoiceResolver } from './einvoice.resolver';
import { WeTaxClient } from './_internal/wetax.client';
import { WeTaxProvider } from './_internal/wetax.provider';
import { KycLookupService } from './_internal/kyc-lookup';

@Module({
  providers: [
    MealEInvoiceService,
    MealEInvoiceResolver,
    // Provider 추상화 (1차 구현: WeTax)
    WeTaxClient,
    KycLookupService,
    WeTaxProvider,
  ],
  exports: [MealEInvoiceService],
})
export class EInvoiceModule {}
