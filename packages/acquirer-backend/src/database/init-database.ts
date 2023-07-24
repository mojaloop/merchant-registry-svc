import { AppDataSource } from './data-source'
import logger from '../logger'
import 'dotenv/config'
import { CurrencyCodes, MerchantCategoryCodes, PortalUserStatus, PortalUserType } from 'shared-lib'
import { MerchantCategoryEntity } from '../entity/MerchantCategoryEntity'
import { CurrencyEntity } from '../entity/CurrencyEntity'
import { hashPassword } from '../utils/utils'
import { PortalUserEntity } from '../entity/PortalUserEntity'
import { PortalRoleEntity } from '../entity/PortalRoleEntity'

export const initializeDatabase = async (): Promise<void> => {
  logger.info('Connecting MySQL database...')

  await AppDataSource.initialize()
    .then(async () => {
      logger.info('MySQL Database Connection success.')

      logger.info('Seeding Merchant Category Codes to DB...')
      await seedCategoryCode()
      logger.info('Seeding Merchant Category Codes to DB success.')

      logger.info('Seeding Currency Codes to DB...')
      await seedCurrency()
      logger.info('Seeding Currency Codes to DB success.')

      logger.info('Seeding Maker Checker Roles to DB...')
      await seedMakerRole()
      await seedCheckerRole()
      logger.info('Seeding Maker Checker Roles to DB success.')

      //
      //  TODO: Remove Test Accounts in Production
      //
      logger.info('Seeding Maker Checker Test Accounts to DB...')
      await seedMakerTestAccount()
      await seedCheckerTestAccount()
      logger.info('Seeding Maker Checker Test Accounts to DB success.')
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

async function seedMakerRole (): Promise<void> {
  // skip seeding maker role if already seeded
  const makerRole = await AppDataSource.manager.findOne(
    PortalRoleEntity,
    { where: { role_name: 'MakerRole' } }
  )
  if (makerRole != null) {
    logger.info('Maker Role already seeded. Skipping...')
  } else {
    const makerRole = new PortalRoleEntity()
    makerRole.role_name = 'MakerRole'
    makerRole.description = 'Maker Role'
    // TODO: Add permissions
    await AppDataSource.manager.save(makerRole)
  }
}

async function seedCheckerRole (): Promise<void> {
  // skip seeding checker role if already seeded
  const checkerRole = await AppDataSource.manager.findOne(
    PortalRoleEntity,
    { where: { role_name: 'CheckerRole' } }
  )
  if (checkerRole != null) {
    logger.info('Checker Role already seeded. Skipping...')
  } else {
    const checkerRole = new PortalRoleEntity()
    checkerRole.role_name = 'CheckerRole'
    checkerRole.description = 'Checker Role'
    // TODO: Add permissions
    await AppDataSource.manager.save(checkerRole)
  }
}

async function seedMakerTestAccount (): Promise<void> {
  const makerRole = await AppDataSource.manager.findOne(
    PortalRoleEntity,
    { where: { role_name: 'MakerRole' } }
  )
  if (makerRole == null) {
    logger.error('Maker Role not found. Please run seedMakerRole() first.')
    throw new Error('Maker Role not found. Please run seedMakerRole() first.')
  }

  const email = process.env.MAKER_EMAIL ?? 'test_maker@email.com'
  let testMakerAccount = await AppDataSource.manager.findOne(
    PortalUserEntity,
    { where: { email } }
  )
  if (testMakerAccount != null) {
    logger.info(`Maker Test Account ${email} already seeded. Skipping...`)
    return
  }

  testMakerAccount = new PortalUserEntity()
  testMakerAccount.email = email
  testMakerAccount.name = process.env.MAKER_NAME ?? 'Test Maker'
  testMakerAccount.phone_number = process.env.MAKER_PHONE_NUMBER ?? '1234567890'
  testMakerAccount.password = await hashPassword(process.env.MAKER_PASSWORD ?? 'password')
  testMakerAccount.user_type = PortalUserType.HUB
  testMakerAccount.status = PortalUserStatus.FRESH
  testMakerAccount.role = makerRole
  await AppDataSource.manager.save(testMakerAccount)
}

async function seedCheckerTestAccount (): Promise<void> {
  const checkerRole = await AppDataSource.manager.findOne(
    PortalRoleEntity,
    { where: { role_name: 'CheckerRole' } }
  )
  if (checkerRole == null) {
    logger.error('Checker Role not found. Please run seedCheckerRole() first.')
    throw new Error('Checker Role not found. Please run seedCheckerRole() first.')
  }

  const email = process.env.CHECKER_EMAIL ?? 'test_checker@email.com'
  let testCheckerAccount = await AppDataSource.manager.findOne(
    PortalUserEntity,
    { where: { email } }
  )
  if (testCheckerAccount != null) {
    logger.info(`Checker Test Account ${email} already seeded. Skipping...`)
    return
  }

  testCheckerAccount = new PortalUserEntity()
  testCheckerAccount.name = process.env.CHECKER_NAME ?? 'Test Checker'
  testCheckerAccount.email = process.env.CHECKER_EMAIL ?? 'test_checker@email.com'
  testCheckerAccount.phone_number = process.env.CHECKER_PHONE_NUMBER ?? '1234567890'
  testCheckerAccount.password = await hashPassword(process.env.CHECKER_PASSWORD ?? 'password')
  testCheckerAccount.user_type = PortalUserType.HUB
  testCheckerAccount.status = PortalUserStatus.FRESH
  testCheckerAccount.role = checkerRole
  await AppDataSource.manager.save(testCheckerAccount)
}
