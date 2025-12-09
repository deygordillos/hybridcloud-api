# Security Guidelines - Hybrid API

## Table of Contents
1. [OWASP Top 10 Implementation](#owasp-top-10-implementation)
2. [Authentication Security](#authentication-security)
3. [Authorization Security](#authorization-security)
4. [Data Protection](#data-protection)
5. [Input Validation](#input-validation)
6. [API Security Best Practices](#api-security-best-practices)
7. [Audit and Monitoring](#audit-and-monitoring)
8. [Security Checklist](#security-checklist)

## OWASP Top 10 Implementation

### A01: Broken Access Control

**Threat:** Users acting outside of their intended permissions

**Implementation:**

1. **Middleware Chain for Access Control**
```typescript
// Every protected route MUST have authMiddleware
router.post('/users',
    [
        authMiddleware,        // Verify JWT and user identity
        companyMiddleware,     // Verify company context
        adminMiddleware,       // Verify admin role
        validatorRequestMiddleware
    ],
    Controller.method
);
```

2. **Role-Based Access Control (RBAC)**
```typescript
// Admin check
if (req.user.is_admin !== 1) {
    return res.status(403).json({ error: "Admin access required" });
}

// Company admin check
const userCompany = await UsersCompaniesRepository.findOne({
    where: { user_id: req.user.user_id, company_id, is_company_admin: 1 }
});
if (!userCompany) {
    return res.status(403).json({ error: "Company admin access required" });
}
```

3. **Data-Level Access Control**
```typescript
// NEVER trust client-provided IDs for authorization
// ALWAYS verify ownership/access at service layer

// BAD - Using client-provided company_id without verification
const company = await CompanyRepository.findOne({ where: { company_id: req.body.company_id }});

// GOOD - Verify user has access to the company
const userCompany = await UsersCompaniesRepository.findOne({
    where: { 
        user_id: req.user.user_id, 
        company_id: req.body.company_id 
    }
});
if (!userCompany) {
    throw new Error("Access denied");
}
```

**Security Rules:**
- ✅ All routes protected by default (deny by default)
- ✅ Explicit permission checks before data access
- ✅ Company-level data isolation enforced
- ✅ No direct object reference without verification
- ✅ Audit trail for sensitive operations

### A02: Cryptographic Failures

**Threat:** Exposure of sensitive data through weak cryptography

**Implementation:**

1. **Password Storage**
```typescript
// ALWAYS hash passwords with bcrypt
import bcrypt from "bcrypt";

// Hash on creation/update
async hashPassword() {
    if (this.password) {
        this.password = await bcrypt.hash(this.password, 10);
    }
}

// Verify on login
async validarPassword(password: string) {
    return await bcrypt.compare(password, this.password);
}
```

2. **JWT Token Security**
```typescript
// Use strong secrets (min 256 bits)
JWT_SECRET=your-very-long-random-secret-key-here

// Set appropriate expiry
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

// Sign with algorithm
jwt.sign(payload, config.JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn: config.JWT_EXPIRES_IN
});
```

3. **Sensitive Data Handling**
```typescript
// NEVER return passwords in responses
const { password, ...userWithoutPassword } = user;
return userWithoutPassword;

// NEVER log sensitive data
console.log('User created:', user.username); // OK
console.log('User created:', user); // BAD - might log password
```

**Security Rules:**
- ✅ All passwords hashed with bcrypt (10 rounds minimum)
- ✅ JWT secrets stored in environment variables
- ✅ Passwords excluded from all API responses
- ✅ No sensitive data in logs
- ✅ HTTPS enforced in production (configure reverse proxy)

### A03: Injection

**Threat:** Malicious code injected through user input

**Implementation:**

1. **SQL Injection Prevention (TypeORM)**
```typescript
// GOOD - Parameterized queries
queryBuilder.where("company_id = :company_id", { company_id });
queryBuilder.andWhere("user_status = :status", { status });

// BAD - String concatenation (NEVER DO THIS)
queryBuilder.where(`company_id = ${company_id}`); // VULNERABLE!
```

2. **NoSQL Injection Prevention**
```typescript
// Always validate and sanitize input
const page = parseInt(req.query.page as string) || 1;
const limit = Math.min(parseInt(req.query.limit as string) || 10, 100);
```

3. **Command Injection Prevention**
```typescript
// NEVER execute user input as shell commands
// If file operations needed, sanitize paths
import path from 'path';

const safePath = path.join(__dirname, 'uploads', path.basename(filename));
```

**Security Rules:**
- ✅ Use TypeORM parameterized queries exclusively
- ✅ Validate and sanitize all inputs
- ✅ No dynamic SQL string construction
- ✅ Type coercion for numeric inputs
- ✅ Whitelist validation for enum values

### A04: Insecure Design

**Threat:** Security flaws in application architecture

**Implementation:**

1. **Secure Architecture Patterns**
- MVC separation of concerns
- Repository pattern for data access
- Service layer for business logic
- Middleware chain for security checks

2. **Fail-Secure Defaults**
```typescript
// Default to most restrictive permission
const is_admin = currentUser?.is_admin === 1; // defaults to false

// Require explicit grants
if (!is_admin && !company_id) {
    return errorResponse(res, "Access denied", 403);
}
```

3. **Principle of Least Privilege**
```typescript
// Users only see data they have access to
if (!is_admin) {
    queryBuilder.innerJoin(
        "users_companies", "uc",
        "uc.company_id = entity.company_id AND uc.user_id = :user_id",
        { user_id: currentUser.user_id }
    );
}
```

**Security Rules:**
- ✅ Deny by default, allow explicitly
- ✅ Layered security (defense in depth)
- ✅ Separation of duties
- ✅ Minimal privilege principle
- ✅ Security by design, not afterthought

### A05: Security Misconfiguration

**Threat:** Insecure default configurations

**Implementation:**

1. **Environment Configuration**
```typescript
// .env file (NEVER commit to repository)
NODE_ENV=production
DB_HOST=localhost
DB_PASSWORD=strong-random-password
JWT_SECRET=very-long-random-secret

// Add .env to .gitignore
echo ".env" >> .gitignore
```

2. **Error Handling**
```typescript
// PRODUCTION - Hide implementation details
if (process.env.NODE_ENV === 'production') {
    return res.status(500).json({ 
        error: "Internal server error" 
    });
}

// DEVELOPMENT - Show details
if (process.env.NODE_ENV === 'development') {
    return res.status(500).json({ 
        error: error.message,
        stack: error.stack 
    });
}
```

3. **HTTP Headers Security**
```typescript
// Use helmet middleware
import helmet from 'helmet';
app.use(helmet());

// Configure CORS properly
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));
```

**Security Rules:**
- ✅ Secrets in environment variables
- ✅ Different configs for dev/prod
- ✅ No default/weak passwords
- ✅ Disable debug mode in production
- ✅ Security headers configured
- ✅ CORS properly configured

### A07: Identification and Authentication Failures

**Threat:** Weak authentication mechanisms

**Implementation:**

1. **Strong Password Policy**
```typescript
body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/)
    .withMessage('Password must contain uppercase letter')
    .matches(/[a-z]/)
    .withMessage('Password must contain lowercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain number')
```

2. **JWT Session Management**
```typescript
// Short-lived access tokens
JWT_EXPIRES_IN=1h

// Refresh token mechanism
JWT_REFRESH_EXPIRES_IN=7d

// Token validation on every request
const decoded = verifyToken(token);
req['user'] = decoded;
```

3. **Account Security**
```typescript
// Track last login
user.last_login = new Date();
await UserRepository.save(user);

// Password change requires current password
async changePassword(currentPassword: string, newPassword: string) {
    const isValid = await this.validarPassword(currentPassword);
    if (!isValid) throw new Error("Current password incorrect");
    this.password = newPassword;
    await this.hashPassword();
}
```

**Security Rules:**
- ✅ Strong password requirements enforced
- ✅ JWT tokens with expiry
- ✅ Refresh token rotation
- ✅ Last login tracking
- ✅ No password in responses
- ✅ Secure password reset flow (if implemented)

### A08: Software and Data Integrity Failures

**Threat:** Code and infrastructure integrity compromised

**Implementation:**

1. **Audit Trail System**
```typescript
// Track all critical changes
await UserAuditRepository.save({
    user_id: { user_id: user.user_id },
    changed_by: { user_id: currentUser.user_id },
    action_type: 'UPDATE',
    changes_data: JSON.stringify({
        old: { email: oldEmail },
        new: { email: newEmail }
    }),
    ip_address: req.ip,
    created_at: new Date()
});
```

2. **Database Migrations**
```typescript
// Version control for schema changes
npm run migration:generate -- DescriptiveName
npm run migration:run

// Rollback capability
npm run migration:revert
```

3. **Input Integrity**
```typescript
// Validate data types and ranges
const page = Math.max(1, parseInt(req.query.page as string) || 1);
const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 10));
```

**Security Rules:**
- ✅ Comprehensive audit logging
- ✅ Migration version control
- ✅ Change attribution (who, when, what)
- ✅ IP address logging
- ✅ Input type validation
- ✅ Change data preserved as JSON

### A09: Security Logging and Monitoring Failures

**Threat:** Insufficient logging and monitoring

**Implementation:**

1. **Audit Table Structure**
```sql
CREATE TABLE users_audit (
    audit_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    changed_by INT,
    action_type ENUM('CREATE', 'UPDATE', 'DEACTIVATE', 'ACTIVATE', 'PASSWORD_CHANGE'),
    changes_data JSON,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_changed_by (changed_by),
    INDEX idx_action_type (action_type),
    INDEX idx_created_at (created_at)
);
```

2. **Logging Critical Events**
```typescript
// Log authentication attempts
console.log(`Login attempt: ${username} from ${req.ip}`);

// Log authorization failures
console.log(`Access denied: user ${user.user_id} attempted ${action} on ${resource}`);

// Log data modifications
console.log(`User ${user.user_id} updated company ${company_id}`);
```

3. **Queryable Audit Trail**
```typescript
// Retrieve audit history
async getAuditHistory(user_id: number, offset: number, limit: number) {
    return await UserAuditRepository
        .createQueryBuilder("audit")
        .leftJoinAndSelect("audit.changed_by", "changed_by")
        .where("audit.user_id = :user_id", { user_id })
        .orderBy("audit.created_at", "DESC")
        .skip(offset)
        .take(limit)
        .getManyAndCount();
}
```

**Security Rules:**
- ✅ Log all authentication attempts
- ✅ Log all authorization failures
- ✅ Log all data modifications
- ✅ Include user, IP, timestamp
- ✅ Audit trails are queryable
- ✅ Logs protected from tampering
- ✅ Regular log review (manual/automated)

### A10: Server-Side Request Forgery (SSRF)

**Threat:** Server tricked into making malicious requests

**Implementation:**

1. **URL Validation**
```typescript
// If accepting URLs from users
import { URL } from 'url';

function validateUrl(urlString: string): boolean {
    try {
        const url = new URL(urlString);
        // Whitelist allowed protocols
        if (!['http:', 'https:'].includes(url.protocol)) {
            return false;
        }
        // Blacklist internal IPs
        const hostname = url.hostname;
        if (hostname === 'localhost' || 
            hostname.startsWith('127.') || 
            hostname.startsWith('192.168.') ||
            hostname.startsWith('10.')) {
            return false;
        }
        return true;
    } catch {
        return false;
    }
}
```

2. **File Upload Security**
```typescript
// Validate file types
const allowedMimeTypes = ['image/jpeg', 'image/png', 'application/pdf'];
if (!allowedMimeTypes.includes(file.mimetype)) {
    throw new Error("File type not allowed");
}

// Sanitize filenames
import path from 'path';
const safeName = path.basename(file.originalname)
    .replace(/[^a-zA-Z0-9.-]/g, '_');
```

**Security Rules:**
- ✅ Validate all user-provided URLs
- ✅ Whitelist allowed protocols
- ✅ Blacklist internal networks
- ✅ Sanitize file names
- ✅ Validate file types
- ✅ No user control over server requests

## Authentication Security

### JWT Token Structure

```typescript
// Token Payload
{
    user_id: number,
    username: string,
    is_admin: number,
    iat: number,  // issued at
    exp: number   // expiry
}

// Token Generation
export const generateToken = (user: Users) => {
    return jwt.sign(
        {
            user_id: user.user_id,
            username: user.username,
            is_admin: user.is_admin
        },
        config.JWT_SECRET,
        { expiresIn: config.JWT_EXPIRES_IN }
    );
};

// Token Verification
export const verifyToken = (token: string) => {
    try {
        return jwt.verify(token, config.JWT_SECRET);
    } catch (error) {
        throw new Error("Invalid token");
    }
};
```

### Authentication Flow Security

```
1. User submits credentials
   ↓
2. Server validates credentials
   ↓
3. If valid:
   a. Generate access token (short-lived: 1h)
   b. Generate refresh token (long-lived: 7d)
   c. Return both tokens
   ↓
4. Client stores tokens securely:
   - Access token: Memory (not localStorage)
   - Refresh token: httpOnly cookie
   ↓
5. Client sends access token with each request:
   Authorization: Bearer <access_token>
   ↓
6. Server validates token on each request:
   a. Verify signature
   b. Check expiry
   c. Extract user payload
   ↓
7. When access token expires:
   a. Client sends refresh token
   b. Server validates refresh token
   c. Issue new access token
   d. Rotate refresh token (optional)
```

### Password Security

**Hashing Algorithm: bcrypt**
- Cost factor: 10 (2^10 = 1024 iterations)
- Automatically salted
- Resistant to rainbow tables
- Slow by design (prevents brute force)

**Password Requirements:**
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- (Optional) At least one special character

**Password Change Flow:**
```typescript
1. User must be authenticated
2. Require current password verification
3. Validate new password meets requirements
4. Hash new password
5. Update database
6. Create audit log entry
7. (Optional) Invalidate all existing sessions
8. (Optional) Send email notification
```

## Authorization Security

### Permission Levels

```
Level 1: System Administrator (is_admin = 1)
  • Full system access
  • Bypass company restrictions
  • Manage all resources
  
Level 2: Company Administrator (is_company_admin = 1)
  • Full access within their companies
  • Manage users in their companies
  • Cannot access other companies
  
Level 3: Regular User (is_company_admin = 0)
  • View access within their companies
  • Limited modification rights
  • No user management
```

### Authorization Checks

```typescript
// Check 1: Authentication
if (!req.user) {
    return res.status(401).json({ error: "Not authenticated" });
}

// Check 2: Admin Role
if (requiresAdmin && req.user.is_admin !== 1) {
    return res.status(403).json({ error: "Admin access required" });
}

// Check 3: Company Access
if (company_id) {
    const hasAccess = req.user.is_admin === 1 || 
        await UsersCompaniesRepository.findOne({
            where: { 
                user_id: req.user.user_id, 
                company_id 
            }
        });
    
    if (!hasAccess) {
        return res.status(403).json({ error: "Company access denied" });
    }
}

// Check 4: Resource Ownership
const resource = await ResourceRepository.findOne({ where: { id } });
if (resource.created_by !== req.user.user_id && req.user.is_admin !== 1) {
    return res.status(403).json({ error: "Access denied" });
}
```

## Data Protection

### Sensitive Data Handling

**1. Password Protection**
```typescript
// NEVER return password field
const { password, ...userWithoutPassword } = user;
return userWithoutPassword;

// Use @Exclude() decorator (if using class-transformer)
@Exclude()
password: string;
```

**2. Personal Data Protection**
```typescript
// Log only non-sensitive data
console.log('User login:', user.username); // OK
console.log('User data:', user); // BAD - might contain sensitive fields

// Sanitize before logging
const sanitized = {
    user_id: user.user_id,
    username: user.username,
    action: 'login'
};
console.log('Event:', sanitized);
```

**3. Database Encryption (Future Enhancement)**
```typescript
// For highly sensitive fields
@Column({ type: 'text', transformer: {
    to: (value: string) => encrypt(value),
    from: (value: string) => decrypt(value)
}})
ssn: string;
```

### Data Minimization

**Only collect and store necessary data:**
- ✅ Username, email, hashed password
- ✅ User type, role, status
- ✅ Timestamps (created, updated, last_login)
- ❌ Social security numbers (unless required)
- ❌ Credit card details (use payment gateway)
- ❌ Unnecessary personal information

## Input Validation

### Validation Strategy

```
Layer 1: Route-Level (express-validator)
  ↓
Layer 2: DTO Validation (optional)
  ↓
Layer 3: Service-Level Business Rules
  ↓
Layer 4: Database Constraints
```

### express-validator Examples

```typescript
// Email validation
body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail()

// String length validation
body('username')
    .notEmpty().withMessage('Username is required')
    .isLength({ min: 3, max: 100 })
    .withMessage('Username must be between 3 and 100 characters')
    .trim()

// Numeric validation
query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer')
    .toInt()

// Enum validation
body('user_type')
    .notEmpty()
    .isInt()
    .isIn([1, 2, 3, 4])
    .withMessage('User type must be 1, 2, 3, or 4')

// Complex validation
body('password')
    .notEmpty()
    .isLength({ min: 8 })
    .matches(/[A-Z]/)
    .matches(/[a-z]/)
    .matches(/[0-9]/)
```

### Sanitization

```typescript
// String sanitization
.trim()          // Remove whitespace
.escape()        // Escape HTML characters
.normalizeEmail() // Normalize email format

// Number coercion
.toInt()         // Convert to integer
.toFloat()       // Convert to float

// Boolean coercion
.toBoolean()     // Convert to boolean
```

## API Security Best Practices

### 1. Rate Limiting (Future Implementation)

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window
    message: 'Too many requests, please try again later'
});

app.use('/api/', limiter);

// Stricter for auth endpoints
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: 'Too many login attempts'
});

app.use('/api/v1/auth/login', authLimiter);
```

### 2. CORS Configuration

```typescript
import cors from 'cors';

app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:4200',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-company-id']
}));
```

### 3. Security Headers

```typescript
import helmet from 'helmet';

app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"]
        }
    },
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    }
}));
```

### 4. Request Size Limits

```typescript
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
```

### 5. Query Complexity Limits

```typescript
// Limit pagination
const limit = Math.min(
    parseInt(req.query.limit as string) || 10,
    100  // Maximum 100 items per page
);

// Prevent deeply nested queries
const maxDepth = 3;
```

## Audit and Monitoring

### What to Audit

**High Priority:**
- ✅ Authentication attempts (success/failure)
- ✅ Authorization failures
- ✅ User creation/modification/deletion
- ✅ Password changes
- ✅ Permission changes
- ✅ Configuration changes

**Medium Priority:**
- ✅ Data access (read operations)
- ✅ Data modifications (create/update)
- ✅ Report generation
- ✅ Export operations

**Low Priority:**
- ✅ Login/logout events
- ✅ Session information

### Audit Log Format

```typescript
{
    audit_id: 123,
    user_id: 45,
    changed_by: 1,
    action_type: 'UPDATE',
    changes_data: {
        old: { email: 'old@example.com' },
        new: { email: 'new@example.com' }
    },
    ip_address: '192.168.1.100',
    created_at: '2025-11-30T10:30:00Z'
}
```

### Monitoring Alerts (Future)

- Failed login attempts > 5 in 15 minutes
- Authorization failures > 10 in 1 hour
- Database errors > 5 in 5 minutes
- API response time > 2 seconds
- Memory usage > 80%

## Security Checklist

### Development
- [ ] All routes protected by authMiddleware
- [ ] Admin routes protected by adminMiddleware
- [ ] Company routes use companyMiddleware
- [ ] All inputs validated with express-validator
- [ ] Passwords hashed with bcrypt
- [ ] No passwords in responses
- [ ] No sensitive data in logs
- [ ] TypeORM parameterized queries only
- [ ] Error messages don't expose internals

### Pre-Deployment
- [ ] Environment variables configured
- [ ] JWT secrets are strong and unique
- [ ] Database passwords are strong
- [ ] CORS configured for production domain
- [ ] Helmet middleware enabled
- [ ] Rate limiting configured
- [ ] HTTPS enforced
- [ ] Security headers configured
- [ ] Error handling hides stack traces

### Production
- [ ] Regular security updates
- [ ] Dependency vulnerability scanning
- [ ] Log monitoring active
- [ ] Backup and recovery tested
- [ ] Incident response plan ready
- [ ] Regular security audits
- [ ] Penetration testing scheduled

### Compliance
- [ ] Data retention policy
- [ ] Privacy policy published
- [ ] User consent mechanisms
- [ ] Data export capability
- [ ] Data deletion capability
- [ ] Audit log retention (minimum 1 year)

---

**Document Version:** 1.0  
**Last Security Review:** November 30, 2025  
**Next Review:** Monthly or after security incidents  
**Security Contact:** [Add security team email]
