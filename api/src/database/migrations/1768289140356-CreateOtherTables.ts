import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateTableOthers1768289140356 implements MigrationInterface {
  name = 'CreateTableOthers1768289140356';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // user_password_resets
    await queryRunner.createTable(
      new Table({
        name: 'user_password_resets',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          { name: 'user_id', type: 'int' },
          { name: 'token', type: 'varchar', length: '255' },
          { name: 'expires_at', type: 'timestamp' },
          { name: 'used_at', type: 'timestamp', isNullable: true },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'user_password_resets',
      new TableIndex({
        name: 'IDX_user_password_resets_token',
        columnNames: ['token'],
        isUnique: true,
      }),
    );

    // user_login_otps
    await queryRunner.createTable(
      new Table({
        name: 'user_login_otps',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          { name: 'user_id', type: 'int' },
          { name: 'otp_code', type: 'varchar', length: '10' },
          {
            name: 'attempt_count',
            type: 'int',
            default: 0,
          },
          { name: 'expires_at', type: 'timestamp' },
          { name: 'verified_at', type: 'timestamp', isNullable: true },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'user_login_otps',
      new TableIndex({
        name: 'IDX_user_login_otps_user_id',
        columnNames: ['user_id'],
        isUnique: true,
      }),
    );

    // user_email_verifications
    await queryRunner.createTable(
      new Table({
        name: 'user_email_verifications',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          { name: 'user_id', type: 'int' },
          { name: 'token', type: 'varchar', length: '255' },
          { name: 'expires_at', type: 'timestamp' },
          { name: 'verified_at', type: 'timestamp', isNullable: true },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'user_email_verifications',
      new TableIndex({
        name: 'IDX_user_email_verifications_token',
        columnNames: ['token'],
        isUnique: true,
      }),
    );

    // user_exchanges
    await queryRunner.createTable(
      new Table({
        name: 'user_exchanges',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'user_id',
            type: 'int',
          },
          {
            name: 'exchange_id',
            type: 'int',
          },
          {
            name: 'exchange_uid',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true,
    );

    // CREATE INDEX ON exchange_uid
    await queryRunner.createIndex(
      'user_exchanges',
      new TableIndex({
        name: 'IDX_user_exchanges_exchange_uid',
        columnNames: ['exchange_uid'],
      }),
    );

    // CREATE UNIQUE INDEX ON (exchange_id, exchange_uid)
    await queryRunner.createIndex(
      'user_exchanges',
      new TableIndex({
        name: 'IDX_user_exchanges_exchange_exchange_uid',
        columnNames: ['exchange_id', 'exchange_uid'],
        isUnique: true,
      }),
    );

    // CREATE UNIQUE INDEX ON (user_id, exchange_id)
    await queryRunner.createIndex(
      'user_exchanges',
      new TableIndex({
        name: 'IDX_user_exchanges_user_exchange',
        columnNames: ['user_id', 'exchange_id'],
        isUnique: true,
      }),
    );

    // pages
    await queryRunner.createTable(
      new Table({
        name: 'pages',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          { name: 'slug', type: 'varchar', length: '100' },
          { name: 'content', type: 'jsonb' },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    // exchanges
    await queryRunner.createTable(
      new Table({
        name: 'exchanges',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          { name: 'name', type: 'varchar', length: '100' },
          { name: 'code', type: 'varchar', length: '50' },
          { name: 'affiliate_link', type: 'text' },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'exchanges',
      new TableIndex({
        name: 'IDX_exchanges_code',
        columnNames: ['code'],
        isUnique: true,
      }),
    );

    // campaigns
    await queryRunner.createTable(
      new Table({
        name: 'campaigns',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          { name: 'exchange_id', type: 'int', isNullable: true },
          { name: 'title', type: 'varchar', length: '255' },
          { name: 'description', type: 'text' },
          { name: 'banner_url', type: 'text' },
          { name: 'redirect_url', type: 'text', isNullable: true },
          { name: 'is_active', type: 'boolean', default: true },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'campaigns',
      new TableIndex({
        name: 'IDX_campaigns_exchange_id',
        columnNames: ['exchange_id'],
      }),
    );

    // access_logs
    await queryRunner.createTable(
      new Table({
        name: 'access_logs',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          { name: 'user_id', type: 'int' },
          { name: 'ip_address', type: 'varchar', length: '45' },
          { name: 'user_agent', type: 'text', isNullable: true },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'access_logs',
      new TableIndex({
        name: 'IDX_access_logs_user_id',
        columnNames: ['user_id'],
      }),
    );

    await queryRunner.createIndex(
      'access_logs',
      new TableIndex({
        name: 'IDX_access_logs_ip_address',
        columnNames: ['ip_address'],
      }),
    );

    // access_block_rules
    await queryRunner.createTable(
      new Table({
        name: 'access_block_rules',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'ip_address',
            type: 'varchar',
            length: '45',
            isNullable: true,
          },
          { name: 'reason', type: 'varchar', length: '255', isNullable: true },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true,
    );

    // ALTER users / admins
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "first_name" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "last_name" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "created_at" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "updated_at" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "admins" ALTER COLUMN "created_at" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "admins" ALTER COLUMN "updated_at" SET DEFAULT now()`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('access_block_rules');
    await queryRunner.dropTable('access_logs');
    await queryRunner.dropTable('campaigns');
    await queryRunner.dropTable('exchanges');
    await queryRunner.dropTable('pages');
    await queryRunner.dropTable('user_email_verifications');
    await queryRunner.dropTable('user_login_otps');
    await queryRunner.dropTable('user_password_resets');
  }
}
