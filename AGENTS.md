# AI Agent Documentation - Hybrid API TypeScript

## Project Overview

**Project Name:** Hybrid API TypeScript  
**Version:** 1.4.0  
**Type:** Multi-tenant Administrative System REST API  
**Tech Stack:** Node.js, Express, TypeScript, TypeORM, MySQL/PostgreSQL  
**Architecture Pattern:** MVC with Repository Pattern  
**Authentication:** JWT (JSON Web Tokens)  

## Purpose

This is an enterprise-level administrative system API designed for multi-company inventory, user, and financial management. The system supports multiple companies (tenants) with role-based access control, comprehensive audit trails, and modular architecture for scalability.

## Quick Context Guide

### When User Asks About...

**Authentication/Security:**
- JWT tokens in `src/config/jwt.ts`
- Auth middleware: `src/middlewares/AuthMiddleware.ts`
- Admin middleware: `src/middlewares/adminMiddleware.ts`
- Company context: `src/middlewares/companyMiddleware.ts`
- Password hashing: bcrypt (10 rounds)

**Users:**
- Controller: `src/controllers/users.controller.ts`
- Service: `src/services/UserService.ts`
- Entity: `src/entity/users.entity.ts`
- Audit: `src/entity/users_audit.entity.ts`
- Routes: `src/routes/v1/users.route.ts`
- Tests: `tests/modules/users/users.route.test.ts`

**Companies:**
- Controller: `src/controllers/companies.controller.ts`
- Service: `src/services/CompanyService.ts`
- Entity: `src/entity/companies.entity.ts`
- Users-Companies relation: `src/entity/users_companies.entity.ts`

**Inventory:**
- Main entity: `src/entity/inventory.entity.ts`
- Families: `src/entity/inventoryFamily.entity.ts`
- Storage: `src/entity/inventoryStorage.entity.ts`
- Variants: `src/entity/inventory_variants.entity.ts`
- Prices: `src/entity/inventory_prices.entity.ts`
- Movements: `src/entity/inventory_movements.entity.ts`
- Lots: `src/entity/inventory_lots.entity.ts`

**Validation:**
- express-validator for request validation
- Middleware: `src/middlewares/validator_request.ts`
- Pattern: validators in route definitions

**Database:**
- ORM: TypeORM
- Migrations: `src/migration/`
- Data source: `src/app-data-source.ts`
- Repositories: `src/repositories/`

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    HTTP Request (JWT Token)                  │
└────────────────────────────┬────────────────────────────────┘
                             │
                    ┌────────▼─────────┐
                    │  Express Routes  │
                    │  (v1, v2, ...)   │
                    └────────┬─────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
┌───────▼────────┐  ┌────────▼─────────┐  ┌──────▼──────┐
│ authMiddleware │  │ companyMiddleware│  │adminMiddleware│
│  (JWT verify)  │  │ (extract company)│  │ (role check) │
└───────┬────────┘  └────────┬─────────┘  └──────┬──────┘
        │                    │                    │
        └────────────────────┼────────────────────┘
                             │
                    ┌────────▼─────────┐
                    │   Controllers    │
                    │ (HTTP handlers)  │
                    └────────┬─────────┘
                             │
                    ┌────────▼─────────┐
                    │    Services      │
                    │ (Business Logic) │
                    └────────┬─────────┘
                             │
                    ┌────────▼─────────┐
                    │   Repositories   │
                    │ (Data Access)    │
                    └────────┬─────────┘
                             │
                    ┌────────▼─────────┐
                    │  TypeORM/MySQL   │
                    │    (Database)    │
                    └──────────────────┘
```

## Key Design Patterns

### 1. Multi-Tenancy Pattern
- Companies are isolated tenants
- Users can belong to multiple companies via `users_companies` junction table
- Each user has `is_company_admin` flag per company
- Filtering by company is enforced at service layer

### 2. Repository Pattern
- All database access through TypeORM repositories
- Custom repositories in `src/repositories/`
- Example: `UserRepository`, `CompanyRepository`, `UsersCompaniesRepository`

### 3. Service Layer Pattern
- Business logic isolated from HTTP concerns
- Services handle transactions, validations, and complex queries
- Example: `UserService.list()`, `CompanyService.create()`

### 4. Audit Trail Pattern
- Critical entities have audit tables (e.g., `users_audit`)
- Tracks: CREATE, UPDATE, DEACTIVATE, ACTIVATE, PASSWORD_CHANGE
- Records: changed_by (user_id), IP address, changes_data (JSON), timestamp

### 5. Soft Delete Pattern
- Users cannot be deleted, only deactivated
- DELETE endpoints return 403 with message
- Use `user_status` field (0=inactive, 1=active)

## Security Implementation (OWASP Top 10)

### A01: Broken Access Control
**Implementation:**
- JWT authentication on all protected routes
- Role-based access control (admin vs regular user)
- Company-based data isolation
- Middleware chain: `authMiddleware → companyMiddleware → adminMiddleware`

**Example:**
```typescript
router.post('/users',
    [authMiddleware, companyMiddleware, adminMiddleware, ...validators],
    UsersController.create
);
```

### A02: Cryptographic Failures
**Implementation:**
- Passwords hashed with bcrypt (10 rounds)
- JWT tokens with configurable expiry
- Sensitive data never in logs or responses
- Password field excluded from API responses

**Code Location:**
- `src/config/jwt.ts` - Token generation
- `src/entity/users.entity.ts` - Password hashing in `hashPassword()` method

### A03: Injection
**Implementation:**
- TypeORM parameterized queries (prevents SQL injection)
- express-validator for input sanitization
- No raw SQL queries without parameterization

**Example:**
```typescript
queryBuilder.where("uc.company_id = :company_id", { company_id });
```

### A04: Insecure Design
**Implementation:**
- Separation of concerns (MVC + Services + Repositories)
- Fail-secure defaults (deny by default)
- Input validation at route level
- Business logic validation in services

### A05: Security Misconfiguration
**Implementation:**
- Environment variables for sensitive config
- Helmet.js for HTTP headers (if implemented)
- CORS configuration
- Error handling middleware prevents stack trace leaks

**Code Location:**
- `src/middlewares/error.middleware.ts`
- `.env` for configuration

### A07: Identification and Authentication Failures
**Implementation:**
- JWT with expiry
- Refresh token mechanism
- Password complexity requirements (min 8 chars, uppercase, lowercase, number)
- No password in responses
- Session management via JWT

**Password Rules:**
```typescript
.isLength({ min: 8 })
.matches(/[A-Z]/) // uppercase
.matches(/[a-z]/) // lowercase
.matches(/[0-9]/) // number
```

### A08: Software and Data Integrity Failures
**Implementation:**
- Audit tables for critical operations
- Change tracking with user attribution
- Migration system for schema versioning
- TypeScript for type safety

### A09: Security Logging and Monitoring
**Implementation:**
- Audit trail in `users_audit` table
- IP address logging on sensitive operations
- Operation type tracking (CREATE, UPDATE, etc.)
- Changes stored as JSON for forensics

**Audit Structure:**
```typescript
{
  audit_id: number,
  user_id: FK,
  changed_by: FK,
  action_type: ENUM,
  changes_data: JSON,
  ip_address: string,
  created_at: timestamp
}
```

### A10: Server-Side Request Forgery (SSRF)
**Implementation:**
- No external URL fetching based on user input
- File upload validation (if implemented)
- Whitelist approach for external resources

## Database Schema Key Relationships

```
users (1) ──< users_companies >── (N) companies
                    │
                    └─── is_company_admin (flag)

users (1) ──< users_audit (audit trail)

companies (1) ──< inventory (N)
companies (1) ──< taxes (N)
companies (1) ──< customers (N)

inventory (1) ──< inventory_variants (N)
inventory (1) ──< inventory_prices (N)
inventory (1) ──< inventory_movements (N)

groups (1) ──< companies (N)
countries (1) ──< companies (N)
```

## API Conventions

### Request Headers
```
Authorization: Bearer <JWT_TOKEN>
x-company-id: <COMPANY_ID> (optional, for filtering)
Content-Type: application/json
```

### Response Format (Success)
```json
{
  "success": true,
  "message": "Operation successful",
  "code": 200,
  "data": { ... },
  "pagination": {
    "total": 100,
    "perPage": 10,
    "currentPage": 1,
    "lastPage": 10
  }
}
```

### Response Format (Error)
```json
{
  "success": false,
  "message": "Error description",
  "code": 400,
  "errors": [ ... ]
}
```

### Helper Functions
- `successResponse(res, message, code, data, pagination?)`
- `errorResponse(res, message, code, errors?)`
- Located: `src/helpers/responseHelper.ts`

## Permission Matrix

| Action | Admin | Company Admin | Regular User | Notes |
|--------|-------|---------------|--------------|-------|
| List all users (no company_id) | ✅ | ❌ | ❌ | Admin sees all system users |
| List users (with company_id) | ✅ | ✅ | ✅ | Filtered by company |
| List users (no company_id, non-admin) | ✅* | ✅* | ✅* | *Shows users from their associated companies |
| Create user | ✅ | ✅ | ❌ | Admin or Company Admin only |
| Update user | ✅ | ✅ | ❌ | Admin or Company Admin only |
| Deactivate user | ✅ | ✅ | ❌ | Soft delete only |
| Delete user | ❌ | ❌ | ❌ | Not allowed (403) |
| List all companies | ✅ | ❌ | ❌ | Admin sees all |
| List companies (non-admin) | ❌ | ✅* | ✅* | *Only their associated companies |
| Create company | ✅ | ❌ | ❌ | Admin only |
| Update company | ✅ | ✅ | ❌ | Admin or Company Admin |

## Common Code Patterns

### Creating a New Endpoint

1. **Define Route** (`src/routes/v1/module.route.ts`):
```typescript
router.post('/',
    [
        authMiddleware,
        companyMiddleware,
        adminMiddleware,
        body('field').notEmpty(),
        validatorRequestMiddleware
    ],
    ModuleController.create
);
```

2. **Create Controller** (`src/controllers/module.controller.ts`):
```typescript
static async create(req: Request, res: Response): Promise<Response> {
    try {
        const currentUser = (req as any).user;
        const data = await ModuleService.create(req.body, currentUser);
        return successResponse(res, "Created successfully", 201, data);
    } catch (error: any) {
        return errorResponse(res, error.message, 500);
    }
}
```

3. **Implement Service** (`src/services/ModuleService.ts`):
```typescript
static async create(data: any, currentUser: any) {
    const entity = ModuleRepository.create(data);
    return await ModuleRepository.save(entity);
}
```

4. **Create Repository** (`src/repositories/ModuleRepository.ts`):
```typescript
import { appDataSource } from "../app-data-source";
import { Module } from "../entity/module.entity";

export const ModuleRepository = appDataSource.getRepository(Module);
```

### Filtering by Company (Admin vs Non-Admin)

**Pattern used in UserService.list() and CompanyService.list():**

```typescript
static async list(offset, limit, company_id?, is_admin, current_user_id?) {
    const queryBuilder = Repository.createQueryBuilder("entity");
    
    // If NOT admin, filter by user's companies
    if (!is_admin && current_user_id) {
        queryBuilder.innerJoin(
            "users_companies", "uc",
            "uc.company_id = entity.company_id AND uc.user_id = :current_user_id",
            { current_user_id }
        );
    }
    
    // If company_id specified, filter by that company
    if (company_id) {
        queryBuilder.andWhere("entity.company_id = :company_id", { company_id });
    }
    
    return await queryBuilder.getManyAndCount();
}
```

### Audit Trail Implementation

```typescript
private static async createAuditLog(
    user_id: number,
    changed_by: any,
    action_type: string,
    changes_data: object,
    ip_address?: string
) {
    const audit = UserAuditRepository.create({
        user_id: { user_id },
        changed_by: { user_id: changed_by.user_id },
        action_type,
        changes_data: JSON.stringify(changes_data),
        ip_address
    });
    await UserAuditRepository.save(audit);
}

// Usage
await this.createAuditLog(
    user.user_id,
    createdBy,
    'CREATE',
    { username: user.username, email: user.email },
    ipAddress
);
```

## Testing Strategy

**Framework:** Jest + Supertest  
**Test Database:** SQLite (in-memory)  
**Location:** `tests/modules/`

### Test Structure
```typescript
describe('Module Routes - /api/v1/module', () => {
    beforeAll(async () => {
        // Initialize test database
        await appDataSource.initialize();
        await appDataSource.runMigrations();
        
        // Create test data
        company = await createTestCompany();
        const { data, access_token } = await createTestUserAndToken(company);
        token = access_token;
        adminUser = data;
    });
    
    afterAll(async () => {
        await appDataSource.destroy();
    });
    
    it('should perform action', async () => {
        const res = await request(app)
            .post('/api/v1/module')
            .set(authHeader(token, company.company_id))
            .send(data);
        
        expect(res.statusCode).toBe(201);
        expect(res.body.success).toBe(true);
    });
});
```

### Running Tests
```bash
npm test                           # All tests
npm test -- tests/modules/users   # Specific module
npm run test:watch                 # Watch mode
npm run test:cov                   # Coverage report
```

## Migration System

### Creating a Migration
```bash
npm run migration:generate -- NameOfMigration
```

### Running Migrations
```bash
npm run migration:run      # Development
npm run migration:run:prod # Production
```

### Reverting Migrations
```bash
npm run migration:revert      # Development
npm run migration:revert:prod # Production
```

### Migration Pattern
```typescript
export class MigrationName1234567890 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table({
            name: "table_name",
            columns: [ ... ]
        }));
    }
    
    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("table_name");
    }
}
```

## Environment Configuration

**Required Variables:**
```env
# Server
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=password
DB_NAME=hybrid_db

# JWT
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# Bcrypt
BCRYPT_SALT=10

# CORS
CORS_ORIGIN=http://localhost:4200
```

## Common Tasks

### Adding a New Entity

1. Create entity file in `src/entity/`:
```typescript
@Entity('table_name')
export class EntityName {
    @PrimaryGeneratedColumn()
    id: number;
    
    @Column()
    name: string;
    
    @CreateDateColumn()
    created_at: Date;
}
```

2. Create repository:
```typescript
export const EntityRepository = appDataSource.getRepository(EntityName);
```

3. Generate migration:
```bash
npm run migration:generate -- AddEntityName
```

4. Run migration:
```bash
npm run migration:run
```

### Adding Validation to Endpoint

Use express-validator in route definition:
```typescript
body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format'),
body('password')
    .isLength({ min: 8 }).withMessage('Min 8 characters')
    .matches(/[A-Z]/).withMessage('Needs uppercase'),
validatorRequestMiddleware
```

### Implementing Audit Trail

1. Create audit entity (follow `users_audit.entity.ts` pattern)
2. Create audit repository
3. Add audit methods to service
4. Call audit on CREATE, UPDATE, DELETE operations

## Performance Considerations

### Query Optimization
- Use `select()` to fetch only needed fields
- Use pagination (`offset`, `limit`)
- Add indexes on foreign keys and frequently queried fields
- Use `getRawMany()` for flat results instead of nested objects

### Caching Strategy (Future)
- Redis for session management
- Query result caching for expensive operations
- ETags for static resources

### Database Indexes
```typescript
@Index('idx_user_id', ['user_id'])
@Index('idx_company_id', ['company_id'])
@Index('idx_user_company', ['user_id', 'company_id'])
```

## Error Handling Best Practices

1. **Always use try-catch in controllers**
2. **Return appropriate HTTP status codes**
3. **Use consistent error response format**
4. **Log errors but don't expose stack traces**
5. **Validate at route level AND service level**

```typescript
try {
    // Operation
} catch (error: any) {
    console.error('Controller.method error:', error);
    if (error.message === messages.Entity.not_found) {
        return errorResponse(res, error.message, 404);
    }
    return errorResponse(res, error.message, 500);
}
```

## Code Quality Rules

1. **TypeScript strict mode enabled**
2. **No `any` types without justification**
3. **Consistent naming conventions:**
   - Controllers: `ModuleController`
   - Services: `ModuleService`
   - Entities: `ModuleName` (singular)
   - Repositories: `ModuleRepository`
   - Routes: `module.route.ts`
4. **Always hash passwords before saving**
5. **Never return passwords in API responses**
6. **Use transactions for multi-step operations**
7. **Validate input at route level**
8. **Business logic belongs in services, not controllers**

## Troubleshooting Guide

### JWT Token Issues
- Check token expiry in `src/config/jwt.ts`
- Verify `JWT_SECRET` in `.env`
- Ensure `Authorization: Bearer <token>` header format

### TypeORM Connection Issues
- Verify database credentials in `.env`
- Check `app-data-source.ts` configuration
- Ensure database exists and migrations are run

### Validation Failures
- Check route validators using express-validator
- Ensure `validatorRequestMiddleware` is in middleware chain
- Review validation error response format

### Permission Denied (403)
- Verify user has `is_admin = 1` for admin routes
- Check `is_company_admin` for company-specific operations
- Ensure JWT token contains correct user data

### Test Failures
- Check if test database is properly initialized
- Verify test user has `is_admin = 1` in `setupTestData.ts`
- Ensure all tests include `authHeader(token, companyId)`
- SQLite limitations: use `simple-enum` instead of `enum` for entities

## Token Usage Optimization for AI Agents

### Use These Quick References

**User Module:**
- CRUD: `src/controllers/users.controller.ts` + `src/services/UserService.ts`
- Auth: `src/middlewares/AuthMiddleware.ts`
- Routes: `src/routes/v1/users.route.ts`
- Tests: `tests/modules/users/users.route.test.ts`

**Company Module:**
- CRUD: `src/controllers/companies.controller.ts` + `src/services/CompanyService.ts`
- Multi-tenant: Uses `users_companies` junction table

**Inventory Module:**
- Main: `src/entity/inventory.entity.ts`
- Related: variants, prices, movements, lots, storages

**Security:**
- JWT: `src/config/jwt.ts`
- Middlewares: `src/middlewares/` (auth, admin, company, validator)
- Password: bcrypt with 10 rounds

**Database:**
- Config: `src/app-data-source.ts`
- Migrations: `src/migration/`
- Repositories: `src/repositories/`

### When Debugging
1. Check controller → service → repository flow
2. Verify middleware chain in routes
3. Check entity relationships in TypeORM
4. Review validation rules in routes
5. Check test files for expected behavior

## Future Enhancements

- [ ] Redis caching layer
- [ ] Rate limiting middleware
- [ ] API versioning (v2, v3)
- [ ] WebSocket support for real-time updates
- [ ] File upload service
- [ ] Email notification service
- [ ] Comprehensive API documentation (Swagger)
- [ ] GraphQL endpoint option
- [ ] Monitoring and logging service (Winston, Sentry)
- [ ] Kubernetes deployment configuration

---

**Last Updated:** November 30, 2025  
**Maintainer:** Dey Gordillo  
**For AI Agents:** This documentation is optimized for context understanding. Always check file contents before modifications as codebase evolves.
