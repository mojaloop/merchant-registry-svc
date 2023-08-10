import { AppDataSource } from '../database/data-source'
import { PortalUserEntity } from '../entity/PortalUserEntity'

export async function getAuthenticatedPortalUser (authorization: string | null | undefined):
Promise<PortalUserEntity | null> {
  if (authorization === undefined) {
    return null
  }

  if (authorization === null) {
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
  }

  return portalUser
}
