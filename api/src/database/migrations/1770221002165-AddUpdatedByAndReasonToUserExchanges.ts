import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUpdatedByAndReasonToUserExchanges1770221002165 implements MigrationInterface {
  name = 'AddUpdatedByAndReasonToUserExchanges1770221002165';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add updated_by column
    await queryRunner.query(`
      ALTER TABLE "user_exchanges" 
      ADD COLUMN "updated_by" character varying
    `);

    // Add reason column
    await queryRunner.query(`
      ALTER TABLE "user_exchanges" 
      ADD COLUMN "reason" character varying
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop reason column
    await queryRunner.query(`
      ALTER TABLE "user_exchanges" DROP COLUMN "reason"
    `);

    // Drop updated_by column
    await queryRunner.query(`
      ALTER TABLE "user_exchanges" DROP COLUMN "updated_by"
    `);
  }
}
