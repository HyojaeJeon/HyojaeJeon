import { Injectable, Logger } from '@nestjs/common';
import { CacheService } from '@core/cache/Cache.service';
import { CachePolicies } from '@core/cache/cachePolicies';
import { DomainError } from '@core/errors/DomainError';
import { ViettelClient } from './Viettel.client';
import { ViettelConstants } from './viettel.constants';
import { buildViettelInvoiceBody } from './viettel.serializer';
import type { ViettelCredentials } from './viettel.types';
import type {
  EInvoiceProvider,
  EInvoiceProviderType,
  EInvoiceProviderConfig,
  EInvoicePublishContext,
  EInvoicePublishResult,
  WeTaxCompany,
} from './EinvoiceProvider.interface';

@Injectable()
export class ViettelProvider implements EInvoiceProvider {
  readonly type: EInvoiceProviderType = 'VIETTEL';
  private readonly logger = new Logger(ViettelProvider.name);

  constructor(
    private readonly client: ViettelClient,
    private readonly cache: CacheService,
  ) {}

  async authenticate(config: EInvoiceProviderConfig): Promise<void> {
    const creds = config.credentials as unknown as ViettelCredentials | undefined;
    if (!creds?.username || !creds?.password) {
      throw new DomainError({ code: 'EINVOICE_CREDENTIALS_MISSING', params: { provider: 'VIETTEL' } });
    }

    const fallbackCache = CachePolicies.einvoiceProviderToken(
      this.type,
      config.baseUrl,
      ViettelConstants.TOKEN_TTL_FALLBACK_SECONDS,
    );
    const cached = await this.cache.get(fallbackCache.key);
    if (cached) return;

    const loginRes = await this.client.login(config.baseUrl, creds.username, creds.password);
    const ttl = loginRes.expires_in
      ? Math.floor(loginRes.expires_in * 0.9)
      : ViettelConstants.TOKEN_TTL_FALLBACK_SECONDS;

    const tokenCache = CachePolicies.einvoiceProviderToken(this.type, config.baseUrl, ttl);
    await this.cache.set(tokenCache.key, loginRes.access_token, tokenCache.ttlSeconds);
    this.logger.log(`Viettel token cached (TTL ${ttl}s)`);
  }

  async publish(ctx: EInvoicePublishContext): Promise<EInvoicePublishResult> {
    const creds = ctx.providerConfig.credentials as unknown as ViettelCredentials;
    await this.authenticate(ctx.providerConfig);

    const tokenCache = CachePolicies.einvoiceProviderToken(
      this.type,
      ctx.providerConfig.baseUrl,
      ViettelConstants.TOKEN_TTL_FALLBACK_SECONDS,
    );
    const token = await this.cache.get(tokenCache.key);
    if (!token) throw new DomainError({ code: 'EINVOICE_TOKEN_EXPIRED', params: { provider: 'VIETTEL' } });

    const body = buildViettelInvoiceBody(ctx, creds);
    const bodyJson = JSON.stringify(body);

    const res = await this.client.createInvoice(
      ctx.providerConfig.baseUrl,
      token,
      ctx.seller.taxCode,
      bodyJson,
    );

    if (res.errorCode) {
      return {
        success: false,
        providerResponse: res,
        errorCode: res.errorCode,
        errorMessage: res.description ?? 'Viettel invoice creation failed',
      };
    }

    return {
      success: true,
      providerResponse: res,
      invoiceNo: res.result?.invoiceNo,
      lookupCode: res.result?.reservationCode,
      transactionId: res.result?.transactionID,
    };
  }

  async void(_invoiceId: string, _reason: string, _config: EInvoiceProviderConfig): Promise<void> {
    throw new DomainError({ code: 'NOT_IMPLEMENTED', params: { feature: 'Viettel void' } });
  }

  async lookupCompany(_taxId: string, _config: EInvoiceProviderConfig): Promise<WeTaxCompany> {
    throw new DomainError({ code: 'NOT_IMPLEMENTED', params: { feature: 'Viettel KYC' } });
  }
}
