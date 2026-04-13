import { Injectable, Logger } from '@nestjs/common';
import { CacheService } from '@core/cache/Cache.service';
import { CachePolicies } from '@core/cache/cachePolicies';
import { DomainError } from '@core/errors/DomainError';
import { MisaClient } from './Misa.client';
import { MisaConstants } from './misa.constants';
import { buildMisaInvoiceBody } from './misa.serializer';
import type { MisaCredentials } from './misa.types';
import type {
  EInvoiceProvider,
  EInvoiceProviderType,
  EInvoiceProviderConfig,
  EInvoicePublishContext,
  EInvoicePublishResult,
  WeTaxCompany,
} from './EinvoiceProvider.interface';

@Injectable()
export class MisaProvider implements EInvoiceProvider {
  readonly type: EInvoiceProviderType = 'MISA';
  private readonly logger = new Logger(MisaProvider.name);

  constructor(
    private readonly client: MisaClient,
    private readonly cache: CacheService,
  ) {}

  async authenticate(config: EInvoiceProviderConfig): Promise<void> {
    const creds = config.credentials as unknown as MisaCredentials | undefined;
    if (!creds?.appId || !creds?.username || !creds?.password || !creds?.sellerTaxCode) {
      throw new DomainError({ code: 'EINVOICE_CREDENTIALS_MISSING', params: { provider: 'MISA' } });
    }

    const tokenCache = CachePolicies.einvoiceProviderToken(
      this.type,
      config.baseUrl,
      MisaConstants.TOKEN_TTL_FALLBACK_SECONDS,
    );
    const cached = await this.cache.get(tokenCache.key);
    if (cached) return;

    const loginRes = await this.client.login(
      config.baseUrl,
      creds.appId,
      creds.sellerTaxCode,
      creds.username,
      creds.password,
    );

    if (!loginRes.Success || !loginRes.Data) {
      throw new DomainError({
        code: 'EINVOICE_AUTH_FAILED',
        params: { provider: 'MISA', error: loginRes.ErrorMessage ?? 'Unknown' },
      });
    }

    await this.cache.set(tokenCache.key, loginRes.Data, tokenCache.ttlSeconds);
    this.logger.log(`MISA token cached`);
  }

  async publish(ctx: EInvoicePublishContext): Promise<EInvoicePublishResult> {
    const creds = ctx.providerConfig.credentials as unknown as MisaCredentials;
    await this.authenticate(ctx.providerConfig);

    const tokenCache = CachePolicies.einvoiceProviderToken(
      this.type,
      ctx.providerConfig.baseUrl,
      MisaConstants.TOKEN_TTL_FALLBACK_SECONDS,
    );
    const token = await this.cache.get(tokenCache.key);
    if (!token) throw new DomainError({ code: 'EINVOICE_TOKEN_EXPIRED', params: { provider: 'MISA' } });

    const body = buildMisaInvoiceBody(ctx, creds);
    const bodyJson = JSON.stringify(body);

    const res = await this.client.createInvoice(ctx.providerConfig.baseUrl, token, bodyJson);

    if (!res.Success || !res.Data) {
      return {
        success: false,
        providerResponse: res,
        errorCode: res.ErrorCode ?? 'UNKNOWN',
        errorMessage: res.ErrorMessage ?? 'MISA invoice creation failed',
      };
    }

    return {
      success: true,
      providerResponse: res,
      invoiceNo: res.Data.InvoiceNo,
      transactionId: res.Data.TransactionID,
    };
  }

  async void(_invoiceId: string, _reason: string, _config: EInvoiceProviderConfig): Promise<void> {
    throw new DomainError({ code: 'NOT_IMPLEMENTED', params: { feature: 'MISA void' } });
  }

  async lookupCompany(_taxId: string, _config: EInvoiceProviderConfig): Promise<WeTaxCompany> {
    throw new DomainError({ code: 'NOT_IMPLEMENTED', params: { feature: 'MISA KYC' } });
  }
}
