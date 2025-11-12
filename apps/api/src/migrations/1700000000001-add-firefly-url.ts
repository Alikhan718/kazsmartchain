import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFireflyUrl1700000000001 implements MigrationInterface {
  name = 'AddFireflyUrl1700000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE organizations ADD COLUMN IF NOT EXISTS "fireflyBaseUrl" varchar`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE organizations DROP COLUMN IF EXISTS "fireflyBaseUrl"`);
  }
}


