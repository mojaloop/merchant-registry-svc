import { AppDataSource } from './dataSource'
import fs from 'fs'
import path from 'path'
import logger from '../services/logger'
import {
  CurrencyCodes, CurrencyDescriptions,
  MerchantCategoryCodes,
  PortalUserStatus, PortalUserType
} from 'shared-lib'
import { MerchantCategoryEntity } from '../entity/MerchantCategoryEntity'
import { CurrencyEntity } from '../entity/CurrencyEntity'
import { hashPassword } from '../utils/utils'
import { PortalUserEntity } from '../entity/PortalUserEntity'
import { PermissionsEnum } from '../types/permissions'
import { DefaultRoles } from './defaultRoles'
import { PortalPermissionEntity } from '../entity/PortalPermissionEntity'
import { PortalRoleEntity } from '../entity/PortalRoleEntity'
import { DefaultDFSPUsers, DefaultHubSuperAdmin, DefaultHubUsers } from './defaultUsers'
import { DefaultDFSPs } from './defaultDfsps'
import { DFSPEntity } from '../entity/DFSPEntity'
import { CountryEntity } from '../entity/CountryEntity'
import { CountrySubdivisionEntity } from '../entity/CountrySubdivisionEntity'
import { DistrictEntity } from '../entity/DistrictEntity'
import { type DataSource } from 'typeorm'
import { readEnv } from '../setup/readEnv'
import { ApplicationStateEntity } from '../entity/ApplicationStateEntity'

const SEED_DEFAULT_DFSP_USERS = readEnv('SEED_DEFAULT_DFSP_USERS', 'false') === 'true'
const SEED_DEFAULT_HUB_USERS = readEnv('SEED_DEFAULT_HUB_USERS', 'false') === 'true'

export const initializeDatabase = async (): Promise<void> => {
  logger.info('Connecting MySQL database...')

  await AppDataSource.initialize()
    .then(async () => {
      logger.info('MySQL Database Connection success.')

      await seedCategoryCode(AppDataSource, MerchantCategoryCodes)

      await seedCurrency(AppDataSource)

      await seedDFSPs(AppDataSource)

      await seedDefaultPermissions(AppDataSource)
      await seedDefaultRoles(AppDataSource)

      if (SEED_DEFAULT_DFSP_USERS) {
        await seedDefaultDFSPUsers(AppDataSource)
      }

      if (SEED_DEFAULT_HUB_USERS) {
        await seedDefaultHubUsers(AppDataSource)
      }

      let applicationState = await AppDataSource.manager.findOne(ApplicationStateEntity, { where: {} })
      if (applicationState == null) {
        applicationState = new ApplicationStateEntity()
        applicationState.is_hub_onboarding_complete = false
        await AppDataSource.manager.save(applicationState)
      }

      if (!applicationState.is_hub_onboarding_complete) {
        await seedDefaultHubSuperAdmin(AppDataSource)
      }

      /* istanbul ignore next */
      if (process.env.NODE_ENV !== 'test') {
        // only seed countries, subdivisions, districts in non-test environment
        // because it takes a long time to seed
        const filePath = path.join(__dirname, 'countries.json')
        await seedCountriesSubdivisionsDistricts(AppDataSource, filePath)
      }
    })
    .catch((error) => {
      /* istanbul ignore next */
      throw error
    })
}

export async function seedCategoryCode (appDataSource: DataSource, merchantCategoryData: Record<string, string>): Promise<void> {
  // skip if already seeded by checking size
  // TODO: Is there a better way?
  logger.info('Seeding Merchant Category Codes...')
  const alreadySeedSize = await appDataSource.manager.count(MerchantCategoryEntity)
  if (Object.keys(merchantCategoryData).length <= alreadySeedSize) {
    logger.info('Merchant Category Codes already seeded. Skipping...')
    return
  }

  const categories: MerchantCategoryEntity[] = []
  for (const categoryCode in merchantCategoryData) {
    const category = new MerchantCategoryEntity()
    category.category_code = categoryCode
    category.description = merchantCategoryData[categoryCode]
    categories.push(category)
  }
  await appDataSource.manager.save(categories)
  logger.info('Seeding Merchant Category Codes... Done')
}

export async function seedCurrency (appDataSource: DataSource): Promise<void> {
  // skip if already seeded by checking size
  // TODO: Is there a better way?
  logger.info('Seeding Currency Codes...')
  const alreadySeedSize = await appDataSource.manager.count(CurrencyEntity)
  if (Object.keys(CurrencyCodes).length <= alreadySeedSize) {
    logger.info('Currency Codes already seeded. Skipping...')
    return
  }

  for (const currencyCode in CurrencyCodes) {
    const currency = new CurrencyEntity()
    currency.iso_code = CurrencyCodes[currencyCode as keyof typeof CurrencyCodes]
    currency.description = CurrencyDescriptions[currencyCode as keyof typeof CurrencyDescriptions]
    await appDataSource.manager.save(currency)
  }
  logger.info('Seeding Currency Codes... Done')
}

export async function seedDFSPs (appDataSource: DataSource): Promise<void> {
  logger.info('Seeding Default DFSPs...')
  for (const dfsp of DefaultDFSPs) {
    const dfspEntity = await appDataSource.manager.findOne(
      DFSPEntity,
      { where: { name: dfsp.name } }
    )

    if (dfspEntity == null) {
      const newDFSP = new DFSPEntity()
      newDFSP.name = dfsp.name
      newDFSP.fspId = dfsp.fspId
      newDFSP.dfsp_type = dfsp.dfsp_type
      newDFSP.logo_uri = dfsp.logo_uri
      newDFSP.business_license_id = dfsp.business_license_id
      await AppDataSource.manager.save(newDFSP)
    }
  }
  logger.info('Seeding Default DFSPs... Done')
}

export async function seedDefaultPermissions (appDataSource: DataSource): Promise<void> {
  logger.info('Seeding Default Permissions...')
  for (const key of Object.keys(PermissionsEnum)) {
    const permission = PermissionsEnum[key as keyof typeof PermissionsEnum]
    let permissionEntity = await appDataSource.manager.findOne(
      PortalPermissionEntity,
      { where: { name: permission } }
    )

    if (permissionEntity == null) {
      permissionEntity = new PortalPermissionEntity()
      permissionEntity.name = permission
      permissionEntity.description = permission
      await appDataSource.manager.save(permissionEntity)
    }
  }
  logger.info('Seeding Default Permissions... Done')
}

export async function seedDefaultRoles (appDataSource: DataSource): Promise<void> {
  logger.info('Seeding Default Roles...')
  const permissions = await appDataSource.manager.find(PortalPermissionEntity)

  for (const role of DefaultRoles) {
    const filteredPermissions = permissions.filter(permission =>
      role.permissions.includes(permission.name as unknown as PermissionsEnum)
    )

    const roleEntity = await appDataSource.manager.findOne(
      PortalRoleEntity,
      { where: { name: role.name } }
    )

    if (roleEntity == null) {
      const newRole = new PortalRoleEntity()
      newRole.name = role.name
      newRole.description = role.name
      newRole.permissions = filteredPermissions
      await appDataSource.manager.save(newRole)
    }
  }
  logger.info('Seeding Default Roles... Done')
}

export async function seedAllDefaultUsers (appDataSource: DataSource): Promise<void> {
  await seedDefaultDFSPUsers(appDataSource)
  await seedDefaultHubUsers(appDataSource)
}

export async function seedDefaultDFSPUsers (appDataSource: DataSource): Promise<void> {
  logger.info('Seeding Default DFSP Users...')

  const roles = await appDataSource.manager.find(PortalRoleEntity)

  const dfsps = await appDataSource.manager.find(DFSPEntity)

  for (const user of DefaultDFSPUsers) {
    const userEntity = await appDataSource.manager.findOne(
      PortalUserEntity,
      { where: { email: user.email } }
    )

    if (userEntity == null) {
      const newUserRole = roles.find(role => user.role === role.name)
      if (newUserRole == null) {
        throw new Error(`Role '${user.role}' not found for seeding with '${user.email}'.`)
      }

      const newUserDFSP = dfsps.find(dfsp => user.dfsp_name === dfsp.name)
      if (newUserDFSP == null) {
        throw new Error(`DFSP '${user.dfsp_name}' not found for seeding with '${user.email}'.`)
      }

      const newUser = new PortalUserEntity()
      newUser.name = user.name
      newUser.email = user.email
      newUser.password = await hashPassword(user.password)
      newUser.phone_number = user.phone_number
      newUser.user_type = PortalUserType.DFSP
      newUser.status = PortalUserStatus.ACTIVE
      newUser.role = newUserRole
      newUser.dfsp = newUserDFSP
      await appDataSource.manager.save(newUser)
    } else {
      logger.info(`User ${user.email} already seeded. Skipping...`)
    }
  }
}

export async function seedDefaultHubSuperAdmin (appDataSource: DataSource): Promise<void> {
  logger.info('Seeding Default Hub Super Admin...')
  const roles = await appDataSource.manager.find(PortalRoleEntity)

  const user = DefaultHubSuperAdmin
  const userEntity = await appDataSource.manager.findOne(
    PortalUserEntity,
    { where: { email: user.email } }
  )

  if (userEntity != null) {
    logger.info(`User ${user.email} already seeded. Skipping...`)
    return
  }

  const newUserRole = roles.find(role => user.role === role.name)
  if (newUserRole == null) {
    throw new Error(`Role '${user.role}' not found for seeding with '${user.email}'.`)
  }

  const newUser = new PortalUserEntity()
  newUser.name = user.name
  newUser.email = user.email
  newUser.password = await hashPassword(user.password)
  newUser.phone_number = user.phone_number
  newUser.user_type = PortalUserType.HUB
  newUser.status = PortalUserStatus.ACTIVE
  newUser.role = newUserRole
  await appDataSource.manager.save(newUser)
}

export async function seedDefaultHubUsers (appDataSource: DataSource): Promise<void> {
  logger.info('Seeding Default Hub Users...')

  const roles = await appDataSource.manager.find(PortalRoleEntity)

  for (const user of DefaultHubUsers) {
    const userEntity = await appDataSource.manager.findOne(
      PortalUserEntity,
      { where: { email: user.email } }
    )

    if (userEntity == null) {
      const newUserRole = roles.find(role => user.role === role.name)
      if (newUserRole == null) {
        throw new Error(`Role '${user.role}' not found for seeding with '${user.email}'.`)
      }

      const newUser = new PortalUserEntity()
      newUser.name = user.name
      newUser.email = user.email
      newUser.password = await hashPassword(user.password)
      newUser.phone_number = user.phone_number
      newUser.user_type = PortalUserType.HUB
      newUser.status = PortalUserStatus.ACTIVE
      newUser.role = newUserRole
      await appDataSource.manager.save(newUser)
    } else {
      logger.info(`User ${user.email} already seeded. Skipping...`)
    }
  }

  logger.info('Seeding Default Users... Done')
}

export interface SubdivisionData {
  name: string
  districts: string[]
}

export interface CountryData {
  name: string
  code: string
  country_subdivisions: SubdivisionData[]
}

export async function seedCountriesSubdivisionsDistricts (
  appDataSource: DataSource,
  filePath: string): Promise<void> {
  logger.warn('Seeding Countries, Subdivisions, Districts... please wait...')

  const rawData = fs.readFileSync(filePath, 'utf-8')
  const seedData: CountryData[] = JSON.parse(rawData)

  await appDataSource.manager.clear(DistrictEntity)
  for (const countryData of seedData) {
    let country = await appDataSource.manager.findOne(
      CountryEntity, { where: { name: countryData.name } }
    )

    if (country == null) {
      country = new CountryEntity()
      country.name = countryData.name
      country.code = countryData.code
      await appDataSource.manager.save(country)
    }

    for (const subdivisionData of countryData.country_subdivisions) {
      let subdivision = await appDataSource.manager.findOne(
        CountrySubdivisionEntity, { where: { name: subdivisionData.name } }
      )

      if (subdivision == null) {
        subdivision = new CountrySubdivisionEntity()
        subdivision.name = subdivisionData.name
        subdivision.country = country
        await appDataSource.manager.save(subdivision)
      }

      const districtEntities: DistrictEntity[] = []
      for (const districtName of subdivisionData.districts) {
        const district = new DistrictEntity()
        district.name = districtName
        district.subdivision = subdivision
        districtEntities.push(district)
      }
      await appDataSource.manager.save(districtEntities)
    }
  }

  logger.info('Seeding Countries, Subdivisions, Districts... Done')
}
