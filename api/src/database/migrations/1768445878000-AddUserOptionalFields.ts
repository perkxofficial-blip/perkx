import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserOptionalFields1768445878000 implements MigrationInterface {
  name = 'AddUserOptionalFields1768445878000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "user_gender_enum" AS ENUM ('Male', 'Female')
    `);

    await queryRunner.query(`
      ALTER TABLE "users"
      ADD COLUMN "birthday" date,
      ADD COLUMN "gender" "user_gender_enum",
      ADD COLUMN "country" character varying
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
      DROP COLUMN "country",
      DROP COLUMN "gender",
      DROP COLUMN "birthday"
    `);

    await queryRunner.query(`
      DROP TYPE "user_gender_enum"
    `);
  }
}
