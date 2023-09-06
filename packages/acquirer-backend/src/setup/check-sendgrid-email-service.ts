import logger from '../services/logger'
import { checkSendGridAPIKeyValidity } from '../utils/sendGrid'
import { readEnv } from './readEnv'

const apiKey = readEnv('SENDGRID_API_KEY', '<invalid-api-key>') as string

export function sendGridSetup (): void {
  logger.info('Connecting SendGrid Service...')
  checkSendGridAPIKeyValidity(apiKey).then((isValid) => {
    if (!isValid) {
      process.exit(1)
    }
    logger.info('Connecting SendGrid Service... Successful')
  }).catch((err) => {
    logger.error('Error while checking SendGrid API Key validity', err)
    process.exit(1)
  })
}
