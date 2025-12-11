import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import type { MerchantRegistrationStatus } from 'shared-lib'

import type { MerchantDetails } from '@/types/merchantDetails'
import TestWrapper from '@/__tests__/TestWrapper'
import { createBusinessInfoMerchant } from '@/__tests__/fixtures/merchantDetails'
import BusinessInfoForm from './BusinessInfoForm'

const draft = createBusinessInfoMerchant()
const fn = vi.fn()
const mockMerchantId = vi.fn()

vi.mock('@chakra-ui/react', async () => {
  const chakraUI: object = await vi.importActual('@chakra-ui/react')

  return {
    ...chakraUI,
    useToast: () => {
      return () => fn('toast')
    },
  }
})

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
  useCreateBusinessInfo: () => ({
    mutate: () => fn('createBusinessInfo'),
    isPending: false,
  }),
  useUpdateBusinessInfo: () => ({
    mutate: () => fn('updateBusinessInfo'),
    isPending: false,
  }),
}))

const mockSetActiveStep = vi.fn()

describe('BusinessInfoForm', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    draftData = null
  })

  beforeEach(() => {
    fn.mockClear()
  })

  it('should render "Document is already uploaded." text when license document exists', () => {
    draftData = draft

    render(
      <TestWrapper>
        <BusinessInfoForm setActiveStep={mockSetActiveStep} />
      </TestWrapper>
    )

    expect(screen.queryByText('Document is already uploaded.')).toBeInTheDocument()
  })

  it('should render "Upload your PDF file" text when license document does not exist', () => {
    draftData = null

    render(
      <TestWrapper>
        <BusinessInfoForm setActiveStep={mockSetActiveStep} />
      </TestWrapper>
    )

    expect(screen.queryByText('Upload your PDF file')).toBeInTheDocument()
  })

  it('should focus the first input which has an error when the validation fails', async () => {
    draftData = null

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
    draftData = draft

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
    draftData = draft

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
    draftData = draft

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

  it('should render file upload modal when upload file icon button is clicked', () => {
    draftData = draft

    render(
      <TestWrapper>
        <BusinessInfoForm setActiveStep={mockSetActiveStep} />
      </TestWrapper>
    )

    const uploadFileButton = screen.getByLabelText('Upload file')
    fireEvent.click(uploadFileButton)

    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('should call "createBusinessInfo.mutate" when it is not a draft', async () => {
    draftData = null

    render(
      <TestWrapper>
        <BusinessInfoForm setActiveStep={mockSetActiveStep} />
      </TestWrapper>
    )

    const dbaNameInput: HTMLInputElement = screen.getByLabelText(/Doing Business As Name/)
    const numberOfEmployeeInput: HTMLSelectElement =
      screen.getByLabelText(/Number of Employee/)
    const merchantCategoryInput: HTMLSelectElement =
      screen.getByLabelText(/Merchant Category/)
    const merchantTypeInput: HTMLSelectElement = screen.getByLabelText(/Merchant Type/)
    const currencyInput: HTMLSelectElement = screen.getByLabelText(/Currency/)
    const submitButton: HTMLButtonElement = screen.getByText('Save and Proceed')

    fireEvent.change(dbaNameInput, { target: { value: 'marco' } })
    fireEvent.change(numberOfEmployeeInput, { target: { value: '6 - 10' } })
    fireEvent.change(merchantCategoryInput, { target: { value: '10120' } })
    fireEvent.change(merchantTypeInput, { target: { value: 'Small Shop' } })
    fireEvent.change(currencyInput, { target: { value: 'ALL' } })
    fireEvent.click(submitButton)

    await waitFor(() => Promise.resolve())

    expect(fn.mock.calls[0]).toEqual(['createBusinessInfo'])
  })

  it('should call "updateBusinessInfo.mutate" when it is a draft or reverted data', async () => {
    draftData = {
      ...draft,
      registration_status: 'Reverted' as MerchantRegistrationStatus,
    }
    mockMerchantId.mockReturnValue(1)

    render(
      <TestWrapper>
        <BusinessInfoForm setActiveStep={mockSetActiveStep} />
      </TestWrapper>
    )

    const submitButton: HTMLButtonElement = screen.getByText('Save and Proceed')
    fireEvent.click(submitButton)

    await waitFor(() => Promise.resolve())

    expect(fn.mock.calls[0]).toEqual(['updateBusinessInfo'])
  })

  it('should show an error toast when the merchantId is not found', async () => {
    draftData = draft
    mockMerchantId.mockReturnValue(null)

    render(
      <TestWrapper>
        <BusinessInfoForm setActiveStep={mockSetActiveStep} />
      </TestWrapper>
    )

    const submitButton: HTMLButtonElement = screen.getByText('Save and Proceed')
    fireEvent.click(submitButton)

    await waitFor(() => Promise.resolve())

    expect(fn.mock.calls[0]).toEqual(['toast'])
  })
})
