/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { type Response } from 'express'
import { AppDataSource } from '../../database/data-source'
import logger from '../../services/logger'
import { type AuthRequest } from 'src/types/express'
import { CountryEntity } from '../../entity/CountryEntity'
import { CountrySubdivisionEntity } from '../../entity/CountrySubdivisionEntity'
import { AuditActionType, AuditTrasactionStatus } from 'shared-lib'
import { audit } from '../../utils/audit'
import { DistrictEntity } from '../../entity/DistrictEntity'

/**
 * @openapi
 * /countries/{countryName}/subdivisions/{subdivisionName}/districts:
 *   get:
 *     tags:
 *       - Countries
 *     security:
 *       - Authorization: []
 *     summary: GET List of Districts
 *     parameters:
 *      - in: path
 *        name: countryName
 *        schema:
 *          type: string
 *        required: true
 *        description: Name of the Country
 *      - in: path
 *        name: subdivisionName
 *        schema:
 *          type: string
 *        required: true
 *        description: Name of the Country Subdivision
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
 *                   description: The list of districts
 *                   items:
 *                     type: object
 */
export async function getDistricts (req: AuthRequest, res: Response) {
  const portalUser = req.user
  if (portalUser == null) {
    return res.status(401).send({ message: 'Unauthorized' })
  }

  try {
    const country = await AppDataSource.manager.findOneOrFail(
      CountryEntity, { where: { name: req.params.countryName } }
    )
    const countrySubdivision = await AppDataSource.manager.findOneOrFail(CountrySubdivisionEntity, {
      where: { country, name: req.params.subdivisionName }
    })
    const districts = await AppDataSource.manager.find(DistrictEntity, {
      where: { subdivision: countrySubdivision }
    })

    const data = []
    for (const district of districts) {
      data.push(district.name)
    }

    await audit(
      AuditActionType.ACCESS,
      AuditTrasactionStatus.SUCCESS,
      'getDistricts',
      'GET Districts',
      'DistrictEntity',
      {}, { params: req.params }, portalUser
    )

    res.send({ message: 'OK', data })
  } catch (e: any) {
    await audit(
      AuditActionType.ACCESS,
      AuditTrasactionStatus.FAILURE,
      'getDistricts',
      `Error: ${e.message as string}`,
      'DistrictEntity',
      {}, { params: req.params }, portalUser
    )

    logger.error('%o', e)
    res.status(500).send({ message: e })
  }
}
