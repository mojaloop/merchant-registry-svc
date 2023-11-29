import { fireEvent, render, screen } from '@testing-library/react'
import { vi } from 'vitest'

import TestWrapper from '@/__tests__/TestWrapper'
import ReviewModal from './ReviewModal'

const mockDraft = vi.fn()
vi.mock('@/api/hooks/forms', () => ({
  useDraft: () => mockDraft(),
  useChangeStatusToReview: () => ({
    mutate: () => vi.fn(),
  }),
}))

describe('ReviewModal', () => {
  it('should render skeleton when the draft is loading', () => {
    mockDraft.mockReturnValue({ isLoading: true })

    render(
      <TestWrapper>
        <ReviewModal isOpen={true} onClose={vi.fn} merchantId='1' />
      </TestWrapper>
    )

    expect(screen.getByTestId('skeleton')).toBeInTheDocument()
  })

  it('should hide skeleton when the draft is successfully loaded', () => {
    mockDraft.mockReturnValue({ isLoading: false })

    render(
      <TestWrapper>
        <ReviewModal isOpen={true} onClose={vi.fn} merchantId='1' />
      </TestWrapper>
    )

    expect(screen.queryByTestId('skeleton')).not.toBeInTheDocument()
  })

  it('should call "changeStatusToReview.mutate" function when "Submit" button is clicked', () => {
    const chageStatusSpy = vi.spyOn(vi, 'fn')

    render(
      <TestWrapper>
        <ReviewModal isOpen={true} onClose={vi.fn} merchantId='1' />
      </TestWrapper>
    )

    const submitButton = screen.getByText('Submit')
    fireEvent.click(submitButton)

    expect(chageStatusSpy).toHaveBeenCalled()
  })
})
