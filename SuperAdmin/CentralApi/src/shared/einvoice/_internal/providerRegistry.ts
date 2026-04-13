import { Injectable } from '@nestjs/common';
import { DomainError } from '@core/errors/DomainError';
import { WeTaxProvider } from './Wetax.provider';
import { ViettelProvider } from './Viettel.provider';
import { MisaProvider } from './Misa.provider';
import type { EInvoiceProvider } from './EinvoiceProvider.interface';

@Injectable()
export class EInvoiceProviderRegistry {
  private readonly providers = new Map<string, EInvoiceProvider>();

  constructor(
    wetax: WeTaxProvider,
    viettel: ViettelProvider,
    misa: MisaProvider,
  ) {
    this.providers.set('WETAX', wetax);
    this.providers.set('VIETTEL', viettel);
    this.providers.set('MISA', misa);
  }

  resolve(providerType: string): EInvoiceProvider {
    const provider = this.providers.get(providerType);
    if (!provider) {
      throw new DomainError({
        code: 'EINVOICE_PROVIDER_NOT_FOUND',
        params: { providerType },
      });
    }
    return provider;
  }

  listTypes(): string[] {
    return Array.from(this.providers.keys());
  }
}
