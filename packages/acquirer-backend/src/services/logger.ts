import path from 'path'
import { type TransformableInfo } from 'logform'
import winston, { type Logger } from 'winston'

import 'dotenv/config'

const logPath = process.env.LOG_PATH ?? './logs'

const logger: Logger = winston.createLogger({
  level: process.env.LOG_LEVEL ?? 'info',
  format: winston.format.combine(
    winston.format.splat(),
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'merchant-system' },
  transports: [
    new winston.transports.File({ filename: path.join(logPath, 'error.log'), level: 'error' }),
    new winston.transports.File({ filename: path.join(logPath, 'info.log'), level: 'info' }),
    new winston.transports.File({ filename: path.join(logPath, 'debug.log'), level: 'debug' }),
    new winston.transports.File({ filename: path.join(logPath, 'all_combined.log') })
  ]
})

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.splat(),
      winston.format.colorize(),
      winston.format.timestamp(),
      winston.format.printf(
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        (info: TransformableInfo) => `${info.timestamp} ${info.level}: ${info.message}`
      )
    )
  }))
}

logger.silent = process.env.LOG_DISABLED === 'true'
if (logger.silent) {
  console.log('Logger is disabled')
}

export default logger
