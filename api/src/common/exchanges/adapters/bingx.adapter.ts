import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BaseExchangeAdapter } from '../base-exchange.adapter';
import { VerificationResult } from '../types/exchange-api-response.types';
import axios from 'axios';
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

      const response = await axios({
        method: method,
        url: url,
        headers: {
          'X-BX-APIKEY': this.config.apiKey,
        },
        timeout: 10000,
        transformResponse: [(data) => {
          const jsonBig = JSONBig({ storeAsString: true });
          return jsonBig.parse(data);
        }],
      });

      if (response.data && response.data.data) {
        const inviteResult = response.data.data.inviteResult;

        if (inviteResult === true || inviteResult === 1) {
          return {
            status: 'ACTIVE',
            message: 'UID verified successfully',
            data: response.data.data,
          };
        }

        return {
          status: 'REJECTED',
          message: 'UID is not registered from affiliate link',
          data: response.data.data,
        };
      }

      return {
        status: 'REJECTED',
        message: response.data?.msg || 'Invalid response from BingX API',
        data: response.data,
      };
    } catch (error: any) {
      this.logger.error(`BingX verification failed: ${error.message}`, error.stack);

      return {
        status: 'REJECTED',
        message: `Verification failed: ${error.message}`,
      };
    }
  }
}
