/* eslint-disable no-console */
import 'reflect-metadata';
import dataSource from '../ormconfig';
import { Organization } from './persistence/entities/organization.entity';
import { User } from './persistence/entities/user.entity';
import { RoleAssignment } from './persistence/entities/role-assignment.entity';

async function main() {
  await dataSource.initialize();
  await dataSource.runMigrations();

  const orgRepo = dataSource.getRepository(Organization);
  const userRepo = dataSource.getRepository(User);
  const rolesRepo = dataSource.getRepository(RoleAssignment);

  // Организация 1: Банк ЦентрКредит (BCC)
  let bccOrg = await orgRepo.findOne({ where: { slug: 'bcc' } });
  if (!bccOrg) {
    bccOrg = orgRepo.create({
      name: 'Банк ЦентрКредит',
      slug: 'bcc',
      active: true,
      fireflyBaseUrl: 'http://firefly:5000',
    });
    await orgRepo.save(bccOrg);
    console.log('✅ Created organization: Банк ЦентрКредит (BCC)');
  }

  let bccUser = await userRepo.findOne({ where: { email: 'admin@bcc.kz' } });
  if (!bccUser) {
    bccUser = userRepo.create({
      email: 'admin@bcc.kz',
      displayName: 'BCC Admin',
      organization: bccOrg,
    });
    await userRepo.save(bccUser);
    console.log('✅ Created user: admin@bcc.kz');
  }

  const bccRole = await rolesRepo.findOne({
    where: { user: { id: bccUser.id } as any, organization: { id: bccOrg.id } as any },
  });
  if (!bccRole) {
    const role = rolesRepo.create({ user: bccUser, organization: bccOrg, role: 'OrgAdmin' });
    await rolesRepo.save(role);
    console.log('✅ Created role: OrgAdmin for BCC');
  }

  // Организация 2: КазНУ имени Аль-Фараби
  let kazNuOrg = await orgRepo.findOne({ where: { slug: 'kaznu' } });
  if (!kazNuOrg) {
    kazNuOrg = orgRepo.create({
      name: 'КазНУ имени Аль-Фараби',
      slug: 'kaznu',
      active: true,
      fireflyBaseUrl: 'http://firefly:5000',
    });
    await orgRepo.save(kazNuOrg);
    console.log('✅ Created organization: КазНУ имени Аль-Фараби');
  }

  let kazNuUser = await userRepo.findOne({ where: { email: 'admin@kaznu.kz' } });
  if (!kazNuUser) {
    kazNuUser = userRepo.create({
      email: 'admin@kaznu.kz',
      displayName: 'КазНУ Admin',
      organization: kazNuOrg,
    });
    await userRepo.save(kazNuUser);
    console.log('✅ Created user: admin@kaznu.kz');
  }

  const kazNuRole = await rolesRepo.findOne({
    where: { user: { id: kazNuUser.id } as any, organization: { id: kazNuOrg.id } as any },
  });
  if (!kazNuRole) {
    const role = rolesRepo.create({ user: kazNuUser, organization: kazNuOrg, role: 'OrgAdmin' });
    await rolesRepo.save(role);
    console.log('✅ Created role: OrgAdmin for КазНУ');
  }

  console.log('\n🎉 Seed completed successfully!');
  console.log('📊 Organizations created:');
  console.log('  1. Банк ЦентрКредит (BCC) - slug: bcc');
  console.log('  2. КазНУ имени Аль-Фараби - slug: kaznu');
  await dataSource.destroy();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

