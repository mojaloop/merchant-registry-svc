import swaggerJSDoc from 'swagger-jsdoc'
import path from 'path'

const ROUTE_PATH = path.join(__dirname, './routes/*.ts')
const ENTITY_PATH = path.join(__dirname, './entities/*.ts')

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
  apis: [ROUTE_PATH, ENTITY_PATH]
}

export const openAPISpecification = swaggerJSDoc(options)
