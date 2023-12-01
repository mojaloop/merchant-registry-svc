import { render, screen } from '@testing-library/react'

import TestWrapper from '@/__tests__/TestWrapper'
import { useMerchantId } from '.'

describe('useMerchantId', () => {
  function TestComponent() {
    const merchantId = useMerchantId()

    return <div>{merchantId}</div>
  }

  it('should return merchantId if it exists in localStorage', () => {
    Storage.prototype.getItem = () => '123'

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    )

    expect(screen.getByText('123')).toBeInTheDocument()
  })

  it("should return null if merchantId doesn't exist in localStorage", () => {
    Storage.prototype.getItem = () => null

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    )

    expect(screen.queryByText('123')).toBeNull()
  })
})
