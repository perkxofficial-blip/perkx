import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class UpdateCampaignTable1769102134100 implements MigrationInterface {
  name = 'UpdateCampaignTable1769102134100';

  public async up(queryRunner: QueryRunner): Promise<void> {
    /* 1. Create enum type */
    await queryRunner.query(`
      CREATE TYPE "campaign_category_enum"
      AS ENUM ('New User', 'Trading Competition')
    `);

    /* 2. Rename banner_url -> banner_path */
    await queryRunner.renameColumn(
      'campaigns',
      'banner_url',
      'banner_path',
    );

    /* 3. Add new columns */
    await queryRunner.addColumns('campaigns', [
      new TableColumn({
        name: 'preview_start',
        type: 'timestamp',
        isNullable: true,
      }),
      new TableColumn({
        name: 'preview_end',
        type: 'timestamp',
        isNullable: true,
      }),
      new TableColumn({
        name: 'launch_start',
        type: 'timestamp',
        isNullable: false,
      }),
      new TableColumn({
        name: 'launch_end',
        type: 'timestamp',
        isNullable: false,
      }),
      new TableColumn({
        name: 'archive_start',
        type: 'timestamp',
        isNullable: true,
      }),
      new TableColumn({
        name: 'archive_end',
        type: 'timestamp',
        isNullable: true,
      }),
      new TableColumn({
        name: 'featured',
        type: 'boolean',
        isNullable: false,
        default: false,
      }),
      new TableColumn({
        name: 'category',
        type: 'campaign_category_enum',
        isNullable: true,
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    /* 1. Drop added columns */
    await queryRunner.dropColumns('campaigns', [
      'category',
      'featured',
      'archive_end',
      'archive_start',
      'launch_end',
      'launch_start',
      'preview_end',
      'preview_start',
    ]);

    /* 2. Rename banner_path -> banner_url */
    await queryRunner.renameColumn(
      'campaigns',
      'banner_path',
      'banner_url',
    );

    /* 3. Drop enum type */
    await queryRunner.query(`
      DROP TYPE "campaign_category_enum"
    `);
  }
}
