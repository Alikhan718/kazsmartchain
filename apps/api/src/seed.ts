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

  let org = await orgRepo.findOne({ where: { slug: 'demo-bank' } });
  if (!org) {
    org = orgRepo.create({ name: 'Demo Bank', slug: 'demo-bank', active: true });
    await orgRepo.save(org);
  }

  let user = await userRepo.findOne({ where: { email: 'admin@demo.bank' } });
  if (!user) {
    user = userRepo.create({ email: 'admin@demo.bank', displayName: 'Demo Admin', organization: org });
    await userRepo.save(user);
  }

  const existingRole = await rolesRepo.findOne({ where: { user: { id: user.id } as any, organization: { id: org.id } as any } });
  if (!existingRole) {
    const role = rolesRepo.create({ user, organization: org, role: 'OrgAdmin' });
    await rolesRepo.save(role);
  }

  console.log('Seed completed');
  await dataSource.destroy();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

