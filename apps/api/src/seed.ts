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

  // Организация 1: Назарбаевский Университет (НУ)
  let nuOrg = await orgRepo.findOne({ where: { slug: 'nu' } });
  if (!nuOrg) {
    nuOrg = orgRepo.create({
      name: 'Назарбаевский Университет',
      slug: 'nu',
      active: true,
      fireflyBaseUrl: 'http://firefly:5000',
    });
    await orgRepo.save(nuOrg);
    console.log('✅ Created organization: Назарбаевский Университет (НУ)');
  }

  let nuUser = await userRepo.findOne({ where: { email: 'admin@nu.kz' } });
  if (!nuUser) {
    nuUser = userRepo.create({
      email: 'admin@nu.kz',
      displayName: 'НУ Admin',
      organization: nuOrg,
    });
    await userRepo.save(nuUser);
    console.log('✅ Created user: admin@nu.kz');
  }

  const nuRole = await rolesRepo.findOne({
    where: { user: { id: nuUser.id } as any, organization: { id: nuOrg.id } as any },
  });
  if (!nuRole) {
    const role = rolesRepo.create({ user: nuUser, organization: nuOrg, role: 'OrgAdmin' });
    await rolesRepo.save(role);
    console.log('✅ Created role: OrgAdmin for НУ');
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
  console.log('  1. Назарбаевский Университет (НУ) - slug: nu');
  console.log('  2. КазНУ имени Аль-Фараби - slug: kaznu');
  await dataSource.destroy();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

