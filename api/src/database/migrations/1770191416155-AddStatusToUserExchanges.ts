import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStatusToUserExchanges1770191416155 implements MigrationInterface {
  name = 'AddStatusToUserExchanges1770191416155';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum type
    await queryRunner.query(`
      CREATE TYPE "user_exchange_status_enum" AS ENUM ('ACTIVE', 'PENDING', 'REJECTED')
    `);

    // Add new status column with default value
    await queryRunner.query(`
      ALTER TABLE "user_exchanges" 
      ADD COLUMN "status" "user_exchange_status_enum" NOT NULL DEFAULT 'PENDING'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop status column
    await queryRunner.query(`
      ALTER TABLE "user_exchanges" DROP COLUMN "status"
    `);

    // Drop enum type
    await queryRunner.query(`
      DROP TYPE "user_exchange_status_enum"
    `);
  }
}
