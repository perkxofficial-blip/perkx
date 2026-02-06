import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BaseExchangeAdapter } from '../base-exchange.adapter';
import { VerificationResult } from '../types/exchange-api-response.types';

@Injectable()
export class BybitAdapter extends BaseExchangeAdapter {
  constructor(private configService: ConfigService) {
    super();
  }

  async verifyAffiliateUid(uid: string): Promise<VerificationResult> {
    return {
      status: 'PENDING',
      message: 'Pending verification',
    };
  }
}
