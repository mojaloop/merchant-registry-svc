import amqplib, { type Channel, type Message } from 'amqplib'
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
import { DFSPEntity } from '../entity/DFSPEntity'

const RABBITMQ_HOST = readEnv('RABBITMQ_HOST', '127.0.0.1') as string
const RABBITMQ_PORT = readEnv('RABBITMQ_PORT', 5672) as number
const RABBITMQ_USERNAME = readEnv('RABBITMQ_USERNAME', 'guest') as string
const RABBITMQ_PASSWORD = readEnv('RABBITMQ_PASSWORD', 'guest') as string
const RABBITMQ_QUEUE = readEnv('RABBITMQ_QUEUE', 'acquirer_to_registry') as string
const RABBITMQ_REPLY_QUEUE = readEnv('RABBITMQ_REPLY_QUEUE', 'registry_reply_acquirer') as string

const connStr = `amqp://${RABBITMQ_USERNAME}:${RABBITMQ_PASSWORD}@${RABBITMQ_HOST}:${RABBITMQ_PORT}`
let channel: Channel

// Initialize a map to store callbacks for each correlation ID
const correlationCallbacks = new Map<string, (msg: Message) => Promise<void>>()

logger.info('Connecting to RabbitMQ: %s', connStr)
amqplib.connect(connStr)
  .then(async (conn) => await conn.createChannel())
  .then(async (ch) => {
    channel = ch
    const result = await channel.assertQueue(RABBITMQ_QUEUE, { durable: true })
    const resplyResult = await channel.assertQueue(RABBITMQ_REPLY_QUEUE, { durable: true })

    logger.info('Connected to RabbitMQ %s: %o', RABBITMQ_QUEUE, result)
    logger.info('Connected to RabbitMQ %s: %o', RABBITMQ_REPLY_QUEUE, resplyResult)

    // Wait for database connection to be ready
    await AppDataSource.initialize()
  }).then(async () => {
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
    }).catch((err) => {
      logger.error('Error while consuming reply queue', err)
      console.error(err)
    })
  }).catch((err) => {
    logger.error('Error while connecting to RabbitMQ', err)
    console.error(err)
  })

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

async function processReplyMessage (msg: Message): Promise<void> {
  const response = JSON.parse(msg.content.toString()) as MessagePayload
  logger.debug(
    'Received response from \'%s\' queue: %s',
    RABBITMQ_REPLY_QUEUE,
    JSON.stringify(response)
  )

  if (response.command === 'bulkGenerateAlias') {
    for (const aliasData of response.data) {
      await AppDataSource.manager.update(CheckoutCounterEntity, aliasData.checkout_counter_id, {
        alias_value: aliasData.alias_value
      })
      await AppDataSource.manager.update(MerchantEntity, aliasData.merchant_id, {
        registration_status: MerchantRegistrationStatus.APPROVED
      })
    }
    logger.info('Updated alias value for %d checkout counters', response.data.length)
    logger.info('Updated registration status for %d merchants: Approved', response.data.length)
  }

  // Perform other actions like resolving a Promise, etc.
}
