# Development Guide - Hybrid API

## Quick Start for Developers

### Prerequisites
- Node.js >= 18.x
- npm >= 9.x
- MySQL >= 8.0 or PostgreSQL >= 13
- Git
- TypeScript knowledge

### Setup

1. **Clone and Install**
```bash
git clone [repository-url]
cd hybrid-api-ts
npm install
```

2. **Environment Configuration**
```bash
cp .env.example .env
# Edit .env with your database credentials
```

3. **Database Setup**
```bash
# Create database
mysql -u root -p -e "CREATE DATABASE hybrid_db;"

# Run migrations
npm run migration:run
```

4. **Start Development Server**
```bash
npm run dev
```

Server runs at `http://localhost:3000`

## Project Structure

```
hybrid-api-ts/
├── src/
│   ├── app.ts                 # Express app configuration
│   ├── index.ts               # Entry point
│   ├── app-data-source.ts     # TypeORM configuration
│   ├── config/                # Configuration files
│   │   ├── config.ts          # App config
│   │   ├── jwt.ts             # JWT utilities
│   │   └── messages.ts        # Response messages
│   ├── controllers/           # HTTP request handlers
│   │   ├── users.controller.ts
│   │   ├── companies.controller.ts
│   │   └── ...
│   ├── entity/                # TypeORM entities
│   │   ├── users.entity.ts
│   │   ├── companies.entity.ts
│   │   └── ...
│   ├── helpers/               # Utility functions
│   │   └── responseHelper.ts
│   ├── middlewares/           # Express middlewares
│   │   ├── AuthMiddleware.ts
│   │   ├── adminMiddleware.ts
│   │   ├── companyMiddleware.ts
│   │   └── validator_request.ts
│   ├── migration/             # Database migrations
│   ├── repositories/          # TypeORM repositories
│   ├── routes/                # Route definitions
│   │   └── v1/                # API v1 routes
│   └── services/              # Business logic
│       ├── UserService.ts
│       ├── CompanyService.ts
│       └── ...
├── tests/                     # Test files
│   ├── helpers/
│   └── modules/
├── docs/                      # Documentation
├── AGENTS.md                  # AI agent documentation
├── README.md
├── package.json
└── tsconfig.json
```

## Development Workflow

### 1. Creating a New Feature

**Example: Adding a "Categories" module**

#### Step 1: Create Entity
```typescript
// src/entity/categories.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Index } from "typeorm";
import { Companies } from "./companies.entity";

@Index('idx_company_id', ['company_id'])
@Entity('categories')
export class Categories {
    @PrimaryGeneratedColumn()
    category_id: number;

    @ManyToOne(() => Companies, { onDelete: "CASCADE" })
    @JoinColumn({ name: "company_id" })
    company_id: Companies;

    @Column({ length: 100 })
    category_name: string;

    @Column({ type: 'tinyint', default: 1 })
    category_status: number;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
```

#### Step 2: Create Repository
```typescript
// src/repositories/CategoryRepository.ts
import { appDataSource } from "../app-data-source";
import { Categories } from "../entity/categories.entity";

export const CategoryRepository = appDataSource.getRepository(Categories);
```

#### Step 3: Create Service
```typescript
// src/services/CategoryService.ts
import { CategoryRepository } from "../repositories/CategoryRepository";
import messages from "../config/messages";

export class CategoryService {
    static async list(offset: number, limit: number, company_id: number) {
        const [data, total] = await CategoryRepository.findAndCount({
            where: { company_id: { company_id } },
            skip: offset,
            take: limit,
            order: { created_at: 'DESC' }
        });
        return { data, total };
    }

    static async findById(category_id: number) {
        const category = await CategoryRepository.findOne({
            where: { category_id },
            relations: ['company_id']
        });
        if (!category) {
            throw new Error(messages.Category.not_found);
        }
        return category;
    }

    static async create(data: any, company_id: number) {
        const category = CategoryRepository.create({
            ...data,
            company_id: { company_id }
        });
        return await CategoryRepository.save(category);
    }

    static async update(category_id: number, data: any) {
        await CategoryRepository.update(category_id, data);
        return await this.findById(category_id);
    }

    static async delete(category_id: number) {
        const result = await CategoryRepository.delete(category_id);
        if (result.affected === 0) {
            throw new Error(messages.Category.not_found);
        }
    }
}
```

#### Step 4: Create Controller
```typescript
// src/controllers/categories.controller.ts
import { Request, Response } from "express";
import { CategoryService } from "../services/CategoryService";
import { successResponse, errorResponse } from "../helpers/responseHelper";

export class CategoriesController {
    static async list(req: Request, res: Response): Promise<Response> {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const offset = (page - 1) * limit;
            const company_id = req['company_id'];

            const { data, total } = await CategoryService.list(offset, limit, company_id);
            
            const pagination = {
                total,
                perPage: limit,
                currentPage: page,
                lastPage: Math.ceil(total / limit)
            };

            return successResponse(res, "Categories retrieved", 200, data, pagination);
        } catch (error: any) {
            return errorResponse(res, error.message, 500);
        }
    }

    static async getById(req: Request, res: Response): Promise<Response> {
        try {
            const category_id = parseInt(req.params.id);
            const data = await CategoryService.findById(category_id);
            return successResponse(res, "Category retrieved", 200, data);
        } catch (error: any) {
            if (error.message.includes('not found')) {
                return errorResponse(res, error.message, 404);
            }
            return errorResponse(res, error.message, 500);
        }
    }

    static async create(req: Request, res: Response): Promise<Response> {
        try {
            const company_id = req['company_id'];
            const data = await CategoryService.create(req.body, company_id);
            return successResponse(res, "Category created", 201, data);
        } catch (error: any) {
            return errorResponse(res, error.message, 500);
        }
    }

    static async update(req: Request, res: Response): Promise<Response> {
        try {
            const category_id = parseInt(req.params.id);
            const data = await CategoryService.update(category_id, req.body);
            return successResponse(res, "Category updated", 200, data);
        } catch (error: any) {
            if (error.message.includes('not found')) {
                return errorResponse(res, error.message, 404);
            }
            return errorResponse(res, error.message, 500);
        }
    }

    static async delete(req: Request, res: Response): Promise<Response> {
        try {
            const category_id = parseInt(req.params.id);
            await CategoryService.delete(category_id);
            return successResponse(res, "Category deleted", 200, null);
        } catch (error: any) {
            if (error.message.includes('not found')) {
                return errorResponse(res, error.message, 404);
            }
            return errorResponse(res, error.message, 500);
        }
    }
}
```

#### Step 5: Create Routes
```typescript
// src/routes/v1/categories.route.ts
import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { validatorRequestMiddleware } from '../../middlewares/validator_request';
import { authMiddleware } from '../../middlewares/AuthMiddleware';
import { companyMiddleware } from '../../middlewares/companyMiddleware';
import { CategoriesController } from '../../controllers/categories.controller';

const router = Router();

// List categories
router.get('/',
    [
        authMiddleware,
        companyMiddleware,
        query('page').optional().isInt({ min: 1 }),
        query('limit').optional().isInt({ min: 1, max: 100 }),
        validatorRequestMiddleware
    ],
    CategoriesController.list
);

// Get single category
router.get('/:id',
    [
        authMiddleware,
        companyMiddleware,
        param('id').isInt(),
        validatorRequestMiddleware
    ],
    CategoriesController.getById
);

// Create category
router.post('/',
    [
        authMiddleware,
        companyMiddleware,
        body('category_name').notEmpty().isLength({ max: 100 }),
        body('category_status').optional().isInt().isIn([0, 1]),
        validatorRequestMiddleware
    ],
    CategoriesController.create
);

// Update category
router.put('/:id',
    [
        authMiddleware,
        companyMiddleware,
        param('id').isInt(),
        body('category_name').optional().isLength({ max: 100 }),
        body('category_status').optional().isInt().isIn([0, 1]),
        validatorRequestMiddleware
    ],
    CategoriesController.update
);

// Delete category
router.delete('/:id',
    [
        authMiddleware,
        companyMiddleware,
        param('id').isInt(),
        validatorRequestMiddleware
    ],
    CategoriesController.delete
);

export default router;
```

#### Step 6: Register Routes
```typescript
// src/routes/index.ts
import categoriesRoute from './v1/categories.route';

app.use('/api/v1/categories', categoriesRoute);
```

#### Step 7: Add Messages
```typescript
// src/config/messages.ts
export default {
    Category: {
        not_found: "Category not found",
        created: "Category created successfully",
        updated: "Category updated successfully",
        deleted: "Category deleted successfully"
    }
};
```

#### Step 8: Create Migration
```bash
npm run migration:generate -- AddCategoriesTable
npm run migration:run
```

#### Step 9: Write Tests
```typescript
// tests/modules/categories/categories.route.test.ts
import request from 'supertest';
import app from '../../../src/app';
import { appDataSource } from '../../../src/app-data-source';
import { authHeader, createTestCompany, createTestUserAndToken } from '../../helpers/setupTestData';

describe('Categories Routes', () => {
    let token: string;
    let companyId: number;

    beforeAll(async () => {
        await appDataSource.initialize();
        await appDataSource.runMigrations();
        
        const company = await createTestCompany();
        companyId = company.company_id;
        const { access_token } = await createTestUserAndToken(company);
        token = access_token;
    });

    afterAll(async () => {
        await appDataSource.destroy();
    });

    it('should create a category', async () => {
        const res = await request(app)
            .post('/api/v1/categories')
            .set(authHeader(token, companyId))
            .send({ category_name: 'Test Category' });

        expect(res.statusCode).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data.category_name).toBe('Test Category');
    });

    it('should list categories', async () => {
        const res = await request(app)
            .get('/api/v1/categories')
            .set(authHeader(token, companyId));

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data)).toBe(true);
    });
});
```

### 2. Database Migrations

**Create a new migration:**
```bash
npm run migration:generate -- MigrationName
```

**Run migrations:**
```bash
npm run migration:run
```

**Revert last migration:**
```bash
npm run migration:revert
```

**Migration template:**
```typescript
import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateTableName1234567890 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table({
            name: "table_name",
            columns: [
                {
                    name: "id",
                    type: "int",
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: "increment"
                },
                {
                    name: "name",
                    type: "varchar",
                    length: "100"
                },
                {
                    name: "created_at",
                    type: "timestamp",
                    default: "CURRENT_TIMESTAMP"
                }
            ]
        }), true);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("table_name");
    }
}
```

### 3. Testing

**Run all tests:**
```bash
npm test
```

**Run specific test file:**
```bash
npm test -- tests/modules/users/users.route.test.ts
```

**Run tests in watch mode:**
```bash
npm run test:watch
```

**Generate coverage report:**
```bash
npm run test:cov
```

**Test structure:**
```typescript
describe('Feature Name', () => {
    beforeAll(async () => {
        // Setup: Initialize database, create test data
    });

    afterAll(async () => {
        // Cleanup: Destroy connections
    });

    beforeEach(async () => {
        // Reset state before each test (optional)
    });

    describe('Endpoint Name', () => {
        it('should perform expected action', async () => {
            const res = await request(app)
                .post('/api/v1/endpoint')
                .set(authHeader(token, companyId))
                .send(data);

            expect(res.statusCode).toBe(201);
            expect(res.body.success).toBe(true);
        });

        it('should fail with invalid data', async () => {
            const res = await request(app)
                .post('/api/v1/endpoint')
                .set(authHeader(token, companyId))
                .send(invalidData);

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
        });
    });
});
```

## Common Tasks

### Adding Validation

```typescript
// In route definition
body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
body('age')
    .optional()
    .isInt({ min: 18, max: 120 })
    .withMessage('Age must be between 18 and 120'),
validatorRequestMiddleware
```

### Implementing Pagination

```typescript
// Controller
const page = parseInt(req.query.page as string) || 1;
const limit = Math.min(parseInt(req.query.limit as string) || 10, 100);
const offset = (page - 1) * limit;

const { data, total } = await Service.list(offset, limit);

const pagination = {
    total,
    perPage: limit,
    currentPage: page,
    lastPage: Math.ceil(total / limit)
};

return successResponse(res, "Success", 200, data, pagination);
```

### Adding Relationships

```typescript
// One-to-Many
@Entity()
export class Parent {
    @OneToMany(() => Child, child => child.parent)
    children: Child[];
}

@Entity()
export class Child {
    @ManyToOne(() => Parent, parent => parent.children)
    @JoinColumn({ name: "parent_id" })
    parent: Parent;
}

// Query with relations
const data = await Repository.findOne({
    where: { id },
    relations: ['children']
});
```

### Complex Queries

```typescript
// QueryBuilder
const data = await Repository
    .createQueryBuilder("entity")
    .leftJoinAndSelect("entity.relation", "relation")
    .where("entity.status = :status", { status: 1 })
    .andWhere("relation.type = :type", { type: 'A' })
    .orderBy("entity.created_at", "DESC")
    .skip(offset)
    .take(limit)
    .getManyAndCount();

// With subquery
const data = await Repository
    .createQueryBuilder("entity")
    .where((qb) => {
        const subQuery = qb.subQuery()
            .select("sub.id")
            .from("other_table", "sub")
            .where("sub.status = :status")
            .getQuery();
        return "entity.id IN " + subQuery;
    })
    .setParameter("status", 1)
    .getMany();
```

### Error Handling

```typescript
// In Service
static async method() {
    const item = await Repository.findOne({ where: { id } });
    if (!item) {
        throw new Error(messages.Item.not_found);
    }
    return item;
}

// In Controller
try {
    const data = await Service.method();
    return successResponse(res, "Success", 200, data);
} catch (error: any) {
    console.error('Controller.method error:', error);
    
    if (error.message === messages.Item.not_found) {
        return errorResponse(res, error.message, 404);
    }
    if (error.message.includes('duplicate')) {
        return errorResponse(res, "Item already exists", 400);
    }
    return errorResponse(res, error.message, 500);
}
```

## Debugging

### TypeScript Debugging in VS Code

**.vscode/launch.json:**
```json
{
    "version": "0.2.0",
    "configurations": [
        {
            "type": "node",
            "request": "launch",
            "name": "Debug TypeScript",
            "program": "${workspaceFolder}/src/index.ts",
            "preLaunchTask": "tsc: build - tsconfig.json",
            "outFiles": ["${workspaceFolder}/dist/**/*.js"],
            "sourceMaps": true
        }
    ]
}
```

### Console Logging

```typescript
// Development
console.log('Debug:', data);
console.error('Error:', error);

// Production - use logging library
import winston from 'winston';

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' })
    ]
});
```

### Database Query Logging

```typescript
// In app-data-source.ts
export const appDataSource = new DataSource({
    // ...
    logging: process.env.NODE_ENV === 'development' ? true : false,
    logger: "advanced-console"
});
```

## Best Practices

### Code Style

1. **Use TypeScript types**
```typescript
// Good
function getUser(id: number): Promise<User> { }

// Bad
function getUser(id: any): any { }
```

2. **Consistent naming**
- Controllers: `ModuleController`
- Services: `ModuleService`
- Entities: `ModuleName` (singular)
- Files: `module-name.ts` (kebab-case)

3. **Error handling**
```typescript
// Always use try-catch in controllers
try {
    // operation
} catch (error: any) {
    console.error('Error:', error);
    return errorResponse(res, error.message, 500);
}
```

4. **Async/await over callbacks**
```typescript
// Good
const user = await UserRepository.findOne({ where: { id } });

// Bad
UserRepository.findOne({ where: { id } }, (error, user) => { });
```

### Security

1. **Always validate input**
2. **Never trust user data**
3. **Hash passwords before saving**
4. **Never return passwords**
5. **Use parameterized queries**
6. **Apply authentication to protected routes**
7. **Check authorization before operations**

### Performance

1. **Use pagination for large datasets**
2. **Add indexes on foreign keys**
3. **Select only needed fields**
4. **Use QueryBuilder for complex queries**
5. **Implement caching for expensive operations**

## Troubleshooting

### Common Issues

**1. TypeORM connection error**
- Check database credentials in `.env`
- Ensure database exists
- Verify network connectivity

**2. Migration errors**
- Check migration file syntax
- Ensure database schema is correct
- Try reverting and re-running

**3. Authentication failures**
- Verify JWT_SECRET in `.env`
- Check token expiry
- Ensure Authorization header format

**4. Validation errors**
- Review express-validator rules
- Check request body format
- Ensure validatorRequestMiddleware is included

**5. Permission denied (403)**
- Verify user has required role
- Check middleware order in routes
- Confirm company access for user

---

**Happy Coding!**  
For questions, check AGENTS.md or existing code patterns.
