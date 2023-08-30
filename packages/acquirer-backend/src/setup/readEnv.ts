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
