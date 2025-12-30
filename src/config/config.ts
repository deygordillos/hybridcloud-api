import 'dotenv/config';

export default {
    isProduction: process.env.NODE_ENV === 'production',
    PORT: parseInt(process.env.PORT || "3000"),
    LOGGER: process.env.LOGGER || 'dev',

    DB_DRIVER: process.env.NODE_ENV === 'test' ? 'sqlite' : (process.env.DB_DRIVER || 'mysql'),
    DB_HOST: process.env.DB_HOST || 'localhost',
    DB_PORT: parseInt(process.env.DB_PORT || "3306"),
    DB_USERNAME: process.env.DB_USERNAME || '',
    DB_PASSWORD: process.env.DB_PASSWORD || '',
    DB_DATABASE: process.env.NODE_ENV === 'test' ? ':memory:' : (process.env.DB_DATABASE || ''),
    DB_DEBUG: process.env.DB_DEBUG === 'true' || false,
    DB_SYNC: process.env.DB_SYNC === 'true' || false,
    DB_SSL: process.env.DB_SSL === 'true' || false,
    DB_SSL_CA: process.env.DB_SSL_CA || '',

    JWT_ACCESS_TOKEN: process.env.JWT_ACCESS_TOKEN || '',
    JWT_REFRESH_TOKEN: process.env.JWT_REFRESH_TOKEN || '',
    JWT_EXPIRES_IN_ACCESS: process.env.JWT_EXPIRES_IN_ACCESS || '1h',
    JWT_EXPIRES_IN_REFRESH: process.env.JWT_EXPIRES_IN_REFRESH || '1d',
    BCRYPT_SALT: parseInt(process.env.BCRYPT_SALT || "10", 10),

    // Email configuration
    EMAIL_HOST: process.env.EMAIL_HOST || '',
    EMAIL_PORT: parseInt(process.env.EMAIL_PORT || ""),
    EMAIL_USER: process.env.EMAIL_USER || '',
    EMAIL_PASSWORD: process.env.EMAIL_PASSWORD || '',
    EMAIL_FROM: process.env.EMAIL_FROM || '',
    EMAIL_FROM_NAME: process.env.EMAIL_FROM_NAME || '',
    FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:4200',
    
    // Resend API (fallback for email sending)
    RESEND_API_KEY: process.env.RESEND_API_KEY || ''
}