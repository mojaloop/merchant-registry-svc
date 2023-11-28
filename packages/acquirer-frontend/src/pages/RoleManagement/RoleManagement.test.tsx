import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'

import TestWrapper from '@/__tests__/TestWrapper'
import { RoleManagement } from '..'

const hoistedValues = vi.hoisted(() => ({
  roles: [
    {
      id: 1,
      name: 'Hub Admin',
      description: 'Hub Admin',
      permissions: [
        'Create Portal Users',
        'View Portal Users',
        'Edit Portal Users',
        'Delete Portal Users',
        'View DFSPs',
        'Create DFSPs',
        'Edit DFSPs',
        'Delete DFSPs',
      ],
    },
  ],
  permissions: [
    'Access Create Merchant Form',
    'Access Edit Merchant Form',
    'Approve Merchants',
    'Reject Merchants',
    'Revert Merchants',
    'View Merchants',
    'Create Merchants',
    'Edit Merchants',
    'Delete Merchants',
    'View Pending Table',
    'View Reverted Table',
    'Create Roles',
    'View Roles',
    'Edit Roles',
    'Assignable Admin Roles',
    'Assignable Operator Roles',
    'Assignable Auditor Roles',
    'Create Portal Users',
    'View Portal Users',
    'Edit Portal Users',
    'Delete Portal Users',
    'Export Merchants',
    'View Audit Logs',
    'Edit Server Log Level',
    'View DFSPs',
    'Create DFSPs',
    'Edit DFSPs',
    'Delete DFSPs',
  ],
}))

const mockRoles = vi.fn()
vi.mock('@/api/hooks/roles', () => ({
  useRoles: () => mockRoles(),
}))

describe('RoleManagement', () => {
  it('should render table skeleton when roles data is loading', () => {
    mockRoles.mockReturnValue({
      data: null,
      isFetching: true,
      isSuccess: false,
    })

    render(
      <TestWrapper>
        <RoleManagement />
      </TestWrapper>
    )

    expect(screen.getByTestId('table-skeleton')).toBeInTheDocument()
  })

  it('should render table content when roles data is successfully loaded', () => {
    mockRoles.mockReturnValue({
      data: { data: hoistedValues.roles, permissions: hoistedValues.permissions },
      isFetching: false,
      isSuccess: true,
    })

    render(
      <TestWrapper>
        <RoleManagement />
      </TestWrapper>
    )

    expect(screen.getByTestId('table')).toBeInTheDocument()
  })
})
