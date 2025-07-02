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

    JWT_ACCESS_TOKEN: process.env.JWT_ACCESS_TOKEN || '',
    JWT_REFRESH_TOKEN: process.env.JWT_REFRESH_TOKEN || '',
    JWT_EXPIRES_IN_ACCESS: process.env.JWT_EXPIRES_IN_ACCESS || '1h',
    JWT_EXPIRES_IN_REFRESH: process.env.JWT_EXPIRES_IN_REFRESH || '1d',
    BCRYPT_SALT: parseInt(process.env.BCRYPT_SALT || "10", 10)
}