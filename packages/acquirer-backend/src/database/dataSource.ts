import 'reflect-metadata'
import path from 'path'
import { DataSource } from 'typeorm'
import dotenv from 'dotenv'
import { readEnv } from '../setup/readEnv'

if (process.env.NODE_ENV === 'test')/* istanbul ignore next */ {
  dotenv.config({ path: path.resolve(process.cwd(), '.env.test'), override: true })
}

const DB_HOSTNAME: string = readEnv('DB_HOST', 'localhost') as string
const PORT: number = readEnv('DB_PORT', 3306, true) as number
const DB_USERNAME: string = readEnv('DB_USERNAME', 'merchant_acquirer_user') as string
const DB_PASSWORD: string = readEnv('DB_PASSWORD', 'password') as string
const DB_DATABASE: string = readEnv('DB_DATABASE', 'merchant_acquirer_db') as string

let dbConfig

/* istanbul ignore if */
if (process.env.NODE_ENV === 'test') {
  dbConfig = {
    type: 'sqlite',
    database: ':memory:',
    synchronize: true,
    logging: false,
    entities: [
      path.join(__dirname, '../entity/*.ts')
    ],
    migrations: [],
    subscribers: []
  }
} else /* istanbul ignore next */ {
  dbConfig = {
    type: 'mysql',
    host: DB_HOSTNAME,
    port: PORT,
    username: DB_USERNAME,
    password: DB_PASSWORD,
    database: DB_DATABASE,
    synchronize: true,
    logging: false,
    entities: [
      path.join(__dirname, '../entity/*.ts')
    ],
    migrations: [],
    subscribers: []
  }
}
export const AppDataSource = new DataSource(dbConfig as any)

//
// export const AppDataSource = new DataSource({
//   type: 'mysql',
//   host: DB_HOSTNAME,
//   port: PORT,
//   username: DB_USERNAME,
//   password: DB_PASSWORD,
//   database: DB_DATABASE,
//   synchronize: true,
//   logging: false,
//   entities: [
//     path.join(__dirname, '../entity/*.ts')
//   ],
//   migrations: [],
//   subscribers: []
// })
