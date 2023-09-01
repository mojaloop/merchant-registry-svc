/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express'

import { pdfUpload } from '../services/S3Client'
import { getMerchants } from './merchant-controllers/get-merchants'
import { getMerchantById } from './merchant-controllers/get-merchant-by-id'
import { postMerchantDraft } from './merchant-controllers/post-merchant-draft'
import { putMerchantStatusReadyToReview } from './merchant-controllers/put-merchant-ready-to-review'
import { postMerchantLocation } from './merchant-controllers/post-merchant-location'
import { postMerchantContactPerson } from './merchant-controllers/post-merchant-contact-person'
import { postMerchantOwner } from './merchant-controllers/post-merchant-owner'
import { putMerchantDraft } from './merchant-controllers/put-merchant-draft'
import { putMerchantLocation } from './merchant-controllers/put-merchant-location'
import { getMerchantLocations } from './merchant-controllers/get-merchant-locations'
import { getMerchantCheckoutCounters } from './merchant-controllers/get-merchant-checkout-counters'
import { getMerchantDraftCountsByUser } from
  './merchant-controllers/get-merchant-draft-counts-by-user'
import { putMerchantOwner } from './merchant-controllers/put-merchant-owner'
import { putMerchantContactPerson } from './merchant-controllers/put-merchant-contact-person'
import { putWaitingAliasGeneration } from './merchant-controllers/put-merchant-approve'
import { exportMerchantIdsXlsx } from './merchant-controllers/get-merchant-export-ids-xlsx'
import { putBulkWaitingAliasGeneration } from './merchant-controllers/put-merchant-approve-bulk'
import { putBulkReject } from './merchant-controllers/put-merchant-reject-bulk'
import { putBulkRevert } from './merchant-controllers/put-merchant-revert-bulk'
import { exportMerchantFilterXlsx } from './merchant-controllers/get-merchant-export-filter-xlsx'

import { authenticateJWT } from '../middleware/authenticate'
import { checkPermissions } from '../middleware/check-permissions'
import { PermissionsEnum } from '../types/permissions'

const router = express.Router()

router.get('/merchants',
  authenticateJWT,
  checkPermissions(PermissionsEnum.VIEW_MERCHANTS),
  getMerchants
)

router.get('/merchants/draft-counts',
  authenticateJWT,
  checkPermissions(PermissionsEnum.VIEW_MERCHANTS),
  getMerchantDraftCountsByUser
)

router.get('/merchants/export-with-ids',
  authenticateJWT,
  checkPermissions(PermissionsEnum.EXPORT_MERCHANTS),
  exportMerchantIdsXlsx
)

router.get('/merchants/export-with-filter',
  authenticateJWT,
  checkPermissions(PermissionsEnum.EXPORT_MERCHANTS),
  exportMerchantFilterXlsx
)

router.post('/merchants/draft',
  authenticateJWT,
  checkPermissions(PermissionsEnum.CREATE_MERCHANTS),
  pdfUpload.single('license_document'),
  postMerchantDraft
)

router.get('/merchants/:id',
  authenticateJWT,
  checkPermissions(PermissionsEnum.VIEW_MERCHANTS),
  getMerchantById
)

router.put('/merchants/:id/draft',
  authenticateJWT,
  checkPermissions(PermissionsEnum.EDIT_MERCHANTS),
  pdfUpload.single('license_document'),
  putMerchantDraft
)

router.put('/merchants/:id/approve',
  authenticateJWT,
  checkPermissions(PermissionsEnum.APPROVE_MERCHANTS),
  putWaitingAliasGeneration
)

router.put('/merchants/bulk-approve',
  authenticateJWT,
  checkPermissions(PermissionsEnum.APPROVE_MERCHANTS),
  putBulkWaitingAliasGeneration)

router.put('/merchants/bulk-reject',
  authenticateJWT,
  checkPermissions(PermissionsEnum.REJECT_MERCHANTS),
  putBulkReject
)

router.put('/merchants/bulk-revert',
  authenticateJWT,
  checkPermissions(PermissionsEnum.REVERT_MERCHANTS),
  putBulkRevert)

router.put('/merchants/:id/ready-to-review',
  authenticateJWT,
  checkPermissions(PermissionsEnum.CREATE_MERCHANTS),
  putMerchantStatusReadyToReview
)

router.get('/merchants/:id/locations',
  authenticateJWT,
  checkPermissions(PermissionsEnum.VIEW_MERCHANTS),
  getMerchantLocations)

router.post('/merchants/:id/locations',
  authenticateJWT,
  checkPermissions(PermissionsEnum.CREATE_MERCHANTS),
  postMerchantLocation)

router.put('/merchants/:merchantId/locations/:locationId',
  authenticateJWT,
  checkPermissions(PermissionsEnum.EDIT_MERCHANTS),
  putMerchantLocation)

router.post('/merchants/:id/contact-persons',
  authenticateJWT,
  checkPermissions(PermissionsEnum.CREATE_MERCHANTS),
  postMerchantContactPerson)

router.put('/merchants/:merchantId/contact-persons/:contactPersonId',
  authenticateJWT,
  checkPermissions(PermissionsEnum.EDIT_MERCHANTS),
  putMerchantContactPerson
)

router.post('/merchants/:id/business-owners',
  authenticateJWT,
  checkPermissions(PermissionsEnum.CREATE_MERCHANTS),
  postMerchantOwner
)

router.put('/merchants/:merchantId/business-owners/:ownerId',
  authenticateJWT,
  checkPermissions(PermissionsEnum.EDIT_MERCHANTS),
  putMerchantOwner)

router.get('/merchants/:id/checkout-counters',
  authenticateJWT,
  checkPermissions(PermissionsEnum.VIEW_MERCHANTS),
  getMerchantCheckoutCounters)

export default router
