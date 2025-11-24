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
  const defaultFireflyUrl = process.env.FIREFLY_BASE_URL || 'http://firefly-mock:5100';
  const existing = await orgRepo.findOne({ where: { slug } });
  if (!existing) {
    const org = orgRepo.create({ name: 'Demo Bank', slug, active: true, fireflyBaseUrl: defaultFireflyUrl });
    await orgRepo.save(org);
    // eslint-disable-next-line no-console
    console.log('Seeded organization', slug);
  } else if (!existing.fireflyBaseUrl || existing.fireflyBaseUrl !== defaultFireflyUrl) {
    // Update existing organization if URL is missing or different
    existing.fireflyBaseUrl = defaultFireflyUrl;
    await orgRepo.save(existing);
    // eslint-disable-next-line no-console
    console.log('Updated organization', slug, 'fireflyBaseUrl to', defaultFireflyUrl);
  }
  const slugB = 'demo-uni';
  const defaultFireflyUrlB = process.env.FIREFLY_ORGB_URL || 'http://localhost:5002';
  const existingB = await orgRepo.findOne({ where: { slug: slugB } });
  if (!existingB) {
    const orgB = orgRepo.create({ name: 'Demo University', slug: slugB, active: true, fireflyBaseUrl: defaultFireflyUrlB });
    await orgRepo.save(orgB);
    console.log('Seeded organization', slugB);
  } else if (!existingB.fireflyBaseUrl || existingB.fireflyBaseUrl !== defaultFireflyUrlB) {
    // Update existing organization if URL is missing or different
    existingB.fireflyBaseUrl = defaultFireflyUrlB;
    await orgRepo.save(existingB);
    console.log('Updated organization', slugB, 'fireflyBaseUrl to', defaultFireflyUrlB);
  }
  await dataSource.destroy();
  console.log('Migrations completed');
}

main().catch((e) => {
  console.error('Migration failed', e);
  process.exit(1);
});


