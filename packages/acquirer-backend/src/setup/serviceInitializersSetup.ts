import { initializeDatabase } from '../database/initDatabase'
import logger from '../services/logger'
import {
  merchantDocumentBucketName,
  minioClient, createMerchantDocumentBucket
} from '../services/S3Client'

export async function tryInitializeS3 (): Promise<void> {
  try {
    await minioClient.listBuckets()
    await createMerchantDocumentBucket()
    await minioClient.putObject(merchantDocumentBucketName, 'test.txt', 'Hello World!')
    logger.info('S3 successfully initialized.')
  } catch (error: any) {
    logger.error('S3 Initializing error: %s', error.message)
    logger.info('Retrying S3 in 3 seconds...')

    // Retry after 3 seconds
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    setTimeout(tryInitializeS3, 3000)
  }
}

export async function tryInitializeDatabase (): Promise<void> {
  try {
    await initializeDatabase()
  } catch (error: any) {
    logger.error('MySQL Database Initializing error: %s', error.message)
    logger.info('Retrying in 3 seconds...')

    // Retry after 3 seconds
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    setTimeout(tryInitializeDatabase, 3000)
  }
}
