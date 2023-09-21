import amqplib, { type Channel } from 'amqplib'
import 'dotenv/config'
import { AuditActionType, AuditTrasactionStatus } from 'shared-lib'
import logger from '../services/logger'
import { readEnv } from '../setup/readEnv'
import { audit } from '../utils/audit'

const RABBITMQ_HOST = readEnv('RABBITMQ_HOST', '127.0.0.1') as string
const RABBITMQ_PORT = readEnv('RABBITMQ_PORT', 5672) as number
const RABBITMQ_USERNAME = readEnv('RABBITMQ_USERNAME', 'guest') as string
const RABBITMQ_PASSWORD = readEnv('RABBITMQ_PASSWORD', 'guest') as string
const RABBITMQ_QUEUE = readEnv('RABBITMQ_QUEUE', 'acquirer_to_registry') as string

const connStr = `amqp://${RABBITMQ_USERNAME}:${RABBITMQ_PASSWORD}@${RABBITMQ_HOST}:${RABBITMQ_PORT}`
let channel: Channel

logger.info('Connecting to RabbitMQ: %s', connStr)
amqplib.connect(connStr)
  .then(async (conn) => await conn.createChannel())
  .then(async (ch) => {
    channel = ch
    const result = await channel.assertQueue(RABBITMQ_QUEUE, { durable: false })
    logger.info('Connected to RabbitMQ acquirer_to_registry: %o', result)
    channel.sendToQueue(
      RABBITMQ_QUEUE,
      Buffer.from(JSON.stringify({
        command: 'registerEndpointDFSP',
        data: { dfsp_id: 'Hello World!', dfsp_name: 'Hello World!' }
      }))
    )
  })
  .catch((err) => {
    logger.error('Error while connecting to RabbitMQ', err)
    console.error(err)
  })

export async function publishToQueue (data: any): Promise<boolean> {
  logger.debug('Publishing to \'%s\' queue: %s', RABBITMQ_QUEUE, JSON.stringify(data))
  const result = channel.sendToQueue(RABBITMQ_QUEUE, Buffer.from(JSON.stringify(data)))

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
