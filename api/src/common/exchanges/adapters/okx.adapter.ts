import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BaseExchangeAdapter } from '../base-exchange.adapter';
import { VerificationResult } from '../types/exchange-api-response.types';
import * as CryptoJS from 'crypto-js';

interface OkxConfig {
  apiKey: string;
  apiSecret: string;
  passphrase: string;
  url: string;
}

@Injectable()
export class OkxAdapter extends BaseExchangeAdapter {
  private readonly config: OkxConfig;

  constructor(private configService: ConfigService) {
    super();
    this.config = this.getConfig();
  }

  /**
   * Get OKX configuration from environment variables
   */
  private getConfig(): OkxConfig {
    const exchangeEnv = this.configService.get('exchanges.okx');

    return {
      apiKey: exchangeEnv?.apiKey || '',
      apiSecret: exchangeEnv?.apiSecret || '',
      passphrase: exchangeEnv?.passphrase || '',
      url: exchangeEnv?.url || 'https://www.okx.com',
    };
  }

  /**
   * Generate OKX signature (HMAC SHA256 then Base64)
   * Format: timestamp + method + requestPath + body
   * @param timestamp - ISO timestamp string
   * @param method - HTTP method (UPPERCASE)
   * @param requestPath - Request path including query params
   * @param body - Request body string (empty for GET requests)
   * @returns Base64 encoded signature
   */
  private generateOkxSignature(
    timestamp: string,
    method: string,
    requestPath: string,
    body: string,
  ): string {
    const message = timestamp + method.toUpperCase() + requestPath + body;
    const hmac = CryptoJS.HmacSHA256(message, this.config.apiSecret);
    return CryptoJS.enc.Base64.stringify(hmac);
  }

  async verifyAffiliateUid(uid: string): Promise<VerificationResult> {
    try {
      const uri = '/api/v5/affiliate/invitee/detail';
      const method = 'GET';

      if (!this.config.apiKey || !this.config.apiSecret || !this.config.passphrase) {
        this.logger.warn(
          'OKX API credentials not configured. Skipping verification.',
        );
        return {
          status: 'REJECTED',
          message: 'OKX API credentials not configured',
        };
      }

      // Format timestamp as ISO millisecond (e.g., 2020-12-08T09:08:57.715Z)
      const timestamp = new Date().toISOString();

      // For GET request, query params are part of requestPath
      const requestPath = `${uri}?uid=${encodeURIComponent(uid)}`;
      const body = ''; // GET requests have no body

      const signature = this.generateOkxSignature(
        timestamp,
        method,
        requestPath,
        body,
      );

      const endpoint = `${this.config.url}${requestPath}`;

      const fetchResponse = await fetch(endpoint, {
        method: method,
        headers: {
          'OK-ACCESS-KEY': this.config.apiKey,
          'OK-ACCESS-SIGN': signature,
          'OK-ACCESS-TIMESTAMP': timestamp,
          'OK-ACCESS-PASSPHRASE': this.config.passphrase,
          'Content-Type': 'application/json',
        },
      });

      if (!fetchResponse.ok) {
        const errorText = await fetchResponse.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { msg: `HTTP ${fetchResponse.status}: ${fetchResponse.statusText}` };
        }
        this.logger.error(`OKX API error response: ${JSON.stringify(errorData)}`);
        return {
          status: 'REJECTED',
          message: 'Verification failed',
        };
      }

      const responseText = await fetchResponse.text();
      const response = JSON.parse(responseText);

      // OKX API returns { code: "0", msg: "", data: [{ inviteeLevel: "2", ... }] }
      if (response && response.code === '0' && response.data) {
        const inviteeData = response.data[0];

        this.logger.debug(`OKX API response data: ${JSON.stringify(response.data)}`);

        // Check if inviteeLevel is "2" (invitee)
        if (inviteeData && inviteeData.inviteeLevel === '2') {
          return {
            status: 'ACTIVE',
            message: 'UID verified successfully',
          };
        }

        return {
          status: 'REJECTED',
          message: 'UID is not registered from affiliate link',
        };
      }

      this.logger.warn(`OKX API invalid response: ${JSON.stringify(response)}`);
      return {
        status: 'REJECTED',
        message: response.msg || 'Verification failed',
      };
    } catch (error: any) {
      this.logger.error(`OKX verification failed: ${error.message}`, error.stack);

      return {
        status: 'REJECTED',
        message: 'Verification failed',
      };
    }
  }
}
