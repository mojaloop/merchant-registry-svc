/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { type Request, type Response } from 'express'
import { Workbook } from 'exceljs'
import { AppDataSource } from '../../database/data-source'
import { MerchantEntity } from '../../entity/MerchantEntity'
import logger from '../../logger'
import { getAuthenticatedPortalUser } from '../../middleware/authenticate'
import { audit } from '../../utils/audit'
import { AuditActionType, AuditTrasactionStatus } from 'shared-lib'
import { In } from 'typeorm'
import { getMerchantDocumentURL } from '../../middleware/minioClient'

interface ICategory {
  category_code: string
  description: string
}

interface ICurrency {
  iso_code: string
  description: string
}
/**
 * @openapi
 * /merchants/export:
 *   get:
 *     tags:
 *       - Merchants
 *     security:
 *       - Authorization: []
 *     summary: Export Merchants as XLSX
 *     parameters:
 *       - in: query
 *         name: ids
 *         required: true
 *         schema:
 *           type: array
 *           items:
 *             type: number
 *         description: Merchant Record IDs are either as a comma-separated string or an array of numbers.
 *         example: [1, 2, 3]
 *     responses:
 *       200:
 *         description: Merchants Exported
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 */

export async function exportMerchantXlsx (req: Request, res: Response) {
  const portalUser = await getAuthenticatedPortalUser(req.headers.authorization)
  if (portalUser == null) {
    return res.status(401).send({ message: 'Unauthorized' })
  }

  const merchantRepository = AppDataSource.getRepository(MerchantEntity)
  logger.debug('req.query.ids: %o', req.query.ids)
  const idsParam = req.query.ids
  let ids: number[] = []

  if (typeof idsParam === 'string') {
    ids = idsParam.split(',').map(Number)
  } else if (Array.isArray(idsParam)) {
    ids = idsParam.map(Number)
  } else {
    throw new Error('IDs must be provided as a comma-separated string or an array of numbers.')
  }

  // Validate IDs
  if (!Array.isArray(ids)) throw new Error('IDs must be an array of numbers.')
  for (const id of ids) {
    if (isNaN(Number(id)) || Number(id) < 1) {
      await audit(
        AuditActionType.UPDATE,
        AuditTrasactionStatus.FAILURE,
        'putBulkApprove',
        'ID must be a valid ID number',
        'Merchant',
        {}, {}, portalUser
      )

      return res.status(422).send({ message: 'Each ID in the array must be a valid ID number.' })
    }
  }

  let merchants: MerchantEntity[] = []
  try {
    merchants = await merchantRepository.find({
      where: {
        id: In(ids)
      },
      relations: [
        'locations',
        'category_code',
        'currency_code',
        'checkout_counters',
        'business_licenses',
        'contact_persons',
        'created_by',
        'business_owners',
        'business_owners.businessPersonLocation',
        'checked_by'
      ]
    })
  } catch (e) {
    logger.error('Error fetching merchant: %o', e)
    await audit(
      AuditActionType.ACCESS,
      AuditTrasactionStatus.FAILURE,
      'getMerchantById',
        `User ${portalUser.id} (${portalUser.email}) failed to fetch merchant ${req.params.id}`,
        'MerchantEntity',
        {}, {}, portalUser
    )
    res.status(500).send({ message: e })
  }

  const workbook = new Workbook()
  const merchantsWorkbook = workbook.addWorksheet('Merchants')
  const businessLocationsWorkbook = workbook.addWorksheet('Business Locations')
  const checkoutCountersWorkbook = workbook.addWorksheet('Checkout Counters')
  const businessOwnersWorkbook = workbook.addWorksheet('Business Owners')
  const contactPersonsWorkbook = workbook.addWorksheet('Contact Persons')

  merchantsWorkbook.columns = [
    { header: 'ID', key: 'id', width: 10 },
    { header: 'dba_trading_name', key: 'dba_trading_name', width: 32 },
    { header: 'registered_name', key: 'registered_name', width: 32 },
    { header: 'employees_num', key: 'employees_num', width: 32 },
    { header: 'monthly_turnover', key: 'monthly_turnover', width: 32 },
    { header: 'merchant_type', key: 'merchant_type', width: 32 },
    { header: 'allow_block_status', key: 'allow_block_status', width: 32 },
    { header: 'registration_status', key: 'registration_status', width: 32 },
    { header: 'registration_status_reason', key: 'registration_status_reason', width: 32 },
    { header: 'category', key: 'category', width: 32 },
    { header: 'currency', key: 'currency', width: 32 },
    { header: 'license_number', key: 'license_number', width: 32 },
    { header: 'license_document_link', key: 'license_document_link', width: 32 }
  ]

  const locationColumns = [
    { header: 'ID', key: 'id', width: 10 },
    { header: 'address_type', key: 'address_type', width: 32 },
    { header: 'department', key: 'department', width: 32 },
    { header: 'sub_department', key: 'sub_department', width: 32 },
    { header: 'street_name', key: 'street_name', width: 32 },
    { header: 'building_number', key: 'building_number', width: 32 },
    { header: 'building_name', key: 'building_name', width: 32 },
    { header: 'floor_number', key: 'floor_number', width: 32 },
    { header: 'room_number', key: 'room_number', width: 32 },
    { header: 'post_box', key: 'post_box', width: 32 },
    { header: 'postal_code', key: 'postal_code', width: 32 },
    { header: 'town_name', key: 'town_name', width: 32 },
    { header: 'district_name', key: 'district_name', width: 32 },
    { header: 'country_subdivision', key: 'country_subdivision', width: 32 },
    { header: 'country', key: 'country', width: 32 },
    { header: 'address_line', key: 'address_line', width: 32 },
    { header: 'latitude', key: 'latitude', width: 32 },
    { header: 'longitude', key: 'longitude', width: 32 }
  ]

  businessLocationsWorkbook.columns = [
    { header: 'ID', key: 'id', width: 10 },
    { header: 'Merchant ID', key: 'merchant_id', width: 32 },
    { header: 'location_type', key: 'location_type', width: 32 },
    { header: 'web_url', key: 'web_url', width: 32 },
    ...locationColumns
  ]

  checkoutCountersWorkbook.columns = [
    { header: 'ID', key: 'id', width: 10 },
    { header: 'Merchant ID', key: 'merchant_id', width: 10 },
    { header: 'description', key: 'description', width: 32 },
    { header: 'notification_number', key: 'notification_number', width: 32 },
    { header: 'alias_type', key: 'alias_type', width: 32 },
    { header: 'alias_value', key: 'alias_value', width: 32 },
    { header: 'Merchant Registry ID', key: 'merchant_registry_id', width: 10 },
    { header: 'Location ID', key: 'checkout_location', width: 10 }
  ]

  businessOwnersWorkbook.columns = [
    { header: 'ID', key: 'id', width: 10 },
    { header: 'Merchant ID', key: 'merchant_id', width: 10 },
    { header: 'identificaton_type', key: 'identificaton_type', width: 32 },
    { header: 'identification_number', key: 'identification_number', width: 32 },
    { header: 'name', key: 'name', width: 32 },
    { header: 'email', key: 'email', width: 32 },
    { header: 'phone_number', key: 'phone_number', width: 32 },
    { header: 'Location ID', key: 'businessPersonLocation', width: 32 }
  ]

  contactPersonsWorkbook.columns = [
    { header: 'ID', key: 'id', width: 10 },
    { header: 'Merchant ID', key: 'merchant_id', width: 10 },
    { header: 'name', key: 'name', width: 32 },
    { header: 'email', key: 'email', width: 32 },
    { header: 'phone_number', key: 'phone_number', width: 32 }
  ]

  for (const merchant of merchants) {
    const category: ICategory = JSON.parse(JSON.stringify(merchant.category_code))
    const currency: ICurrency = JSON.parse(JSON.stringify(merchant.currency_code))
    merchantsWorkbook.addRow({
      id: merchant.id,
      dba_trading_name: merchant.dba_trading_name,
      registered_name: merchant.registered_name,
      employees_num: merchant.employees_num,
      monthly_turnover: merchant.monthly_turnover,
      merchant_type: merchant.merchant_type,
      allow_block_status: merchant.allow_block_status,
      registration_status: merchant.registration_status,
      registration_status_reason: merchant.registration_status_reason,
      category: `${category.category_code} - ${category.description}`,
      currency: `${currency.iso_code} - ${currency.description}`,
      license_number: merchant.business_licenses[0]?.license_number,
      // eslint-disable-next-line
      license_document_link: await getMerchantDocumentURL(merchant.business_licenses[0]?.license_document_link)
    })

    for (const location of merchant.locations) {
      businessLocationsWorkbook.addRow({
        merchant_id: merchant.id,
        ...location,
        id: location.id
      })
    }

    for (const checkoutCounter of merchant.checkout_counters) {
      checkoutCountersWorkbook.addRow({
        merchant_id: merchant.id,
        ...checkoutCounter,
        checkout_location: checkoutCounter.checkout_location?.id
      })
    }

    for (const businessOwner of merchant.business_owners) {
      businessOwnersWorkbook.addRow({
        merchant_id: merchant.id,
        ...businessOwner,
        businessPersonLocation: businessOwner.businessPersonLocation?.id
      })
    }

    for (const contactPerson of merchant.contact_persons) {
      contactPersonsWorkbook.addRow({
        merchant_id: merchant.id,
        ...contactPerson
      })
    }
  }

  const buffer = await workbook.xlsx.writeBuffer()

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  res.setHeader('Content-Disposition', 'attachment; filename=merchants.xlsx')
  res.end(buffer)
}
