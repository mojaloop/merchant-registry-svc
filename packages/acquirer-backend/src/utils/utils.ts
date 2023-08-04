import bcrypt from 'bcrypt'

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
