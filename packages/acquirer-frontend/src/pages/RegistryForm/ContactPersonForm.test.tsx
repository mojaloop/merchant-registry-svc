import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { vi } from 'vitest'

import TestWrapper from '@/__tests__/TestWrapper'
import ContactPersonForm from './ContactPersonForm'

const hoistedValues = vi.hoisted(() => ({
  draft: {
    business_owners: [
      {
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
    contact_persons: [
      {
        created_at: '2023-10-26T06:29:21.676Z',
        email: 'john@gmail.com',
        id: 1,
        name: 'John',
        phone_number: '932-555-4213',
        updated_at: '2023-10-26T06:29:21.676Z',
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
  useDraft: () => mockDraft(),
  useCreateContactPerson: () => ({
    mutate: () => fn('createContactPerson'),
  }),
  useUpdateContactPerson: () => ({
    mutate: () => fn('updateContactPerson'),
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
  })

  it('should focus the first input which has an error when the validation fails', async () => {
    mockDraft.mockReturnValue({ data: null })

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
    mockDraft.mockReturnValue({ data: hoistedValues.draft })

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
    mockDraft.mockReturnValue({ data: hoistedValues.draft })

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
    mockDraft.mockReturnValue({ data: null })

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
    mockDraft.mockReturnValue({ data: null })
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
    mockDraft.mockReturnValue({ data: hoistedValues.draft })
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
    mockDraft.mockReturnValue({ data: hoistedValues.draft })
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
