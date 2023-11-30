import dotenv from 'dotenv'
import 'dotenv/config'
import path from 'path'

if (process.env.NODE_ENV === 'test')/* istanbul ignore next */ {
  dotenv.config({ path: path.resolve(process.cwd(), '.env.test'), override: true })
}

export function readEnv (
  key: string,
  defaultValue: string | number,
  isNumeric: boolean = false
): string | number {
  const value = process.env[key]
  if (value !== null && value !== undefined && value !== '') {
    return isNumeric ? parseInt(value) : value
  }
  return defaultValue
}
