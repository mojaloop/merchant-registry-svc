import amqplib, { type Channel, type Message } from 'amqplib'
import 'dotenv/config'
import logger from '../services/logger'
import { readEnv } from '../setup/readEnv'
import { registerEndpointDFSP } from './registerEndpointDFSP'
import { registerMerchants } from './registerMerchant'

const RABBITMQ_HOST = readEnv('RABBITMQ_HOST', '127.0.0.1') as string
const RABBITMQ_PORT = readEnv('RABBITMQ_PORT', 5672) as number
const RABBITMQ_USERNAME = readEnv('RABBITMQ_USERNAME', 'guest') as string
const RABBITMQ_PASSWORD = readEnv('RABBITMQ_PASSWORD', 'guest') as string
const RABBITMQ_QUEUE = readEnv('RABBITMQ_QUEUE', 'acquirer_to_registry') as string

// Retry parameters
// const MAX_RETRIES = 5
const RETRY_INTERVAL_MS = 5000 // in miliseconds
// let retryCount = 0
//
const connStr = `amqp://${RABBITMQ_USERNAME}:${RABBITMQ_PASSWORD}@${RABBITMQ_HOST}:${RABBITMQ_PORT}`
let channel: Channel

logger.info('Connecting to RabbitMQ: %s', connStr)

interface MessagePayload {
  command: string
  data: any
}

const connectToRabbitMQ = async (delay: number): Promise<void> => {
  try {
    const conn = await amqplib.connect(connStr)
    channel = await conn.createChannel()

    const result = await channel.assertQueue(RABBITMQ_QUEUE, { durable: true })
    logger.info(`Connected to RabbitMQ ${RABBITMQ_QUEUE}: ${JSON.stringify(result)}`)

    // Reset retry count upon successful connection
    // retryCount = 0

    // Consume the reply queue for the response
    await consumeQueue()
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

const consumeQueue = async (): Promise<void> => {
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  channel.consume(RABBITMQ_QUEUE, async (message: Message | null) => {
    if (message !== null) {
      const processMessage = async (): Promise<void> => {
        const msgContent = message.content.toString()
        logger.debug(`Received message: ${msgContent}`)
        let msgJson: MessagePayload
        let result: any
        try {
          msgJson = JSON.parse(msgContent)

          if (msgJson.command === 'bulkGenerateAlias') {
            result = await registerMerchants(msgJson.data)
          } else if (msgJson.command === 'registerEndpointDFSP') {
            result = await registerEndpointDFSP(msgJson.data)
          } else {
            logger.error('Invalid command: %s', msgJson.command)
            channel.ack(message)
            return
          }

          logger.debug('Sending reply: %o', result)
          channel.sendToQueue(
            message.properties.replyTo,
            Buffer.from(JSON.stringify({
              command: msgJson.command,
              data: result
            })),
            {
              correlationId: message.properties.correlationId
            }
          )

          channel.ack(message)
        } catch (err) {
          logger.error('Error while parsing message from queue: %o', err)
          channel.ack(message)
        }
      }
      processMessage().catch((err) => {
        logger.error('Error processing message: %o', err)
      })
    }
  }).then(() => {
    logger.info('Queue consumption has started.')
  }).catch((err) => {
    logger.error('Error starting queue consumption: %o', err)
  })
}

logger.info('Connecting to RabbitMQ: %s', connStr)
connectToRabbitMQ(RETRY_INTERVAL_MS)
  .then(() => {})
  .catch((_) => {})
