import amqplib, { Channel, Message } from 'amqplib';
import 'dotenv/config';
import logger from '../services/logger';
import { readEnv } from '../setup/readEnv';
import {registerEndpointDFSP} from './registerEndpointDFSP';
import {registerMerchant } from './registerMerchant';

const RABBITMQ_HOST = readEnv('RABBITMQ_HOST', '127.0.0.1') as string;
const RABBITMQ_PORT = readEnv('RABBITMQ_PORT', 5672) as number;
const RABBITMQ_USERNAME = readEnv('RABBITMQ_USERNAME', 'guest') as string;
const RABBITMQ_PASSWORD = readEnv('RABBITMQ_PASSWORD', 'guest') as string;
const RABBITMQ_QUEUE = readEnv('RABBITMQ_QUEUE', 'acquirer_to_registry') as string;

const connStr = `amqp://${RABBITMQ_USERNAME}:${RABBITMQ_PASSWORD}@${RABBITMQ_HOST}:${RABBITMQ_PORT}`;

logger.info('Connecting to RabbitMQ: %s', connStr);


interface MessagePayload {
  command: string;
  data: any;
}

amqplib.connect(connStr)
  .then(async (conn) => await conn.createChannel())
  .then(async (channel: Channel) => {
    await channel.assertQueue(RABBITMQ_QUEUE, { durable: false });

    logger.info(`Listening for messages in queue: ${RABBITMQ_QUEUE}`);

    channel.consume(RABBITMQ_QUEUE, (message: Message | null) => {
      if (message) {
        const msgContent = message.content.toString();
        let msgJson: MessagePayload;
        try{
          msgJson = JSON.parse(msgContent);
          
          if(msgJson.command == 'bulkGenerateAlias') {
            registerMerchant(msgJson.data);
          }

          if(msgJson.command == 'registerEndpointDFSP') {
            registerEndpointDFSP(msgJson.data);
          }

        }catch(err){
          logger.error('Error while parsing message from queue: %o', err);
          return
        }
        logger.info(`Received message: ${JSON.stringify(msgJson)}`);

        // Acknowledge the message
        channel.ack(message);
      }
    });
  })
  .catch((err) => {
    logger.error('Error while connecting to RabbitMQ: %o', err);
    console.error(err);
  });


