import { AppDataSource } from './data-source'
import logger from '../logger'
import 'dotenv/config'

export const initializeDatabase = async (): Promise<void> => {
  logger.info('Connecting MySQL database...')

  await AppDataSource.initialize()
    .then(async () => {
      logger.info('MySQL Database Connection success.')
    })
    .catch((error) => {
      throw error
    })
}
