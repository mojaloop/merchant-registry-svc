/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { type Response } from 'express'
import { AppDataSource } from '../../database/dataSource'
import logger from '../../services/logger'
import { type AuthRequest } from 'src/types/express'
import { CountryEntity } from '../../entity/CountryEntity'
import { AuditActionType, AuditTrasactionStatus } from 'shared-lib'
import { audit } from '../../utils/audit'

/**
 * @openapi
 * /countries/{countryName}/code:
 *   get:
 *     tags:
 *       - Countries
 *     security:
 *       - Authorization: []
 *     summary: GET Country Code
 *     parameters:
 *      - in: path
 *        name: countryName
 *        schema:
 *          type: string
 *        required: true
 *        description: Name of the Country
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
 *                   description: The list of country subdivisions
 *                   items:
 *                     type: object
 */
export async function getCountryCode (req: AuthRequest, res: Response) {
  const portalUser = req.user

  /* istanbul ignore if */
  if (portalUser == null) {
    return res.status(401).send({ message: 'Unauthorized' })
  }

  try {
    const country = await AppDataSource.manager.findOneOrFail(CountryEntity,
      { where: { name: req.params.countryName } }
    )

    await audit(
      AuditActionType.ACCESS,
      AuditTrasactionStatus.SUCCESS,
      'getCountryCode',
      'GET Country Code',
      'CountryEntity',
      {}, { params: req.params }, portalUser
    )

    res.send({ message: 'OK', data: country.code })
  } catch (e: any) /* istanbul ignore next */ {
    await audit(
      AuditActionType.ACCESS,
      AuditTrasactionStatus.FAILURE,
      'getCountryCode',
      `Error: ${e.message as string}`,
      'CountryEntity',
      {}, { params: req.params }, portalUser
    )

    logger.error('%o', e)
    res.status(500).send({ message: e })
  }
}
