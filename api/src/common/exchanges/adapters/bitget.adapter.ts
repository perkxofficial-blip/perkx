import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BaseExchangeAdapter } from '../base-exchange.adapter';
import { VerificationResult } from '../types/exchange-api-response.types';
import * as CryptoJS from 'crypto-js';

interface BitgetConfig {
  apiKey: string;
  apiSecret: string;
  passphrase: string;
  url: string;
}

@Injectable()
export class BitgetAdapter extends BaseExchangeAdapter {
  private readonly config: BitgetConfig;

  constructor(private configService: ConfigService) {
    super();
    this.config = this.getConfig();
  }

  /**
   * Get Bitget configuration from environment variables
   */
  private getConfig(): BitgetConfig {
    const exchangeEnv = this.configService.get('exchanges.bitget');

    return {
      apiKey: exchangeEnv?.apiKey || '',
      apiSecret: exchangeEnv?.apiSecret || '',
      passphrase: exchangeEnv?.passphrase || '',
      url: exchangeEnv?.url || 'https://api.bitget.com',
    };
  }

  /**
   * Get server time from Bitget API
   * @returns Server timestamp in milliseconds as string, or null if failed
   */
  private async getServerTime(): Promise<string | null> {
    try {
      const endpoint = `${this.config.url}/api/v2/public/time`;
      
      const fetchResponse = await fetch(endpoint, {
        method: 'GET',
      });

      if (!fetchResponse.ok) {
        this.logger.warn(`Failed to get Bitget server time: HTTP ${fetchResponse.status}`);
        return null;
      }

      const responseText = await fetchResponse.text();
      const response = JSON.parse(responseText);

      // Response format: { code: "00000", msg: "success", requestTime: 1688008631614, data: { serverTime: "1688008631614" } }
      if (response && response.code === '00000' && response.data?.serverTime) {
        return response.data.serverTime;
      }

      this.logger.warn(`Invalid Bitget server time response: ${JSON.stringify(response)}`);
      return null;
    } catch (error: any) {
      this.logger.warn(`Error getting Bitget server time: ${error.message}`);
      return null;
    }
  }

  /**
   * Generate Bitget signature (HMAC SHA256 then Base64)
   * Format: timestamp + method.toUpperCase() + requestPath + "?" + queryString + body
   */
  private generateBitgetSignature(
    timestamp: string,
    method: string,
    requestPath: string,
    queryString: string,
    body: string,
  ): string {
    let message = timestamp + method.toUpperCase() + requestPath;

    if (queryString) {
      message += '?' + queryString;
    }

    if (body) {
      message += body;
    }

    const hmac = CryptoJS.HmacSHA256(message, this.config.apiSecret);
    return CryptoJS.enc.Base64.stringify(hmac);
  }

  async verifyAffiliateUid(uid: string): Promise<VerificationResult> {
    try {
      const uri = '/api/v2/broker/customer-list';
      const method = 'POST';

      if (!this.config.apiKey || !this.config.apiSecret || !this.config.passphrase) {
        this.logger.warn(
          'Bitget API credentials not configured. Skipping verification.',
        );
        return {
          status: 'REJECTED',
          message: 'Bitget API credentials not configured',
        };
      }

      // Get timestamp from Bitget server, fallback to local time if failed
      let timestamp = await this.getServerTime();
      if (!timestamp) {
        timestamp = (Date.now() - 105000).toString();
      }

      // For POST request, body should be JSON string
      const body = JSON.stringify({
        uid: uid,
      });

      // POST requests typically don't have query string
      const signature = this.generateBitgetSignature(timestamp, method, uri, '', body);

      const endpoint = `${this.config.url}${uri}`;

      const fetchResponse = await fetch(endpoint, {
        method: method,
        headers: {
          'ACCESS-KEY': this.config.apiKey,
          'ACCESS-SIGN': signature,
          'ACCESS-TIMESTAMP': timestamp,
          'ACCESS-PASSPHRASE': this.config.passphrase,
          'Content-Type': 'application/json',
        },
        body: body,
      });

      if (!fetchResponse.ok) {
        const errorText = await fetchResponse.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { msg: `HTTP ${fetchResponse.status}: ${fetchResponse.statusText}` };
        }
        this.logger.error(`Bitget API error response: ${JSON.stringify(errorData)}`);
        return {
          status: 'REJECTED',
          message: 'Verification failed',
        };
      }

      const responseText = await fetchResponse.text();
      const response = JSON.parse(responseText);

      // Bitget API typically returns { code: "00000", data: {...}, msg: "success" }
      if (response && response.code === '00000' && response.data) {
        const firstCustomer = response.data[0] || [];

        this.logger.debug(`Bitget API response data: ${JSON.stringify(response.data)}`);

        if (firstCustomer) {
          if (firstCustomer.uid === uid) {
            return {
              status: 'ACTIVE',
              message: 'UID verified successfully',
            };
          }
        }

        return {
          status: 'REJECTED',
          message: 'UID is not registered from affiliate link',
        };
      }

      this.logger.warn(`Bitget API invalid response: ${JSON.stringify(response)}`);
      return {
        status: 'REJECTED',
        message: response.msg || 'Verification failed',
      };
    } catch (error: any) {
      this.logger.error(`Bitget verification failed: ${error.message}`, error.stack);

      return {
        status: 'REJECTED',
        message: 'Verification failed',
      };
    }
  }
}
