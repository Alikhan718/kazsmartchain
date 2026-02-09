import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBiometricFields1704000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add biometric KYC fields to users table
    await queryRunner.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS iin VARCHAR(12) UNIQUE,
      ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
      ADD COLUMN IF NOT EXISTS biometric_verified BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS biometric_session_id VARCHAR(255);
    `);

    // Create index on IIN for fast lookups
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_users_iin ON users(iin);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_users_iin;`);
    await queryRunner.query(`
      ALTER TABLE users 
      DROP COLUMN IF EXISTS iin,
      DROP COLUMN IF EXISTS phone,
      DROP COLUMN IF EXISTS biometric_verified,
      DROP COLUMN IF EXISTS biometric_session_id;
    `);
  }
}
