import { Injectable, Logger } from '@nestjs/common';
import { MisaConstants } from './misa.constants';
import type { MisaLoginResponse, MisaCreateInvoiceResponse } from './misa.types';

@Injectable()
export class MisaClient {
  private readonly logger = new Logger(MisaClient.name);

  async login(
    baseUrl: string,
    appId: string,
    taxCode: string,
    username: string,
    password: string,
  ): Promise<MisaLoginResponse> {
    const url = `${baseUrl}${MisaConstants.API.LOGIN}`;
    this.logger.debug(`MISA login → ${url}`);

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ appid: appId, taxcode: taxCode, username, password }),
      signal: AbortSignal.timeout(30_000),
    });

    if (!res.ok) {
      throw new Error(`MISA login failed: HTTP ${res.status}`);
    }

    return res.json() as Promise<MisaLoginResponse>;
  }

  async createInvoice(
    baseUrl: string,
    bearerToken: string,
    bodyJson: string,
  ): Promise<MisaCreateInvoiceResponse> {
    const url = `${baseUrl}${MisaConstants.API.CREATE_INVOICE}`;
    this.logger.debug(`MISA createInvoice → ${url}`);

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
      throw new Error(`MISA createInvoice failed: HTTP ${res.status}`);
    }

    return res.json() as Promise<MisaCreateInvoiceResponse>;
  }
}
