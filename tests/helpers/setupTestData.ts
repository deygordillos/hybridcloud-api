import bcrypt from "bcryptjs";
import { Companies } from '../../src/entity/companies.entity';
import { GroupRepository } from '../../src/repositories/GroupRepository'
import { CompanyRepository } from '../../src/repositories/CompanyRepository'
import { UserRepository } from '../../src/repositories/UserRepository'
import { UsersCompaniesRepository } from "../../src/repositories/UsersCompaniesRepository";
import { generateRefreshToken, generateToken } from '../../src/config/jwt';
import config from "../../src/config/config";

export const authHeader = (token: string, company_id?: number) => {
  const headers: any = {
    Authorization: `Bearer ${token}`
  };
  if (company_id) {
    headers['x-company-id'] = company_id.toString();
  }
  return headers;
};

export const createTestCompany = async () => {
  let admin_user = await UserRepository.findOne({
    where: { username: 'admin' }
  });

  if (!admin_user) {
    const hashedPassword = await bcrypt.hash("admin", config.BCRYPT_SALT);
    const user = UserRepository.create({
      username: "admin",
      password: hashedPassword,
      first_name: "Admin",
      last_name: "User",
      email: "admin@test.com",
      is_admin: 1
    });
    admin_user = await UserRepository.save(user)
  }

  const group = GroupRepository.create({
    group_name: "Test Group",
    user_id: admin_user
  });
  const new_group = await GroupRepository.save(group)

  const company = CompanyRepository.create({
    group_id: new_group,
    company_is_principal: 1,
    company_id_fiscal: '123456789',
    company_name: 'TestCo',
    company_razon_social: 'TestCo SRL',
    country_id: { country_id: 1 } // VEN
  });

  return await CompanyRepository.save(company);
};

export const createTestUserAndToken = async (company: Companies) => {
  let test_user = await UserRepository.findOne({
    where: { username: 'test' }
  });
  if (!test_user) {
    const hashedPassword = await bcrypt.hash("test", config.BCRYPT_SALT);
    const user = UserRepository.create({
      username: 'test',
      password: hashedPassword,
      first_name: 'Juan',
      last_name: 'Perez',
      email: 'test2@gmail.com',
      is_admin: 1  // Make test user an admin for testing purposes
    });
    test_user = await UserRepository.save(user);
  }

  const access_token = generateToken(test_user);
  const refresh_token = generateRefreshToken(test_user);

  const is_company_admin : number = 1;
  const newRelation = UsersCompaniesRepository.create({
      user_id: test_user,
      company_id: company,
      is_company_admin
  });
  await UsersCompaniesRepository.save(newRelation);

  return { access_token, refresh_token, data: test_user };
};
