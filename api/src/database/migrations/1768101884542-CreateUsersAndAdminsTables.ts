import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateUsersAndAdminsTables1768101884542 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create users table
        await queryRunner.createTable(
        new Table({
            name: 'users',
            columns: [
            {
                name: 'id',
                type: 'int',
                isPrimary: true,
                isGenerated: true,
                generationStrategy: 'increment',
            },
            {
                name: 'email',
                type: 'varchar',
                isUnique: true,
            },
            {
                name: 'password',
                type: 'varchar',
            },
            {
                name: 'firstName',
                type: 'varchar',
            },
            {
                name: 'lastName',
                type: 'varchar',
            },
            {
                name: 'phone',
                type: 'varchar',
                isNullable: true,
            },
            {
                name: 'isActive',
                type: 'boolean',
                default: true,
            },
            {
                name: 'createdAt',
                type: 'timestamp',
                default: 'CURRENT_TIMESTAMP',
            },
            {
                name: 'updatedAt',
                type: 'timestamp',
                default: 'CURRENT_TIMESTAMP',
                onUpdate: 'CURRENT_TIMESTAMP',
            },
            ],
        }),
        true,
        );

        // Create admins table
        await queryRunner.createTable(
        new Table({
            name: 'admins',
            columns: [
            {
                name: 'id',
                type: 'int',
                isPrimary: true,
                isGenerated: true,
                generationStrategy: 'increment',
            },
            {
                name: 'username',
                type: 'varchar',
                isUnique: true,
            },
            {
                name: 'email',
                type: 'varchar',
                isUnique: true,
            },
            {
                name: 'password',
                type: 'varchar',
            },
            {
                name: 'role',
                type: 'varchar',
                default: "'admin'",
            },
            {
                name: 'permissions',
                type: 'text',
                isArray: true,
                default: 'ARRAY[]::text[]',
            },
            {
                name: 'isActive',
                type: 'boolean',
                default: true,
            },
            {
                name: 'createdAt',
                type: 'timestamp',
                default: 'CURRENT_TIMESTAMP',
            },
            {
                name: 'updatedAt',
                type: 'timestamp',
                default: 'CURRENT_TIMESTAMP',
                onUpdate: 'CURRENT_TIMESTAMP',
            },
            ],
        }),
        true,
        );

        console.log('✅ Created tables: users, admins');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('admins');
        await queryRunner.dropTable('users');
        console.log('✅ Dropped tables: users, admins');
    }

}
