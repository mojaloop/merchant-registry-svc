import { describe, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'

import TestWrapper from '@/__tests__/TestWrapper'
import { Registry } from '..'

const mockDraftCount = vi.fn()
vi.mock('@/api/hooks/forms', () => {
  return {
    useDraftCount: () => mockDraftCount(),
  }
})

describe('Registry', () => {
  it('should show loading spinner when draft count is loading', () => {
    mockDraftCount.mockReturnValue({ data: null, isLoading: true })

    render(
      <TestWrapper>
        <Registry />
      </TestWrapper>
    )

    expect(screen.getByTestId('spinner')).toBeInTheDocument()
  })

  it('should disable continue with saved draft button when draft count is 0', () => {
    mockDraftCount.mockReturnValue({ data: 0, isLoading: false })

    render(
      <TestWrapper>
        <Registry />
      </TestWrapper>
    )

    expect(screen.getByText('Continue with saved draft')).toHaveStyle(
      'cursor: not-allowed'
    )
  })

  it('should render draft count when it is greater than 0', () => {
    mockDraftCount.mockReturnValue({ data: 3, isLoading: false })

    render(
      <TestWrapper>
        <Registry />
      </TestWrapper>
    )

    expect(screen.getByTestId('draft-count')).toHaveTextContent('3')
  })

  it('should remove merchantId from local storage when add new record button is clicked', () => {
    const removeMerchantIdSpy = vi.spyOn(Storage.prototype, 'removeItem')

    render(
      <TestWrapper>
        <Registry />
      </TestWrapper>
    )
    localStorage.setItem('merchantId', '1')

    const addNewRecordBtn = screen.getByText('Add new record')
    fireEvent.click(addNewRecordBtn)

    expect(localStorage.getItem('merchantId')).toBeNull()
    expect(removeMerchantIdSpy).toHaveBeenCalledWith('merchantId')

    removeMerchantIdSpy.mockClear()
  })
})
