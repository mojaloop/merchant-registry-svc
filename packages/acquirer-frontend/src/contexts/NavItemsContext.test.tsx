import { BrowserRouter } from 'react-router-dom'
import { act, render, screen } from '@testing-library/react'
import { ErrorBoundary } from 'react-error-boundary'
import { vi } from 'vitest'

import TestWrapper from '@/__tests__/TestWrapper'
import { useNavItems } from './NavItemsContext'

const mockUserProfile = vi.fn()
vi.mock('@/api/users', () => ({
  getUserProfile: () => Promise.resolve(mockUserProfile()),
}))

describe('NavItemsContext', () => {
  function TestComponent() {
    const context = useNavItems()

    return context ? 'Context' : null
  }

  function NavItems() {
    const context = useNavItems()

    return (
      <ul>
        {context.navItems.map(navItem => (
          <li key={navItem.name}>{navItem.name}</li>
        ))}
      </ul>
    )
  }

  it('should error when "useNavItems" hook is called outside of "NavItemsProvider"', () => {
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
      '`useNavItems` hook must be called inside `NavItemsProvider`'
    )
  })

  it('should return context when "useNavItems" hook is called inside "NavItemsProvider"', () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    )

    expect(screen.getByText('Context')).toBeInTheDocument()
  })

  it('should restrict "Portal User Management" and "Audit Log" route when the user is operator', async () => {
    mockUserProfile.mockReturnValue({
      id: 7,
      name: 'DFSP 1 Operator 1',
      role: {
        name: 'DFSP Operator',
      },
    })
    Storage.prototype.getItem = () => 'token'

    await act(async () =>
      render(
        <TestWrapper>
          <NavItems />
        </TestWrapper>
      )
    )

    expect(screen.queryByText('Portal User Management')).toBeNull()
    expect(screen.queryByText('Audit Log')).toBeNull()
  })

  it('should restrict "Portal User Management" and "Audit Log" route when the user is auditor', async () => {
    mockUserProfile.mockReturnValue({
      id: 9,
      name: 'DFSP 1 Auditor 1',
      role: {
        name: 'DFSP Auditor',
      },
    })
    Storage.prototype.getItem = () => 'token'

    await act(async () =>
      render(
        <TestWrapper>
          <NavItems />
        </TestWrapper>
      )
    )

    expect(screen.queryByText('Portal User Management')).toBeNull()
    expect(screen.queryByText('Audit Log')).toBeNull()
  })

  it('should have access to all routes when the user is not operator or auditor', () => {
    mockUserProfile.mockReturnValue({
      id: 5,
      name: 'DFSP 1 Admin 1',
      role: {
        name: 'DFSP Admin',
      },
    })
    Storage.prototype.getItem = () => 'token'

    render(
      <TestWrapper>
        <NavItems />
      </TestWrapper>
    )

    expect(screen.getByText('Portal User Management')).toBeInTheDocument()
    expect(screen.getByText('Audit Log')).toBeInTheDocument()
  })
})
