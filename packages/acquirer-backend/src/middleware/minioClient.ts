import path from 'path'
import multer from 'multer'
import logger from '../logger'
import dotenv from 'dotenv'
import { Client } from 'minio'

if (process.env.NODE_ENV === 'test') {
  dotenv.config({ path: path.resolve(process.cwd(), '.env.test'), override: true })
}

const storage = multer.memoryStorage()

export const upload = multer({ storage })
export const pdfUpload = multer({
  storage,
  fileFilter: function (_req, file, cb) {
    // Only allow PDF files
    if (path.extname(file.originalname) !== '.pdf') {
      cb(new Error('Only PDFs are allowed')); return
    }
    cb(null, true)
  }
})

export const merchantDocumentBucketName =
  process.env.S3_MERCHANT_BUCKET_NAME ?? 'merchant-documents'

const endPoint = process.env.S3_ENDPOINT ?? 'localhost'
const port = parseInt(process.env.S3_PORT ?? '9000')
const useSSL = process.env.S3_USE_SSL === 'true'
const accessKey = process.env.S3_ACCESS_KEY ?? 'minioadmin'
const secretKey = process.env.S3_SECRET_KEY ?? 'minioadmin'

export const s3Region = process.env.S3_REGION ?? 'us-east-1'

export const minioClient = new Client({
  endPoint,
  port,
  useSSL,
  accessKey,
  secretKey
})

export async function createMerchantDocumentBucket (): Promise<void> {
  const exists = await minioClient.bucketExists(merchantDocumentBucketName)
  if (!exists) {
    logger.info('Creating Storage Server bucket: %s', merchantDocumentBucketName)
    await minioClient.makeBucket(merchantDocumentBucketName, s3Region)
    logger.info('Storage Server bucket created: %s', merchantDocumentBucketName)
  } else {
    logger.info('Storage Server bucket exists: %s', merchantDocumentBucketName)
  }
}

export async function removeMerchantDocumentBucket (): Promise<void> {
  const exists = await minioClient.bucketExists(merchantDocumentBucketName)
  if (exists) {
    await minioClient.removeBucket(merchantDocumentBucketName)
    logger.info('Storage Server bucket removed: %s', merchantDocumentBucketName)
  } else {
    logger.info('Storage Server bucket does not exist: %s', merchantDocumentBucketName)
  }
}

export async function removeMerchantDocument (documentPath: string): Promise<void> {
  // documentPath example.. merchant-1/merchant-1-license-document-1690705979705.pdf
  await minioClient.removeObject(merchantDocumentBucketName, documentPath)
  logger.info('Storage Server document removed: %s', documentPath)
}
