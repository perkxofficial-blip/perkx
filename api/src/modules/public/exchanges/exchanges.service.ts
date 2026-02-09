import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
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
    // Get all exchange products first
    const allProducts = await this.exchangeProductRepository.find({
      order: { id: 'ASC' },
    });

    // Get unique exchange codes from products in order of first appearance
    // This preserves the order based on exchange_product table
    const exchangeOrder: string[] = [];
    const exchangeCodesSet = new Set<string>();
    for (const product of allProducts) {
      const key = product.exchange_name.toLowerCase();
      if (!exchangeCodesSet.has(key)) {
        exchangeCodesSet.add(key);
        exchangeOrder.push(key);
      }
    }

    if (exchangeCodesSet.size === 0) {
      return [];
    }

    // Query only exchanges that have products and are active
    const exchanges = await this.exchangeRepository.find({
      where: {
        is_active: true,
        code: In(Array.from(exchangeCodesSet)),
      },
    });

    // Group products by exchange_name in a Map for O(1) lookup
    const productsByExchangeName = new Map<string, ExchangeProduct[]>();
    for (const product of allProducts) {
      const key = product.exchange_name.toLowerCase();
      if (!productsByExchangeName.has(key)) {
        productsByExchangeName.set(key, []);
      }
      productsByExchangeName.get(key)!.push(product);
    }

    // Sort products within each exchange: "Futures Trading" first
    for (const [exchangeKey, products] of productsByExchangeName.entries()) {
      products.sort((a, b) => {
        const aIsFutures = a.product_name === 'Futures Trading';
        const bIsFutures = b.product_name === 'Futures Trading';
        if (aIsFutures && !bIsFutures) return -1;
        if (!aIsFutures && bIsFutures) return 1;
        return 0;
      });
    }

    // Sort exchanges according to the order they appear in exchange_product
    const sortedExchanges = exchanges.sort((a, b) => {
      const indexA = exchangeOrder.indexOf(a.code.toLowerCase());
      const indexB = exchangeOrder.indexOf(b.code.toLowerCase());
      return indexA - indexB;
    });

    // Transform exchanges with logo_url and products
    return sortedExchanges.map((exchange) =>
      this.transformExchangeResponse(
        exchange,
        productsByExchangeName.get(exchange.code.toLowerCase()) || [],
      ),
    );
  }

  /**
   * Transform exchange entity to response format with logo_url and products
   */
  private transformExchangeResponse(
    exchange: Exchange,
    products: ExchangeProduct[],
  ): ExchangeResponse {
    const productResponses = products.map((product) => ({
      ...product,
      discount: typeof product.discount === 'string' ? Number(product.discount) : product.discount,
      default_fee_maker: typeof product.default_fee_maker === 'string' ? Number(product.default_fee_maker) : product.default_fee_maker,
      default_fee_taker: typeof product.default_fee_taker === 'string' ? Number(product.default_fee_taker) : product.default_fee_taker,
      final_fee_maker: typeof product.final_fee_maker === 'string' ? Number(product.final_fee_maker) : product.final_fee_maker,
      final_fee_taker: typeof product.final_fee_taker === 'string' ? Number(product.final_fee_taker) : product.final_fee_taker,
      ave_rebate: product.ave_rebate ? (typeof product.ave_rebate === 'string' ? Number(product.ave_rebate) : product.ave_rebate) : null,
    }));

    return {
      ...exchange,
      logo_url: this.storageService.getFileUrl(exchange.logo_path),
      products: productResponses,
    } as ExchangeResponse;
  }
}
