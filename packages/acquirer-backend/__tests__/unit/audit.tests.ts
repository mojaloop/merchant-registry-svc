import { AuditActionType, AuditTrasactionStatus } from 'shared-lib'
import { initializeDatabase } from '../../src/database/initDatabase'
import { AppDataSource } from '../../src/database/dataSource'
import { PortalUserEntity } from '../../src/entity/PortalUserEntity'
import { DefaultHubUsers } from '../../src/database/defaultUsers'
import { audit } from '../../src/utils/audit'
import { AuditEntity } from '../../src/entity/AuditEntity'
import logger from '../../src/services/logger'

logger.silent = true
describe('audit unit tests', () => {
  const actionType = AuditActionType.UPDATE
  const auditTrasactionStatus = AuditTrasactionStatus.SUCCESS
  const applicationModule = 'AuditUnitTestModule'
  const entityName = 'AuditEntity'

  beforeAll(async () => {
    await initializeDatabase()
  }, 60000) // wait for 60secs for db to initialize

  it('should audit differences when deepObjectCompare is false', async () => {
    const mockUser = await AppDataSource.manager.findOneOrFail(PortalUserEntity, { where: { email: DefaultHubUsers[0].email } })
    const oldValue = { a: 1, b: 2 }
    const newValue = { a: 1, b: 3 }

    await audit(
      actionType,
      auditTrasactionStatus,
      applicationModule,
      'AuditUnitTestEventDeepObjectCompareFalse',
      entityName,
      oldValue,
      newValue,
      mockUser,
      false
    )

    const auditObj = await AppDataSource.manager.findOneOrFail(AuditEntity, { where: { event_description: 'AuditUnitTestEventDeepObjectCompareFalse' } })
    expect(auditObj).toBeDefined()
    expect(auditObj.old_value).toBe(JSON.stringify({ b: 2 }))
    expect(auditObj.new_value).toBe(JSON.stringify({ b: 3 }))
  })

  it('should audit deep differences when deepObjectCompare is true', async () => {
    const mockUser = await AppDataSource.manager.findOneOrFail(PortalUserEntity, { where: { email: DefaultHubUsers[0].email } })
    const oldValue = { b: 2 }
    const newValue = { a: { c: 4 } }

    await audit(
      actionType,
      auditTrasactionStatus,
      applicationModule,
      'AuditUnitTestEventDeepObjectCompareTrue',
      'AuditEntity',
      oldValue,
      newValue,
      mockUser,
      true
    )

    const auditObj = await AppDataSource.manager.findOneOrFail(AuditEntity, { where: { event_description: 'AuditUnitTestEventDeepObjectCompareTrue' } })
    expect(auditObj).toBeDefined()
    expect(auditObj.old_value).toBe(JSON.stringify({ a: null }))
    expect(auditObj.new_value).toBe(JSON.stringify({ a: { c: 4 } }))
  })
})
