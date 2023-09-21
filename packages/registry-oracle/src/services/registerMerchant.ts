import {AppDataSource} from '../database/dataSource';
import {RegistryEntity} from '../entity/RegistryEntity';
import {readEnv} from '../setup/readEnv';
import logger from './logger';

const ALIAS_CHECKOUT_MAX_DIGITS = readEnv('ALIAS_CHECKOUT_MAX_DIGITS', 10) as number;

interface CurrencyCode{
  iso_code: string;
  description: string;
}

export interface MerchantData {
  merchant_id: number;
  dfsp_id: string;
  dfsp_name: string;
  checkout_counter_id: number;
  currency_code: CurrencyCode;
}

export async function registerMerchant (merchants: MerchantData[]) {
  const registryRepository = AppDataSource.getRepository(RegistryEntity)

  // Fetch the maximum alias_value from the database
  const maxAliasEntity = await registryRepository.find({
    select: ["alias_value"],
    order: { alias_value: "DESC" },
    take: 1
  });

  // Initialize maxAliasValue
  let maxAliasValue = maxAliasEntity.length > 0 ? parseInt(maxAliasEntity[0].alias_value, 10) : 0;

  const bulkRegistryEntities: RegistryEntity[] = [];

  for (const merchant of merchants) {
    // Increment maxAliasValue
    // NOTE: This is not a good way to do this.
    //      If multiple instances of this service are running concurrently, 
    //      We may run into concurrency issues with incrementing alias_value
    //

    maxAliasValue++;

    // Zero-pad maxAliasValue to ALIAS_CHECKOUT_MAX_DIGITS length
    const paddedAliasValue = maxAliasValue.toString().padStart(ALIAS_CHECKOUT_MAX_DIGITS, "0");

    const registryRecord = registryRepository.create({
        merchant_id: merchant.merchant_id,
        dfsp_id: merchant.dfsp_id,
        dfsp_name: merchant.dfsp_name,
        checkout_counter_id: merchant.checkout_counter_id,
        alias_value: paddedAliasValue,
        currency_code: merchant.currency_code.iso_code
    });

    bulkRegistryEntities.push(registryRecord);
  }
  logger.info('Bulk inserting %d records', bulkRegistryEntities.length);

  if (bulkRegistryEntities.length === 0) {
    logger.error("No valid merchant data found. Aborting transaction.");
    return;
  }

  try{
    // Insert in transaction to ensure atomicity
    await AppDataSource.manager.transaction(async transactionalEntityManager => {
      await transactionalEntityManager.save(RegistryEntity, bulkRegistryEntities);
    });
  }catch(err) {
    logger.error('Transaction failed: %o', err);
  };
}
