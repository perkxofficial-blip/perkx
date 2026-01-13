import { MigrationInterface, QueryRunner } from "typeorm";
import * as bcrypt from 'bcrypt';

export class SeedAdminUser1768101929589 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Hash password cho admin
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);

        // Insert admin user
        await queryRunner.query(`
            INSERT INTO admins (username, email, password, role, permissions, "isActive", "createdAt", "updatedAt")
            VALUES 
            ('admin', 'admin@perkx.com', '${hashedPassword}', 'super_admin', '{}', true, NOW(), NOW())
            ON CONFLICT (username) DO NOTHING;
        `);

        console.log('✅ Admin user created successfully!');
        console.log('Username: admin');
        console.log('Password: admin123');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Xóa admin user khi revert migration
        await queryRunner.query(`
            DELETE FROM admins WHERE username = 'admin';
        `);
    }

}
