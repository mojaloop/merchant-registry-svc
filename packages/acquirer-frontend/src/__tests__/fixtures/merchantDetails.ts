import type {
  BusinessOwnerIDType,
  CurrencyCodes,
  MerchantLocationType,
  MerchantRegistrationStatus,
  MerchantType,
  NumberOfEmployees,
} from 'shared-lib'

import type { MerchantDetails } from '@/types/merchantDetails'

/**
 * Creates a base merchant details object with minimal required fields
 */
export const createBaseMerchantDetails = (
  overrides?: Partial<MerchantDetails>
): MerchantDetails => ({
  id: 1,
  dba_trading_name: 'Test Merchant',
  registered_name: 'Test Merchant Ltd',
  lei: null,
  employees_num: '6 - 10' as NumberOfEmployees,
  monthly_turnover: '10000',
  merchant_type: 'Small Shop' as MerchantType,
  category_code: { category_code: '10120', description: 'Test Category' },
  currency_code: { iso_code: 'USD' as CurrencyCodes, description: 'US Dollar' },
  allow_block_status: 'Pending',
  registration_status: 'Draft' as MerchantRegistrationStatus,
  registration_status_reason: null,
  gleif_verified_at: null,
  created_at: '2023-10-26T04:24:14.056Z',
  updated_at: '2023-10-26T04:24:14.056Z',
  default_dfsp: {
    id: 1,
    name: 'Test DFSP',
    dfsp_type: 'Bank',
    logo_uri: '',
    activated: true,
    created_at: '2023-10-26T04:24:14.056Z',
    updated_at: '2023-10-26T04:24:14.056Z',
  },
  dfsps: [],
  locations: [],
  checkout_counters: [],
  business_licenses: [],
  contact_persons: [],
  business_owners: [],
  created_by: {
    id: 1,
    name: 'Test User',
    email: 'test@email.com',
    phone_number: '123456789',
  },
  checked_by: null,
  ...overrides,
})

/**
 * Creates a merchant with business owner information
 */
export const createOwnerInfoMerchant = (
  overrides?: Partial<MerchantDetails>
): MerchantDetails =>
  createBaseMerchantDetails({
    business_owners: [
      {
        businessPersonLocation: {
          address_line: '',
          address_type: '',
          building_name: 'Big Building',
          building_number: '123',
          country: 'Australia',
          country_subdivision: 'Western Australia',
          created_at: new Date('2023-10-26T04:24:14.046Z'),
          department: 'Sales',
          district_name: 'Perth',
          floor_number: '4',
          id: 1,
          location_type: 'Physical' as MerchantLocationType,
          web_url: '',
          latitude: '331',
          longitude: '99',
          post_box: 'PO Box 123',
          postal_code: '12345',
          room_number: '101',
          street_name: 'Main Street',
          sub_department: 'Support',
          town_name: 'Townsville',
          updated_at: new Date('2023-10-26T04:24:14.046Z'),
        },
        created_at: new Date('2023-10-26T04:24:14.056Z'),
        email: 'johndoe@gmail.com',
        id: 1,
        identification_number: '30291',
        identificaton_type: 'Passport' as BusinessOwnerIDType,
        name: 'John Doe',
        phone_number: '932-888-4213',
        updated_at: new Date('2023-10-26T04:24:14.056Z'),
      },
    ],
    ...overrides,
  })

/**
 * Creates a merchant with location and checkout counter information
 */
export const createLocationInfoMerchant = (
  overrides?: Partial<MerchantDetails>
): MerchantDetails =>
  createBaseMerchantDetails({
    created_at: '2023-10-25T15:39:03.173Z',
    updated_at: '2023-10-25T17:42:24.000Z',
    default_dfsp: {
      id: 1,
      name: 'Test DFSP',
      dfsp_type: 'Bank',
      logo_uri: '',
      activated: true,
      created_at: '2023-10-25T15:39:03.173Z',
      updated_at: '2023-10-25T17:42:24.000Z',
    },
    checkout_counters: [
      {
        id: 1,
        description: '-',
        notification_number: '',
        alias_type: '',
        alias_value: '',
        merchant_registry_id: 1,
        qr_code_link: '',
        created_at: '2023-10-25T15:39:03.173Z',
        updated_at: '2023-10-25T17:42:24.000Z',
      },
    ],
    locations: [
      {
        address_line: '',
        address_type: '',
        building_name: 'Big Building',
        building_number: '123',
        country: 'Australia',
        country_subdivision: 'Western Australia',
        created_at: new Date('2023-10-25T15:39:03.173Z'),
        department: 'Sale',
        district_name: 'Perth',
        floor_number: '4',
        id: 1,
        latitude: '331',
        location_type: 'Virtual' as MerchantLocationType,
        longitude: '99',
        post_box: 'PO Box 123',
        postal_code: '12345',
        room_number: '101',
        street_name: 'Main Street',
        sub_department: 'Support',
        town_name: 'Townsville',
        updated_at: new Date('2023-10-25T17:42:24.000Z'),
        web_url: 'https://www.example.com',
      },
    ],
    ...overrides,
  })

/**
 * Creates a merchant with contact person information
 */
export const createContactPersonMerchant = (
  overrides?: Partial<MerchantDetails>
): MerchantDetails =>
  createBaseMerchantDetails({
    business_owners: [
      {
        created_at: new Date('2023-10-26T04:24:14.056Z'),
        email: 'johndoe@gmail.com',
        id: 1,
        identification_number: '30291',
        identificaton_type: 'Passport' as BusinessOwnerIDType,
        name: 'John Doe',
        phone_number: '932-888-4213',
        updated_at: new Date('2023-10-26T04:24:14.056Z'),
        businessPersonLocation: {
          id: 1,
          location_type: 'Physical' as MerchantLocationType,
          web_url: '',
          address_type: '',
          department: '',
          sub_department: '',
          street_name: '',
          building_number: '',
          building_name: '',
          floor_number: '',
          room_number: '',
          post_box: '',
          postal_code: '',
          town_name: '',
          district_name: '',
          country_subdivision: '',
          country: '',
          address_line: '',
          latitude: '',
          longitude: '',
          created_at: new Date('2023-10-26T04:24:14.056Z'),
          updated_at: new Date('2023-10-26T04:24:14.056Z'),
        },
      },
    ],
    contact_persons: [
      {
        created_at: new Date('2023-10-26T06:29:21.676Z'),
        email: 'john@gmail.com',
        id: 1,
        name: 'John',
        phone_number: '932-555-4213',
        updated_at: new Date('2023-10-26T06:29:21.676Z'),
      },
    ],
    ...overrides,
  })

/**
 * Creates a merchant with business license information
 */
export const createBusinessInfoMerchant = (
  overrides?: Partial<MerchantDetails>
): MerchantDetails =>
  createBaseMerchantDetails({
    business_licenses: [
      {
        created_at: '2023-10-23T11:55:01.772Z',
        id: 1,
        license_document_link:
          'https://minio:9000/merchant-documents/marco/thitsaworkspdf-123.pdf?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=minioadmin%2F20231025%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20231025T195349Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=d4e492cc0eb820949dd78dfecead33aa7748c206dd5d0c12e3060f63573c0b90',
        license_number: '1234',
        updated_at: '2023-10-23T11:56:54.000Z',
      },
    ],
    category_code: {
      category_code: '10120',
      description: 'Processing and preserving of poultry meat',
    },
    created_at: '2023-10-23T11:55:01.739Z',
    currency_code: {
      description: 'Lek',
      iso_code: 'ALL' as CurrencyCodes,
    },
    dba_trading_name: 'marco',
    employees_num: '6 - 10' as NumberOfEmployees,
    merchant_type: 'Small Shop' as MerchantType,
    monthly_turnover: '',
    registered_name: '',
    registration_status_reason: 'Draft Merchant by d1superadmin1@email.com',
    updated_at: '2023-10-23T11:56:54.000Z',
    default_dfsp: {
      id: 1,
      name: 'Test DFSP',
      dfsp_type: 'Bank',
      logo_uri: '',
      activated: true,
      created_at: '2023-10-23T11:55:01.739Z',
      updated_at: '2023-10-23T11:55:01.739Z',
    },
    created_by: {
      id: 1,
      name: 'Test User',
      email: 'd1superadmin1@email.com',
      phone_number: '123456789',
    },
    ...overrides,
  })
