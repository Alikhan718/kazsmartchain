import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class AddAuthTables1703000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Добавить поля в таблицу users
    await queryRunner.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS certificate_serial VARCHAR(255) UNIQUE,
      ADD COLUMN IF NOT EXISTS certificate_subject JSONB,
      ADD COLUMN IF NOT EXISTS certificate_issuer JSONB,
      ADD COLUMN IF NOT EXISTS certificate_valid_from TIMESTAMP,
      ADD COLUMN IF NOT EXISTS certificate_valid_to TIMESTAMP;
    `);

    // Создать индекс на certificate_serial
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_users_certificate_serial 
      ON users(certificate_serial);
    `);

    // Добавить поля в таблицу organizations
    await queryRunner.query(`
      ALTER TABLE organizations 
      ADD COLUMN IF NOT EXISTS bin VARCHAR(255) UNIQUE,
      ADD COLUMN IF NOT EXISTS email_domain VARCHAR(255);
    `);

    // Создать индекс на bin
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_organizations_bin 
      ON organizations(bin);
    `);

    // Создать таблицу certificates
    await queryRunner.createTable(
      new Table({
        name: 'certificates',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          {
            name: 'serial_number',
            type: 'varchar',
            length: '255',
            isUnique: true,
            isNullable: false,
          },
          {
            name: 'subject',
            type: 'jsonb',
            isNullable: false,
          },
          {
            name: 'issuer',
            type: 'jsonb',
            isNullable: false,
          },
          {
            name: 'certificate_data',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'valid_from',
            type: 'timestamp',
            isNullable: false,
          },
          {
            name: 'valid_to',
            type: 'timestamp',
            isNullable: false,
          },
          {
            name: 'revoked',
            type: 'boolean',
            default: false,
          },
          {
            name: 'revoked_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'revoked_reason',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'NOW()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'NOW()',
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'certificates',
      new TableIndex({
        name: 'idx_certificates_serial_number',
        columnNames: ['serial_number'],
      }),
    );

    await queryRunner.createIndex(
      'certificates',
      new TableIndex({
        name: 'idx_certificates_revoked',
        columnNames: ['revoked'],
      }),
    );

    // Создать таблицу auth_challenges
    await queryRunner.createTable(
      new Table({
        name: 'auth_challenges',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          {
            name: 'nonce',
            type: 'varchar',
            length: '255',
            isUnique: true,
            isNullable: false,
          },
          {
            name: 'challenge',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'expires_at',
            type: 'timestamp',
            isNullable: false,
          },
          {
            name: 'used',
            type: 'boolean',
            default: false,
          },
          {
            name: 'used_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'ip_address',
            type: 'varchar',
            length: '45',
            isNullable: true,
          },
          {
            name: 'user_agent',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'NOW()',
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'auth_challenges',
      new TableIndex({
        name: 'idx_auth_challenges_nonce',
        columnNames: ['nonce'],
        isUnique: true,
      }),
    );

    await queryRunner.createIndex(
      'auth_challenges',
      new TableIndex({
        name: 'idx_auth_challenges_expires_at',
        columnNames: ['expires_at'],
      }),
    );

    await queryRunner.createIndex(
      'auth_challenges',
      new TableIndex({
        name: 'idx_auth_challenges_used',
        columnNames: ['used'],
      }),
    );

    // Создать таблицу refresh_tokens
    await queryRunner.createTable(
      new Table({
        name: 'refresh_tokens',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          {
            name: 'userId',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'token',
            type: 'varchar',
            length: '255',
            isUnique: true,
            isNullable: false,
          },
          {
            name: 'expires_at',
            type: 'timestamp',
            isNullable: false,
          },
          {
            name: 'revoked',
            type: 'boolean',
            default: false,
          },
          {
            name: 'revoked_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'ip_address',
            type: 'varchar',
            length: '45',
            isNullable: true,
          },
          {
            name: 'user_agent',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'NOW()',
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'refresh_tokens',
      new TableForeignKey({
        columnNames: ['userId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    // Индекс на userId создается автоматически через @Index() декоратор на ManyToOne
    // Не нужно создавать отдельный индекс

    await queryRunner.createIndex(
      'refresh_tokens',
      new TableIndex({
        name: 'idx_refresh_tokens_token',
        columnNames: ['token'],
        isUnique: true,
      }),
    );

    await queryRunner.createIndex(
      'refresh_tokens',
      new TableIndex({
        name: 'idx_refresh_tokens_expires_at',
        columnNames: ['expires_at'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Удалить таблицы в обратном порядке
    await queryRunner.dropTable('refresh_tokens', true);
    await queryRunner.dropTable('auth_challenges', true);
    await queryRunner.dropTable('certificates', true);

    // Удалить индексы и колонки из users
    await queryRunner.query(`
      DROP INDEX IF EXISTS idx_users_certificate_serial;
      ALTER TABLE users 
      DROP COLUMN IF EXISTS certificate_serial,
      DROP COLUMN IF EXISTS certificate_subject,
      DROP COLUMN IF EXISTS certificate_issuer,
      DROP COLUMN IF EXISTS certificate_valid_from,
      DROP COLUMN IF EXISTS certificate_valid_to;
    `);

    // Удалить индексы и колонки из organizations
    await queryRunner.query(`
      DROP INDEX IF EXISTS idx_organizations_bin;
      ALTER TABLE organizations 
      DROP COLUMN IF EXISTS bin,
      DROP COLUMN IF EXISTS email_domain;
    `);
  }
}

