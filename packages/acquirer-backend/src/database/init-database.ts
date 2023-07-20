import { AppDataSource } from './data-source'
import logger from '../logger'
import 'dotenv/config'
import { CurrencyCodes, MerchantCategoryCodes } from 'shared-lib'
import { MerchantCategoryEntity } from '../entity/MerchantCategoryEntity'
import { CurrencyEntity } from '../entity/CurrencyEntity'

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
