/**
 * 한국어: WeTax HTTP client — login, publish, getCompany 3개 endpoint 만 노출.
 *
 *   원본: `HJ-POS-TEST/WeTax/WeTaxMgr.cpp` 의 `Login`, `PostJson`, `GetJson` (CInternetSession 기반).
 *   신규 구현: NestJS 의 `HttpService` (axios) 또는 globalThis.fetch 사용.
 *   상세 사양: `1.Docs/식권관리플랫폼/EInvoice-WeTax-사양.md` §1.1 / §11
 *
 *   본 client 는 token 캐시를 갖지 않는다 — 캐시는 `WeTaxProvider` 가 책임 (Redis).
 *   에러 매핑은 호출자가 DomainError 로 감싸므로 본 client 는 raw Error 만 throw.
 *
 *   TODO (Phase 1 구현):
 *     - axios instance 를 NestJS DI 로 주입
 *     - timeout 30s 기본
 *     - retry 는 호출자 책임 (provider 레벨)
 *     - 모든 outbound 요청을 audit 가능한 형태로 logging
 *
 * Tiếng Việt: HTTP client gọi WeTax — chỉ 3 endpoint.
 */
import { Injectable, Logger } from '@nestjs/common';
import { WeTaxConstants } from './wetax.constants';
import type {
  WeTaxCompany,
  WeTaxLoginResponse,
  WeTaxPublishResponse,
} from './wetax.types';

export interface WeTaxClientConfig {
  baseUrl: string;
  timeoutMs?: number;
}

@Injectable()
export class WeTaxClient {
  private readonly logger = new Logger(WeTaxClient.name);

  /**
   * 한국어: WeTax login. username/password 로 Bearer token 발급.
   *   응답의 expiresIn (초) 가 없으면 fallback (50분) 사용.
   */
  async login(
    config: WeTaxClientConfig,
    username: string,
    password: string,
  ): Promise<WeTaxLoginResponse> {
    // TODO Phase 1: axios POST {baseUrl}{API.LOGIN} body={username,password}
    //   - Content-Type: application/json
    //   - timeout = config.timeoutMs ?? 30_000
    //   - 응답 비정상이면 throw new Error('WETAX_LOGIN_FAILED')
    throw new Error(
      `WeTaxClient.login not yet implemented. Will POST ${config.baseUrl}${WeTaxConstants.API.LOGIN}`,
    );
  }

  /**
   * 한국어: 인보이스 발급. SerializedWeTaxBody 를 그대로 전송.
   */
  async publishInvoice(
    config: WeTaxClientConfig,
    bearerToken: string,
    bodyJson: string,
  ): Promise<WeTaxPublishResponse> {
    // TODO Phase 1: axios POST {baseUrl}{API.PUBLISH_INVOICE}
    //   - Headers: Content-Type, Authorization: Bearer <token>
    //   - body: bodyJson (이미 stringify 된 상태)
    //   - 응답 status.success=false 시에도 raw 응답을 반환 (호출자가 매핑)
    throw new Error(
      `WeTaxClient.publishInvoice not yet implemented. Will POST ${config.baseUrl}${WeTaxConstants.API.PUBLISH_INVOICE}`,
    );
  }

  /**
   * 한국어: 사업자번호 KYC 1차 lookup.
   */
  async getCompanyByTaxId(
    config: WeTaxClientConfig,
    bearerToken: string,
    taxId: string,
  ): Promise<{ status: { success: boolean; message?: string }; data: WeTaxCompany }> {
    // TODO Phase 1: axios GET {baseUrl}{API.COMPANY}{taxId}
    //   - Headers: Accept: application/json, Authorization: Bearer <token>
    throw new Error(
      `WeTaxClient.getCompanyByTaxId not yet implemented. Will GET ${config.baseUrl}${WeTaxConstants.API.COMPANY}${taxId}`,
    );
  }
}
