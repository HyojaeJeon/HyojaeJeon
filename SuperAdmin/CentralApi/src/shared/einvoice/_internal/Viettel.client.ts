import { Injectable, Logger } from '@nestjs/common';
import { ViettelConstants } from './viettel.constants';
import type { ViettelLoginResponse, ViettelCreateInvoiceResponse } from './viettel.types';

@Injectable()
export class ViettelClient {
  private readonly logger = new Logger(ViettelClient.name);

  async login(baseUrl: string, username: string, password: string): Promise<ViettelLoginResponse> {
    const url = `${baseUrl}${ViettelConstants.API.LOGIN}`;
    this.logger.debug(`Viettel login → ${url}`);

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
      signal: AbortSignal.timeout(30_000),
    });

    if (!res.ok) {
      throw new Error(`Viettel login failed: HTTP ${res.status}`);
    }

    return res.json() as Promise<ViettelLoginResponse>;
  }

  async createInvoice(
    baseUrl: string,
    bearerToken: string,
    sellerTaxCode: string,
    bodyJson: string,
  ): Promise<ViettelCreateInvoiceResponse> {
    const url = `${baseUrl}${ViettelConstants.API.CREATE_INVOICE}/${sellerTaxCode}`;
    this.logger.debug(`Viettel createInvoice → ${url}`);

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${bearerToken}`,
      },
      body: bodyJson,
      signal: AbortSignal.timeout(30_000),
    });

    if (!res.ok) {
      throw new Error(`Viettel createInvoice failed: HTTP ${res.status}`);
    }

    return res.json() as Promise<ViettelCreateInvoiceResponse>;
  }
}
