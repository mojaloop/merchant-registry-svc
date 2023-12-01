import QRCode, { type QRCodeOptions } from 'qrcode'
import sharp from 'sharp'
import fs from 'fs'
import { crc16ccitt } from 'crc'

export const getEMVQRCodeText = (
  guid: string,
  checkoutCounterAliasValue: string,
  merchantCategoryCode: string,
  transactionCurrency: string,
  // transactionAmount: string,
  countryCode: string | null | undefined,
  merchantDBAName: string,
  merchantCity: string | null | undefined
): string => {
  // Function to add data objects with automatic length calculation
  function addDataObject (id: string, value: string): string {
    const length = value.length.toString().padStart(2, '0')
    return `${id}${length}${value}`
  }

  let emvQRCodeText = addDataObject('00', '01')
  emvQRCodeText += addDataObject('01', '12')

  // Merchant Additional Info
  const guidObj = addDataObject('00', guid)
  const aliasType = addDataObject('01', 'ALIAS')
  const aliasObj = addDataObject('02', checkoutCounterAliasValue)

  emvQRCodeText += addDataObject('28', guidObj + aliasType + aliasObj)

  emvQRCodeText += addDataObject('52', merchantCategoryCode)
  emvQRCodeText += addDataObject('53', transactionCurrency)
  // emvQRCodeText += addDataObject('54', transactionAmount)
  if (countryCode != null && countryCode !== undefined) {
    emvQRCodeText += addDataObject('58', countryCode)
  }
  emvQRCodeText += addDataObject('59', merchantDBAName)

  if (merchantCity != null && merchantCity !== undefined) {
    emvQRCodeText += addDataObject('60', merchantCity)
  }

  // CRC
  emvQRCodeText += '6304'
  const crcValue = crc16ccitt(Buffer.from(emvQRCodeText, 'utf8'))
  emvQRCodeText += crcValue.toString(16).toUpperCase().padStart(4, '0')

  return emvQRCodeText
}

export const generateQRImage = async (
  text: string,
  options?: QRCodeOptions,
  frameImagePath = ''
): Promise<Buffer> => {
  let frameImageBuffer: Buffer = Buffer.from('')
  if (frameImagePath.length > 0) {
    // Read the frame image into a buffer
    try {
      frameImageBuffer = await fs.promises.readFile(frameImagePath)
    } catch (err) {
      throw new Error(`Frame image not found: ${frameImagePath}`)
    }
  }

  const qrCodeBuffer = await QRCode.toBuffer(
    text,
    {
      width: 1500
    })

  if (frameImagePath === '') {
    return qrCodeBuffer
  }

  // Overlay the QR code onto the frame image
  const overlayedBuffer = await sharp(frameImageBuffer)
    .composite([{ input: qrCodeBuffer, gravity: 'center' }])
    .toBuffer()

  return overlayedBuffer
}
