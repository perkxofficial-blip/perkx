import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Exchange } from '../../../entities';
import { StorageService } from '../../../common/storage/storage.service';

type ExchangeResponse = Exchange & {
  logo_url: string | null;
};

@Injectable()
export class PublicExchangesService {
  constructor(
    @InjectRepository(Exchange)
    private exchangeRepository: Repository<Exchange>,
    private storageService: StorageService,
  ) {}

  async findAll(): Promise<ExchangeResponse[]> {
    const exchanges = await this.exchangeRepository.find({
      where: { is_active: true },
      order: { name: 'ASC' },
    });

    // Transform exchanges with logo_url
    return exchanges.map((exchange) => this.transformExchangeResponse(exchange));
  }

  /**
   * Transform exchange entity to response format with logo_url
   */
  private transformExchangeResponse(exchange: Exchange): ExchangeResponse {
    return {
      ...exchange,
      logo_url: this.getLogoUrl(exchange.logo_path),
    } as ExchangeResponse;
  }

  /**
   * Generate logo URL from logo_path (always local)
   * @param logoPath - The logo path stored in database
   * @returns The full URL to access the logo image (always local)
   */
  private getLogoUrl(logoPath: string | null): string | null {
    if (!logoPath) {
      return null;
    }

    // Always use local URL (baseUrl already includes uploads folder)
    return this.storageService.getFileLocal(logoPath);
  }
}
