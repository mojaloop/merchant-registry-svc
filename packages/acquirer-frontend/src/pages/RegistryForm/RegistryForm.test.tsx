import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'

import TestWrapper from '@/__tests__/TestWrapper'
import { RegistryForm } from '..'

const mockStep = vi.fn()
vi.mock('@chakra-ui/react', async () => {
  const charaUI: object = await vi.importActual('@chakra-ui/react')

  return {
    ...charaUI,
    useSteps: () => ({ activeStep: mockStep() }),
  }
})

describe('RegistryForm', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should render business info form in step 1', () => {
    mockStep.mockReturnValue(1)

    render(
      <TestWrapper>
        <RegistryForm />
      </TestWrapper>
    )

    expect(screen.getByLabelText(/Doing Business As Name/)).toBeInTheDocument()
  })

  it('should render location info form in step 2', () => {
    mockStep.mockReturnValue(2)

    render(
      <TestWrapper>
        <RegistryForm />
      </TestWrapper>
    )

    expect(screen.getByLabelText(/Location Type/)).toBeInTheDocument()
  })

  it('should render owner info form in step 3', () => {
    mockStep.mockReturnValue(3)

    render(
      <TestWrapper>
        <RegistryForm />
      </TestWrapper>
    )

    expect(screen.getByLabelText(/ID Type/)).toBeInTheDocument()
  })

  it('should render contact person form in step 4', () => {
    mockStep.mockReturnValue(1)

    render(
      <TestWrapper>
        <RegistryForm />
      </TestWrapper>
    )

    expect(screen.getByText('Contact Person')).toBeInTheDocument()
  })
})
