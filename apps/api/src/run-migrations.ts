/* eslint-disable no-console */
import 'reflect-metadata';
import dataSource from '../ormconfig';
import { Organization } from './persistence/entities/organization.entity';

async function main() {
  await dataSource.initialize();
  await dataSource.runMigrations();
  // Ensure demo tenant exists for local dev
  const orgRepo = dataSource.getRepository(Organization);
  const slug = 'demo-bank';
  const existing = await orgRepo.findOne({ where: { slug } });
  if (!existing) {
    const org = orgRepo.create({ name: 'Demo Bank', slug, active: true, fireflyBaseUrl: process.env.FIREFLY_BASE_URL || 'http://firefly-mock:5100' });
    await orgRepo.save(org);
    // eslint-disable-next-line no-console
    console.log('Seeded organization', slug);
  }
  const slugB = 'demo-uni';
  const existingB = await orgRepo.findOne({ where: { slug: slugB } });
  if (!existingB) {
    const orgB = orgRepo.create({ name: 'Demo University', slug: slugB, active: true, fireflyBaseUrl: process.env.FIREFLY_ORGB_URL || 'http://localhost:5002' });
    await orgRepo.save(orgB);
    console.log('Seeded organization', slugB);
  }
  await dataSource.destroy();
  console.log('Migrations completed');
}

main().catch((e) => {
  console.error('Migration failed', e);
  process.exit(1);
});


