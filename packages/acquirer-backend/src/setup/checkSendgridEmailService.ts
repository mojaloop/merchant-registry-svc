import logger from '../services/logger'
import { checkSendGridAPIKeyValidity } from '../utils/sendGrid'
import { readEnv } from './readEnv'

const apiKey = readEnv('SENDGRID_API_KEY', '<invalid-api-key>') as string

const RETRY_INTERVAL_MS = 30000 // 30s // Time between retries in milliseconds

export async function sendGridSetup (): Promise<void> {
  logger.info('Connecting SendGrid Service...')
  checkSendGridAPIKeyValidity(apiKey).then(async (isValid) => {
    if (isValid) {
      logger.info('Connecting SendGrid Service... Successful')
    } else {
      logger.info(`SendGrid Service: Retrying in ${RETRY_INTERVAL_MS / 1000} seconds...`)
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      setTimeout(async (): Promise<void> => {
        await sendGridSetup()
      }, RETRY_INTERVAL_MS)
    }
  }).catch((_err) => {})
}
