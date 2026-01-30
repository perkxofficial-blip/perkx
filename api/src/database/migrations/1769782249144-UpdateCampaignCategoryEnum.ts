import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateCampaignCategoryEnum1769782249144 implements MigrationInterface {
  name = 'UpdateCampaignCategoryEnum1769782249144';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Create new enum type with updated values
    await queryRunner.query(`
      CREATE TYPE "campaign_category_enum_new"
      AS ENUM ('new_user', 'trading_competition')
    `);

    // 2. Convert column to text temporarily to update values
    await queryRunner.query(`
      ALTER TABLE campaigns
      ALTER COLUMN category TYPE text
      USING category::text
    `);

    // 3. Update existing records: convert old values to new values
    await queryRunner.query(`
      UPDATE campaigns
      SET category = CASE
        WHEN category = 'New User' THEN 'new_user'
        WHEN category = 'Trading Competition' THEN 'trading_competition'
        ELSE NULL
      END
      WHERE category IS NOT NULL
    `);

    // 4. Alter the column to use the new enum type
    await queryRunner.query(`
      ALTER TABLE campaigns
      ALTER COLUMN category TYPE campaign_category_enum_new
      USING category::campaign_category_enum_new
    `);

    // 5. Drop the old enum type
    await queryRunner.query(`
      DROP TYPE "campaign_category_enum"
    `);

    // 6. Rename the new enum type to the original name
    await queryRunner.query(`
      ALTER TYPE "campaign_category_enum_new" RENAME TO "campaign_category_enum"
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 1. Create old enum type
    await queryRunner.query(`
      CREATE TYPE "campaign_category_enum_old"
      AS ENUM ('New User', 'Trading Competition')
    `);

    // 2. Convert column to text temporarily to update values
    await queryRunner.query(`
      ALTER TABLE campaigns
      ALTER COLUMN category TYPE text
      USING category::text
    `);

    // 3. Update existing records: convert new values back to old values
    await queryRunner.query(`
      UPDATE campaigns
      SET category = CASE
        WHEN category = 'new_user' THEN 'New User'
        WHEN category = 'trading_competition' THEN 'Trading Competition'
        ELSE NULL
      END
      WHERE category IS NOT NULL
    `);

    // 4. Alter the column to use the old enum type
    await queryRunner.query(`
      ALTER TABLE campaigns
      ALTER COLUMN category TYPE campaign_category_enum_old
      USING category::campaign_category_enum_old
    `);

    // 5. Drop the new enum type
    await queryRunner.query(`
      DROP TYPE "campaign_category_enum"
    `);

    // 6. Rename the old enum type to the original name
    await queryRunner.query(`
      ALTER TYPE "campaign_category_enum_old" RENAME TO "campaign_category_enum"
    `);
  }
}
