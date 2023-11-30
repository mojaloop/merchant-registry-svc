import path from 'path'
import { generateQRImage } from '../../src/services/generateQRImage'
import logger from '../../src/services/logger'

logger.silent = true
describe('generateQRImage', () => {
  const sampleText = 'Hello, QR!'

  it('should generate a QR code without a frame', async () => {
    const result = await generateQRImage(sampleText)
    expect(result).toBeInstanceOf(Buffer)
    // Optionally, save this to a file for manual inspection?
    // fs.writeFileSync('./qr_with_frame.png', result);
  }, 30000)

  it('should generate a QR code with a frame', async () => {
    const frameImagePath = path.join(__dirname, '../test-files/frame.png')

    const result = await generateQRImage(sampleText, undefined, frameImagePath)
    expect(result).toBeInstanceOf(Buffer)
    // Optionally, save this to a file for manual inspection?
    // fs.writeFileSync('./qr_with_frame.png', result);
  }, 30000)

  it('should throw an error if frame image path is invalid', async () => {
    // An invalid path for testing
    const invalidFrameImagePath = './invalid-path.png'

    await expect(generateQRImage(sampleText, undefined, invalidFrameImagePath))
      .rejects
      .toThrow(`Frame image not found: ${invalidFrameImagePath}`)
  }, 30000)
})
