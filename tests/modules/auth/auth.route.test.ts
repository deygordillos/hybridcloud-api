import request from 'supertest';
import app from '../../../src/app';
import { appDataSource } from '../../../src/app-data-source';
import { authHeader, createTestCompany, createTestUserAndToken } from '../../helpers/setupTestData';
import { Companies } from '../../../src/entity/companies.entity';
import { Users } from '../../../src/entity/users.entity';
import { UserRepository } from '../../../src/repositories/UserRepository';
import bcrypt from 'bcryptjs';

let company: Companies;
let token: string;
let adminUser: Users;
let companyId: number;
let testUserForReset: Users;

// Mock EmailService para evitar envío real de emails en tests
jest.mock('../../../src/services/EmailService', () => ({
    EmailService: {
        sendPasswordResetEmail: jest.fn().mockResolvedValue({ messageId: 'test-message-id' }),
        verifyConnection: jest.fn().mockResolvedValue(true),
        sendEmail: jest.fn().mockResolvedValue({ messageId: 'test-message-id' })
    }
}));

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

    // Crear usuario para tests de reset password
    const hashedPassword = await bcrypt.hash('OldPassword123', 10);
    const user = UserRepository.create({
        username: 'resetuser',
        password: hashedPassword,
        first_name: 'Reset',
        last_name: 'User',
        email: 'resetuser@test.com',
        user_status: 1,
        is_admin: 0
    });
    testUserForReset = await UserRepository.save(user);
});

afterAll(async () => {
    await appDataSource.destroy();
});

describe('Auth Routes - /api/v1/auth', () => {

    describe('POST /api/v1/auth/login', () => {
        it('should login successfully with valid credentials', async () => {
            const res = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    username: 'test',
                    password: 'test'
                });

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('access_token');
            expect(res.body).toHaveProperty('refresh_token');
            expect(res.body.data).toHaveProperty('user_id');
            expect(res.body.data.username).toBe('test');
            expect(res.body.data).not.toHaveProperty('password');
        });

        it('should fail with invalid credentials', async () => {
            const res = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    username: 'test',
                    password: 'wrongpassword'
                });

            expect(res.statusCode).toBe(401);
            expect(res.body).toHaveProperty('error');
        });

        it('should fail validation when username is missing', async () => {
            const res = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    password: 'test'
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe('error');
            expect(res.body.errors).toBeDefined();
        });

        it('should fail validation when password is missing', async () => {
            const res = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    username: 'test'
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe('error');
            expect(res.body.errors).toBeDefined();
        });
    });

    describe('POST /api/v1/auth/refresh', () => {
        let refreshToken: string;

        beforeAll(async () => {
            const loginRes = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    username: 'test',
                    password: 'test'
                });
            refreshToken = loginRes.body.refresh_token;
        });

        it('should refresh token successfully with valid refresh token', async () => {
            const res = await request(app)
                .post('/api/v1/auth/refresh')
                .send({
                    refresh_token: refreshToken
                });

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('access_token');
            expect(res.body).toHaveProperty('refresh_token');
            expect(res.body.data).toHaveProperty('user_id');
        });

        it('should fail with invalid refresh token', async () => {
            const res = await request(app)
                .post('/api/v1/auth/refresh')
                .send({
                    refresh_token: 'invalid-token'
                });

            expect(res.statusCode).toBe(200); // Service returns 200 with error property
            expect(res.body).toHaveProperty('error');
        });

        it('should fail validation when refresh token is missing', async () => {
            const res = await request(app)
                .post('/api/v1/auth/refresh')
                .send({});

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe('error');
            expect(res.body.errors).toBeDefined();
        });
    });

    describe('POST /api/v1/auth/request-password-reset', () => {
        it('should request password reset successfully with valid email', async () => {
            const res = await request(app)
                .post('/api/v1/auth/request-password-reset')
                .send({
                    email: 'resetuser@test.com'
                });

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('message');
            expect(res.body.message).toContain('Password reset instructions');
            expect(res.body).toHaveProperty('email');
            expect(res.body.email).toBe('resetuser@test.com');
            // Token no debe retornarse en producción
            expect(res.body).not.toHaveProperty('token');

            // Verificar que se guardó el token en la base de datos
            const user = await UserRepository.findOne({
                where: { email: 'resetuser@test.com' },
                select: ['user_id', 'email', 'reset_password_token', 'reset_password_expires']
            });
            expect(user?.reset_password_token).toBeDefined();
            expect(user?.reset_password_token).not.toBeNull();
            expect(user?.reset_password_expires).toBeDefined();
            expect(user?.reset_password_expires).not.toBeNull();
        });

        it('should fail with non-existent email', async () => {
            const res = await request(app)
                .post('/api/v1/auth/request-password-reset')
                .send({
                    email: 'nonexistent@test.com'
                });

            expect(res.statusCode).toBe(400);
            expect(res.body).toHaveProperty('error');
            expect(res.body.error).toContain('No user found');
        });

        it('should fail validation when email is missing', async () => {
            const res = await request(app)
                .post('/api/v1/auth/request-password-reset')
                .send({});

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe('error');
            expect(res.body.errors).toBeDefined();
        });

        it('should fail validation with invalid email format', async () => {
            const res = await request(app)
                .post('/api/v1/auth/request-password-reset')
                .send({
                    email: 'invalid-email'
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe('error');
            expect(res.body.errors).toBeDefined();
            expect(res.body.errors.some((error: any) => 
                error.path === 'email' && error.msg === 'Invalid email format'
            )).toBe(true);
        });

        it('should fail for inactive users', async () => {
            // Crear usuario inactivo
            const hashedPassword = await bcrypt.hash('TestPass123', 10);
            const inactiveUser = UserRepository.create({
                username: 'inactive',
                password: hashedPassword,
                first_name: 'Inactive',
                last_name: 'User',
                email: 'inactive@test.com',
                user_status: 0, // Inactivo
                is_admin: 0
            });
            await UserRepository.save(inactiveUser);

            const res = await request(app)
                .post('/api/v1/auth/request-password-reset')
                .send({
                    email: 'inactive@test.com'
                });

            expect(res.statusCode).toBe(400);
            expect(res.body).toHaveProperty('error');
            expect(res.body.error).toContain('User not found');
        });
    });

    describe('POST /api/v1/auth/reset-password', () => {
        let validToken: string;

        beforeEach(async () => {
            // Limpiar usuarios de tests anteriores excepto los básicos
            await UserRepository.createQueryBuilder()
                .delete()
                .where("username NOT IN (:...usernames)", { usernames: ['admin', 'test', 'resetuser'] })
                .execute();

            // Generar token válido para resetuser
            const crypto = require('crypto');
            validToken = crypto.randomBytes(32).toString('hex');
            const hashedToken = await bcrypt.hash(validToken, 10);

            // Actualizar usuario con token válido
            await UserRepository.update(
                { email: 'resetuser@test.com' },
                {
                    reset_password_token: hashedToken,
                    reset_password_expires: new Date(Date.now() + 3600000) // 1 hora
                }
            );
        });

        it('should reset password successfully with valid token', async () => {
            const newPassword = 'NewSecurePass123';
            
            const res = await request(app)
                .post('/api/v1/auth/reset-password')
                .send({
                    token: validToken,
                    new_password: newPassword
                });

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('message');
            expect(res.body.message).toContain('Password has been reset successfully');

            // Verificar que el token fue limpiado
            const user = await UserRepository.findOne({
                where: { email: 'resetuser@test.com' },
                select: ['user_id', 'email', 'password', 'reset_password_token', 'reset_password_expires']
            });
            expect(user?.reset_password_token).toBeNull();
            expect(user?.reset_password_expires).toBeNull();

            // Verificar que puede hacer login con la nueva contraseña
            const loginRes = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    username: 'resetuser',
                    password: newPassword
                });

            expect(loginRes.statusCode).toBe(200);
            expect(loginRes.body).toHaveProperty('access_token');
        });

        it('should fail with invalid token', async () => {
            const res = await request(app)
                .post('/api/v1/auth/reset-password')
                .send({
                    token: 'invalid-token-12345',
                    new_password: 'NewSecurePass123'
                });

            expect(res.statusCode).toBe(400);
            expect(res.body).toHaveProperty('error');
            expect(res.body.error).toContain('Invalid or expired reset token');
        });

        it('should fail with expired token', async () => {
            // Crear token expirado
            const crypto = require('crypto');
            const expiredToken = crypto.randomBytes(32).toString('hex');
            const hashedExpiredToken = await bcrypt.hash(expiredToken, 10);

            // Actualizar resetuser con token expirado
            await UserRepository.update(
                { email: 'resetuser@test.com' },
                {
                    reset_password_token: hashedExpiredToken,
                    reset_password_expires: new Date(Date.now() - 3600000) // Expirado hace 1 hora
                }
            );

            const res = await request(app)
                .post('/api/v1/auth/reset-password')
                .send({
                    token: expiredToken,
                    new_password: 'NewSecurePass123'
                });

            expect(res.statusCode).toBe(400);
            expect(res.body).toHaveProperty('error');
            expect(res.body.error).toContain('Invalid or expired reset token');
        });

        it('should fail validation when token is missing', async () => {
            const res = await request(app)
                .post('/api/v1/auth/reset-password')
                .send({
                    new_password: 'NewSecurePass123'
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe('error');
            expect(res.body.errors).toBeDefined();
        });

        it('should fail validation when password is missing', async () => {
            const res = await request(app)
                .post('/api/v1/auth/reset-password')
                .send({
                    token: validToken
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe('error');
            expect(res.body.errors).toBeDefined();
        });

        it('should fail validation with weak password (too short)', async () => {
            const res = await request(app)
                .post('/api/v1/auth/reset-password')
                .send({
                    token: validToken,
                    new_password: 'Short1'
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe('error');
            expect(res.body.errors.some((error: any) => 
                error.msg.includes('at least 8 characters')
            )).toBe(true);
        });

        it('should fail validation with password missing uppercase', async () => {
            const res = await request(app)
                .post('/api/v1/auth/reset-password')
                .send({
                    token: validToken,
                    new_password: 'noupper123'
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.errors.some((error: any) => 
                error.msg.includes('uppercase')
            )).toBe(true);
        });

        it('should fail validation with password missing lowercase', async () => {
            const res = await request(app)
                .post('/api/v1/auth/reset-password')
                .send({
                    token: validToken,
                    new_password: 'NOLOWER123'
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.errors.some((error: any) => 
                error.msg.includes('lowercase')
            )).toBe(true);
        });

        it('should fail validation with password missing number', async () => {
            const res = await request(app)
                .post('/api/v1/auth/reset-password')
                .send({
                    token: validToken,
                    new_password: 'NoNumber'
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.errors.some((error: any) => 
                error.msg.includes('number')
            )).toBe(true);
        });
    });
});
