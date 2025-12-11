import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import type {
  BusinessOwnerIDType,
  CurrencyCodes,
  MerchantLocationType,
  MerchantRegistrationStatus,
  MerchantType,
  NumberOfEmployees,
} from 'shared-lib'

import type { MerchantDetails } from '@/types/merchantDetails'
import TestWrapper from '@/__tests__/TestWrapper'
import ContactPersonForm from './ContactPersonForm'

const hoistedValues = vi.hoisted(() => ({
  draft: {
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
    created_by: {
      id: 1,
      name: 'Test User',
      email: 'test@email.com',
      phone_number: '123456789',
    },
    checked_by: null,
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
  },
}))

const fn = vi.fn()

vi.mock('@chakra-ui/react', async () => {
  const charaUI: object = await vi.importActual('@chakra-ui/react')

  return {
    ...charaUI,
    useToast: () => {
      return () => fn('toast')
    },
  }
})

const mockMerchantId = vi.fn()
vi.mock('@/hooks', () => ({
  useMerchantId: () => mockMerchantId(),
}))

let draftData: MerchantDetails | null = null

vi.mock('@/api/hooks/forms', () => ({
  useDraft: () => ({
    get data() {
      return draftData
    },
    isFetching: false,
  }),
  useCreateContactPerson: () => ({
    mutate: () => fn('createContactPerson'),
    isPending: false,
  }),
  useUpdateContactPerson: () => ({
    mutate: () => fn('updateContactPerson'),
    isPending: false,
  }),
  useChangeStatusToReview: () => ({
    isLoading: false,
    mutate: () => fn('changeStatusToReview'),
  }),
}))

const mockSetActiveStep = vi.fn()

describe('ContactPersonForm', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    draftData = null
  })

  beforeEach(() => {
    fn.mockClear()
  })

  it('should focus the first input which has an error when the validation fails', async () => {
    draftData = null

    render(
      <TestWrapper>
        <ContactPersonForm setActiveStep={mockSetActiveStep} />
      </TestWrapper>
    )

    const submitButton: HTMLButtonElement = screen.getByText('Review Submission')
    fireEvent.submit(submitButton)

    expect(await screen.findByLabelText(/Name/)).toEqual(document.activeElement)
  })

  it('should fill with draft values when it is a draft', () => {
    draftData = hoistedValues.draft

    render(
      <TestWrapper>
        <ContactPersonForm setActiveStep={mockSetActiveStep} />
      </TestWrapper>
    )

    const nameInput: HTMLInputElement = screen.getByLabelText(/Name/)
    const phoneNumberInput: HTMLInputElement = screen.getByLabelText(/Phone Number/)
    const emailInput: HTMLInputElement = screen.getByLabelText('Email')

    expect(nameInput.value).toEqual('John')
    expect(phoneNumberInput.value).toEqual('932-555-4213')
    expect(emailInput.value).toEqual('john@gmail.com')
  })

  it('should set input values to owner info values when "Same as business owner" checkbox is checked', () => {
    draftData = hoistedValues.draft

    render(
      <TestWrapper>
        <ContactPersonForm setActiveStep={mockSetActiveStep} />
      </TestWrapper>
    )

    const sameAsBusinessOwnerCheckBox = screen.getByLabelText('Same as business owner')
    const nameInput: HTMLInputElement = screen.getByLabelText(/Name/)
    const phoneNumberInput: HTMLInputElement = screen.getByLabelText(/Phone Number/)
    const emailInput: HTMLInputElement = screen.getByLabelText('Email')

    fireEvent.click(sameAsBusinessOwnerCheckBox)

    expect(nameInput.value).toEqual('John Doe')
    expect(phoneNumberInput.value).toEqual('932-888-4213')
    expect(emailInput.value).toEqual('johndoe@gmail.com')
  })

  it('should not set input values to owner info values if owner info doesn\'t exist when "Same as business owner" checkbox is checked', () => {
    draftData = null

    render(
      <TestWrapper>
        <ContactPersonForm setActiveStep={mockSetActiveStep} />
      </TestWrapper>
    )

    const sameAsBusinessOwnerCheckBox = screen.getByLabelText('Same as business owner')
    const nameInput: HTMLInputElement = screen.getByLabelText(/Name/)
    const phoneNumberInput: HTMLInputElement = screen.getByLabelText(/Phone Number/)
    const emailInput: HTMLInputElement = screen.getByLabelText('Email')

    fireEvent.click(sameAsBusinessOwnerCheckBox)

    expect(nameInput.value).toEqual('')
    expect(phoneNumberInput.value).toEqual('')
    expect(emailInput.value).toEqual('')
  })

  it('should call "createContactPerson.mutate" when it is not a draft', async () => {
    draftData = null
    mockMerchantId.mockReturnValue(1)

    render(
      <TestWrapper>
        <ContactPersonForm setActiveStep={mockSetActiveStep} />
      </TestWrapper>
    )

    const nameInput: HTMLInputElement = screen.getByLabelText(/Name/)
    const phoneNumberInput: HTMLInputElement = screen.getByLabelText(/Phone Number/)
    const submitButton: HTMLButtonElement = screen.getByText('Review Submission')

    fireEvent.change(nameInput, { target: { value: 'John' } })
    fireEvent.change(phoneNumberInput, { target: { value: '932-555-4213' } })
    fireEvent.click(submitButton)

    await waitFor(() => Promise.resolve())

    expect(fn.mock.calls[0]).toEqual(['createContactPerson'])
  })

  it('should call "updateContactPerson.mutate" when it is a draft', async () => {
    draftData = hoistedValues.draft
    mockMerchantId.mockReturnValue(1)

    render(
      <TestWrapper>
        <ContactPersonForm setActiveStep={mockSetActiveStep} />
      </TestWrapper>
    )

    const submitButton: HTMLButtonElement = screen.getByText('Review Submission')
    fireEvent.click(submitButton)

    await waitFor(() => Promise.resolve())

    expect(fn.mock.calls[0]).toEqual(['updateContactPerson'])
  })

  it('should show an error toast when the merchantId is not found', async () => {
    draftData = hoistedValues.draft
    mockMerchantId.mockReturnValue(null)

    render(
      <TestWrapper>
        <ContactPersonForm setActiveStep={mockSetActiveStep} />
      </TestWrapper>
    )

    const submitButton: HTMLButtonElement = screen.getByText('Review Submission')
    fireEvent.click(submitButton)

    await waitFor(() => Promise.resolve())

    expect(fn.mock.calls[0]).toEqual(['toast'])
  })
})
