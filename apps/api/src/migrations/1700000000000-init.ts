import { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1700000000000 implements MigrationInterface {
  name = 'Init1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Enable UUID generator
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`);
    await queryRunner.query(`
      CREATE TABLE organizations (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        name varchar NOT NULL UNIQUE,
        slug varchar NOT NULL UNIQUE,
        limits jsonb,
        "fireflyBaseUrl" varchar,
        active boolean DEFAULT true,
        "createdAt" timestamptz DEFAULT now(),
        "updatedAt" timestamptz DEFAULT now()
      );
    `);
    await queryRunner.query(`
      CREATE TABLE users (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        email varchar NOT NULL,
        "displayName" varchar,
        "externalId" varchar,
        "walletAddress" varchar,
        "organizationId" uuid REFERENCES organizations(id) ON DELETE SET NULL,
        "createdAt" timestamptz DEFAULT now(),
        "updatedAt" timestamptz DEFAULT now()
      );
    `);
    await queryRunner.query(`
      CREATE TABLE role_assignments (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "organizationId" uuid REFERENCES organizations(id) ON DELETE CASCADE,
        "userId" uuid REFERENCES users(id) ON DELETE CASCADE,
        role varchar NOT NULL,
        "createdAt" timestamptz DEFAULT now(),
        "updatedAt" timestamptz DEFAULT now()
      );
    `);
    await queryRunner.query(`
      CREATE TABLE x509certs (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "organizationId" uuid REFERENCES organizations(id) ON DELETE CASCADE,
        pem text NOT NULL,
        fingerprint varchar NOT NULL,
        "notBefore" timestamptz,
        "notAfter" timestamptz,
        active boolean DEFAULT true,
        "createdAt" timestamptz DEFAULT now(),
        "updatedAt" timestamptz DEFAULT now()
      );
    `);
    await queryRunner.query(`
      CREATE TABLE privacy_groups (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "organizationId" uuid REFERENCES organizations(id) ON DELETE CASCADE,
        "privacyGroupId" varchar NOT NULL UNIQUE,
        members jsonb,
        name varchar,
        "createdAt" timestamptz DEFAULT now(),
        "updatedAt" timestamptz DEFAULT now()
      );
    `);
    await queryRunner.query(`
      CREATE TABLE contract_interfaces (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "organizationId" uuid REFERENCES organizations(id) ON DELETE CASCADE,
        name varchar NOT NULL,
        abi text NOT NULL,
        address varchar,
        "createdAt" timestamptz DEFAULT now(),
        "updatedAt" timestamptz DEFAULT now()
      );
    `);
    await queryRunner.query(`
      CREATE TABLE contract_listeners (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "organizationId" uuid REFERENCES organizations(id) ON DELETE CASCADE,
        "contractId" uuid REFERENCES contract_interfaces(id) ON DELETE CASCADE,
        "eventName" varchar NOT NULL,
        "streamId" varchar,
        filter jsonb,
        "createdAt" timestamptz DEFAULT now(),
        "updatedAt" timestamptz DEFAULT now()
      );
    `);
    await queryRunner.query(`
      CREATE TABLE token_pools (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "organizationId" uuid REFERENCES organizations(id) ON DELETE CASCADE,
        "poolId" varchar NOT NULL UNIQUE,
        name varchar,
        metadata jsonb,
        "createdAt" timestamptz DEFAULT now(),
        "updatedAt" timestamptz DEFAULT now()
      );
    `);
    await queryRunner.query(`
      CREATE TABLE asset_files (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "organizationId" uuid REFERENCES organizations(id) ON DELETE CASCADE,
        "ipfsCid" varchar NOT NULL UNIQUE,
        mime varchar NOT NULL,
        filename varchar,
        pinned boolean DEFAULT false,
        "createdAt" timestamptz DEFAULT now(),
        "updatedAt" timestamptz DEFAULT now()
      );
    `);
    await queryRunner.query(`
      CREATE TABLE solana_assets (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "organizationId" uuid REFERENCES organizations(id) ON DELETE CASCADE,
        mint varchar NOT NULL UNIQUE,
        uri varchar NOT NULL,
        "besuTxHash" varchar,
        status varchar NOT NULL,
        "createdAt" timestamptz DEFAULT now(),
        "updatedAt" timestamptz DEFAULT now()
      );
    `);
    await queryRunner.query(`
      CREATE TABLE audit_events (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "organizationId" uuid REFERENCES organizations(id) ON DELETE SET NULL,
        "userId" uuid REFERENCES users(id) ON DELETE SET NULL,
        "eventType" varchar NOT NULL,
        details jsonb,
        signer varchar,
        "createdAt" timestamptz DEFAULT now()
      );
    `);
    await queryRunner.query(`
      CREATE TABLE relay_checkpoints (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "streamId" varchar NOT NULL,
        "lastEventId" varchar NOT NULL,
        "createdAt" timestamptz DEFAULT now(),
        "updatedAt" timestamptz DEFAULT now()
      );
    `);
    await queryRunner.query(`
      CREATE TABLE processed_events (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "eventKey" varchar NOT NULL UNIQUE,
        metadata jsonb,
        "createdAt" timestamptz DEFAULT now()
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS processed_events`);
    await queryRunner.query(`DROP TABLE IF EXISTS relay_checkpoints`);
    await queryRunner.query(`DROP TABLE IF EXISTS audit_events`);
    await queryRunner.query(`DROP TABLE IF EXISTS solana_assets`);
    await queryRunner.query(`DROP TABLE IF EXISTS asset_files`);
    await queryRunner.query(`DROP TABLE IF EXISTS token_pools`);
    await queryRunner.query(`DROP TABLE IF EXISTS contract_listeners`);
    await queryRunner.query(`DROP TABLE IF EXISTS contract_interfaces`);
    await queryRunner.query(`DROP TABLE IF EXISTS privacy_groups`);
    await queryRunner.query(`DROP TABLE IF EXISTS x509certs`);
    await queryRunner.query(`DROP TABLE IF EXISTS role_assignments`);
    await queryRunner.query(`DROP TABLE IF EXISTS users`);
    await queryRunner.query(`DROP TABLE IF EXISTS organizations`);
  }
}

