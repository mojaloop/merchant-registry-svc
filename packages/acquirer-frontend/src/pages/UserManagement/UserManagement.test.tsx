import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'

import TestWrapper from '@/__tests__/TestWrapper'
import { UserManagement } from '..'

const hoistedValues = vi.hoisted(() => ({
  users: [
    {
      id: 5,
      name: 'DFSP 1 Super Admin 1',
      email: 'd1superadmin1@email.com',
      phone_number: '0000000',
      role: {
        id: 2,
        name: 'DFSP Super Admin',
        description: 'DFSP Super Admin',
      },
      user_type: 'DFSP',
      status: 'Active',
      updated_at: '2023-10-25T15:15:51.661Z',
    },
  ],
}))

const mockUsers = vi.fn()
vi.mock('@/api/hooks/users', () => ({
  useUsers: () => mockUsers(),
}))

describe('UserManagement', () => {
  it('should render table skeleton when users data is loading', () => {
    mockUsers.mockReturnValue({
      data: null,
      isFetching: true,
      isSuccess: false,
    })

    render(
      <TestWrapper>
        <UserManagement />
      </TestWrapper>
    )

    expect(screen.getByTestId('table-skeleton')).toBeInTheDocument()
  })

  it('should render table content when users data is successfully loaded', () => {
    mockUsers.mockReturnValue({
      data: hoistedValues.users,
      isFetching: false,
      isSuccess: true,
    })

    render(
      <TestWrapper>
        <UserManagement />
      </TestWrapper>
    )

    expect(screen.getByTestId('table')).toBeInTheDocument()
  })
})
