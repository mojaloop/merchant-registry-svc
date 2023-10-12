import bcrypt from 'bcrypt'
import path from 'path'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import { type PortalUserEntity } from '../entity/PortalUserEntity'
import base64url from 'base64url'
import crypto from 'crypto'
import { readEnv } from '../setup/readEnv'

if (process.env.NODE_ENV === 'test') {
  dotenv.config({ path: path.resolve(process.cwd(), '.env.test'), override: true })
}

const JWT_SECRET = readEnv('JWT_SECRET', '', true) as string
const JWT_EXPIRES_IN = readEnv('JWT_EXPIRES_IN', '1d', true) as string

const API_KEY_LENGTH = readEnv('API_KEY_LENGTH', 64, true) as number
const API_KEY_PREFIX = readEnv('API_KEY_PREFIX', 'MR')

const saltRounds = 10
export async function hashPassword (password: string): Promise<string> {
  // 10 is the number of rounds to use, higher means more secure but slower
  const salt = await bcrypt.genSalt(saltRounds)
  const hashedPassword = await bcrypt.hash(password, salt)
  return hashedPassword
}

export function convertURLFriendly (input: string): string {
  // convert to lowercase, replace spaces with hyphens, remove non-alphanumeric
  return input.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

export function isValidDate (d: any): boolean {
  return d instanceof Date && !isNaN(d as any as number)
}

export function generateJwtToken (user: PortalUserEntity): string {
  const token = jwt.sign(
    { id: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  )
  return token
}

export function generateApiKey (): string {
  // Constant prefix

  const randomPayload = base64url(crypto.randomBytes(API_KEY_LENGTH))

  const apiKey = `${API_KEY_PREFIX}.${randomPayload}`

  return apiKey
}
