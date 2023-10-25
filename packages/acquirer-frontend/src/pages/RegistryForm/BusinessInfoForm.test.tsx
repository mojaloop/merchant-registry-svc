import { vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'

import TestWrapper from '@/__tests__/TestWrapper'
import BusinessInfoForm from './BusinessInfoForm'

const hoistedValues = vi.hoisted(() => ({
  draft: {
    allow_block_status: 'Pending',
    business_licenses: [
      {
        created_at: '2023-10-23T11:55:01.772Z',
        id: 1,
        license_document_link:
          'http://minio:9000/merchant-documents/marco/resume-naing-linn-khantpdf-.pdf?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=minioadmin%2F20231024%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20231024T041444Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=c9097641f7e73d7d048084b67eb440bf986f9bc4b3e8530816f6fa57bb08b791',
        license_number: '1234',
        updated_at: '2023-10-23T11:56:54.000Z',
      },
    ],
    category_code: {
      category_code: '10120',
      description: 'Processing and preserving of poultry meat',
    },
    checked_by: null,
    checkout_counters: [
      {
        alias_type: 'MERCHANT_PAYINTOID',
        alias_value: null,
        created_at: '2023-10-23T11:55:01.712Z',
        description: null,
        id: 1,
        merchant_registry_id: null,
        notification_number: null,
        qr_code_link: null,
        updated_at: '2023-10-23T11:55:01.000Z',
      },
    ],
    created_at: '2023-10-23T11:55:01.739Z',
    created_by: {
      email: 'd1superadmin1@email.com',
      id: 5,
      name: 'DFSP 1 Super Admin 1',
      phone_number: '0000000',
    },
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

const mock = vi.fn()

vi.mock('@/api/hooks/forms', () => {
  return {
    useDraft: () => mock(),
    useCreateBusinessInfo: () => ({
      isLoading: false,
    }),
    useUpdateBusinessInfo: () => ({
      isLoading: false,
    }),
  }
})

describe('BusinessInfoForm', () => {
  it('should render "Document is already uploaded." text when license document exists', () => {
    mock.mockReturnValue({ data: hoistedValues.draft })

    render(
      <TestWrapper>
        <BusinessInfoForm
          setActiveStep={() => {
            // empty function
          }}
        />
      </TestWrapper>
    )

    expect(screen.queryByText('Document is already uploaded.')).toBeInTheDocument()
  })

  it('should render "Upload your file" text when license document does not exist', () => {
    mock.mockReturnValue({ data: null })

    render(
      <TestWrapper>
        <BusinessInfoForm
          setActiveStep={() => {
            // empty function
          }}
        />
      </TestWrapper>
    )

    expect(screen.queryByText('Upload your file')).toBeInTheDocument()
  })

  it('should render radio inputs correctly', () => {
    mock.mockReturnValue({ data: hoistedValues.draft })

    render(
      <TestWrapper>
        <BusinessInfoForm
          setActiveStep={() => {
            // empty function
          }}
        />
      </TestWrapper>
    )

    const yesRadioInput: HTMLInputElement = screen.getByLabelText('Yes')
    const noRadioInput: HTMLInputElement = screen.getByLabelText('No')

    expect(yesRadioInput.checked).toEqual(true)
    expect(noRadioInput.checked).toEqual(false)
  })

  it('should have correct submitted values in onSubmit function', () => {
    mock.mockReturnValue({ data: hoistedValues.draft })

    render(
      <TestWrapper>
        <BusinessInfoForm
          setActiveStep={() => {
            // empty function
          }}
        />
      </TestWrapper>
    )

    const dbaNameInput: HTMLInputElement = screen.getByLabelText(/Doing Business As Name/)
    const registeredNameInput: HTMLInputElement = screen.getByLabelText(/Registered Name/)
    const numberOfEmployeeInput: HTMLInputElement =
      screen.getByLabelText(/Number of Employee/)
    const monthlyTurnOverInput: HTMLInputElement =
      screen.getByLabelText(/Monthly Turn Over/)
    const merchantCategoryInput: HTMLInputElement =
      screen.getByLabelText(/Merchant Category/)
    const merchantTypeInput: HTMLInputElement = screen.getByLabelText(/Merchant Type/)
    const currencyInput: HTMLInputElement = screen.getByLabelText(/Currency/)
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
