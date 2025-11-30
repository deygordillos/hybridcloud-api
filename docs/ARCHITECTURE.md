# Hybrid API - Architecture Documentation

## Table of Contents
1. [System Architecture](#system-architecture)
2. [Layer Architecture](#layer-architecture)
3. [Data Flow](#data-flow)
4. [Security Architecture](#security-architecture)
5. [Multi-Tenancy Architecture](#multi-tenancy-architecture)
6. [Database Schema](#database-schema)
7. [API Design](#api-design)

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                             │
│  (Web App, Mobile App, Third-party integrations)                │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTPS/REST
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                      API Gateway Layer                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Rate Limiter │  │ CORS Handler │  │ Compression  │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└────────────────────────┬────────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                   Authentication Layer                           │
│  ┌────────────────────────────────────────────────────┐         │
│  │ JWT Verification → User Context → Company Context  │         │
│  └────────────────────────────────────────────────────┘         │
└────────────────────────┬────────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                  Authorization Layer                             │
│  ┌──────────────┐  ┌────────────────┐  ┌──────────────┐        │
│  │ Role Check   │  │ Company Check  │  │ Permission   │        │
│  │ (Admin)      │  │ (Multi-tenant) │  │ Validator    │        │
│  └──────────────┘  └────────────────┘  └──────────────┘        │
└────────────────────────┬────────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                   Application Layer                              │
│  ┌────────────────────────────────────────────────────┐         │
│  │              Controllers (HTTP Handlers)            │         │
│  │  ┌──────────┐ ┌──────────┐ ┌───────────┐          │         │
│  │  │  Users   │ │Companies │ │Inventory  │ ...      │         │
│  │  └──────────┘ └──────────┘ └───────────┘          │         │
│  └────────────────────────────────────────────────────┘         │
│                         │                                        │
│  ┌────────────────────────────────────────────────────┐         │
│  │           Services (Business Logic)                 │         │
│  │  ┌──────────────┐ ┌──────────────┐ ┌─────────┐    │         │
│  │  │ UserService  │ │CompanyService│ │  ...    │    │         │
│  │  └──────────────┘ └──────────────┘ └─────────┘    │         │
│  └────────────────────────────────────────────────────┘         │
└────────────────────────┬────────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                    Data Access Layer                             │
│  ┌────────────────────────────────────────────────────┐         │
│  │            Repositories (TypeORM)                   │         │
│  │  ┌──────────────┐ ┌──────────────┐ ┌─────────┐    │         │
│  │  │UserRepository│ │CompanyRepo   │ │  ...    │    │         │
│  │  └──────────────┘ └──────────────┘ └─────────┘    │         │
│  └────────────────────────────────────────────────────┘         │
└────────────────────────┬────────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                    Database Layer                                │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────┐        │
│  │  Main DB       │  │  Audit DB      │  │  Cache     │        │
│  │  (MySQL/PG)    │  │  (Logs)        │  │  (Redis)   │        │
│  └────────────────┘  └────────────────┘  └────────────┘        │
└─────────────────────────────────────────────────────────────────┘
```

## Layer Architecture

### 1. Presentation Layer (Routes + Controllers)

**Responsibility:** Handle HTTP requests and responses

**Components:**
- `src/routes/`: API endpoint definitions
- `src/controllers/`: Request handlers
- `src/middlewares/`: Request interceptors

**Pattern:**
```typescript
Route → Middleware Chain → Controller → Response
```

**Example Flow:**
```
POST /api/v1/users
  ↓
authMiddleware (validate JWT)
  ↓
companyMiddleware (extract company context)
  ↓
adminMiddleware (check admin role)
  ↓
validatorRequestMiddleware (validate request body)
  ↓
UsersController.create()
  ↓
HTTP Response (201 Created)
```

### 2. Business Logic Layer (Services)

**Responsibility:** Implement business rules and orchestrate operations

**Components:**
- `src/services/`: Business logic implementation
- Validation rules
- Transaction management
- Audit logging
- Complex queries

**Pattern:**
```typescript
Controller calls Service → Service validates → Service calls Repository → Service returns result
```

**Key Services:**
- `UserService`: User management, authentication, audit
- `CompanyService`: Company CRUD, user-company associations
- `InventoryService`: Inventory operations, stock management
- `TaxService`: Tax calculations and management

### 3. Data Access Layer (Repositories)

**Responsibility:** Abstract database operations

**Components:**
- `src/repositories/`: TypeORM repositories
- `src/entity/`: Database entity definitions

**Pattern:**
```typescript
Repository ← TypeORM ← Database
```

**Repository Types:**
- **Basic Repositories:** Simple CRUD operations
- **Custom Repositories:** Complex queries, joins, aggregations

### 4. Cross-Cutting Concerns

**Components:**
- **Authentication:** JWT generation and verification
- **Authorization:** Role-based access control
- **Validation:** Input sanitization and validation
- **Error Handling:** Centralized error management
- **Logging:** Audit trails and system logs
- **Configuration:** Environment-based settings

## Data Flow

### Read Operation (GET)

```
Client Request
  ↓
[Route] /api/v1/users
  ↓
[Middleware] authMiddleware → verify JWT
  ↓
[Middleware] companyMiddleware → extract company_id
  ↓
[Controller] UsersController.list(req, res)
  ↓
[Service] UserService.list(offset, limit, company_id, is_admin, user_id)
  ↓
[Service] Build query based on permissions:
          - Admin: query all users OR filter by company_id
          - Non-admin: query users from user's companies
  ↓
[Repository] UserRepository / UsersCompaniesRepository
  ↓
[TypeORM] Generate SQL query
  ↓
[Database] Execute query
  ↓
[TypeORM] Map results to entities
  ↓
[Repository] Return data
  ↓
[Service] Process and format data
  ↓
[Controller] Format response with pagination
  ↓
[Response] JSON with success, data, pagination
  ↓
Client receives data
```

### Write Operation (POST/PUT)

```
Client Request with data
  ↓
[Route] /api/v1/users
  ↓
[Middleware] authMiddleware → verify JWT
  ↓
[Middleware] companyMiddleware → extract company_id
  ↓
[Middleware] adminMiddleware → check is_admin
  ↓
[Middleware] validatorRequestMiddleware → validate input
  ↓
[Controller] UsersController.create(req, res)
  ↓
[Controller] Extract user from req.user (JWT payload)
  ↓
[Controller] Extract IP address from request
  ↓
[Service] UserService.create(userData, createdBy, ipAddress)
  ↓
[Service] Business validations:
          - Check username uniqueness
          - Check email uniqueness
          - Hash password
  ↓
[Repository] UserRepository.create() → UserRepository.save()
  ↓
[Database] INSERT INTO users ...
  ↓
[Service] Create audit log entry
  ↓
[Repository] UserAuditRepository.save()
  ↓
[Database] INSERT INTO users_audit ...
  ↓
[Service] Return created user
  ↓
[Controller] Remove password from response
  ↓
[Controller] Format success response
  ↓
[Response] JSON with success, message, data (201)
  ↓
Client receives confirmation
```

## Security Architecture

### Authentication Flow

```
┌─────────────┐
│   Client    │
│  (Login)    │
└──────┬──────┘
       │ POST /auth/login
       │ {username, password}
       ▼
┌──────────────────────┐
│  AuthController      │
│  1. Receive creds    │
│  2. Call AuthService │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  AuthService         │
│  1. Find user        │
│  2. Validate pwd     │
│  3. Generate JWT     │
│  4. Generate refresh │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  JWT Token Generated │
│  Payload:            │
│  {                   │
│    user_id: 1,       │
│    username: "john", │
│    is_admin: 1       │
│  }                   │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  Response to Client  │
│  {                   │
│    access_token,     │
│    refresh_token     │
│  }                   │
└──────────────────────┘
```

### Authorization Flow (Middleware Chain)

```
Request with JWT
  ↓
┌─────────────────────────────┐
│  authMiddleware              │
│  ────────────────────────   │
│  1. Extract Authorization    │
│  2. Verify JWT signature     │
│  3. Decode payload           │
│  4. Attach to req.user       │
│  5. Continue or 401          │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│  companyMiddleware           │
│  ────────────────────────   │
│  1. Extract x-company-id     │
│  2. Verify user has access   │
│  3. Attach to req.company_id │
│  4. Continue or 403          │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│  adminMiddleware             │
│  ────────────────────────   │
│  1. Check req.user.is_admin  │
│  2. Continue or 403          │
└──────────┬──────────────────┘
           │
           ▼
     Controller executes
```

### Permission Model

```
┌──────────────────────────────────────────────────────────┐
│                    Permission Hierarchy                   │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  ┌─────────────────────────────────────────────────┐    │
│  │          System Administrator (is_admin = 1)     │    │
│  │  ───────────────────────────────────────────    │    │
│  │  • Full system access                            │    │
│  │  • Manage all companies                          │    │
│  │  • View all users                                │    │
│  │  • Create/update/deactivate any resource         │    │
│  │  • Access system configuration                   │    │
│  └─────────────────────────────────────────────────┘    │
│                         │                                 │
│                         ▼                                 │
│  ┌─────────────────────────────────────────────────┐    │
│  │     Company Administrator (is_company_admin = 1) │    │
│  │  ───────────────────────────────────────────    │    │
│  │  • Manage users within their company/companies   │    │
│  │  • View company data                             │    │
│  │  • Create/update resources for their company     │    │
│  │  • Cannot access other companies' data           │    │
│  └─────────────────────────────────────────────────┘    │
│                         │                                 │
│                         ▼                                 │
│  ┌─────────────────────────────────────────────────┐    │
│  │       Regular User (is_company_admin = 0)        │    │
│  │  ───────────────────────────────────────────    │    │
│  │  • View resources within their company/companies │    │
│  │  • Limited create/update permissions             │    │
│  │  • Cannot manage users                           │    │
│  │  • Cannot access other companies' data           │    │
│  └─────────────────────────────────────────────────┘    │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

## Multi-Tenancy Architecture

### Tenant Isolation Model

```
┌─────────────────────────────────────────────────────────────┐
│                    Multi-Tenant Data Model                   │
└─────────────────────────────────────────────────────────────┘

┌──────────┐         ┌──────────────────┐         ┌──────────┐
│  User 1  │────────▶│ users_companies  │◀────────│Company A │
└──────────┘         │  (Junction Table)│         └──────────┘
                     │                  │
     ┌───────────────┤  • user_id       │
     │               │  • company_id    │◀────────┐
     │               │  • is_company_   │         │
     │               │    admin         │         │
     │               └──────────────────┘         │
     │                                            │
     │                                            │
┌────▼────┐                                  ┌────┴────┐
│ User 2  │                                  │Company B│
│ (Admin) │──────────────────────────────────▶         │
└─────────┘                                  └────┬────┘
     │                                            │
     │               ┌──────────────────┐         │
     └──────────────▶│ users_companies  │◀────────┘
                     │  (Junction Table)│
                     │                  │
                     │  • user_id       │
                     │  • company_id    │
                     │  • is_company_   │
                     │    admin         │
                     └──────────────────┘
```

### Tenant Data Filtering Strategy

**1. Admin User (is_admin = 1):**
```sql
-- No filtering: Access all data
SELECT * FROM users;
SELECT * FROM companies;
```

**2. Non-Admin with company_id specified:**
```sql
-- Filter by specific company
SELECT u.* 
FROM users u
INNER JOIN users_companies uc ON uc.user_id = u.user_id
WHERE uc.company_id = :company_id;
```

**3. Non-Admin without company_id:**
```sql
-- Filter by all user's associated companies
SELECT u.*, uc.company_id
FROM users u
INNER JOIN users_companies uc ON uc.user_id = u.user_id
WHERE uc.company_id IN (
    SELECT company_id 
    FROM users_companies 
    WHERE user_id = :current_user_id
);
```

### Tenant Context Flow

```
Request arrives
  ↓
authMiddleware extracts user_id from JWT
  ↓
companyMiddleware checks x-company-id header
  ↓
┌─────────────────────────────────────────────────┐
│ Is x-company-id provided?                       │
├─────────────────────────────────────────────────┤
│ YES → Use that company_id                       │
│ NO  → Query user's companies:                   │
│       • If 1 company: use it automatically      │
│       • If multiple: require header OR filter   │
│         by all associated companies             │
└─────────────────────────────────────────────────┘
  ↓
Attach company_id to req['company_id']
  ↓
Controller passes to Service
  ↓
Service applies tenant filtering in queries
```

## Database Schema

### Core Tables Relationships

```
┌─────────────┐
│   Groups    │
│─────────────│
│ group_id PK │
│ group_name  │
└──────┬──────┘
       │ 1:N
       ▼
┌─────────────────────┐
│     Companies       │
│─────────────────────│
│ company_id PK       │
│ group_id FK         │
│ country_id FK       │
│ company_name        │
│ company_status      │
└──────┬──────────────┘
       │ N:M (via users_companies)
       ▼
┌──────────────────────┐
│  users_companies     │
│──────────────────────│
│ user_company_id PK   │
│ user_id FK           │
│ company_id FK        │
│ is_company_admin     │
│ created_at           │
└──────┬───────────────┘
       │
       ▼
┌─────────────────────┐
│       Users         │
│─────────────────────│
│ user_id PK          │
│ username UNIQUE     │
│ password HASHED     │
│ email UNIQUE        │
│ user_type           │
│ user_status         │
│ is_admin            │
│ created_at          │
│ updated_at          │
│ last_login          │
└──────┬──────────────┘
       │ 1:N
       ▼
┌─────────────────────┐
│    users_audit      │
│─────────────────────│
│ audit_id PK         │
│ user_id FK          │
│ changed_by FK       │
│ action_type ENUM    │
│ changes_data JSON   │
│ ip_address          │
│ created_at          │
└─────────────────────┘
```

### Inventory Schema

```
┌──────────────────┐
│   Companies      │
└────────┬─────────┘
         │ 1:N
         ▼
┌─────────────────────┐
│ inventory_family    │
│─────────────────────│
│ id_inv_family PK    │
│ company_id FK       │
│ inv_family_name     │
└────────┬────────────┘
         │ 1:N
         ▼
┌─────────────────────┐
│    inventory        │
│─────────────────────│
│ inv_id PK           │
│ id_inv_family FK    │
│ company_id FK       │
│ inv_code            │
│ inv_description     │
│ inv_type            │
│ inv_status          │
│ inv_has_variants    │
└────────┬────────────┘
         │ 1:N
         ├──────────────────┐
         │                  │
         ▼                  ▼
┌─────────────────┐  ┌──────────────────┐
│inventory_variants│ │ inventory_prices │
│─────────────────│  │──────────────────│
│ inv_variant_id PK│ │ inv_price_id PK  │
│ inv_id FK        │  │ inv_id FK        │
│ variant_sku      │  │ type_price_id FK │
│ variant_name     │  │ price_amount     │
└──────────────────┘  └──────────────────┘
```

## API Design

### RESTful Conventions

```
Resource: Users
─────────────────────────────────────────────────
GET    /api/v1/users              → List users (paginated)
GET    /api/v1/users/:id          → Get single user
POST   /api/v1/users              → Create user
PUT    /api/v1/users/:id          → Update user
DELETE /api/v1/users/:id          → Blocked (403)
POST   /api/v1/users/:id/activate → Activate user
POST   /api/v1/users/:id/deactivate → Deactivate user
POST   /api/v1/users/:id/change-password → Change password
GET    /api/v1/users/:id/audit-history → Get audit trail
```

### URL Structure

```
/api/{version}/{resource}/{id?}/{action?}

Examples:
/api/v1/companies/123
/api/v1/inventory?family_id=5&page=2&limit=20
/api/v1/users/45/deactivate
```

### Request/Response Format

**Request Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
x-company-id: 123 (optional)
```

**Success Response (200, 201):**
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

**Error Response (400, 404, 500):**
```json
{
  "success": false,
  "message": "Error description",
  "code": 400,
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### Pagination Strategy

```
Query Parameters:
- page: Page number (1-based)
- limit: Items per page (default 10, max 100)

Response includes:
- data: Array of items
- pagination:
  - total: Total count
  - perPage: Items per page
  - currentPage: Current page
  - lastPage: Total pages
```

### Filtering Strategy

```
Query Parameters:
- Exact match: ?status=1
- Multiple values: ?type=1,2,3
- Date ranges: ?start_date=2025-01-01&end_date=2025-12-31
- Search: ?search=keyword

Applied at Service Layer:
queryBuilder.andWhere("field = :value", { value });
```

---

**Document Version:** 1.0  
**Last Updated:** November 30, 2025  
**Next Review:** Quarterly or on major architectural changes
