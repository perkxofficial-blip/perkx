import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BaseExchangeAdapter } from '../base-exchange.adapter';
import { VerificationResult } from '../types/exchange-api-response.types';
const JSONBig = require('json-bigint');

interface BingxConfig {
  apiKey: string;
  apiSecret: string;
  passphrase?: string;
  url: string;
}

@Injectable()
export class BingxAdapter extends BaseExchangeAdapter {
  private readonly config: BingxConfig;
  private readonly jsonBig = JSONBig({ storeAsString: true });

  constructor(private configService: ConfigService) {
    super();
    this.config = this.getConfig();
  }

  /**
   * Get BingX configuration from environment variables
   */
  private getConfig(): BingxConfig {
    const exchangeEnv = this.configService.get('exchanges.bingx');
    
    return {
      apiKey: exchangeEnv?.apiKey || '',
      apiSecret: exchangeEnv?.apiSecret || '',
      passphrase: exchangeEnv?.passphrase,
      url: exchangeEnv?.url || 'https://open-api.bingx.com',
    };
  }

  /**
   * Parse JSON response with BigInt support
   */
  private parseJsonResponse(data: string): any {
    return this.jsonBig.parse(data);
  }

  async verifyAffiliateUid(uid: string): Promise<VerificationResult> {
    try {
      const uri = '/openApi/agent/v1/account/inviteRelationCheck';
      const method = 'GET';
      if (!this.config.apiKey || !this.config.apiSecret) {
        this.logger.warn(
          'BingX API credentials not configured. Skipping verification.',
        );
        return {
          status: 'REJECTED',
          message: 'BingX API credentials not configured',
        };
      }

      const timestamp = Date.now();
      const payload = {
        uid: uid,
        timestamp: timestamp,
      };

      const paramsStr = this.getParameters(payload, false);
      const signature = this.generateSignature(paramsStr, this.config.apiSecret);

      const url = `${this.config.url}${uri}?${this.getParameters(payload, true)}&signature=${signature}`;

      const fetchResponse = await fetch(url, {
        method: method,
        headers: {
          'X-BX-APIKEY': this.config.apiKey,
        },
      });

      if (!fetchResponse.ok) {
        const errorText = await fetchResponse.text();
        let errorData;
        try {
          errorData = this.parseJsonResponse(errorText);
        } catch {
          errorData = { msg: `HTTP ${fetchResponse.status}: ${fetchResponse.statusText}` };
        }
        this.logger.error(`BingX API error response: ${JSON.stringify(errorData)}`);
        return {
          status: 'REJECTED',
          message: 'Verification failed',
        };
      }

      const responseText = await fetchResponse.text();
      const response = this.parseJsonResponse(responseText);

      if (response && response.data) {
        const inviteResult = response.data.inviteResult;
        this.logger.debug(`BingX API response data: ${JSON.stringify(response.data)}`);

        if (inviteResult === true || inviteResult === 1) {
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

      this.logger.warn(`BingX API invalid response: ${JSON.stringify(response)}`);
      return {
        status: 'REJECTED',
        message: 'Verification failed',
      };
    } catch (error: any) {
      this.logger.error(`BingX verification failed: ${error.message}`, error.stack);

      return {
        status: 'REJECTED',
        message: 'Verification failed',
      };
    }
  }
}
