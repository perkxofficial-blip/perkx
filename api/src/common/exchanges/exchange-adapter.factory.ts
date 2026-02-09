import { Injectable, BadRequestException } from '@nestjs/common';
import { ExchangeAdapter } from './exchange-adapter.interface';
import { BingxAdapter } from './adapters/bingx.adapter';
import { BinanceAdapter } from './adapters/binance.adapter';
import { BybitAdapter } from './adapters/bybit.adapter';
import { OkxAdapter } from './adapters/okx.adapter';
import { BitgetAdapter } from './adapters/bitget.adapter';
import { GateioAdapter } from './adapters/gateio.adapter';
import { WeexAdapter } from './adapters/weex.adapter';
import { KucoinAdapter } from './adapters/kucoin.adapter';
import { ZoomexAdapter } from './adapters/zoomex.adapter';
import { HyperliquidAdapter } from './adapters/hyperliquid.adapter';

@Injectable()
export class ExchangeAdapterFactory {
  private readonly adapters: Map<string, ExchangeAdapter> = new Map();

  constructor(
    private readonly bingxAdapter: BingxAdapter,
    private readonly binanceAdapter: BinanceAdapter,
    private readonly bybitAdapter: BybitAdapter,
    private readonly okxAdapter: OkxAdapter,
    private readonly bitgetAdapter: BitgetAdapter,
    private readonly gateioAdapter: GateioAdapter,
    private readonly weexAdapter: WeexAdapter,
    private readonly kucoinAdapter: KucoinAdapter,
    private readonly zoomexAdapter: ZoomexAdapter,
    private readonly hyperliquidAdapter: HyperliquidAdapter,
  ) {
    this.adapters.set('bingx', this.bingxAdapter);
    this.adapters.set('binance', this.binanceAdapter);
    this.adapters.set('bybit', this.bybitAdapter);
    this.adapters.set('okx', this.okxAdapter);
    this.adapters.set('bitget', this.bitgetAdapter);
    this.adapters.set('gateio', this.gateioAdapter);
    this.adapters.set('weex', this.weexAdapter);
    this.adapters.set('kucoin', this.kucoinAdapter);
    this.adapters.set('zoomex', this.zoomexAdapter);
    this.adapters.set('hyperliquid', this.hyperliquidAdapter);
  }

  /**
   * Get adapter for a specific exchange code
   * @param exchangeCode - Exchange code (e.g., 'bingx', 'binance')
   * @returns Exchange adapter instance
   * @throws BadRequestException if exchange is not supported
   */
  getAdapter(exchangeCode: string): ExchangeAdapter {
    const normalizedCode = exchangeCode.toLowerCase();
    const adapter = this.adapters.get(normalizedCode);

    if (!adapter) {
      throw new BadRequestException(
        `Exchange '${exchangeCode}' is not supported. Supported exchanges: ${Array.from(this.adapters.keys()).join(', ')}`,
      );
    }

    return adapter;
  }

  /**
   * Check if an exchange is supported
   */
  isSupported(exchangeCode: string): boolean {
    return this.adapters.has(exchangeCode.toLowerCase());
  }
}
