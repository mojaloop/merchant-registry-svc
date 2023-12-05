import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { vi } from 'vitest'

import TestWrapper from '@/__tests__/TestWrapper'
import { AddNewUser } from '..'

const hoistedValues = vi.hoisted(() => ({
  roles: [
    {
      description: 'Hub Admin',
      id: 1,
      name: 'Hub Admin',
      permissions: [
        'Create Roles',
        'View Roles',
        'Edit Roles',
        'Create Portal Users',
        'Create Hub Admin',
        'Create DFSP Admin',
        'View Portal Users',
        'Edit Portal Users',
        'Delete Portal Users',
        'View Audit Logs',
        'Edit Server Log Level',
        'View DFSPs',
        'Create DFSPs',
        'Edit DFSPs',
        'Delete DFSPs',
      ],
    },
    {
      description: 'DFSP Admin',
      id: 2,
      name: 'DFSP Admin',
      permissions: [
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
        'Create Portal Users',
        'Create DFSP Operator',
        'Create DFSP Auditor',
        'View Portal Users',
        'Edit Portal Users',
        'Delete Portal Users',
        'Export Merchants',
        'View Audit Logs',
      ],
    },
    {
      description: 'DFSP Operator',
      id: 4,
      name: 'DFSP Operator',
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
        'View Portal Users',
        'Export Merchants',
      ],
    },
    {
      description: 'DFSP Auditor',
      id: 5,
      name: 'DFSP Auditor',
      permissions: [
        'View Merchants',
        'View Pending Table',
        'View Reverted Table',
        'View Portal Users',
        'View Audit Logs',
      ],
    },
  ],
}))

const mockUserProfile = vi.fn()
vi.mock('@/api/hooks/users', () => ({
  useCreateUser: () => ({
    isLoading: false,
    mutateAsync: () => vi.fn(),
  }),
  useUserProfile: () => mockUserProfile(),
}))

vi.mock('@/api/hooks/roles', () => ({
  useRoles: () => ({
    isLoading: false,
    isSuccess: true,
    data: {
      data: hoistedValues.roles,
    },
  }),
}))

describe('AddNewUser', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should show operator and auditor roles when user is admin', () => {
    mockUserProfile.mockReturnValue({
      isSuccess: true,
      data: {
        id: 6,
        name: 'DFSP 1 Admin 1',
        role: hoistedValues.roles[1],
      },
    })

    render(
      <TestWrapper>
        <AddNewUser />
      </TestWrapper>
    )

    expect(screen.queryByText('DFSP Admin')).toBeNull()
    expect(screen.getByText('DFSP Operator')).toBeInTheDocument()
    expect(screen.getByText('DFSP Auditor')).toBeInTheDocument()
  })

  it('should call "createUser.mutateAsync" when form is submitted', async () => {
    mockUserProfile.mockReturnValue({
      isSuccess: true,
      data: {
        id: 5,
        name: 'DFSP 1 Admin 1',
        role: hoistedValues.roles[1],
      },
    })
    const mutateAsyncSpy = vi.spyOn(vi, 'fn')

    render(
      <TestWrapper>
        <AddNewUser />
      </TestWrapper>
    )

    const nameInput = screen.getByLabelText('Name')
    const emailInput = screen.getByLabelText('Email')
    const roleInput = screen.getByLabelText('Role')
    const submitButton = screen.getByText('Submit')

    fireEvent.change(nameInput, { target: { value: 'John' } })
    fireEvent.change(emailInput, { target: { value: 'john@gmail.com' } })
    fireEvent.change(roleInput, { target: { value: 'DFSP Operator' } })
    fireEvent.click(submitButton)

    await waitFor(() => Promise.resolve)
    expect(mutateAsyncSpy).toHaveBeenCalled()
  })

  it('should reset form when "Cancel" button is clicked', () => {
    mockUserProfile.mockReturnValue({
      isSuccess: true,
      data: {
        id: 5,
        name: 'DFSP 1 Admin 1',
        role: hoistedValues.roles[1],
      },
    })

    render(
      <TestWrapper>
        <AddNewUser />
      </TestWrapper>
    )

    const nameInput: HTMLInputElement = screen.getByLabelText('Name')
    const emailInput: HTMLInputElement = screen.getByLabelText('Email')
    const roleInput: HTMLSelectElement = screen.getByLabelText('Role')
    const cancelButton: HTMLButtonElement = screen.getByText('Cancel')

    fireEvent.change(nameInput, { target: { value: 'John' } })
    fireEvent.change(emailInput, { target: { value: 'john@gmail.com' } })
    fireEvent.change(roleInput, { target: { value: 'DFSP Operator' } })
    fireEvent.click(cancelButton)

    expect(nameInput.value).toEqual('')
    expect(emailInput.value).toEqual('')
    expect(roleInput.value).toEqual('')
  })
})
