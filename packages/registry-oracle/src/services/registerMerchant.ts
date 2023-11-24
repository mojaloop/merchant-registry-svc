import { AppDataSource } from '../database/dataSource'
import { RegistryEntity } from '../entity/RegistryEntity'
import { readEnv } from '../setup/readEnv'
import { findIncrementAliasValue } from '../utils/utils'
import logger from './logger'

const ALIAS_CHECKOUT_MAX_DIGITS = readEnv('ALIAS_CHECKOUT_MAX_DIGITS', 10) as number

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
}

export async function registerMerchants (merchants: MerchantData[]): Promise<RegistryEntity[]> {
  const registryRepository = AppDataSource.getRepository(RegistryEntity)

  // Fetch the maximum alias_value from the database
  const headPointerAlias = await registryRepository.findOne({
    select: ['alias_value', 'id'],
    where: { is_incremental_head: true }
  })

  let currentAliasValue: string
  if (headPointerAlias != null) {
    currentAliasValue = headPointerAlias.alias_value
  } else {
    currentAliasValue = '0'.repeat(ALIAS_CHECKOUT_MAX_DIGITS)
  }

  const bulkRegistryEntities: RegistryEntity[] = []

  for (const merchant of merchants) {
    currentAliasValue = await findIncrementAliasValue(currentAliasValue)

    const registryRecord = registryRepository.create({
      merchant_id: merchant.merchant_id,
      fspId: merchant.fspId,
      dfsp_name: merchant.dfsp_name,
      checkout_counter_id: merchant.checkout_counter_id,
      alias_value: currentAliasValue,
      currency: merchant.currency_code.iso_code
    })

    bulkRegistryEntities.push(registryRecord)
  }
  logger.debug('Bulk inserting %d records', bulkRegistryEntities.length)

  if (bulkRegistryEntities.length === 0) {
    logger.error('No valid merchant data is registered.')
    return []
  }

  try {
    // Save the last record as the head pointer
    bulkRegistryEntities[bulkRegistryEntities.length - 1].is_incremental_head = true

    // Insert in transaction to ensure atomicity
    await AppDataSource.manager.transaction(async transactionalEntityManager => {
      await transactionalEntityManager.save(RegistryEntity, bulkRegistryEntities)
      if (headPointerAlias != null) {
        await transactionalEntityManager.update(
          RegistryEntity,
          headPointerAlias.id,
          { is_incremental_head: false }
        )
      }
    })
  } catch (err)/* istanbul ignore next */ {
    logger.error('Transaction failed: %o', err)
    return []
  };

  return bulkRegistryEntities
}
