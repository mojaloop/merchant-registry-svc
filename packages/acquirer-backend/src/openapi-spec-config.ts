import swaggerJSDoc from 'swagger-jsdoc'

const options = {
  failOnErrors: true,
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Merchant Acquirer API',
      version: '0.1.0'
    },
    components: {
      securitySchemes: {
        Authorization: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          value: 'Bearer <JWT token here>'
        }
      }
    }
  },
  apis: ['./src/routes/*.ts', './src/entities/*.ts']
}

export const openAPISpecification = swaggerJSDoc(options)
