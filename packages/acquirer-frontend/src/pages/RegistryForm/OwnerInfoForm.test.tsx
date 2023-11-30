import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { vi } from 'vitest'

import TestWrapper from '@/__tests__/TestWrapper'
import OwnerInfoForm from './OwnerInfoForm'

const hoistedValues = vi.hoisted(() => ({
  draft: {
    business_owners: [
      {
        businessPersonLocation: {
          address_line: '',
          address_type: '',
          building_name: 'Big Building',
          building_number: '123',
          country: 'Australia',
          country_subdivision: 'Western Australia',
          created_at: '2023-10-26T04:24:14.046Z',
          department: 'Sales',
          district_name: 'Perth',
          floor_number: '4',
          id: 1,
          latitude: '331',
          longitude: '99',
          post_box: 'PO Box 123',
          postal_code: '12345',
          room_number: '101',
          street_name: 'Main Street',
          sub_department: 'Support',
          town_name: 'Townsville',
          updated_at: '2023-10-26T04:24:14.046Z',
        },
        created_at: '2023-10-26T04:24:14.056Z',
        email: 'johndoe@gmail.com',
        id: 1,
        identification_number: '30291',
        identificaton_type: 'Passport',
        name: 'John Doe',
        phone_number: '932-888-4213',
        updated_at: '2023-10-26T04:24:14.056Z',
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

const mockDraft = vi.fn()
vi.mock('@/api/hooks/forms', () => ({
  useCountries: () => ({ data: ['Australia'] }),
  useSubdivisions: () => ({ data: ['Western Australia'] }),
  useDistricts: () => ({ data: ['Perth'] }),
  useDraft: () => mockDraft(),
  useCreateOwnerInfo: () => ({
    mutate: () => fn('createOwnerInfo'),
  }),
  useUpdateOwnerInfo: () => ({
    mutate: () => fn('updateOwnerInfo'),
  }),
}))

const mockSetActiveStep = vi.fn()

describe('OwnerInfoForm', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should focus the first input which has an error when the validation fails', async () => {
    mockDraft.mockReturnValue({ data: null })

    render(
      <TestWrapper>
        <OwnerInfoForm setActiveStep={mockSetActiveStep} />
      </TestWrapper>
    )

    const submitButton: HTMLButtonElement = screen.getByText('Save and Proceed')
    fireEvent.submit(submitButton)

    expect(await screen.findByLabelText('Name*')).toEqual(document.activeElement)
  })

  it('should fill with draft values when it is a draft', () => {
    mockDraft.mockReturnValue({ data: hoistedValues.draft })

    render(
      <TestWrapper>
        <OwnerInfoForm setActiveStep={mockSetActiveStep} />
      </TestWrapper>
    )

    const nameInput: HTMLInputElement = screen.getByLabelText('Name*')
    const idTypeInput: HTMLInputElement = screen.getByLabelText(/ID Type/)
    const identificationNumberInput: HTMLInputElement =
      screen.getByLabelText(/Identification Number/)
    const phoneNumberInput: HTMLInputElement = screen.getByLabelText(/Phone Number/)
    const emailInput: HTMLInputElement = screen.getByLabelText('Email')
    const departmentInput: HTMLInputElement = screen.getByLabelText('Department')
    const subDepartmentInput: HTMLInputElement = screen.getByLabelText('Sub Department')
    const streetNameInput: HTMLInputElement = screen.getByLabelText('Street Name')
    const buildingNumberInput: HTMLInputElement = screen.getByLabelText('Building Number')
    const buildingNameInput: HTMLInputElement = screen.getByLabelText('Building Name')
    const floorNumberInput: HTMLInputElement = screen.getByLabelText('Floor Number')
    const roomNumberInput: HTMLInputElement = screen.getByLabelText('Room Number')
    const postBoxInput: HTMLInputElement = screen.getByLabelText('Post Box')
    const postalCodeInput: HTMLInputElement = screen.getByLabelText('Postal Code')
    const countryInput: HTMLSelectElement = screen.getByLabelText('Country')
    const countrySubdivisionInput: HTMLSelectElement = screen.getByLabelText(
      'Country Subdivision (State/Divison)'
    )
    const districtInput: HTMLSelectElement = screen.getByLabelText('District')
    const townshipInput: HTMLInputElement = screen.getByLabelText('Township')
    const longitudeInput: HTMLInputElement = screen.getByLabelText('Longitude')
    const latitudeInput: HTMLInputElement = screen.getByLabelText('Latitude')

    expect(nameInput.value).toEqual('John Doe')
    expect(idTypeInput.value).toEqual('Passport')
    expect(identificationNumberInput.value).toEqual('30291')
    expect(phoneNumberInput.value).toEqual('932-888-4213')
    expect(emailInput.value).toEqual('johndoe@gmail.com')
    expect(departmentInput.value).toEqual('Sales')
    expect(subDepartmentInput.value).toEqual('Support')
    expect(streetNameInput.value).toEqual('Main Street')
    expect(buildingNumberInput.value).toEqual('123')
    expect(buildingNameInput.value).toEqual('Big Building')
    expect(floorNumberInput.value).toEqual('4')
    expect(roomNumberInput.value).toEqual('101')
    expect(postBoxInput.value).toEqual('PO Box 123')
    expect(postalCodeInput.value).toEqual('12345')
    expect(countryInput.value).toEqual('Australia')
    expect(countrySubdivisionInput.value).toEqual('Western Australia')
    expect(districtInput.value).toEqual('Perth')
    expect(townshipInput.value).toEqual('Townsville')
    expect(longitudeInput.value).toEqual('99')
    expect(latitudeInput.value).toEqual('331')
  })

  it('should reset the values of "Country Subdivision" and "District" when the value of "Country" is changed', () => {
    mockDraft.mockReturnValue({ data: hoistedValues.draft })

    render(
      <TestWrapper>
        <OwnerInfoForm setActiveStep={mockSetActiveStep} />
      </TestWrapper>
    )

    const countryInput: HTMLSelectElement = screen.getByLabelText('Country')
    const countrySubdivisionInput: HTMLSelectElement = screen.getByLabelText(
      'Country Subdivision (State/Divison)'
    )
    const districtInput: HTMLSelectElement = screen.getByLabelText('District')

    fireEvent.change(countryInput, { target: { value: 'Belgium' } })

    expect(countrySubdivisionInput.value).toEqual('')
    expect(districtInput.value).toEqual('')
  })

  it('should reset the value of "District" when the value of "Country Subdivision" is changed', () => {
    mockDraft.mockReturnValue({ data: hoistedValues.draft })

    render(
      <TestWrapper>
        <OwnerInfoForm setActiveStep={mockSetActiveStep} />
      </TestWrapper>
    )

    const countrySubdivisionInput: HTMLSelectElement = screen.getByLabelText(
      'Country Subdivision (State/Divison)'
    )
    const districtInput: HTMLSelectElement = screen.getByLabelText('District')

    fireEvent.change(countrySubdivisionInput, { target: { value: 'Queensland' } })

    expect(districtInput.value).toEqual('')
  })

  it('should call "createOwnerInfo.mutate" when it is not a draft', async () => {
    mockDraft.mockReturnValue({ data: null })
    mockMerchantId.mockReturnValue(1)

    render(
      <TestWrapper>
        <OwnerInfoForm setActiveStep={mockSetActiveStep} />
      </TestWrapper>
    )

    const nameInput: HTMLInputElement = screen.getByLabelText('Name*')
    const idTypeInput: HTMLInputElement = screen.getByLabelText(/ID Type/)
    const identificationNumberInput: HTMLInputElement =
      screen.getByLabelText(/Identification Number/)
    const phoneNumberInput: HTMLInputElement = screen.getByLabelText(/Phone Number/)
    const submitButton: HTMLButtonElement = screen.getByText('Save and Proceed')

    fireEvent.change(nameInput, { target: { value: 'John' } })
    fireEvent.change(idTypeInput, { target: { value: 'Passport' } })
    fireEvent.change(identificationNumberInput, { target: { value: '30291' } })
    fireEvent.change(phoneNumberInput, { target: { value: '932-555-4213' } })
    fireEvent.click(submitButton)

    await waitFor(() => Promise.resolve())

    expect(fn.mock.calls[0]).toEqual(['createOwnerInfo'])
  })

  it('should call "updateOwnerInfo.mutate" when it is a draft', async () => {
    mockDraft.mockReturnValue({ data: hoistedValues.draft })
    mockMerchantId.mockReturnValue(1)

    render(
      <TestWrapper>
        <OwnerInfoForm setActiveStep={mockSetActiveStep} />
      </TestWrapper>
    )

    const submitButton: HTMLButtonElement = screen.getByText('Save and Proceed')
    fireEvent.click(submitButton)

    await waitFor(() => Promise.resolve())

    expect(fn.mock.calls[0]).toEqual(['updateOwnerInfo'])
  })

  it('should show an error toast when the merchantId is not found', async () => {
    mockDraft.mockReturnValue({ data: hoistedValues.draft })
    mockMerchantId.mockReturnValue(null)

    render(
      <TestWrapper>
        <OwnerInfoForm setActiveStep={mockSetActiveStep} />
      </TestWrapper>
    )

    const submitButton: HTMLButtonElement = screen.getByText('Save and Proceed')
    fireEvent.click(submitButton)

    await waitFor(() => Promise.resolve())

    expect(fn.mock.calls[0]).toEqual(['toast'])
  })
})
