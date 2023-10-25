import { AppDataSource } from './dataSource'
import fs from 'fs'
import path from 'path'
import logger from '../services/logger'
import 'dotenv/config'
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
import { DefaultDFSPUsers, DefaultHubUsers } from './defaultUsers'
import { DefaultDFSPs } from './defaultDfsps'
import { DFSPEntity } from '../entity/DFSPEntity'
import { CountryEntity } from '../entity/CountryEntity'
import { CountrySubdivisionEntity } from '../entity/CountrySubdivisionEntity'
import { DistrictEntity } from '../entity/DistrictEntity'
import { type DataSource } from 'typeorm'

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
      await seedDefaultUsers(AppDataSource)

      if (process.env.NODE_ENV !== 'test') {
        // only seed countries, subdivisions, districts in non-test environment
        // because it takes a long time to seed
        const filePath = path.join(__dirname, 'countries.json')
        await seedCountriesSubdivisionsDistricts(AppDataSource, filePath)
      }
    })
    .catch((error) => {
      throw error
    })
}

export async function seedCategoryCode (AppDataSource: DataSource, merchantCategoryData: Record<string, string>): Promise<void> {
  // skip if already seeded by checking size
  // TODO: Is there a better way?
  logger.info('Seeding Merchant Category Codes...')
  const alreadySeedSize = await AppDataSource.manager.count(MerchantCategoryEntity)
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
  await AppDataSource.manager.save(categories)
  logger.info('Seeding Merchant Category Codes... Done')
}

export async function seedCurrency (AppDataSource: DataSource): Promise<void> {
  // skip if already seeded by checking size
  // TODO: Is there a better way?
  logger.info('Seeding Currency Codes...')
  const alreadySeedSize = await AppDataSource.manager.count(CurrencyEntity)
  if (Object.keys(CurrencyCodes).length <= alreadySeedSize) {
    logger.info('Currency Codes already seeded. Skipping...')
    return
  }

  for (const currencyCode in CurrencyCodes) {
    const currency = new CurrencyEntity()
    currency.iso_code = CurrencyCodes[currencyCode as keyof typeof CurrencyCodes]
    currency.description = CurrencyDescriptions[currencyCode as keyof typeof CurrencyDescriptions]
    await AppDataSource.manager.save(currency)
  }
  logger.info('Seeding Currency Codes... Done')
}

export async function seedDFSPs (AppDataSource: DataSource): Promise<void> {
  logger.info('Seeding Default DFSPs...')
  for (const dfsp of DefaultDFSPs) {
    const dfspEntity = await AppDataSource.manager.findOne(
      DFSPEntity,
      { where: { name: dfsp.name } }
    )

    if (dfspEntity == null) {
      const newDFSP = new DFSPEntity()
      newDFSP.name = dfsp.name
      newDFSP.fspId = dfsp.fspId
      newDFSP.dfsp_type = dfsp.dfsp_type
      newDFSP.joined_date = dfsp.joined_date
      newDFSP.activated = dfsp.activated
      newDFSP.logo_uri = dfsp.logo_uri
      await AppDataSource.manager.save(newDFSP)
    }
  }
  logger.info('Seeding Default DFSPs... Done')
}

export async function seedDefaultPermissions (AppDataSource: DataSource): Promise<void> {
  logger.info('Seeding Default Permissions...')
  for (const key of Object.keys(PermissionsEnum)) {
    const permission = PermissionsEnum[key as keyof typeof PermissionsEnum]
    let permissionEntity = await AppDataSource.manager.findOne(
      PortalPermissionEntity,
      { where: { name: permission } }
    )

    if (permissionEntity == null) {
      permissionEntity = new PortalPermissionEntity()
      permissionEntity.name = permission
      permissionEntity.description = permission
      await AppDataSource.manager.save(permissionEntity)
    }
  }
  logger.info('Seeding Default Permissions... Done')
}

export async function seedDefaultRoles (AppDataSource: DataSource): Promise<void> {
  logger.info('Seeding Default Roles...')
  const permissions = await AppDataSource.manager.find(PortalPermissionEntity)

  for (const role of DefaultRoles) {
    const filteredPermissions = permissions.filter(permission =>
      role.permissions.includes(permission.name as unknown as PermissionsEnum)
    )

    const roleEntity = await AppDataSource.manager.findOne(
      PortalRoleEntity,
      { where: { name: role.name } }
    )

    if (roleEntity == null) {
      const newRole = new PortalRoleEntity()
      newRole.name = role.name
      newRole.description = role.name
      newRole.permissions = filteredPermissions
      await AppDataSource.manager.save(newRole)
    }
  }
  logger.info('Seeding Default Roles... Done')
}

export async function seedDefaultUsers (AppDataSource: DataSource): Promise<void> {
  logger.info('Seeding Default Users...')

  const roles = await AppDataSource.manager.find(PortalRoleEntity)

  const dfsps = await AppDataSource.manager.find(DFSPEntity)

  for (const user of DefaultDFSPUsers) {
    const userEntity = await AppDataSource.manager.findOne(
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
      await AppDataSource.manager.save(newUser)
    } else {
      logger.info(`User ${user.email} already seeded. Skipping...`)
    }
  }

  for (const user of DefaultHubUsers) {
    const userEntity = await AppDataSource.manager.findOne(
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
      await AppDataSource.manager.save(newUser)
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
  country_subdivisions: SubdivisionData[]
}

export async function seedCountriesSubdivisionsDistricts (
  AppDataSource: DataSource,
  filePath: string): Promise<void> {
  logger.warn('Seeding Countries, Subdivisions, Districts... please wait...')

  const rawData = fs.readFileSync(filePath, 'utf-8')
  const seedData: CountryData[] = JSON.parse(rawData)

  await AppDataSource.manager.clear(DistrictEntity)
  for (const countryData of seedData) {
    let country = await AppDataSource.manager.findOne(
      CountryEntity, { where: { name: countryData.name } }
    )

    if (country == null) {
      country = new CountryEntity()
      country.name = countryData.name
      await AppDataSource.manager.save(country)
    }

    for (const subdivisionData of countryData.country_subdivisions) {
      let subdivision = await AppDataSource.manager.findOne(
        CountrySubdivisionEntity, { where: { name: subdivisionData.name } }
      )

      if (subdivision == null) {
        subdivision = new CountrySubdivisionEntity()
        subdivision.name = subdivisionData.name
        subdivision.country = country
        await AppDataSource.manager.save(subdivision)
      }

      const districtEntities: DistrictEntity[] = []
      for (const districtName of subdivisionData.districts) {
        const district = new DistrictEntity()
        district.name = districtName
        district.subdivision = subdivision
        districtEntities.push(district)
      }
      await AppDataSource.manager.save(districtEntities)
    }
  }

  logger.info('Seeding Countries, Subdivisions, Districts... Done')
}
