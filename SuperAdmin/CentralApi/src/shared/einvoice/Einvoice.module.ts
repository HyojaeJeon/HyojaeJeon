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
import { EInvoiceService } from './Einvoice.service';
import { EInvoiceResolver } from './Einvoice.resolver';
import { EInvoiceProviderRegistry } from './_internal/providerRegistry';
// WeTax
import { WeTaxClient } from './_internal/Wetax.client';
import { WeTaxProvider } from './_internal/Wetax.provider';
import { KycLookupService } from './_internal/KycLookup';
// Viettel
import { ViettelClient } from './_internal/Viettel.client';
import { ViettelProvider } from './_internal/Viettel.provider';
// MISA
import { MisaClient } from './_internal/Misa.client';
import { MisaProvider } from './_internal/Misa.provider';

@Module({
  providers: [
    EInvoiceService,
    EInvoiceResolver,
    EInvoiceProviderRegistry,
    // WeTax
    WeTaxClient,
    KycLookupService,
    WeTaxProvider,
    // Viettel
    ViettelClient,
    ViettelProvider,
    // MISA
    MisaClient,
    MisaProvider,
  ],
  exports: [EInvoiceService],
})
export class EInvoiceModule {}
