/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express'

import { pdfUpload } from '../services/S3Client'
import { getMerchants } from './merchantControllers/getMerchants'
import { getMerchantById } from './merchantControllers/getMerchantById'
import { postMerchantDraft } from './merchantControllers/postMerchantDraft'
import { putMerchantStatusReadyToReview } from './merchantControllers/putMerchantReadyToReview'
import { postMerchantLocation } from './merchantControllers/postMerchantLocation'
import { postMerchantContactPerson } from './merchantControllers/postMerchantContactPerson'
import { postMerchantOwner } from './merchantControllers/postMerchantOwner'
import { putMerchantDraft } from './merchantControllers/putMerchantDraft'
import { putMerchantLocation } from './merchantControllers/putMerchantLocation'
import { getMerchantLocations } from './merchantControllers/getMerchantLocations'
import { getMerchantCheckoutCounters } from './merchantControllers/getMerchantCheckoutCounters'
import { getMerchantDraftCountsByUser } from
  './merchantControllers/getMerchantDraftCountsByUser'
import { putMerchantOwner } from './merchantControllers/putMerchantOwner'
import { putMerchantContactPerson } from './merchantControllers/putMerchantContactPerson'
import { putWaitingAliasGeneration } from './merchantControllers/putMerchantApprove'
import { exportMerchantIdsXlsx } from './merchantControllers/getMerchantExportIdsXlsx'
import { putBulkWaitingAliasGeneration } from './merchantControllers/putMerchantApproveBulk'
import { putBulkReject } from './merchantControllers/putMerchantRejectBulk'
import { putBulkRevert } from './merchantControllers/putMerchantRevertBulk'
import { exportMerchantFilterXlsx } from './merchantControllers/getMerchantExportFilterXlsx'

import { authenticateJWT } from '../middleware/authenticate'
import { checkPermissions } from '../middleware/checkPermissions'
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
