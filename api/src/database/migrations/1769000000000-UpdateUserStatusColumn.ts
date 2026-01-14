import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateUserStatusColumn1769000000000 implements MigrationInterface {
  name = 'UpdateUserStatusColumn1769000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum type
    await queryRunner.query(`
      CREATE TYPE "user_status_enum" AS ENUM ('INACTIVE', 'ACTIVE', 'DEACTIVATE')
    `);

    // Add new status column with default value
    await queryRunner.query(`
      ALTER TABLE "users" 
      ADD COLUMN "status" "user_status_enum" NOT NULL DEFAULT 'INACTIVE'
    `);

    // Migrate existing data: true -> 'ACTIVE', false -> 'INACTIVE'
    await queryRunner.query(`
      UPDATE "users" 
      SET "status" = CASE 
        WHEN "is_active" = true THEN 'ACTIVE'::user_status_enum
        ELSE 'INACTIVE'::user_status_enum
      END
    `);

    // Drop old is_active column
    await queryRunner.query(`
      ALTER TABLE "users" DROP COLUMN "is_active"
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Add back is_active column
    await queryRunner.query(`
      ALTER TABLE "users" 
      ADD COLUMN "is_active" boolean NOT NULL DEFAULT true
    `);

    // Migrate data back: 'ACTIVE' -> true, others -> false
    await queryRunner.query(`
      UPDATE "users" 
      SET "is_active" = CASE 
        WHEN "status" = 'ACTIVE' THEN true
        ELSE false
      END
    `);

    // Drop status column
    await queryRunner.query(`
      ALTER TABLE "users" DROP COLUMN "status"
    `);

    // Drop enum type
    await queryRunner.query(`
      DROP TYPE "user_status_enum"
    `);
  }
}
