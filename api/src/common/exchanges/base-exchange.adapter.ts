import { Injectable, Logger } from '@nestjs/common';
import { ExchangeAdapter } from './exchange-adapter.interface';
import { VerificationResult } from './types/exchange-api-response.types';
import * as CryptoJS from 'crypto-js';

@Injectable()
export abstract class BaseExchangeAdapter implements ExchangeAdapter {
  protected readonly logger = new Logger(this.constructor.name);

  abstract verifyAffiliateUid(uid: string): Promise<VerificationResult>;

  /**
   * Get parameters string from object, sorted alphabetically
   * @param paramsObj - Parameters object
   * @param urlEncode - Whether to URL encode values
   * @returns Query string (e.g., "key1=value1&key2=value2")
   */
  protected getParameters(
    paramsObj: Record<string, any>,
    urlEncode: boolean,
  ): string {
    const sortedKeys = Object.keys(paramsObj).sort();
    let parameters = '';

    for (let i = 0; i < sortedKeys.length; i++) {
      if (i > 0) {
        parameters += '&';
      }
      const key = sortedKeys[i];
      let value = paramsObj[key];

      if (urlEncode) {
        value = encodeURIComponent(value);
      }
      parameters += `${key}=${value}`;
    }

    return parameters;
  }

  /**
   * Generate HMAC-SHA256 signature
   * @param message - Message to sign (usually query string)
   * @param secret - Secret key for signing
   * @returns Hex string signature
   */
  protected generateSignature(message: string, secret: string): string {
    return CryptoJS.enc.Hex.stringify(
      CryptoJS.HmacSHA256(message, secret),
    );
  }
}
