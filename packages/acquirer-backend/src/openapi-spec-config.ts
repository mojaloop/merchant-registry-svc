import swaggerJSDoc from 'swagger-jsdoc'
import path from 'path'
import fs from 'fs'
import yaml from 'js-yaml'

const ROUTE_PATH = path.join(__dirname, './routes/**/*.ts')
const ENTITY_PATH = path.join(__dirname, './entities/**/*.ts')

const options = {
  failOnErrors: true,
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Merchant Acquirer API',
      version: '0.1.0',
      // eslint-disable-next-line max-len
      description: 'Merchant Acquirer Backend'
    },
    servers: [
      {
        url: '/api/v1'
      }
    ],
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

fs.writeFileSync(
  path.join(__dirname, '../docs/openapi-autogenerated.yaml'),
  yaml.dump(openAPISpecification)
)
