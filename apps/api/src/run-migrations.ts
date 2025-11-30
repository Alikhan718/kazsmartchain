/* eslint-disable no-console */
import 'reflect-metadata';
import dataSource from '../ormconfig';

async function main() {
  await dataSource.initialize();
  
  // Сначала выполняем миграции
  console.log('Running migrations...');
  await dataSource.runMigrations();
  console.log('Migrations completed');
  
  // Затем выполняем seed код используя raw SQL чтобы избежать проблем с отсутствующими полями
  try {
    const queryRunner = dataSource.createQueryRunner();
    
    // Проверяем существует ли организация demo-bank
    const demoBankExists = await queryRunner.query(
      `SELECT id FROM organizations WHERE slug = $1`,
      ['demo-bank']
    );
    
    const defaultFireflyUrl = process.env.FIREFLY_BASE_URL || 'http://firefly:5000';
    
    if (demoBankExists.length === 0) {
      await queryRunner.query(
        `INSERT INTO organizations (id, name, slug, active, "fireflyBaseUrl", "createdAt", "updatedAt")
         VALUES (gen_random_uuid(), $1, $2, $3, $4, NOW(), NOW())`,
        ['Demo Bank', 'demo-bank', true, defaultFireflyUrl]
      );
      console.log('Seeded organization demo-bank');
    } else {
      // Обновляем fireflyBaseUrl если нужно
      await queryRunner.query(
        `UPDATE organizations SET "fireflyBaseUrl" = $1, "updatedAt" = NOW() WHERE slug = $2`,
        [defaultFireflyUrl, 'demo-bank']
      );
      console.log('Updated organization demo-bank fireflyBaseUrl');
    }
    
    // Проверяем существует ли организация demo-uni
    const demoUniExists = await queryRunner.query(
      `SELECT id FROM organizations WHERE slug = $1`,
      ['demo-uni']
    );
    
    const defaultFireflyUrlB = process.env.FIREFLY_ORGB_URL || 'http://localhost:5002';
    
    if (demoUniExists.length === 0) {
      await queryRunner.query(
        `INSERT INTO organizations (id, name, slug, active, "fireflyBaseUrl", "createdAt", "updatedAt")
         VALUES (gen_random_uuid(), $1, $2, $3, $4, NOW(), NOW())`,
        ['Demo University', 'demo-uni', true, defaultFireflyUrlB]
      );
      console.log('Seeded organization demo-uni');
    } else {
      await queryRunner.query(
        `UPDATE organizations SET "fireflyBaseUrl" = $1, "updatedAt" = NOW() WHERE slug = $2`,
        [defaultFireflyUrlB, 'demo-uni']
      );
      console.log('Updated organization demo-uni fireflyBaseUrl');
    }
    
    await queryRunner.release();
  } catch (error: any) {
    console.warn('Seed failed (this is OK if migrations are still running):', error.message);
  }
  
  await dataSource.destroy();
  console.log('Migration script completed');
}

main().catch((e) => {
  console.error('Migration failed', e);
  process.exit(1);
});
