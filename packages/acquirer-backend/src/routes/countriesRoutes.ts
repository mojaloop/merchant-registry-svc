/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express'
import { checkPermissionsOr } from '../middleware/checkPermissions'
import { PermissionsEnum } from '../types/permissions'
import { authenticateJWT } from '../middleware/authenticate'
import { getCountries } from './countryControllers/getCountries'
import { getCountrySubdivisions } from './countryControllers/getCountrySubdivisions'
import { getDistricts } from './countryControllers/getCountrySubdivDistricts'

const router = express.Router()

router.get('/countries',
  authenticateJWT,
  checkPermissionsOr([PermissionsEnum.CREATE_MERCHANTS, PermissionsEnum.EDIT_MERCHANTS]),
  getCountries
)

router.get('/countries/:countryName/subdivisions',
  authenticateJWT,
  checkPermissionsOr([PermissionsEnum.CREATE_MERCHANTS, PermissionsEnum.EDIT_MERCHANTS]),
  getCountrySubdivisions
)

router.get('/countries/:countryName/subdivisions/:subdivisionName/districts',
  authenticateJWT,
  checkPermissionsOr([PermissionsEnum.CREATE_MERCHANTS, PermissionsEnum.EDIT_MERCHANTS]),
  getDistricts
)

export default router
