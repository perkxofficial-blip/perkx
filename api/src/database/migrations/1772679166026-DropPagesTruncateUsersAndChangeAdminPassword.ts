import { MigrationInterface, QueryRunner } from "typeorm";
import * as bcrypt from 'bcrypt';

export class DropPagesTruncateUsersAndChangeAdminPassword1772679166026 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Drop table pages
        await queryRunner.query(`DROP TABLE IF EXISTS pages`);

        // Truncate access_logs
        await queryRunner.query(`TRUNCATE TABLE access_logs`);

        // Add foreign key constraints
        // Users self-reference for referral
        await queryRunner.query(`
            ALTER TABLE users ADD CONSTRAINT fk_users_referral_user_id 
            FOREIGN KEY (referral_user_id) REFERENCES users(id) ON DELETE SET NULL
        `);

        // User exchanges
        await queryRunner.query(`
            ALTER TABLE user_exchanges ADD CONSTRAINT fk_user_exchanges_user_id 
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        `);
        await queryRunner.query(`
            ALTER TABLE user_exchanges ADD CONSTRAINT fk_user_exchanges_exchange_id 
            FOREIGN KEY (exchange_id) REFERENCES exchanges(id) ON DELETE CASCADE
        `);

        // User login otps
        await queryRunner.query(`
            ALTER TABLE user_login_otps ADD CONSTRAINT fk_user_login_otps_user_id 
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        `);

        // User password resets
        await queryRunner.query(`
            ALTER TABLE user_password_resets ADD CONSTRAINT fk_user_password_resets_user_id 
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        `);

        // User email verifications
        await queryRunner.query(`
            ALTER TABLE user_email_verifications ADD CONSTRAINT fk_user_email_verifications_user_id 
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        `);

        // Access logs
        await queryRunner.query(`
            ALTER TABLE access_logs ADD CONSTRAINT fk_access_logs_user_id 
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        `);

        console.log('✅ Migration completed: Admin password changed, pages table dropped, user-related tables truncated, foreign keys added.');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Note: This migration performs destructive operations (drop table, truncate).
        // Down migration cannot fully revert these changes.
        // You may need to manually restore data or recreate tables if necessary.
        console.log('⚠️  Down migration: Cannot revert drop table and truncate operations.');
    }

}
