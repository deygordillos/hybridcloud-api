import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Hybrid API',
      version: '1.3.5',
      description: 'Documentación de la API REST con Swagger',
    },
    servers: [
      {
        url: 'http://localhost:3002',
        description: 'Servidor local',
      },
    ],
  },
  apis: ['./routes/*.js', './routes/*.ts'],
};

const swaggerSpec = swaggerJSDoc(options);

export { swaggerUi, swaggerSpec };
