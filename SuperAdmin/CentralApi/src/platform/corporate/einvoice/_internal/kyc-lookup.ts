/**
 * 한국어: 사업자번호 KYC 3-source fallback.
 *
 *   순서: WeTax → vietqr.io → esgoo / thongtindoanhnghiep.co.
 *   원본: `HJ-POS-TEST/WeTax/WeTaxMgr.cpp` 의
 *     - `GetCompanyByTaxId`
 *     - `GetCompanyByTaxIdByVietqr`
 *     - `GetCompanyByTaxIdByEsgoo`
 *
 *   상세 사양: `1.Docs/식권관리플랫폼/EInvoice-WeTax-사양.md` §9
 *
 *   본 모듈은 leaf 외부에서 import 하지 않는다 (`_internal/`).
 *
 *   TODO (Phase 1 구현):
 *     - Redis 캐시 (TTL 24h) — `KYC:taxId:{taxId}`
 *     - 각 source client 분리 (vietqr.client.ts, esgoo.client.ts) 또는 단일 파일에 함수 3개
 *     - 모든 source 실패 시 DomainError({ code: 'KYC_LOOKUP_FAILED' })
 *
 * Tiếng Việt: Tra cứu doanh nghiệp 3 nguồn theo thứ tự ưu tiên.
 */
import { Injectable, Logger } from '@nestjs/common';
import { DomainError } from '@core/errors/domain-error';
import { WeTaxClient } from './wetax.client';
import type { EInvoiceProviderConfig } from './einvoice-provider.interface';
import type { WeTaxCompany } from './wetax.types';

@Injectable()
export class KycLookupService {
  private readonly logger = new Logger(KycLookupService.name);

  constructor(private readonly wetaxClient: WeTaxClient) {}

  async lookupByTaxId(
    taxId: string,
    config: EInvoiceProviderConfig,
    bearerToken: string,
  ): Promise<WeTaxCompany> {
    if (!taxId || taxId.trim().length === 0) {
      throw new DomainError({ code: 'EINVOICE_VALIDATION_FAILED', params: { field: 'taxId' } });
    }

    // 1차: WeTax (provider 1차)
    try {
      const wetax = await this.wetaxClient.getCompanyByTaxId(
        { baseUrl: config.baseUrl },
        bearerToken,
        taxId,
      );
      if (wetax.status.success) return wetax.data;
    } catch (err) {
      this.logger.warn(
        `WeTax KYC failed for taxId=${taxId}: ${(err as Error).message}. Fallback to vietqr.`,
      );
    }

    // 2차: vietqr.io
    try {
      const data = await this.lookupByVietqr(taxId);
      if (data) return data;
    } catch (err) {
      this.logger.warn(
        `VietQR KYC failed for taxId=${taxId}: ${(err as Error).message}. Fallback to esgoo.`,
      );
    }

    // 3차: esgoo / thongtindoanhnghiep
    try {
      const data = await this.lookupByEsgoo(taxId);
      if (data) return data;
    } catch (err) {
      this.logger.error(
        `Esgoo KYC failed for taxId=${taxId}: ${(err as Error).message}. All sources exhausted.`,
      );
    }

    throw new DomainError({
      code: 'KYC_LOOKUP_FAILED',
      params: { taxId },
      details: { reason: 'All 3 KYC sources failed' },
    });
  }

  private async lookupByVietqr(_taxId: string): Promise<WeTaxCompany | null> {
    // TODO Phase 1: GET https://api.vietqr.io/v2/business/{taxId}
    //   응답 매핑은 WeTaxMgr.cpp:507~578 의 ParseCompanyResponseByVietqr 참조
    throw new Error('vietqr lookup not yet implemented');
  }

  private async lookupByEsgoo(_taxId: string): Promise<WeTaxCompany | null> {
    // TODO Phase 1: GET https://thongtindoanhnghiep.co/api/company/{taxId}
    //   응답 매핑은 WeTaxMgr.cpp:580~642 의 ParseCompanyResponseByEsgoo 참조
    throw new Error('esgoo lookup not yet implemented');
  }
}
