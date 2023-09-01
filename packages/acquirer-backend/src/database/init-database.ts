import { AppDataSource } from './data-source'
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
import { DefaultRoles } from './default-roles'
import { PortalPermissionEntity } from '../entity/PortalPermissionEntity'
import { PortalRoleEntity } from '../entity/PortalRoleEntity'
import { DefaultUsers } from './default-users'
import { DefaultDFSPs } from './default-dfsps'
import { DFSPEntity } from '../entity/DFSPEntity'

export const initializeDatabase = async (): Promise<void> => {
  logger.info('Connecting MySQL database...')

  await AppDataSource.initialize()
    .then(async () => {
      logger.info('MySQL Database Connection success.')

      await seedCategoryCode()

      await seedCurrency()

      await seedDFSPs()

      await seedDefaultPermissions()
      await seedDefaultRoles()
      await seedDefaultUsers()
    })
    .catch((error) => {
      throw error
    })
}

async function seedCategoryCode (): Promise<void> {
  // skip if already seeded by checking size
  // TODO: Is there a better way?
  logger.info('Seeding Merchant Category Codes...')
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
  logger.info('Seeding Merchant Category Codes... Done')
}

async function seedCurrency (): Promise<void> {
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

async function seedDFSPs (): Promise<void> {
  logger.info('Seeding Default DFSPs...')
  for (const dfsp of DefaultDFSPs) {
    const dfspEntity = await AppDataSource.manager.findOne(
      DFSPEntity,
      { where: { name: dfsp.name } }
    )

    if (dfspEntity == null) {
      const newDFSP = new DFSPEntity()
      newDFSP.name = dfsp.name
      newDFSP.dfsp_type = dfsp.dfsp_type
      newDFSP.joined_date = dfsp.joined_date
      newDFSP.activated = dfsp.activated
      newDFSP.logo_uri = dfsp.logo_uri
      await AppDataSource.manager.save(newDFSP)
    }
  }
  logger.info('Seeding Default DFSPs... Done')
}

async function seedDefaultPermissions (): Promise<void> {
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

async function seedDefaultRoles (): Promise<void> {
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

async function seedDefaultUsers (): Promise<void> {
  logger.info('Seeding Default Users...')

  const roles = await AppDataSource.manager.find(PortalRoleEntity)

  const dfsps = await AppDataSource.manager.find(DFSPEntity)

  for (const user of DefaultUsers) {
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
      newUser.name = user.email
      newUser.email = user.email
      newUser.password = await hashPassword(user.password)
      newUser.phone_number = user.phone_number
      newUser.user_type = PortalUserType.DFSP
      newUser.status = PortalUserStatus.FRESH
      newUser.role = newUserRole
      newUser.dfsp = newUserDFSP
      await AppDataSource.manager.save(newUser)
    } else {
      logger.info(`User ${user.email} already seeded. Skipping...`)
    }
  }
  logger.info('Seeding Default Users... Done')
}
