import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateUsersAddReferralFields1768276540203 implements MigrationInterface {
  name = 'UpdateUsersAddReferralFields1768276540203';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users"
            RENAME COLUMN "firstName" TO "first_name"`);
    await queryRunner.query(`ALTER TABLE "users"
            RENAME COLUMN "lastName" TO "last_name"`);
    await queryRunner.query(`ALTER TABLE "users"
            RENAME COLUMN "isActive" TO "is_active"`);
    await queryRunner.query(`ALTER TABLE "users"
            RENAME COLUMN "createdAt" TO "created_at"`);
    await queryRunner.query(`ALTER TABLE "users"
            RENAME COLUMN "updatedAt" TO "updated_at"`);
    await queryRunner.query(`ALTER TABLE "admins"
            RENAME COLUMN "isActive" TO "is_active"`);
    await queryRunner.query(`ALTER TABLE "admins"
            RENAME COLUMN "createdAt" TO "created_at"`);
    await queryRunner.query(`ALTER TABLE "admins"
            RENAME COLUMN "updatedAt" TO "updated_at"`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD "referral_code" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "UQ_ba10055f9ef9690e77cf6445cba" UNIQUE ("referral_code")`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "referral_user_id" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "email_verified_at" TIMESTAMP`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_bdc9d9d2cfa7df73ecc81c7cf3" ON "users" ("referral_user_id") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users"
            RENAME COLUMN "first_name" TO "firstName"`);
    await queryRunner.query(`ALTER TABLE "users"
            RENAME COLUMN "last_name" TO "lastName"`);
    await queryRunner.query(`ALTER TABLE "users"
            RENAME COLUMN "is_active" TO "isActive"`);
    await queryRunner.query(`ALTER TABLE "users"
            RENAME COLUMN "created_at" TO "createdAt"`);
    await queryRunner.query(`ALTER TABLE "users"
            RENAME COLUMN "updated_at" TO "updatedAt"`);
    await queryRunner.query(`ALTER TABLE "admins"
            RENAME COLUMN "is_active" TO "isActive"`);
    await queryRunner.query(`ALTER TABLE "admins"
            RENAME COLUMN "created_at" TO "createdAt"`);
    await queryRunner.query(`ALTER TABLE "admins"
            RENAME COLUMN "updated_at" TO "updatedAt"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_bdc9d9d2cfa7df73ecc81c7cf3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "email_verified_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "referral_user_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "UQ_ba10055f9ef9690e77cf6445cba"`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "referral_code"`);
  }
}
