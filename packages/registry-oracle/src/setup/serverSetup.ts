/* eslint-disable @typescript-eslint/no-misused-promises */
import { type Application } from 'express'
import logger from '../services/logger'

export default function setupServer (
  app: Application,
  HOSTNAME: string,
  PORT: number,
  tryInitializeDatabase: () => Promise<void>
): void {
  app.listen(PORT, HOSTNAME, async () => {
    logger.info(`API is running on http://${HOSTNAME}:${PORT}/api/v1`)
    logger.info(`Swagger API Documentation UI is running on http://${HOSTNAME}:${PORT}/docs`)
    await tryInitializeDatabase()
  })
}
