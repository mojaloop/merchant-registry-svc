import path from 'path'
import multer from 'multer'
import logger from './logger'
import dotenv from 'dotenv'
import { Client, type UploadedObjectInfo } from 'minio'
import { convertURLFriendly } from '../utils/utils'
import { type MerchantEntity } from '../entity/MerchantEntity'
import { type DFSPEntity } from '../entity/DFSPEntity'

if (process.env.NODE_ENV === 'test') {
  dotenv.config({ path: path.resolve(process.cwd(), '.env.test'), override: true })
}

const storage = multer.memoryStorage()

export const upload = multer({ storage })

export const logoUpload = multer({
  storage,
  fileFilter: function (_req, file, cb) {
    const allowedMimeTypes = new Set([
      'image/jpeg',
      'image/png',
      'image/webp'
    ])
    // Only allow Image files
    if (allowedMimeTypes.has(file.mimetype)) {
      cb(null, true)
      return
    }
    cb(new Error('Only Image Files are allowed'))
  }
})

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

export const dfspLogoBucketName =
  process.env.S3_DFSP_LOGO_BUCKET_NAME ?? 'dfsp-logos'

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

export async function uploadCheckoutAliasQRImage (
  aliasValue: string,
  buffer: Buffer
): Promise<string | null> {
  const metaData = {
    'Content-Type': 'image/png',
    'X-Amz-Meta-Testing': 1234
  }

  const objectName = `qr_images/${aliasValue}.png`
  let uploadedQRInfo: UploadedObjectInfo | null = null
  try {
    uploadedQRInfo = await minioClient.putObject(
      merchantDocumentBucketName,
      objectName,
      buffer,
      buffer.length,
      metaData
    )
  } catch (e) {
    logger.error('Storage Server QR image upload error: %s', e)
    return null
  }
  if (uploadedQRInfo == null) {
    logger.error('Storage Server QR image upload error: %s', 'uploadedQRInfo is null')
    return null
  }

  logger.info('Storage Server QR image uploaded: %s', objectName)
  return objectName
}

export async function uploadMerchantDocument (
  merchant: MerchantEntity,
  licenseNumber: string,
  file: Express.Multer.File
): Promise<string | null> {
  const metaData = {
    'Content-Type': 'application/pdf',
    'X-Amz-Meta-Testing': 1234
  }

  const name = convertURLFriendly(merchant.dba_trading_name)
  file.originalname = convertURLFriendly(file.originalname)
  const postfix = convertURLFriendly(licenseNumber)
  const objectName = `${name}/${file.originalname}-${postfix}.pdf`
  let uploadedPDFInfo: UploadedObjectInfo | null = null
  try {
    uploadedPDFInfo = await minioClient.putObject(
      merchantDocumentBucketName,
      objectName,
      file.buffer,
      file.buffer.length,
      metaData
    )
  } catch (e) {
    logger.error('Storage Server document upload error: %s', e)
    return null
  }
  if (uploadedPDFInfo == null) {
    logger.error('Storage Server document upload error: %s', 'uploadedPDFInfo is null')
    return null
  }

  logger.info('Storage Server document uploaded: %s', objectName)
  return objectName
}

export async function uploadDFSPLogo (
  dfsp: DFSPEntity,
  file: Express.Multer.File
): Promise<string | null> {
  const metaData = {
    'Content-Type': file.mimetype
  }

  const name = convertURLFriendly(dfsp.name)
  file.originalname = convertURLFriendly(file.originalname)
  const postfix = convertURLFriendly(dfsp.name)
  const ext = path.extname(file.originalname)
  const objectName = `${name}/${file.originalname}-${postfix}${ext}`

  let uploadedLogoInfo: UploadedObjectInfo | null = null
  try {
    uploadedLogoInfo = await minioClient.putObject(
      merchantDocumentBucketName,
      objectName,
      file.buffer,
      file.buffer.length,
      metaData
    )
  } catch (e) {
    logger.error('Storage Server Logo upload error: %s', e)
    return null
  }
  if (uploadedLogoInfo == null) {
    logger.error('Storage Server Logo upload error: %s', 'uploadedLogoInfo is null')
    return null
  }

  logger.info('Storage Server Logo uploaded: %s', objectName)
  return objectName
}

export async function getQRImageUrl (qrPath: string): Promise<string> {
  // qrPath example.. qr_images/000001.png
  if (qrPath == null || qrPath.length === 0) {
    return ''
  }
  try {
    const url = await minioClient.presignedGetObject(merchantDocumentBucketName, qrPath)
    logger.info('Storage Server QR URL: %s', url)
    return url
  } catch (e) {
    logger.error('Storage Server QR URL error: %s', e)
    return ''
  }
}

export async function getMerchantDocumentURL (documentPath: string): Promise<string> {
  // documentPath example.. merchant-1/merchant-1-license-document-1690705979705.pdf
  if (documentPath == null || documentPath.length === 0) {
    return ''
  }
  try {
    const url = await minioClient.presignedGetObject(merchantDocumentBucketName, documentPath)
    logger.info('Storage Server document URL: %s', url)
    return url
  } catch (e) {
    logger.error('Storage Server document URL error: %s', e)
    return ''
  }
}

export async function getDFSPLogoURL (logoPath: string): Promise<string> {
  // documentPath example.. dfsp-1/dfsp-1-1690705979705.jpg
  if (logoPath == null || logoPath.length === 0) {
    return ''
  }
  try {
    const url = await minioClient.presignedGetObject(dfspLogoBucketName, logoPath)
    logger.info('Storage Server Logo URL: %s', url)
    return url
  } catch (e) {
    logger.error('Storage Server Logo URL error: %s', e)
    return ''
  }
}
