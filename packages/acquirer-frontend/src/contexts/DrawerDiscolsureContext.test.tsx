import { BrowserRouter } from 'react-router-dom'
import { render, screen } from '@testing-library/react'
import { ErrorBoundary } from 'react-error-boundary'
import { vi } from 'vitest'

import TestWrapper from '@/__tests__/TestWrapper'
import { useDrawerDisclosure } from './DrawerDisclosureContext'

describe('DrawerDiscolsureContext', () => {
  function TestComponent() {
    const context = useDrawerDisclosure()

    return context ? 'Context' : null
  }

  it('should error when "useDrawerDisclosure" hook is called outside of "DrawerDisclosureProvider"', () => {
    const logSpy = vi.spyOn(console, 'error')

    render(
      <BrowserRouter>
        <ErrorBoundary
          fallback={<div>Something went wrong.</div>}
          onError={error => console.error(error.message)}
        >
          <TestComponent />
        </ErrorBoundary>
      </BrowserRouter>
    )

    expect(screen.getByText('Something went wrong.')).toBeInTheDocument()
    expect(logSpy).toHaveBeenCalledWith(
      '`useDrawerDisclosure` hook must be called inside `DrawerDisclosureProvider`'
    )
  })

  it('should return context when "useDrawerDisclosure" hook is called inside "DrawerDisclosureProvider"', () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    )

    expect(screen.getByText('Context')).toBeInTheDocument()
  })
})
