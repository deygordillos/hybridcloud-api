import request from 'supertest';
import app from '../../../src/app';
import { appDataSource } from '../../../src/app-data-source';
import { authHeader, createTestCompany, createTestUserAndToken } from '../../helpers/setupTestData';
import { Companies } from '../../../src/entity/companies.entity';
import { Users } from '../../../src/entity/users.entity';

let company: Companies;
let token: string;
let adminUser: Users;
let testUser: Users;
let companyId: number;

beforeAll(async () => {
  if (appDataSource.isInitialized) {
    await appDataSource.destroy();
  }
  process.env.NODE_ENV = 'test';
  await appDataSource.initialize();
  await appDataSource.runMigrations();

  company = await createTestCompany();
  companyId = company.company_id;
  const { data, access_token } = await createTestUserAndToken(company);
  token = access_token;
  adminUser = data;
});

afterAll(async () => {
  await appDataSource.destroy();
});

describe('Users Routes - /api/v1/users', () => {
  
  describe('POST /api/v1/users - Create User', () => {
    it('should create a new user with valid data', async () => {
      const validUserData = {
        username: 'johndoe',
        password: 'SecurePass123',
        user_type: 2,
        email: 'johndoe@test.com',
        first_name: 'John',
        last_name: 'Doe',
        user_phone: '+1234567890',
        is_admin: 0
      };

      const res = await request(app)
        .post('/api/v1/users')
        .set(authHeader(token, companyId))
        .send(validUserData);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('user_id');
      expect(res.body.data.username).toBe('johndoe');
      expect(res.body.data.email).toBe('johndoe@test.com');
      expect(res.body.data.first_name).toBe('John');
      expect(res.body.data).not.toHaveProperty('password');
      expect(res.body.message).toBe('User created successfully');

      testUser = res.body.data;
    });

    it('should fail validation when username is missing', async () => {
      const invalidData = {
        password: 'SecurePass123',
        user_type: 2,
        email: 'test@test.com',
        first_name: 'Test'
      };

      const res = await request(app)
        .post('/api/v1/users')
        .set(authHeader(token, companyId))
        .send(invalidData);

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('error');
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors.some((error: any) => 
        error.path === 'username' && error.msg === 'Username is required'
      )).toBe(true);
    });

    it('should fail validation when username is too short', async () => {
      const invalidData = {
        username: 'ab',
        password: 'SecurePass123',
        user_type: 2,
        email: 'test2@test.com',
        first_name: 'Test'
      };

      const res = await request(app)
        .post('/api/v1/users')
        .set(authHeader(token, companyId))
        .send(invalidData);

      expect(res.statusCode).toBe(400);
      expect(res.body.errors.some((error: any) => 
        error.path === 'username' && error.msg.includes('between 3 and 100')
      )).toBe(true);
    });

    it('should fail validation when password is missing', async () => {
      const invalidData = {
        username: 'testuser2',
        user_type: 2,
        email: 'test3@test.com',
        first_name: 'Test'
      };

      const res = await request(app)
        .post('/api/v1/users')
        .set(authHeader(token, companyId))
        .send(invalidData);

      expect(res.statusCode).toBe(400);
      expect(res.body.errors.some((error: any) => 
        error.path === 'password' && error.msg === 'Password is required'
      )).toBe(true);
    });

    it('should fail validation when password is too short', async () => {
      const invalidData = {
        username: 'testuser3',
        password: 'Short1',
        user_type: 2,
        email: 'test4@test.com',
        first_name: 'Test'
      };

      const res = await request(app)
        .post('/api/v1/users')
        .set(authHeader(token, companyId))
        .send(invalidData);

      expect(res.statusCode).toBe(400);
      expect(res.body.errors.some((error: any) => 
        error.path === 'password' && error.msg.includes('at least 8 characters')
      )).toBe(true);
    });

    it('should fail validation when password lacks uppercase letter', async () => {
      const invalidData = {
        username: 'testuser4',
        password: 'lowercase123',
        user_type: 2,
        email: 'test5@test.com',
        first_name: 'Test'
      };

      const res = await request(app)
        .post('/api/v1/users')
        .set(authHeader(token, companyId))
        .send(invalidData);

      expect(res.statusCode).toBe(400);
      expect(res.body.errors.some((error: any) => 
        error.path === 'password' && error.msg.includes('uppercase')
      )).toBe(true);
    });

    it('should fail validation when password lacks lowercase letter', async () => {
      const invalidData = {
        username: 'testuser5',
        password: 'UPPERCASE123',
        user_type: 2,
        email: 'test6@test.com',
        first_name: 'Test'
      };

      const res = await request(app)
        .post('/api/v1/users')
        .set(authHeader(token, companyId))
        .send(invalidData);

      expect(res.statusCode).toBe(400);
      expect(res.body.errors.some((error: any) => 
        error.path === 'password' && error.msg.includes('lowercase')
      )).toBe(true);
    });

    it('should fail validation when password lacks number', async () => {
      const invalidData = {
        username: 'testuser6',
        password: 'NoNumbersHere',
        user_type: 2,
        email: 'test7@test.com',
        first_name: 'Test'
      };

      const res = await request(app)
        .post('/api/v1/users')
        .set(authHeader(token, companyId))
        .send(invalidData);

      expect(res.statusCode).toBe(400);
      expect(res.body.errors.some((error: any) => 
        error.path === 'password' && error.msg.includes('number')
      )).toBe(true);
    });

    it('should fail validation when email is invalid', async () => {
      const invalidData = {
        username: 'testuser7',
        password: 'SecurePass123',
        user_type: 2,
        email: 'invalid-email',
        first_name: 'Test'
      };

      const res = await request(app)
        .post('/api/v1/users')
        .set(authHeader(token, companyId))
        .send(invalidData);

      expect(res.statusCode).toBe(400);
      expect(res.body.errors.some((error: any) => 
        error.path === 'email' && error.msg.includes('Invalid email')
      )).toBe(true);
    });

    it('should fail validation when user_type is invalid', async () => {
      const invalidData = {
        username: 'testuser8',
        password: 'SecurePass123',
        user_type: 5,
        email: 'test8@test.com',
        first_name: 'Test'
      };

      const res = await request(app)
        .post('/api/v1/users')
        .set(authHeader(token, companyId))
        .send(invalidData);

      expect(res.statusCode).toBe(400);
      expect(res.body.errors.some((error: any) => 
        error.path === 'user_type' && error.msg.includes('1, 2, 3, or 4')
      )).toBe(true);
    });

    it('should fail when username already exists', async () => {
      const duplicateData = {
        username: 'johndoe',
        password: 'SecurePass123',
        user_type: 2,
        email: 'different@test.com',
        first_name: 'Different'
      };

      const res = await request(app)
        .post('/api/v1/users')
        .set(authHeader(token, companyId))
        .send(duplicateData);

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('username already exists');
    });

    it('should fail when email already exists', async () => {
      const duplicateData = {
        username: 'differentuser',
        password: 'SecurePass123',
        user_type: 2,
        email: 'johndoe@test.com',
        first_name: 'Different'
      };

      const res = await request(app)
        .post('/api/v1/users')
        .set(authHeader(token, companyId))
        .send(duplicateData);

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('email already exists');
    });
  });

  describe('GET /api/v1/users - List Users', () => {
    it('should list all users with pagination', async () => {
      const res = await request(app)
        .get('/api/v1/users')
        .set(authHeader(token, companyId))
        .query({ page: 1, limit: 10 });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.pagination).toBeDefined();
      expect(res.body.pagination).toHaveProperty('total');
      expect(res.body.pagination).toHaveProperty('perPage');
      expect(res.body.pagination).toHaveProperty('currentPage');
      expect(res.body.pagination).toHaveProperty('lastPage');
    });

    it('should filter users by status', async () => {
      const res = await request(app)
        .get('/api/v1/users')
        .set(authHeader(token, companyId))
        .query({ user_status: 1 });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.every((user: any) => user.user_status === 1)).toBe(true);
    });

    it('should filter users by type', async () => {
      const res = await request(app)
        .get('/api/v1/users')
        .set(authHeader(token, companyId))
        .query({ user_type: 2 });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.every((user: any) => user.user_type === 2)).toBe(true);
    });

    it('should fail validation with invalid page number', async () => {
      const res = await request(app)
        .get('/api/v1/users')
        .set(authHeader(token, companyId))
        .query({ page: 0 });

      expect(res.statusCode).toBe(400);
      expect(res.body.errors).toBeDefined();
    });
  });

  describe('GET /api/v1/users/:id - Get User by ID', () => {
    it('should get user by valid ID', async () => {
      const res = await request(app)
        .get(`/api/v1/users/${testUser.user_id}`)
        .set(authHeader(token, companyId));

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user_id).toBe(testUser.user_id);
      expect(res.body.data.username).toBe(testUser.username);
      expect(res.body.data).not.toHaveProperty('password');
    });

    it('should fail validation with invalid ID format', async () => {
      const res = await request(app)
        .get('/api/v1/users/invalid-id')
        .set(authHeader(token, companyId));

      expect(res.statusCode).toBe(400);
      expect(res.body.errors).toBeDefined();
    });

    it('should return 404 for non-existent user', async () => {
      const res = await request(app)
        .get('/api/v1/users/99999')
        .set(authHeader(token, companyId));

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('does not exists');
    });
  });

  describe('PUT /api/v1/users/:id - Update User', () => {
    it('should update user with valid data', async () => {
      const updateData = {
        first_name: 'John Updated',
        last_name: 'Doe Updated',
        email: 'johnupdated@test.com',
        user_phone: '+9876543210'
      };

      const res = await request(app)
        .put(`/api/v1/users/${testUser.user_id}`)
        .set(authHeader(token, companyId))
        .send(updateData);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.first_name).toBe('John Updated');
      expect(res.body.data.email).toBe('johnupdated@test.com');
      expect(res.body.message).toBe('User updated successfully');
    });

    it('should fail validation with invalid email format', async () => {
      const invalidData = {
        email: 'invalid-email-format'
      };

      const res = await request(app)
        .put(`/api/v1/users/${testUser.user_id}`)
        .set(authHeader(token, companyId))
        .send(invalidData);

      expect(res.statusCode).toBe(400);
      expect(res.body.errors).toBeDefined();
    });

    it('should fail when updating to existing email', async () => {
      const duplicateData = {
        email: adminUser.email
      };

      const res = await request(app)
        .put(`/api/v1/users/${testUser.user_id}`)
        .set(authHeader(token, companyId))
        .send(duplicateData);

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain('email already exists');
    });
  });

  describe('POST /api/v1/users/:id/deactivate - Deactivate User', () => {
    it('should deactivate an active user', async () => {
      const res = await request(app)
        .post(`/api/v1/users/${testUser.user_id}/deactivate`)
        .set(authHeader(token, companyId));

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('User deactivated successfully');
    });

    it('should fail to deactivate already inactive user', async () => {
      const res = await request(app)
        .post(`/api/v1/users/${testUser.user_id}/deactivate`)
        .set(authHeader(token, companyId));

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('already inactive');
    });

    it('should fail validation with invalid ID format', async () => {
      const res = await request(app)
        .post('/api/v1/users/invalid-id/deactivate')
        .set(authHeader(token, companyId));

      expect(res.statusCode).toBe(400);
      expect(res.body.errors).toBeDefined();
    });
  });

  describe('POST /api/v1/users/:id/activate - Activate User', () => {
    it('should activate an inactive user', async () => {
      const res = await request(app)
        .post(`/api/v1/users/${testUser.user_id}/activate`)
        .set(authHeader(token, companyId));

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('User activated successfully');
    });

    it('should fail to activate already active user', async () => {
      const res = await request(app)
        .post(`/api/v1/users/${testUser.user_id}/activate`)
        .set(authHeader(token, companyId));

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('already active');
    });
  });

  describe('POST /api/v1/users/:id/change-password - Change Password', () => {
    it('should change password with valid data', async () => {
      const passwordData = {
        password: 'NewSecurePass123'
      };

      const res = await request(app)
        .post(`/api/v1/users/${testUser.user_id}/change-password`)
        .set(authHeader(token, companyId))
        .send(passwordData);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Password changed successfully');
    });

    it('should fail validation when password is too short', async () => {
      const invalidData = {
        password: 'Short1'
      };

      const res = await request(app)
        .post(`/api/v1/users/${testUser.user_id}/change-password`)
        .set(authHeader(token, companyId))
        .send(invalidData);

      expect(res.statusCode).toBe(400);
      expect(res.body.errors.some((error: any) => 
        error.msg.includes('at least 8 characters')
      )).toBe(true);
    });

    it('should fail validation when password lacks required characters', async () => {
      const invalidData = {
        password: 'nouppercase123'
      };

      const res = await request(app)
        .post(`/api/v1/users/${testUser.user_id}/change-password`)
        .set(authHeader(token, companyId))
        .send(invalidData);

      expect(res.statusCode).toBe(400);
      expect(res.body.errors).toBeDefined();
    });
  });

  describe('GET /api/v1/users/:id/audit-history - Get Audit History', () => {
    it('should get audit history for a user', async () => {
      const res = await request(app)
        .get(`/api/v1/users/${testUser.user_id}/audit-history`)
        .set(authHeader(token, companyId));

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.pagination).toBeDefined();
      
      // Should have CREATE, UPDATE, DEACTIVATE, ACTIVATE, PASSWORD_CHANGE events
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0]).toHaveProperty('action_type');
      expect(res.body.data[0]).toHaveProperty('changes_data');
      expect(res.body.data[0]).toHaveProperty('created_at');
    });

    it('should paginate audit history', async () => {
      const res = await request(app)
        .get(`/api/v1/users/${testUser.user_id}/audit-history`)
        .set(authHeader(token, companyId))
        .query({ page: 1, limit: 2 });

      expect(res.statusCode).toBe(200);
      expect(res.body.pagination.perPage).toBe(2);
    });
  });

  describe('DELETE /api/v1/users/:id - Delete User (Not Allowed)', () => {
    it('should return 403 when attempting to delete a user', async () => {
      const res = await request(app)
        .delete(`/api/v1/users/${testUser.user_id}`)
        .set(authHeader(token, companyId));

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Cannot delete users');
    });
  });

  describe('POST /api/v1/users/me/change-password - Change Own Password', () => {
    let regularUserToken: string;
    let regularUserId: number;

    beforeAll(async () => {
      // Crear un usuario regular (no admin) para probar cambio de propia contraseña
      const userData = {
        username: 'regularuser',
        password: 'CurrentPass123',
        user_type: 2,
        email: 'regular@test.com',
        first_name: 'Regular',
        last_name: 'User',
        is_admin: 0
      };

      const createRes = await request(app)
        .post('/api/v1/users')
        .set(authHeader(token, companyId))
        .send(userData);

      regularUserId = createRes.body.data.user_id;

      // Login para obtener token
      const loginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({
          username: 'regularuser',
          password: 'CurrentPass123'
        });

      regularUserToken = loginRes.body.access_token;
    });

    it('should allow user to change own password with valid credentials', async () => {
      const res = await request(app)
        .post('/api/v1/users/me/change-password')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .send({
          current_password: 'CurrentPass123',
          new_password: 'NewSecurePass456'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Password changed successfully');

      // Verificar que puede hacer login con la nueva contraseña
      const loginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({
          username: 'regularuser',
          password: 'NewSecurePass456'
        });

      expect(loginRes.statusCode).toBe(200);
      expect(loginRes.body).toHaveProperty('access_token');

      // Actualizar token para siguiente test
      regularUserToken = loginRes.body.access_token;
    });

    it('should fail when current password is incorrect', async () => {
      const res = await request(app)
        .post('/api/v1/users/me/change-password')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .send({
          current_password: 'WrongPassword123',
          new_password: 'NewSecurePass789'
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Current password is incorrect');
    });

    it('should fail validation when current password is missing', async () => {
      const res = await request(app)
        .post('/api/v1/users/me/change-password')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .send({
          new_password: 'NewSecurePass789'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('error');
      expect(res.body.errors).toBeDefined();
    });

    it('should fail validation when new password is missing', async () => {
      const res = await request(app)
        .post('/api/v1/users/me/change-password')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .send({
          current_password: 'NewSecurePass456'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('error');
      expect(res.body.errors).toBeDefined();
    });

    it('should fail validation with weak password (too short)', async () => {
      const res = await request(app)
        .post('/api/v1/users/me/change-password')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .send({
          current_password: 'NewSecurePass456',
          new_password: 'Short1'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.errors.some((error: any) => 
        error.msg.includes('at least 8 characters')
      )).toBe(true);
    });

    it('should fail validation with password missing uppercase', async () => {
      const res = await request(app)
        .post('/api/v1/users/me/change-password')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .send({
          current_password: 'NewSecurePass456',
          new_password: 'nouppercase123'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.errors.some((error: any) => 
        error.msg.includes('uppercase')
      )).toBe(true);
    });

    it('should fail validation with password missing lowercase', async () => {
      const res = await request(app)
        .post('/api/v1/users/me/change-password')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .send({
          current_password: 'NewSecurePass456',
          new_password: 'NOLOWERCASE123'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.errors.some((error: any) => 
        error.msg.includes('lowercase')
      )).toBe(true);
    });

    it('should fail validation with password missing number', async () => {
      const res = await request(app)
        .post('/api/v1/users/me/change-password')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .send({
          current_password: 'NewSecurePass456',
          new_password: 'NoNumberPass'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.errors.some((error: any) => 
        error.msg.includes('number')
      )).toBe(true);
    });

    it('should require authentication', async () => {
      const res = await request(app)
        .post('/api/v1/users/me/change-password')
        .send({
          current_password: 'CurrentPass123',
          new_password: 'NewSecurePass789'
        });

      expect(res.statusCode).toBe(400);
    });

    it('should work for admin users too', async () => {
      const res = await request(app)
        .post('/api/v1/users/me/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          current_password: 'test',
          new_password: 'NewAdminPass123'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      
      // Restaurar contraseña del admin para otros tests
      const restoreRes = await request(app)
        .post('/api/v1/users/me/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          current_password: 'NewAdminPass123',
          new_password: 'TestPass123'
        });
      
      expect(restoreRes.statusCode).toBe(200);
    });
  });

  describe('Authorization Tests', () => {
    it('should return 400 without authentication token', async () => {
      const res = await request(app)
        .get('/api/v1/users')
        .set('x-company-id', companyId.toString());

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBeDefined();
    });

    it('should return 401 with invalid token', async () => {
      const res = await request(app)
        .get('/api/v1/users')
        .set('Authorization', 'Bearer invalid-token');

      expect(res.statusCode).toBe(401);
    });
  });
});
