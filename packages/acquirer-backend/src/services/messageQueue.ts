/* istanbul ignore file */
/* planning to remove messagequeue in favor of gRPC */
import amqplib, { type Connection, type Channel, type Message } from 'amqplib'
import 'dotenv/config'
import { AuditActionType, AuditTrasactionStatus, MerchantRegistrationStatus } from 'shared-lib'
import logger from '../services/logger'
import { readEnv } from '../setup/readEnv'
import { audit } from '../utils/audit'
import { v4 as uuidv4 } from 'uuid'
import { type MessagePayload } from './replyMessagePayload'
import { AppDataSource } from '../database/dataSource'
import { CheckoutCounterEntity } from '../entity/CheckoutCounterEntity'
import { MerchantEntity } from '../entity/MerchantEntity'
import { uploadCheckoutAliasQRImage } from './S3Client'
import { generateQRImage, getEMVQRCodeText } from './generateQRImage'
import path from 'path'
import { CountryEntity } from '../entity/CountryEntity'

const RABBITMQ_HOST = readEnv('RABBITMQ_HOST', '127.0.0.1') as string
const RABBITMQ_PORT = readEnv('RABBITMQ_PORT', 5672) as number
const RABBITMQ_USERNAME = readEnv('RABBITMQ_USERNAME', 'guest') as string
const RABBITMQ_PASSWORD = readEnv('RABBITMQ_PASSWORD', 'guest') as string
const RABBITMQ_QUEUE = readEnv('RABBITMQ_QUEUE', 'acquirer_to_registry') as string
const RABBITMQ_REPLY_QUEUE = readEnv('RABBITMQ_REPLY_QUEUE', 'registry_reply_acquirer') as string

// Retry parameters
// const MAX_RETRIES = 5
const RETRY_INTERVAL_MS = 5000 // in miliseconds
// let retryCount = 0

const connStr = `amqp://${RABBITMQ_USERNAME}:${RABBITMQ_PASSWORD}@${RABBITMQ_HOST}:${RABBITMQ_PORT}`
let channel: Channel
let conn: Connection

// Initialize a map to store callbacks for each correlation ID
const correlationCallbacks = new Map<string, (msg: Message) => Promise<void>>()

export const connectToRabbitMQ = async (delay: number): Promise<void> => {
  try {
    conn = await amqplib.connect(connStr)
    channel = await conn.createChannel()

    const result = await channel.assertQueue(RABBITMQ_QUEUE, { durable: true })
    const replyResult = await channel.assertQueue(RABBITMQ_REPLY_QUEUE, { durable: true })

    logger.info(`Connected to RabbitMQ ${RABBITMQ_QUEUE}: ${JSON.stringify(result)}`)
    logger.info(`Connected to RabbitMQ ${RABBITMQ_REPLY_QUEUE}: ${JSON.stringify(replyResult)}`)

    // Reset retry count upon successful connection
    // retryCount = 0

    // Consume the reply queue for the response
    await consumeReplyQueue()
  } catch (err: any) {
    logger.error(`Error while connecting to RabbitMQ: ${err as string}`)

    // if (retryCount < MAX_RETRIES) {
    // retryCount++
    logger.info(`Reconnecting RabbitMQ Queue in ${RETRY_INTERVAL_MS / 1000} seconds...`)

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    setTimeout(async (): Promise<void> => {
      await connectToRabbitMQ(RETRY_INTERVAL_MS)
    }, RETRY_INTERVAL_MS)
    // } else {
    //   logger.error('Max retries reached. Could not connect to RabbitMQ.')
    // }
  }
}

export const consumeReplyQueue = async (): Promise<void> => {
  // Consume the reply queue for the response
  channel.consume(RABBITMQ_REPLY_QUEUE, (msg: Message | null) => {
    if (msg != null) {
      const correlationId = msg.properties.correlationId

      // Call the stored callback for this correlation ID
      const callbackProcessReply = correlationCallbacks.get(correlationId)
      logger.debug('Callback Reply for %s: %o', correlationId, callbackProcessReply)
      if (callbackProcessReply != null) {
        callbackProcessReply(msg)
          .catch((err) => {
            logger.error('Error while processing reply queue', err)
            console.error(err)
          })
        correlationCallbacks.delete(correlationId) // Remove the callback
      }

      channel.ack(msg)
    }
  }).catch((err: any) => {
    logger.error('Error while consuming reply queue', err)
    console.error(err)
  })
}

export async function publishToQueue (data: any): Promise<boolean> {
  const correlationId = uuidv4()
  logger.debug(
    'Send Message to \'%s\' queue: %s with %s',
    RABBITMQ_QUEUE,
    JSON.stringify(data),
    correlationId
  )

  // map correlationId with callback
  correlationCallbacks.set(correlationId, processReplyMessage)

  const result = channel.sendToQueue(
    RABBITMQ_QUEUE,
    Buffer.from(JSON.stringify(data)),
    {
      correlationId,
      replyTo: RABBITMQ_REPLY_QUEUE
    }
  )

  if (!result) {
    await audit(
      AuditActionType.SEND,
      AuditTrasactionStatus.FAILURE,
      'publishToQueue',
      `Publishing to '${RABBITMQ_QUEUE}' message queue`,
      'RabbitMQ', {}, data, null
    )
    return false
  }

  await audit(
    AuditActionType.SEND,
    AuditTrasactionStatus.SUCCESS,
    'publishToQueue',
    `Publishing to '${RABBITMQ_QUEUE}' message queue`,
    'RabbitMQ', {}, data, null
  )

  return result
}

export async function disconnectMessageQueue (): Promise<void> {
  await conn.close()
}

async function processReplyMessage (msg: Message): Promise<void> {
  const response = JSON.parse(msg.content.toString()) as MessagePayload
  logger.debug(
    'Received response from \'%s\' queue: %s',
    RABBITMQ_REPLY_QUEUE,
    JSON.stringify(response)
  )

  if (response.command === 'bulkGenerateAlias') {
    for (const aliasData of response.data) {
      // generate qr image and upload to s3
      let qrImageBuffer = null
      try {
        const frameImagePath = path.join(__dirname, '../../assets/sample-qr-frame/frame.png')
        const merchant = await AppDataSource.manager.findOne(MerchantEntity, {
          where: { id: aliasData.merchant_id },
          relations: ['category_code', 'currency_code']
        })

        logger.debug('Merchant: %o', merchant)

        if (merchant == null) {
          logger.error('Error while generating QR image: Merchant Not Found \'%o\'', aliasData)
          continue
        }

        const checkoutCounter = await AppDataSource.manager.findOne(CheckoutCounterEntity, {
          where: { id: aliasData.checkout_counter_id },
          relations: ['checkout_location']
        })

        const country = await AppDataSource.manager.findOne(CountryEntity, {
          where: { name: checkoutCounter?.checkout_location.country },
          select: ['code']
        })

        const emvcoQRString = getEMVQRCodeText(
          aliasData.alias_value,
          merchant.category_code.category_code,
          merchant.currency_code.iso_code,
          country?.code,
          merchant.dba_trading_name,
          checkoutCounter?.checkout_location?.district_name
        )
        qrImageBuffer = await generateQRImage(emvcoQRString, {}, frameImagePath)
      } catch (e) {
        logger.error('Error while generating QR image: %o', e)
        continue
      }

      if (qrImageBuffer == null) {
        logger.error('Error while generating QR image')
        continue
      }
      const qrImageS3Path = await uploadCheckoutAliasQRImage(aliasData.alias_value, qrImageBuffer)
      if (qrImageS3Path == null) {
        logger.error('Error while uploading QR image to S3')
        continue
      }
      logger.info('Uploaded QR image to S3: %s', qrImageS3Path)

      await AppDataSource.manager.update(CheckoutCounterEntity, aliasData.checkout_counter_id, {
        alias_value: aliasData.alias_value,
        qr_code_link: qrImageS3Path
      })

      await AppDataSource.manager.update(MerchantEntity, aliasData.merchant_id, {
        registration_status: MerchantRegistrationStatus.APPROVED
      })
    }
    logger.info('Updated alias value for %d checkout counters', response.data.length)
    logger.info('Updated registration status for %d merchants: Approved', response.data.length)
  }
}

logger.info('Connecting to RabbitMQ: %s', connStr)
connectToRabbitMQ(RETRY_INTERVAL_MS)
  .then(() => {})
  .catch((_) => {})
