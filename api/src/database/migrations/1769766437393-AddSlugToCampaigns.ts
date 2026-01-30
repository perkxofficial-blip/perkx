import { MigrationInterface, QueryRunner, TableColumn, TableIndex } from 'typeorm';

export class AddSlugToCampaigns1769766437393 implements MigrationInterface {
  name = 'AddSlugToCampaigns1769766437393';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'campaigns',
      new TableColumn({
        name: 'slug',
        type: 'varchar',
        length: '255',
        isNullable: true,
      }),
    );

    // Create index on slug for faster lookups
    await queryRunner.createIndex(
      'campaigns',
      new TableIndex({
        name: 'IDX_campaigns_slug',
        columnNames: ['slug'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('campaigns', 'IDX_campaigns_slug');
    await queryRunner.dropColumn('campaigns', 'slug');
  }
}
