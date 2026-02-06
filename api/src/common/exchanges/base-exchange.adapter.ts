import { Injectable, Logger } from '@nestjs/common';
import { ExchangeAdapter } from './exchange-adapter.interface';
import { VerificationResult } from './types/exchange-api-response.types';

@Injectable()
export abstract class BaseExchangeAdapter implements ExchangeAdapter {
  protected readonly logger = new Logger(this.constructor.name);

  abstract verifyAffiliateUid(uid: string): Promise<VerificationResult>;
}
