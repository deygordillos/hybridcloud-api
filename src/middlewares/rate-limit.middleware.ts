import rateLimit from 'express-rate-limit';

/**
 * Límite global: 300 solicitudes por IP cada 15 minutos.
 */
export const globalRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Demasiadas solicitudes, intente de nuevo más tarde' },
});

/**
 * Límite estricto para endpoints de autenticación (login/refresh):
 * 10 solicitudes por IP cada 15 minutos.
 */
export const authRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Demasiados intentos de autenticación, intente de nuevo más tarde' },
});
