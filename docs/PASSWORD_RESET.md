# Password Reset Process

## Overview

This document describes the password reset functionality implemented in the Hybrid API TypeScript system.

## Features

- Secure token-based password reset
- Token expiration (1 hour)
- Email validation
- Password strength validation
- Token hashing for security

## Endpoints

### 1. Request Password Reset

**Endpoint:** `POST /api/v1/auth/request-password-reset`

**Description:** Generates a reset token and sends it to the user's email (in production, this should send an email).

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Validation:**
- Email is required
- Email must be in valid format
- User must exist with the provided email
- User must be active (user_status = 1)

**Success Response (200):**
```json
{
  "message": "Password reset instructions have been sent to your email",
  "token": "a1b2c3d4e5f6...",  // Only in development mode
  "email": "user@example.com"
}
```

**Error Responses:**
- `400`: Email not provided or invalid format
- `400`: No user found with this email address

**Important Notes:**
- In production, the `token` field should NOT be returned in the response
- Instead, an email should be sent to the user with a reset link containing the token
- The token is hashed before storing in the database
- Token expires in 1 hour

### 2. Reset Password

**Endpoint:** `POST /v1/auth/reset-password`

**Description:** Resets the user's password using a valid reset token.

**Request Body:**
```json
{
  "token": "a1b2c3d4e5f6...",
  "new_password": "NewPassword123"
}
```

**Validation:**
- Token is required
- New password is required
- Password must be at least 8 characters
- Password must contain at least one uppercase letter
- Password must contain at least one lowercase letter
- Password must contain at least one number

**Success Response (200):**
```json
{
  "message": "Password has been reset successfully"
}
```

**Error Responses:**
- `400`: Token or password not provided
- `400`: Password doesn't meet strength requirements
- `400`: Invalid or expired reset token
- `400`: User not found or inactive

## Database Schema Changes

### New Fields in `users` Table

```sql
ALTER TABLE `users` 
ADD COLUMN `reset_password_token` varchar(255) NULL COMMENT 'token for password reset',
ADD COLUMN `reset_password_expires` datetime NULL COMMENT 'expiration date for reset token';
```

**Fields:**
- `reset_password_token`: Stores the hashed reset token (nullable, not selected by default)
- `reset_password_expires`: Token expiration date (nullable)

## Security Considerations

### Token Generation
- Tokens are generated using `crypto.randomBytes(32)` for cryptographic randomness
- 32 bytes = 256 bits of entropy
- Token is converted to hexadecimal string (64 characters)

### Token Storage
- Tokens are hashed using bcrypt before storage
- Hash strength: 10 rounds (same as passwords)
- Only the hashed version is stored in the database
- Unhashed token is only available when generated

### Token Validation
- Tokens expire after 1 hour
- Expired tokens are automatically rejected
- Token comparison uses bcrypt.compare (timing-attack resistant)
- Token is cleared after successful password reset

### Password Security
- New passwords are validated for strength:
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
- Passwords are hashed using bcrypt with 10 rounds
- Old password is overwritten, not stored

## Implementation Details

### Service Layer (`AuthService.ts`)

**`requestPasswordReset(email: string)`**
1. Finds user by email
2. Validates user exists and is active
3. Generates random token
4. Hashes token with bcrypt
5. Stores hashed token and expiration
6. Sends reset email via SMTP
7. Returns success message

**`resetPassword(token: string, newPassword: string)`**
1. Finds users with non-expired tokens
2. Compares provided token with stored hashes
3. Validates user status
4. Hashes new password
5. Updates password
6. Clears reset token fields
7. Returns success message

### Controller Layer (`AuthController.ts`)

**`requestPasswordReset(req, res)`**
- Validates email presence
- Calls service method
- Returns response

**`resetPassword(req, res)`**
- Validates token and password presence
- Calls service method
- Returns response

### Route Layer (`auth.route.ts`)

**Request Reset Route:**
- Validates email format
- Uses express-validator
- Public endpoint (no authentication required)

**Reset Password Route:**
- Validates token presence
- Validates password strength
- Uses express-validator
- Public endpoint (no authentication required)

## Usage Flow

### For Users

1. **User forgets password**
   - User goes to "Forgot Password" page
   - User enters their email
   - System sends reset link to email (in production)

2. **User receives reset link**
   - Email contains link like: `https://app.com/reset-password?token=xxx`
   - Link is valid for 1 hour

3. **User resets password**
   - User clicks link
   - User enters new password
   - System validates and updates password
   - User can now login with new password

### For Developers

**Development Testing:**
```bash
# 1. Request reset token (email will be sent)
curl -X POST http://localhost:3000/api/v1/auth/request-password-reset \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com"}'

# Response
# { "message": "Password reset instructions have been sent to your email", "email": "user@example.com" }

# 2. Check email and use token from email link
# Token will be in format: http://localhost:4200/reset-password?token=abc123...

# 3. Reset password using token from email
curl -X POST http://localhost:3000/api/v1/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "abc123...",
    "new_password": "NewPassword123"
  }'

# Response
# { "message": "Password has been reset successfully" }

# 4. Login with new password
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "user",
    "password": "NewPassword123"
  }'
```

## Email Configuration

The system now sends real emails via SMTP using nodemailer.

### SMTP Settings
Configure these environment variables in your `.env` file:

```env
############## EMAIL ##############
EMAIL_HOST=
EMAIL_PORT=
EMAIL_USER=
EMAIL_PASSWORD=
EMAIL_FROM=
EMAIL_FROM_NAME=
FRONTEND_URL=http://localhost:4200
```

### Email Service (`EmailService.ts`)

The `EmailService` provides:
- **`sendPasswordResetEmail()`** - Sends formatted reset email with token link
- **`sendEmail()`** - Generic email sending method
- **`verifyConnection()`** - Tests SMTP connection

### Email Template

The password reset email includes:
- Professional HTML design
- Reset button with direct link
- Alternative plain URL for copy/paste
- Token expiration warning (1 hour)
- Security notice
- Plain text fallback

### Testing Email Connection

You can test the email configuration:
```typescript
import { EmailService } from './services/EmailService';

// Verify SMTP connection
const isConnected = await EmailService.verifyConnection();
console.log('Email server ready:', isConnected);
```

## Production Considerations

### Email Service ✅ Implemented
The system now uses nodemailer with the following configuration:
- **Host:** mail.hybrid.com.ve
- **Port:** 587 (STARTTLS)
- **Authentication:** SMTP user/password
- **From:** info@hybrid.com.ve

### Additional Recommendations

1. **Rate Limiting**
   Add rate limiting to prevent abuse:
   ```typescript
   // Example with express-rate-limit
   import rateLimit from 'express-rate-limit';

   const resetLimiter = rateLimit({
       windowMs: 15 * 60 * 1000, // 15 minutes
       max: 3, // limit each IP to 3 requests per windowMs
       message: 'Too many reset attempts, please try again later'
   });

   router.post('/request-password-reset', resetLimiter, [...validators], handler);
   ```

2. **Monitoring**
   Log reset password attempts for security monitoring:
   - Number of requests per IP
   - Failed reset attempts
   - Successful resets
   - Expired token usage attempts

3. **Email Delivery**
   - Monitor email delivery rates
   - Set up bounce handling
   - Configure SPF, DKIM, and DMARC records
   - Use email tracking for delivery confirmation

## Migration

Run the migration to add the required database fields:

```bash
# Development
npm run migration:run

# Production
npm run migration:run:prod
```

To revert the migration:
```bash
# Development
npm run migration:revert

# Production
npm run migration:revert:prod
```

## Testing

### Manual Testing Checklist
- [ ] Request reset with valid email
- [ ] Request reset with invalid email
- [ ] Request reset with non-existent email
- [ ] Reset password with valid token
- [ ] Reset password with expired token (wait 1+ hour)
- [ ] Reset password with invalid token
- [ ] Reset password with weak password
- [ ] Verify old password doesn't work after reset
- [ ] Verify new password works after reset
- [ ] Verify token is cleared after successful reset

### Automated Testing (TODO)
Create test suite in `tests/modules/auth/`:
- `auth.reset.test.ts`

## Error Messages

All error messages are defined in `src/config/messages.ts`:

```typescript
Auth: {
    reset_token_sent: 'Password reset instructions have been sent to your email',
    invalid_reset_token: 'Invalid or expired reset token',
    password_reset_success: 'Password has been reset successfully',
    user_email_not_found: 'No user found with this email address'
}
```

## Related Documentation

- [SECURITY.md](./SECURITY.md) - Overall security practices
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture
- [DEVELOPMENT.md](./DEVELOPMENT.md) - Development guidelines

## Support

For issues or questions:
- Create an issue in GitLab
- Contact: Dey Gordillo

---

**Last Updated:** December 29, 2025  
**Version:** 1.4.0
