import { Module } from '@nestjs/common';
import { BingxAdapter } from './adapters/bingx.adapter';
import { BinanceAdapter } from './adapters/binance.adapter';
import { BybitAdapter } from './adapters/bybit.adapter';
import { OkxAdapter } from './adapters/okx.adapter';
import { BitgetAdapter } from './adapters/bitget.adapter';
import { GateioAdapter } from './adapters/gateio.adapter';
import { WeexAdapter } from './adapters/weex.adapter';
import { KucoinAdapter } from './adapters/kucoin.adapter';
import { ZoomexAdapter } from './adapters/zoomex.adapter';
import { ExchangeAdapterFactory } from './exchange-adapter.factory';

@Module({
  providers: [
    BingxAdapter,
    BinanceAdapter,
    BybitAdapter,
    OkxAdapter,
    BitgetAdapter,
    GateioAdapter,
    WeexAdapter,
    KucoinAdapter,
    ZoomexAdapter,
    ExchangeAdapterFactory,
  ],
  exports: [ExchangeAdapterFactory],
})
export class ExchangesModule {}
