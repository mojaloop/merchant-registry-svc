import QRCode, { type QRCodeOptions } from 'qrcode'
import sharp from 'sharp'
import fs from 'fs'

export const generateQRImage = async (
  text: string,
  options?: QRCodeOptions,
  frameImagePath: string = ''
): Promise<Buffer> => {
  const qrCodeBuffer = await QRCode.toBuffer(
    text,
    {
      width: 1500
    })

  if (frameImagePath === '') {
    return qrCodeBuffer
  }

  // Read the frame image into a buffer
  let frameImageBuffer: Buffer
  try {
    frameImageBuffer = await fs.promises.readFile(frameImagePath)
  } catch (err) {
    throw new Error(`Frame image not found: ${frameImagePath}`)
  }

  // Overlay the QR code onto the frame image
  const overlayedBuffer = await sharp(frameImageBuffer)
    .composite([{ input: qrCodeBuffer, gravity: 'center' }])
    .toBuffer()

  return overlayedBuffer
}
