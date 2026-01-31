import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateCampaignCategoryEnumToAllUser1769871350301 implements MigrationInterface {
  name = 'UpdateCampaignCategoryEnumToAllUser1769871350301';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Convert column to text temporarily to allow value updates
    await queryRunner.query(`
      ALTER TABLE campaigns
      ALTER COLUMN category TYPE text
      USING category::text
    `);

    // 2. Update existing trading_competition data to all_user (now it's text, so this works)
    await queryRunner.query(`
      UPDATE campaigns
      SET category = 'all_user'
      WHERE category = 'trading_competition'
    `);

    // 3. Create new enum type with updated values (all_user, new_user)
    await queryRunner.query(`
      CREATE TYPE "campaign_category_enum_new"
      AS ENUM ('all_user', 'new_user')
    `);

    // 4. Alter the column to use the new enum type
    await queryRunner.query(`
      ALTER TABLE campaigns
      ALTER COLUMN category TYPE campaign_category_enum_new
      USING category::campaign_category_enum_new
    `);

    // 5. Drop the old enum type
    await queryRunner.query(`
      DROP TYPE IF EXISTS "campaign_category_enum"
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
      AS ENUM ('new_user', 'trading_competition')
    `);

    // 2. Convert column to text temporarily to update values
    await queryRunner.query(`
      ALTER TABLE campaigns
      ALTER COLUMN category TYPE text
      USING category::text
    `);

    // 3. Update existing records: convert all_user back to trading_competition
    await queryRunner.query(`
      UPDATE campaigns
      SET category = CASE
        WHEN category = 'all_user' THEN 'trading_competition'
        WHEN category = 'new_user' THEN 'new_user'
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
      DROP TYPE IF EXISTS "campaign_category_enum"
    `);

    // 6. Rename the old enum type to the original name
    await queryRunner.query(`
      ALTER TYPE "campaign_category_enum_old" RENAME TO "campaign_category_enum"
    `);
  }
}
