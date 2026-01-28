import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Exchange, ExchangeProduct } from '../../../entities';
import { StorageService } from '../../../common/storage/storage.service';

type ExchangeProductResponse = {
  id: number;
  exchange_name: string;
  exchange_signup_link: string;
  product_name: string;
  discount: number;
  default_fee_maker: number;
  default_fee_taker: number;
  final_fee_maker: number;
  final_fee_taker: number;
  ave_rebate: number | null;
  created_at: Date;
  updated_at: Date;
};

type ExchangeResponse = Exchange & {
  logo_url: string | null;
  products: ExchangeProductResponse[];
};

@Injectable()
export class PublicExchangesService {
  constructor(
    @InjectRepository(Exchange)
    private exchangeRepository: Repository<Exchange>,
    @InjectRepository(ExchangeProduct)
    private exchangeProductRepository: Repository<ExchangeProduct>,
    private storageService: StorageService,
  ) {}

  async findAll(): Promise<ExchangeResponse[]> {
    const exchanges = await this.exchangeRepository.find({
      where: { is_active: true },
      order: { name: 'ASC' },
    });

    // Get all exchange products
    const allProducts = await this.exchangeProductRepository.find({
      order: { product_name: 'ASC' },
    });

    // Transform exchanges with logo_url and products
    return exchanges.map((exchange) =>
      this.transformExchangeResponse(exchange, allProducts),
    );
  }

  /**
   * Transform exchange entity to response format with logo_url and products
   */
  private transformExchangeResponse(
    exchange: Exchange,
    allProducts: ExchangeProduct[],
  ): ExchangeResponse {
    const products = allProducts
      .filter(
        (product) =>
          product.exchange_name.toLowerCase() === exchange.code.toLowerCase(),
      )
      .map((product) => ({
        id: product.id,
        exchange_name: product.exchange_name,
        exchange_signup_link: product.exchange_signup_link,
        product_name: product.product_name,
        discount: Number(product.discount),
        default_fee_maker: Number(product.default_fee_maker),
        default_fee_taker: Number(product.default_fee_taker),
        final_fee_maker: Number(product.final_fee_maker),
        final_fee_taker: Number(product.final_fee_taker),
        ave_rebate: product.ave_rebate ? Number(product.ave_rebate) : null,
        created_at: product.created_at,
        updated_at: product.updated_at,
      }));

    return {
      ...exchange,
      logo_url: this.getLogoUrl(exchange.logo_path),
      products,
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
