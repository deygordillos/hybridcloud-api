import express from 'express';
import request from 'supertest';
import rateLimit from 'express-rate-limit';

/**
 * Los limiters de producción (src/middlewares/rate-limit.middleware.ts) se
 * deshabilitan cuando NODE_ENV=test para no interferir con el resto de la
 * suite. Aquí se verifica el comportamiento del rate limiting con la misma
 * configuración pero límites pequeños.
 */
const buildApp = (limit: number) => {
    const app = express();
    app.use(rateLimit({
        windowMs: 15 * 60 * 1000,
        limit,
        standardHeaders: true,
        legacyHeaders: false,
        message: { message: 'Demasiadas solicitudes, intente de nuevo más tarde' },
    }));
    app.get('/ping', (_req, res) => res.status(200).json({ ok: true }));
    return app;
};

describe('Rate limiting middleware', () => {
    it('permite solicitudes por debajo del límite', async () => {
        const app = buildApp(5);
        for (let i = 0; i < 5; i++) {
            const res = await request(app).get('/ping');
            expect(res.status).toBe(200);
        }
    });

    it('responde 429 al exceder el límite', async () => {
        const app = buildApp(3);
        for (let i = 0; i < 3; i++) {
            await request(app).get('/ping');
        }
        const res = await request(app).get('/ping');
        expect(res.status).toBe(429);
        expect(res.body).toEqual({ message: 'Demasiadas solicitudes, intente de nuevo más tarde' });
    });

    it('incluye headers estándar RateLimit', async () => {
        const app = buildApp(10);
        const res = await request(app).get('/ping');
        expect(res.headers['ratelimit-limit']).toBeDefined();
        expect(res.headers['ratelimit-remaining']).toBeDefined();
    });
});
