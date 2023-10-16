import bcrypt from 'bcrypt'
import path from 'path'
import dotenv from 'dotenv'
import crypto from 'crypto'
import base64url from 'base64url'
import {readEnv} from '../setup/readEnv'
import {AppDataSource} from '../database/dataSource'
import {RegistryEntity} from '../entity/RegistryEntity'
import {exit} from 'process'

if (process.env.NODE_ENV === 'test') {
  dotenv.config({ path: path.resolve(process.cwd(), '.env.test'), override: true })
}

const API_KEY_LENGTH = readEnv('API_KEY_LENGTH', 64, true) as number
const API_KEY_PREFIX = readEnv('API_KEY_PREFIX', 'MR')

const ALIAS_CHECKOUT_MAX_DIGITS = readEnv('ALIAS_CHECKOUT_MAX_DIGITS', 10) as number;

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

export function generateApiKey(): string {
  // Constant prefix
  
  const randomPayload = base64url(crypto.randomBytes(API_KEY_LENGTH));
  
  const apiKey = `${API_KEY_PREFIX}.${randomPayload}`;
  
  return apiKey;
}

export async function findIncrementAliasValue (alias: string): Promise<string> {
  // This is meant to solve the problem of incremental alias value being unique
  // while allowing external dfsp to create their own alias value
  let incrementedAlias = alias
  let aliasValue = parseInt(incrementedAlias, 10)
  let exist = true
  do {
    aliasValue = aliasValue + 1

    // Zero-pad maxAliasValue to ALIAS_CHECKOUT_MAX_DIGITS length
    incrementedAlias = aliasValue.toString().padStart(ALIAS_CHECKOUT_MAX_DIGITS, '0')
    exist = await AppDataSource.manager.exists(RegistryEntity, { where: {alias_value: incrementedAlias }})
    // if alias value exist.. keep incrementing/searching
  } while (exist)
  return incrementedAlias
}

