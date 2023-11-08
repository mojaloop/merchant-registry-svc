import { Readable } from 'stream'
import { AppDataSource } from '../../src/database/dataSource'
import { initializeDatabase } from '../../src/database/initDatabase'
import { MerchantEntity } from '../../src/entity/MerchantEntity'
import { getMerchantDocumentURL, getQRImageUrl, removeMerchantDocument, uploadCheckoutAliasQRImage, uploadMerchantDocument } from '../../src/services/S3Client'

export function s3ClientTests (): void {
  const mockFile: Express.Multer.File = {
    fieldname: 'file',
    originalname: 'test-document-m1.pdf',
    encoding: '7bit',
    mimetype: 'application/pdf',
    size: Buffer.from('file content', 'utf-8').length,
    destination: 'uploads/',
    filename: 'test-document-m1.pdf',
    path: 'uploads/test-document-m1.pdf',
    buffer: Buffer.from('file content', 'utf-8'),
    stream: new Readable({
      read () {
        this.push(mockFile.buffer)
        this.push(null) // No more data
      }
    })
  }

  beforeAll(async () => {
    await initializeDatabase()
  })

  it('should upload a PDF document and return the object name', async () => {
    // Arrange
    const merchant = AppDataSource.manager.create(MerchantEntity)
    merchant.dba_trading_name = 'Merchant Trading #1'
    const licenseNumber = '123456'

    // Act
    const objectName = await uploadMerchantDocument(merchant, licenseNumber, mockFile)

    // Assert
    expect(objectName).toEqual(expect.any(String))
    expect(objectName?.length).toBeGreaterThan(0)

    // Clean up
    await removeMerchantDocument(objectName as string)
  })

  it('should return a signed URL for the merchant document', async () => {
    // Arrange
    const merchant = AppDataSource.manager.create(MerchantEntity)
    merchant.dba_trading_name = 'Merchant Trading #3'
    const licenseNumber = '123456'
    const objectName = await uploadMerchantDocument(merchant, licenseNumber, mockFile)

    // Act
    const url = await getMerchantDocumentURL(objectName as string)

    // Assert
    expect(url).toEqual(expect.any(String))
    expect(url?.length).toBeGreaterThan(0)

    // Clean up
    await removeMerchantDocument(objectName as string)
  })

  it('should upload QR image and return the object name', async () => {
    const mockBuffer = Buffer.from('image data', 'utf-8')
    const aliasValue = 'test-alias'
    // Act
    const objectName = await uploadCheckoutAliasQRImage(aliasValue, mockBuffer)

    // Assert
    expect(objectName).toEqual(`qr_images/${aliasValue}.png`)
  })

  it('should return a signed URL for the QR image', async () => {
    // Arrange
    const mockBuffer = Buffer.from('image data', 'utf-8')
    const aliasValue = 'test-alias'
    const objectName = await uploadCheckoutAliasQRImage(aliasValue, mockBuffer)

    // Act
    const url = await getQRImageUrl(objectName as string)

    // Assert
    expect(url).toEqual(expect.any(String))
    expect(url?.length).toBeGreaterThan(0)
    expect(url).toContain('http')

    // Clean up
    await removeMerchantDocument(objectName as string)
  })

  it('should remove a merchant document', async () => {
    // Arrange
    const merchant = AppDataSource.manager.create(MerchantEntity)
    merchant.dba_trading_name = 'Merchant Trading #4'
    const licenseNumber = '123456'
    const objectName = await uploadMerchantDocument(merchant, licenseNumber, mockFile)

    // Act
    await removeMerchantDocument(objectName as string)

    // Assert
    expect(objectName).toEqual(expect.any(String))
    expect(objectName?.length).toBeGreaterThan(0)
  })
}
