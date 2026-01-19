import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class UpdateCampaignTable1737021341000 implements MigrationInterface {
  name = 'UpdateCampaignTable1737021341000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum type for category
    await queryRunner.query(`
      CREATE TYPE "campaign_category_enum" AS ENUM ('New User', 'Trading Competition')
    `);

    // Add columns
    await queryRunner.addColumns('campaigns', [
      new TableColumn({
        name: 'preview_start',
        type: 'date',
        isNullable: true,
      }),
      new TableColumn({
        name: 'preview_end',
        type: 'date',
        isNullable: true,
      }),
      new TableColumn({
        name: 'launch_start',
        type: 'date',
      }),
      new TableColumn({
        name: 'launch_end',
        type: 'date',
      }),
      new TableColumn({
        name: 'archive_start',
        type: 'date',
        isNullable: true,
      }),
      new TableColumn({
        name: 'archive_end',
        type: 'date',
        isNullable: true,
      }),
      new TableColumn({
        name: 'featured',
        type: 'boolean',
        default: false,
      }),
    ]);

    // Add category column with enum type using raw SQL
    await queryRunner.query(`
      ALTER TABLE "campaigns" 
      ADD COLUMN "category" "campaign_category_enum"
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('campaigns', 'IDX_campaigns_launch_end');
    await queryRunner.dropIndex('campaigns', 'IDX_campaigns_launch_start');

    await queryRunner.dropColumns('campaigns', [
      'featured',
      'archive_end',
      'archive_start',
      'launch_end',
      'launch_start',
      'preview_end',
      'preview_start',
    ]);

    // Drop category column
    await queryRunner.query(`
      ALTER TABLE "campaigns" DROP COLUMN "category"
    `);

    // Drop enum type
    await queryRunner.query(`
      DROP TYPE "campaign_category_enum"
    `);
  }
}
