import { type Application } from 'express'
import swaggerUi from 'swagger-ui-express'
import { openAPISpecification } from '../openapi-spec-config'

export default function setupSwagger (app: Application): void {
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(openAPISpecification))
}
