import { audit } from '../utils/audit'
import { AppDataSource } from '../database/data-source'
import { PortalUserEntity } from '../entity/PortalUserEntity'
import { AuditActionType, AuditTrasactionStatus } from 'shared-lib'

export async function getAuthenticatedPortalUser (authorization: string | null | undefined):
Promise<PortalUserEntity | null> {
  if (authorization === undefined) {
    await audit(
      AuditActionType.UNAUTHORIZED_ACCESS,
      AuditTrasactionStatus.FAILURE,
      'getAuthenticatedPortalUser',
      'Authorization header is undefined',
      'PortalUserEntity',
      {}, {}, null
    )
    return null
  }

  if (authorization === null) {
    await audit(
      AuditActionType.UNAUTHORIZED_ACCESS,
      AuditTrasactionStatus.FAILURE,
      'getAuthenticatedPortalUser',
      'Authorization header is null',
      'PortalUserEntity',
      {}, {}, null
    )
    return null
  }

  const token = authorization.replace('Bearer', '').trim()

  let portalUser: PortalUserEntity | null = null

  if (token === process.env.TEST1_DUMMY_AUTH_TOKEN) {
    portalUser = await AppDataSource.manager.findOne(
      PortalUserEntity,
      { where: { email: process.env.TEST1_EMAIL } }
    )
  } else if (token === process.env.TEST2_DUMMY_AUTH_TOKEN) {
    portalUser = await AppDataSource.manager.findOne(
      PortalUserEntity,
      { where: { email: process.env.TEST2_EMAIL } }
    )
  } else {
    await audit(
      AuditActionType.UNAUTHORIZED_ACCESS,
      AuditTrasactionStatus.FAILURE,
      'getAuthenticatedPortalUser',
      'Invalid token',
      'PortalUserEntity',
      {}, {}, null
    )
    return null
  }

  return portalUser
}
