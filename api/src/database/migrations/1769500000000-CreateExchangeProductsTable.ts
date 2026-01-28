import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateExchangeProductsTable1769500000000
  implements MigrationInterface
{
  name = 'CreateExchangeProductsTable1769500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'exchange_products',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'exchange_name',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'exchange_signup_link',
            type: 'text',
          },
          {
            name: 'product_name',
            type: 'varchar',
            length: '200',
          },
          {
            name: 'discount',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
          {
            name: 'default_fee_maker',
            type: 'decimal',
            precision: 10,
            scale: 4,
          },
          {
            name: 'default_fee_taker',
            type: 'decimal',
            precision: 10,
            scale: 4,
          },
          {
            name: 'final_fee_maker',
            type: 'decimal',
            precision: 10,
            scale: 4,
          },
          {
            name: 'final_fee_taker',
            type: 'decimal',
            precision: 10,
            scale: 4,
          },
          {
            name: 'ave_rebate',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('exchange_products');
  }
}
