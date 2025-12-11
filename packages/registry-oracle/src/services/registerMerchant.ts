import { AppDataSource } from '../database/dataSource'
import { RegistryEntity } from '../entity/RegistryEntity'
import logger from './logger'

export interface CurrencyCode {
  iso_code: string
  description: string
}

export interface MerchantData {
  merchant_id: number
  fspId: string
  dfsp_name: string
  checkout_counter_id: number
  currency_code: CurrencyCode
  lei?: string
}

export async function registerMerchants (merchants: MerchantData[]): Promise<RegistryEntity[]> {
  const registryRepository = AppDataSource.getRepository(RegistryEntity)

  const bulkRegistryEntities: RegistryEntity[] = []

  for (const merchant of merchants) {
    // Use LEI as alias if present and not empty/whitespace, otherwise use merchant_id + 10000000 as alias_value
    const hasValidLEI = merchant.lei !== null && merchant.lei !== undefined && merchant.lei.trim() !== ''
    const aliasValue = hasValidLEI ? merchant.lei : (10000000 + merchant.merchant_id).toString()
    const aliasType = hasValidLEI ? 'LEI' : '8-digit merchant_id'
    logger.debug('Using %s as alias_value for merchant %d: %s', aliasType, merchant.merchant_id, aliasValue)

    const registryRecord = registryRepository.create({
      merchant_id: merchant.merchant_id,
      fspId: merchant.fspId,
      dfsp_name: merchant.dfsp_name,
      checkout_counter_id: merchant.checkout_counter_id,
      alias_value: aliasValue,
      currency: merchant.currency_code.iso_code,
      lei: hasValidLEI ? merchant.lei : undefined
    })

    bulkRegistryEntities.push(registryRecord)
  }
  logger.debug('Bulk inserting %d records', bulkRegistryEntities.length)

  if (bulkRegistryEntities.length === 0) {
    logger.error('No valid merchant data is registered.')
    return []
  }

  try {
    // Insert in transaction to ensure atomicity
    await AppDataSource.manager.transaction(async transactionalEntityManager => {
      await transactionalEntityManager.save(RegistryEntity, bulkRegistryEntities)
    })
  } catch (err)/* istanbul ignore next */ {
    logger.error('Transaction failed: %o', err)
    return []
  };

  return bulkRegistryEntities
}
