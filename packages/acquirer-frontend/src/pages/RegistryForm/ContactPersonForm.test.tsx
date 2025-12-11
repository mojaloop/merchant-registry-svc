import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { vi } from 'vitest'

import type { MerchantDetails } from '@/types/merchantDetails'
import TestWrapper from '@/__tests__/TestWrapper'
import { createContactPersonMerchant } from '@/__tests__/fixtures/merchantDetails'
import ContactPersonForm from './ContactPersonForm'

const draft = createContactPersonMerchant()
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
    draftData = draft

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
    draftData = draft

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
    draftData = draft
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
    draftData = draft
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
