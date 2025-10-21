const swaggerJSDoc = require('swagger-jsdoc');

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Funed API',
    version: '1.0.0',
    description: 'API para el sistema de Funed',
    contact: {
      name: 'Camilo Hurtado Dev'
    },
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Servidor Local'
    },
    {
      url: 'https://proyecto-funed-backend.onrender.com',
      description: 'Servidor de Producción'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      }
    }
  },
  security: [{
    bearerAuth: []
  }]
};

const options = {
  swaggerDefinition,
  // Paths to files containing OpenAPI definitions
  apis: ['./router/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
