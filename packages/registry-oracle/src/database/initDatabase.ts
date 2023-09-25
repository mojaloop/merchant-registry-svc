import { AppDataSource } from './dataSource'
import logger from '../services/logger'
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

