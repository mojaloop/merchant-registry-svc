import { fireEvent, render, screen } from '@testing-library/react'
import { vi } from 'vitest'

import TestWrapper from '@/__tests__/TestWrapper'
import BusinessInfoForm from './BusinessInfoForm'

const hoistedValues = vi.hoisted(() => ({
  draft: {
    business_licenses: [
      {
        created_at: '2023-10-23T11:55:01.772Z',
        id: 1,
        license_document_link:
          'http://minio:9000/merchant-documents/marco/thitsaworkspdf-123.pdf?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=minioadmin%2F20231025%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20231025T195349Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=d4e492cc0eb820949dd78dfecead33aa7748c206dd5d0c12e3060f63573c0b90',
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
      iso_code: 'ALL',
    },
    dba_trading_name: 'marco',
    employees_num: '6 - 10',
    id: 1,
    merchant_type: 'Small Shop',
    monthly_turnover: '',
    registered_name: '',
    registration_status: 'Draft',
    registration_status_reason: 'Draft Merchant by d1superadmin1@email.com',
    updated_at: '2023-10-23T11:56:54.000Z',
  },
}))

const mockDraft = vi.fn()
vi.mock('@/api/hooks/forms', () => ({
  useDraft: () => mockDraft(),
  useCreateBusinessInfo: () => ({}),
  useUpdateBusinessInfo: () => ({}),
}))

const mockSetActiveStep = vi.fn()

describe('BusinessInfoForm', () => {
  it('should render "Document is already uploaded." text when license document exists', () => {
    mockDraft.mockReturnValue({ data: hoistedValues.draft })

    render(
      <TestWrapper>
        <BusinessInfoForm setActiveStep={mockSetActiveStep} />
      </TestWrapper>
    )

    expect(screen.queryByText('Document is already uploaded.')).toBeInTheDocument()
  })

  it('should render "Upload your file" text when license document does not exist', () => {
    mockDraft.mockReturnValue({ data: null })

    render(
      <TestWrapper>
        <BusinessInfoForm setActiveStep={mockSetActiveStep} />
      </TestWrapper>
    )

    expect(screen.queryByText('Upload your file')).toBeInTheDocument()
  })

  it('should focus the first input which has an error when the validation fails', async () => {
    mockDraft.mockReturnValue({ data: null })

    render(
      <TestWrapper>
        <BusinessInfoForm setActiveStep={mockSetActiveStep} />
      </TestWrapper>
    )

    const submitButton: HTMLButtonElement = screen.getByText('Save and Proceed')
    fireEvent.submit(submitButton)

    expect(await screen.findByLabelText(/Doing Business As Name/)).toEqual(
      document.activeElement
    )
  })

  it('should render radio inputs correctly', () => {
    mockDraft.mockReturnValue({ data: hoistedValues.draft })

    render(
      <TestWrapper>
        <BusinessInfoForm setActiveStep={mockSetActiveStep} />
      </TestWrapper>
    )

    const yesRadioInput: HTMLInputElement = screen.getByLabelText('Yes')
    const noRadioInput: HTMLInputElement = screen.getByLabelText('No')

    expect(yesRadioInput.checked).toEqual(true)
    expect(noRadioInput.checked).toEqual(false)
  })

  it('should fill with draft values when it is a draft', () => {
    mockDraft.mockReturnValue({ data: hoistedValues.draft })

    render(
      <TestWrapper>
        <BusinessInfoForm setActiveStep={mockSetActiveStep} />
      </TestWrapper>
    )

    const dbaNameInput: HTMLInputElement = screen.getByLabelText(/Doing Business As Name/)
    const registeredNameInput: HTMLInputElement = screen.getByLabelText(/Registered Name/)
    const numberOfEmployeeInput: HTMLSelectElement =
      screen.getByLabelText(/Number of Employee/)
    const monthlyTurnOverInput: HTMLInputElement =
      screen.getByLabelText(/Monthly Turn Over/)
    const merchantCategoryInput: HTMLSelectElement =
      screen.getByLabelText(/Merchant Category/)
    const merchantTypeInput: HTMLSelectElement = screen.getByLabelText(/Merchant Type/)
    const currencyInput: HTMLSelectElement = screen.getByLabelText(/Currency/)
    const accountNumberInput: HTMLInputElement = screen.getByLabelText(/Account Number/)
    const radioYesInput: HTMLInputElement = screen.getByLabelText('Yes')
    const radioNoInput: HTMLInputElement = screen.getByLabelText('No')
    const licenseNumberInput: HTMLInputElement = screen.getByLabelText(/License Number/)

    expect(dbaNameInput.value).toEqual('marco')
    expect(registeredNameInput.value).toEqual('')
    expect(numberOfEmployeeInput.value).toEqual('6 - 10')
    expect(monthlyTurnOverInput.value).toEqual('')
    expect(merchantCategoryInput.value).toEqual('10120')
    expect(merchantTypeInput.value).toEqual('Small Shop')
    expect(currencyInput.value).toEqual('ALL')
    expect(accountNumberInput.value).toEqual('')
    expect(radioYesInput.checked).toEqual(true)
    expect(radioNoInput.checked).toEqual(false)
    expect(licenseNumberInput.value).toEqual('1234')
  })

  it('should reset the value of "License Number" when the "No" radio button is clicked', () => {
    mockDraft.mockReturnValue({ data: hoistedValues.draft })

    render(
      <TestWrapper>
        <BusinessInfoForm setActiveStep={mockSetActiveStep} />
      </TestWrapper>
    )

    const licenseNumberInput: HTMLInputElement = screen.getByLabelText(/License Number/)
    const noRadioInput: HTMLInputElement = screen.getByLabelText('No')

    expect(licenseNumberInput.value).toEqual('1234')

    fireEvent.click(noRadioInput)
    expect(licenseNumberInput.value).toEqual('')
  })

  it('should focus the "Upload file" button when it is clicked', () => {
    mockDraft.mockReturnValue({ data: hoistedValues.draft })

    render(
      <TestWrapper>
        <BusinessInfoForm setActiveStep={mockSetActiveStep} />
      </TestWrapper>
    )

    const uploadFileButton = screen.getByLabelText('Upload file')
    fireEvent.click(uploadFileButton)

    expect(uploadFileButton).toEqual(document.activeElement)
  })

  it('should have correct submitted values in onSubmit function', () => {
    mockDraft.mockReturnValue({ data: hoistedValues.draft })

    render(
      <TestWrapper>
        <BusinessInfoForm setActiveStep={mockSetActiveStep} />
      </TestWrapper>
    )

    const dbaNameInput: HTMLInputElement = screen.getByLabelText(/Doing Business As Name/)
    const registeredNameInput: HTMLInputElement = screen.getByLabelText(/Registered Name/)
    const numberOfEmployeeInput: HTMLSelectElement =
      screen.getByLabelText(/Number of Employee/)
    const monthlyTurnOverInput: HTMLInputElement =
      screen.getByLabelText(/Monthly Turn Over/)
    const merchantCategoryInput: HTMLSelectElement =
      screen.getByLabelText(/Merchant Category/)
    const merchantTypeInput: HTMLSelectElement = screen.getByLabelText(/Merchant Type/)
    const currencyInput: HTMLSelectElement = screen.getByLabelText(/Currency/)
    const accountNumberInput: HTMLInputElement = screen.getByLabelText(/Account Number/)
    const licenseNumberInput: HTMLInputElement = screen.getByLabelText(/License Number/)
    const submitButton: HTMLInputElement = screen.getByText('Save and Proceed')
    const businessInfoForm: HTMLFormElement = screen.getByTestId('business-info-form')

    fireEvent.submit(submitButton)

    const formData = new FormData(businessInfoForm)
    const [
      dbaName,
      registeredName,
      numberOfEmployee,
      monthlyTurnOver,
      merchantCategory,
      merchantType,
      currency,
      accountNumber,
      haveBusinessLicnese,
      licenseNumber,
    ] = formData.entries()

    expect(dbaNameInput.value).toEqual(dbaName[1])
    expect(registeredNameInput.value).toEqual(registeredName[1])
    expect(numberOfEmployeeInput.value).toEqual(numberOfEmployee[1])
    expect(monthlyTurnOverInput.value).toEqual(monthlyTurnOver[1])
    expect(merchantCategoryInput.value).toEqual(merchantCategory[1])
    expect(merchantTypeInput.value).toEqual(merchantType[1])
    expect(currencyInput.value).toEqual(currency[1])
    expect(accountNumberInput.value).toEqual(accountNumber[1])
    expect(haveBusinessLicnese[1]).toEqual('yes')
    expect(licenseNumberInput.value).toEqual(licenseNumber[1])
  })
})
