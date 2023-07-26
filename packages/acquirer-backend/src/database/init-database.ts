import { AppDataSource } from './data-source'
import logger from '../logger'
import 'dotenv/config'
import { CurrencyCodes, MerchantCategoryCodes, PortalUserStatus, PortalUserType } from 'shared-lib'
import { MerchantCategoryEntity } from '../entity/MerchantCategoryEntity'
import { CurrencyEntity } from '../entity/CurrencyEntity'
import { hashPassword } from '../utils/utils'
import { PortalUserEntity } from '../entity/PortalUserEntity'

export const initializeDatabase = async (): Promise<void> => {
  logger.info('Connecting MySQL database...')

  await AppDataSource.initialize()
    .then(async () => {
      logger.info('MySQL Database Connection success.')

      await seedCategoryCode()

      await seedCurrency()

      //
      //  TODO: Remove Test Accounts in Production
      //
      await seedTestAccounts()
    })
    .catch((error) => {
      throw error
    })
}

async function seedCategoryCode (): Promise<void> {
  // skip if already seeded by checking size
  // TODO: Is there a better way?
  const alreadySeedSize = await AppDataSource.manager.count(MerchantCategoryEntity)
  if (Object.keys(MerchantCategoryCodes).length <= alreadySeedSize) {
    logger.info('Merchant Category Codes already seeded. Skipping...')
    return
  }

  for (const categoryCode in MerchantCategoryCodes) {
    const category = new MerchantCategoryEntity()
    category.category_code = categoryCode
    category.description = MerchantCategoryCodes[categoryCode]
    await AppDataSource.manager.save(category)
  }
}

async function seedCurrency (): Promise<void> {
  // skip if already seeded by checking size
  // TODO: Is there a better way?
  const alreadySeedSize = await AppDataSource.manager.count(CurrencyEntity)
  if (Object.keys(CurrencyCodes).length <= alreadySeedSize) {
    logger.info('Currency Codes already seeded. Skipping...')
    return
  }

  for (const currencyCode in CurrencyCodes) {
    const currency = new CurrencyEntity()
    currency.iso_code = currencyCode
    currency.description = CurrencyCodes[currencyCode]
    await AppDataSource.manager.save(currency)
  }
}

async function seedTestAccounts (): Promise<void> {
  const test1Account: ITestAccount = {
    name: process.env.TEST1_NAME ?? 'Test 1',
    email: process.env.TEST1_EMAIL ?? 'test1@email.com',
    phone: process.env.TEST1_PHONE_NUMBER ?? '0000000',
    password: process.env.TEST1_PASSWORD ?? 'password'
  }
  await createAccount(test1Account)

  const test2Account: ITestAccount = {
    name: process.env.TEST2_NAME ?? 'Test 2',
    email: process.env.TEST2_EMAIL ?? 'test2@email.com',
    phone: process.env.TEST2_PHONE_NUMBER ?? '1111111',
    password: process.env.TEST2_PASSWORD ?? 'password'
  }
  await createAccount(test2Account)
}

async function createAccount (account: ITestAccount): Promise<void> {
  const { name, email, password, phone } = account
  let testCheckerAccount = await AppDataSource.manager.findOne(
    PortalUserEntity,
    { where: { email } }
  )
  if (testCheckerAccount != null) {
    logger.info(`Test Account ${email} already seeded. Skipping...`)
    return
  }

  testCheckerAccount = new PortalUserEntity()
  testCheckerAccount.name = name
  testCheckerAccount.email = email
  testCheckerAccount.phone_number = phone
  testCheckerAccount.password = await hashPassword(password)
  testCheckerAccount.user_type = PortalUserType.HUB
  testCheckerAccount.status = PortalUserStatus.FRESH
  await AppDataSource.manager.save(testCheckerAccount)
}

interface ITestAccount {
  name: string
  email: string
  phone: string
  password: string
}
