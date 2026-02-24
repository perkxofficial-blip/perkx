import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateAdminPasswordResetTable1768101884542 implements MigrationInterface {
  name = 'CreateAdminPasswordResetTable1768101884542';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'admin_password_resets',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'admin_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'token',
            type: 'varchar',
            length: '255',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'expires_at',
            type: 'timestamp',
            isNullable: false,
          },
          {
            name: 'used_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
        ],
      }),
      true,
    );

    // Create foreign key to admins table
    await queryRunner.query(`
      ALTER TABLE admin_password_resets 
      ADD CONSTRAINT FK_admin_password_resets_admin_id 
      FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('admin_password_resets');
  }
}