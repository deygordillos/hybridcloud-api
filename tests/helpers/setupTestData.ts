import bcrypt from "bcryptjs";
import { Companies } from '../../src/entity/companies.entity';
import { GroupRepository } from '../../src/repositories/GroupRepository'
import { CompanyRepository } from '../../src/repositories/CompanyRepository'
import { UserRepository } from '../../src/repositories/UserRepository'
import { UsersCompaniesRepository } from "../../src/repositories/UsersCompanies";
import { generateRefreshToken, generateToken } from '../../src/config/jwt';
import config from "../../src/config/config";

export const authHeader = (token: string) => ({
  Authorization: `Bearer ${token}`
});

export const createTestCompany = async () => {
  const hashedPassword = await bcrypt.hash("admin", config.BCRYPT_SALT);
  const user = UserRepository.create({
    username: "admin" + Math.floor(Math.random() * 1000),
    password: hashedPassword,
    first_name: "Admin",
    last_name: "User",
    email: "admin@test.com",
    is_admin: 1
  });
  const admin_user = await UserRepository.save(user)

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

  const hashedPassword = await bcrypt.hash("test", config.BCRYPT_SALT);
  const user = UserRepository.create({
    username: 'test',
    password: hashedPassword,
    first_name: 'Juan',
    last_name: 'Perez',
    email: 'test2@gmail.com'
  });
  await UserRepository.save(user);

  const access_token = generateToken(user);
  const refresh_token = generateRefreshToken(user);

  const is_company_admin : number = 1;
  const newRelation = UsersCompaniesRepository.create({
      user_id: user,
      company_id: company,
      is_company_admin
  });
  await UsersCompaniesRepository.save(newRelation);

  return { access_token, refresh_token, data: user };
};
