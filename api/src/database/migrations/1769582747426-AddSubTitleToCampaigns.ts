import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddSubTitleToCampaigns1769582747426 implements MigrationInterface {
  name = 'AddSubTitleToCampaigns1769582747426';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'campaigns',
      new TableColumn({
        name: 'sub_title',
        type: 'varchar',
        length: '255',
        isNullable: false,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('campaigns', 'sub_title');
  }
}
