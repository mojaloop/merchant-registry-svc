import { vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'

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

const mockDraft = vi.fn()
vi.mock('@/api/hooks/forms', () => ({
  useDraft: () => mockDraft(),
  useCreateContactPerson: () => ({}),
  useUpdateContactPerson: () => ({}),
}))

const mockSetActiveStep = vi.fn()

describe('ContactPersonForm', () => {
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

  it('should have correct submitted values in onSubmit function', () => {
    mockDraft.mockReturnValue({ data: hoistedValues.draft })

    render(
      <TestWrapper>
        <ContactPersonForm setActiveStep={mockSetActiveStep} />
      </TestWrapper>
    )

    const nameInput: HTMLInputElement = screen.getByLabelText(/Name/)
    const phoneNumberInput: HTMLInputElement = screen.getByLabelText(/Phone Number/)
    const emailInput: HTMLInputElement = screen.getByLabelText('Email')
    const submitButton: HTMLButtonElement = screen.getByText('Review Submission')
    const contactPersonForm: HTMLFormElement = screen.getByTestId('contact-person-form')

    fireEvent.submit(submitButton)

    const formData = new FormData(contactPersonForm)
    const [name, phoneNumber, email] = formData.entries()

    expect(nameInput.value).toEqual(name[1])
    expect(phoneNumberInput.value).toEqual(phoneNumber[1])
    expect(emailInput.value).toEqual(email[1])
  })
})
