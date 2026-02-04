import { VerificationResult } from './types/exchange-api-response.types';

export interface ExchangeAdapter {
  /**
   * Verify if a UID is registered from the affiliate link
   * @param uid - The UID to verify
   * @returns Verification result
   */
  verifyAffiliateUid(uid: string): Promise<VerificationResult>;
}
