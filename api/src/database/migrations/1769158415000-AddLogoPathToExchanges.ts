import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddLogoPathToExchanges1769158415000 implements MigrationInterface {
  name = 'AddLogoPathToExchanges1769158415000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add logo_path column
    await queryRunner.addColumn(
      'exchanges',
      new TableColumn({
        name: 'logo_path',
        type: 'text',
        isNullable: true,
      }),
    );

    // Update logo_path for existing exchanges
    const exchangeLogos = [
      { code: 'binance', logo_path: 'public/images/exchanges/binance.png' },
      { code: 'bybit', logo_path: 'public/images/exchanges/bybit.png' },
      { code: 'okx', logo_path: 'public/images/exchanges/okx.png' },
      { code: 'bitget', logo_path: 'public/images/exchanges/bitget.png' },
      { code: 'bingx', logo_path: 'public/images/exchanges/bingx.png' },
      { code: 'gateio', logo_path: 'public/images/exchanges/gateio.png' },
      { code: 'weex', logo_path: 'public/images/exchanges/weex.png' },
      { code: 'kucoin', logo_path: 'public/images/exchanges/kucoin.png' },
      { code: 'zoomex', logo_path: 'public/images/exchanges/zoomex.png' },
      { code: 'hyperliquid', logo_path: 'public/images/exchanges/hyperliquid.png' },
    ];

    // Update logo_path for each exchange
    for (const exchange of exchangeLogos) {
      await queryRunner.query(
        `UPDATE exchanges 
         SET logo_path = $1, updated_at = NOW() 
         WHERE code = $2`,
        [exchange.logo_path, exchange.code],
      );
    }

    console.log(`✅ Added logo_path column and updated ${exchangeLogos.length} exchanges`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('exchanges', 'logo_path');
  }
}
