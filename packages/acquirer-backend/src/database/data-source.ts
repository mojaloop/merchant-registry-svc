import 'reflect-metadata'
import path from 'path'
import { DataSource } from 'typeorm'
import dotenv from 'dotenv'

if (process.env.NODE_ENV === 'test') {
  dotenv.config({ path: path.resolve(process.cwd(), '.env.test'), override: true })
}

const PORT: number = parseInt(
  process.env.DB_PORT !== null && process.env.DB_PORT !== undefined && process.env.DB_PORT !== ''
    ? process.env.DB_PORT
    : '3306'
)
export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST ?? 'localhost',
  port: PORT,
  username: process.env.DB_USERNAME ?? 'merchant_acquirer_user',
  password: process.env.DB_PASSWORD ?? 'password',
  database: process.env.DB_DATABASE ?? 'merchant_acquirer_db',
  synchronize: true,
  logging: false,
  entities: [
    path.join(__dirname, '../entity/*.ts')
  ],
  migrations: [],
  subscribers: []
})
