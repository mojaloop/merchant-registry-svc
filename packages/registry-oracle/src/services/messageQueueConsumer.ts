import amqplib, { Channel, Message } from 'amqplib';
import 'dotenv/config';
import logger from '../services/logger';
import { readEnv } from '../setup/readEnv';
import { registerEndpointDFSP } from './registerEndpointDFSP';
import { registerMerchants } from './registerMerchant';

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
    await channel.assertQueue(RABBITMQ_QUEUE, { durable: true });

    logger.info(`Listening for messages in queue: ${RABBITMQ_QUEUE}`);

    channel.consume(RABBITMQ_QUEUE, async (message: Message | null) => {
      if (message) {
        const msgContent = message.content.toString();
        logger.debug(`Received message: ${msgContent}`);
        let msgJson: MessagePayload;
        let result: any;
        try{
          msgJson = JSON.parse(msgContent);
          
          if(msgJson.command == 'bulkGenerateAlias') {
            result = await registerMerchants(msgJson.data);
          } else if(msgJson.command == 'registerEndpointDFSP') {
            result = await registerEndpointDFSP(msgJson.data);
          }else{
            logger.error('Invalid command: %s', msgJson.command);
            channel.ack(message);
            return
          }

          logger.debug('Sending reply: %o', result);
          channel.sendToQueue(
            message.properties.replyTo,
            Buffer.from(JSON.stringify({
              command: msgJson.command,
              data: result
            })), 
            {
              correlationId: message.properties.correlationId
            }
          );
            
          channel.ack(message);

        }catch(err){
          logger.error('Error while parsing message from queue: %o', err);
          channel.ack(message);
          return
        }

        // Acknowledge the message
      }
    });
  })
  .catch((err) => {
    logger.error('Error while connecting to RabbitMQ: %o', err);
    console.error(err);
  });


