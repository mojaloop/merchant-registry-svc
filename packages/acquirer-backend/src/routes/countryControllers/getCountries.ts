/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { type Response } from 'express'
import { AppDataSource } from '../../database/dataSource'
import logger from '../../services/logger'
import { type AuthRequest } from 'src/types/express'
import { CountryEntity } from '../../entity/CountryEntity'
import { audit } from '../../utils/audit'
import { AuditActionType, AuditTrasactionStatus } from 'shared-lib'

/**
 * @openapi
 * tags:
 *   name: Countries
 *
 * /countries:
 *   get:
 *     tags:
 *       - Countries
 *     security:
 *       - Authorization: []
 *     summary: GET List of Countries
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: The response message
 *                   example: OK
 *                 data:
 *                   type: array
 *                   description: The list of countries
 *                   items:
 *                     type: object
 */
export async function getCountries (req: AuthRequest, res: Response) {
  const portalUser = req.user
  if (portalUser == null) {
    return res.status(401).send({ message: 'Unauthorized' })
  }

  try {
    const countries = await AppDataSource.manager.find(CountryEntity, {})

    await audit(
      AuditActionType.ACCESS,
      AuditTrasactionStatus.SUCCESS,
      'getCountries',
      'GET Countries',
      'CountryEntity',
      {}, { params: req.params }, portalUser
    )
    const data = []
    for (const country of countries) {
      data.push(country.name)
    }

    res.send({ message: 'OK', data })
  } catch (e: any) {
    await audit(
      AuditActionType.ACCESS,
      AuditTrasactionStatus.FAILURE,
      'getCountrySubdivisions',
      `Error: ${e.message as string}`,
      'CountrySubdivisionEntity',
      {}, { params: req.params }, portalUser
    )
    logger.error(e)
    res.status(500).send({ message: e })
  }
}
