import QRCode, { type QRCodeOptions } from 'qrcode'
import sharp from 'sharp'
import fs from 'fs'

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
