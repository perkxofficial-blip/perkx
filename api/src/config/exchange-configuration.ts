export default () => ({
  exchanges: {
    bingx: {
      apiKey: process.env.BINGX_API_KEY,
      apiSecret: process.env.BINGX_API_SECRET,
      passphrase: process.env.BINGX_PASSPHRASE,
      url: process.env.BINGX_URL,
    },
    binance: {
      apiKey: process.env.BINANCE_API_KEY,
      apiSecret: process.env.BINANCE_API_SECRET,
      passphrase: process.env.BINANCE_PASSPHRASE,
      url: process.env.BINANCE_URL,
    },
    bybit: {
      apiKey: process.env.BYBIT_API_KEY,
      apiSecret: process.env.BYBIT_API_SECRET,
      passphrase: process.env.BYBIT_PASSPHRASE,
      url: process.env.BYBIT_URL,
    },
    okx: {
      apiKey: process.env.OKX_API_KEY,
      apiSecret: process.env.OKX_API_SECRET,
      passphrase: process.env.OKX_PASSPHRASE,
      url: process.env.OKX_URL,
    },
    bitget: {
      apiKey: process.env.BITGET_API_KEY,
      apiSecret: process.env.BITGET_API_SECRET,
      passphrase: process.env.BITGET_PASSPHRASE,
      url: process.env.BITGET_URL,
    },
    gateio: {
      apiKey: process.env.GATEIO_API_KEY,
      apiSecret: process.env.GATEIO_API_SECRET,
      passphrase: process.env.GATEIO_PASSPHRASE,
      url: process.env.GATEIO_URL,
    },
    weex: {
      apiKey: process.env.WEEX_API_KEY,
      apiSecret: process.env.WEEX_API_SECRET,
      passphrase: process.env.WEEX_PASSPHRASE,
      url: process.env.WEEX_URL,
    },
    kucoin: {
      apiKey: process.env.KUCOIN_API_KEY,
      apiSecret: process.env.KUCOIN_API_SECRET,
      passphrase: process.env.KUCOIN_PASSPHRASE,
      url: process.env.KUCOIN_URL,
    },
    zoomex: {
      apiKey: process.env.ZOOMEX_API_KEY,
      apiSecret: process.env.ZOOMEX_API_SECRET,
      passphrase: process.env.ZOOMEX_PASSPHRASE,
      url: process.env.ZOOMEX_URL,
    },
  },
});
