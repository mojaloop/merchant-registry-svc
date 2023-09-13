/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { type Response } from 'express'
import { AppDataSource } from '../../database/dataSource'
import logger from '../../services/logger'
import { type AuthRequest } from 'src/types/express'
import { CountryEntity } from '../../entity/CountryEntity'
import { CountrySubdivisionEntity } from '../../entity/CountrySubdivisionEntity'
import { AuditActionType, AuditTrasactionStatus } from 'shared-lib'
import { audit } from '../../utils/audit'

/**
 * @openapi
 * /countries/{countryName}/subdivisions:
 *   get:
 *     tags:
 *       - Countries
 *     security:
 *       - Authorization: []
 *     summary: GET List of Country Subdivisions
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
export async function getCountrySubdivisions (req: AuthRequest, res: Response) {
  const portalUser = req.user
  if (portalUser == null) {
    return res.status(401).send({ message: 'Unauthorized' })
  }

  try {
    const country = await AppDataSource.manager.findOneOrFail(CountryEntity,
      { where: { name: req.params.countryName } }
    )
    const countrySubdivisions = await AppDataSource.manager.find(CountrySubdivisionEntity, {
      where: { country }
    })

    // Flattern the data
    const data = []
    for (const countrySubdivision of countrySubdivisions) {
      data.push(countrySubdivision.name)
    }

    await audit(
      AuditActionType.ACCESS,
      AuditTrasactionStatus.SUCCESS,
      'getCountrySubdivisions',
      'GET Country Subdivisions',
      'CountrySubdivisionEntity',
      {}, { params: req.params }, portalUser
    )

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

    logger.error('%o', e)
    res.status(500).send({ message: e })
  }
}
