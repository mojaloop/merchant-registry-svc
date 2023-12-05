import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { vi } from 'vitest'

import TestWrapper from '@/__tests__/TestWrapper'
import { AuditLog } from '..'

const hoistedValues = vi.hoisted(() => ({
  auditLogs: [
    {
      actionType: 'Access',
      applicationModule: 'getUsers',
      createdAt: '2023-11-30T14:11:22.527Z',
      entityName: 'PortalUserEntity',
      eventDescription: 'Get a list of users',
      newValue: '{}',
      oldValue: '{}',
      portalUserName: 'DFSP 1 Admin 1',
      transactionStatus: 'Success',
    },
  ],
  users: [
    { id: 5, name: 'DFSP 1 Admin 1' },
    { id: 6, name: 'DFSP 1 Admin 2' },
  ],
}))

const mockUsers = vi.fn()
vi.mock('@/api/hooks/users', () => ({
  useUsers: () => mockUsers(),
}))

const mockAuditLogs = vi.fn()
vi.mock('@/api/hooks/auditLogs', () => ({
  useAuditLogs: () => mockAuditLogs(),
}))

describe('AuditLog', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should render form skeleton while users data is loading', () => {
    mockUsers.mockReturnValue({ data: null, isLoading: true })
    mockAuditLogs.mockReturnValue({
      data: null,
      isFetching: true,
      isSuccess: false,
    })

    render(
      <TestWrapper>
        <AuditLog />
      </TestWrapper>
    )

    expect(screen.getByTestId('form-skeleton')).toBeInTheDocument()
  })

  it('should render filter form when users data is successfully loaded', () => {
    mockUsers.mockReturnValue({ data: hoistedValues.users, isLoading: false })
    mockAuditLogs.mockReturnValue({
      data: null,
      isFetching: true,
      isSuccess: false,
    })

    render(
      <TestWrapper>
        <AuditLog />
      </TestWrapper>
    )

    expect(screen.getByTestId('filter-form')).toBeInTheDocument()
  })

  it('should render table skeleton when audit logs data is loading', () => {
    mockUsers.mockReturnValue({ data: hoistedValues.users, isLoading: false })
    mockAuditLogs.mockReturnValue({
      data: null,
      isFetching: true,
      isSuccess: false,
    })

    render(
      <TestWrapper>
        <AuditLog />
      </TestWrapper>
    )

    expect(screen.getByTestId('table-skeleton')).toBeInTheDocument()
  })

  it('should render table when audit logs data is successfully loaded', () => {
    mockUsers.mockReturnValue({ data: hoistedValues.users, isLoading: false })
    mockAuditLogs.mockReturnValue({
      data: { data: hoistedValues.auditLogs, totalPages: 1 },
      isFetching: false,
      isSuccess: true,
    })

    render(
      <TestWrapper>
        <AuditLog />
      </TestWrapper>
    )

    expect(screen.getByTestId('table')).toBeInTheDocument()
  })

  it('should render audit log details modal when "View Details" button is clicked', () => {
    mockUsers.mockReturnValue({ data: hoistedValues.users, isLoading: false })
    mockAuditLogs.mockReturnValue({
      data: { data: hoistedValues.auditLogs, totalPages: 1 },
      isFetching: false,
      isSuccess: true,
    })

    render(
      <TestWrapper>
        <AuditLog />
      </TestWrapper>
    )

    const table = screen.getByTestId('table')
    const viewDetailsButton = within(table).getByText('View Details')
    fireEvent.click(viewDetailsButton)

    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('should reset the filter form values when "Clear Filter" button is clicked', () => {
    mockUsers.mockReturnValue({ data: hoistedValues.users, isLoading: false })
    mockAuditLogs.mockReturnValue({
      data: { data: hoistedValues.auditLogs, totalPages: 1 },
      isFetching: false,
      isSuccess: true,
    })

    render(
      <TestWrapper>
        <AuditLog />
      </TestWrapper>
    )

    const actionTypeInput: HTMLInputElement = screen.getByLabelText('Action Type')
    const portalUserNameInput: HTMLInputElement =
      screen.getByLabelText('Portal User Name')
    const clearFilterButton = screen.getByText('Clear Filter')

    fireEvent.change(actionTypeInput, { target: { value: 'Access' } })
    fireEvent.change(portalUserNameInput, { target: { value: 'DFSP 1 Admin 1' } })
    fireEvent.click(clearFilterButton)

    expect(actionTypeInput.value).toEqual('')
    expect(portalUserNameInput.value).toEqual('')
  })

  it('should call "auditLogs.refetch" function when "Search" button is clicked', async () => {
    mockUsers.mockReturnValue({ data: hoistedValues.users, isLoading: false })
    mockAuditLogs.mockReturnValue({
      data: { data: hoistedValues.auditLogs, totalPages: 1 },
      isFetching: false,
      isSuccess: true,
      refetch: () => vi.fn(),
    })
    const refetchSpy = vi.spyOn(vi, 'fn')

    render(
      <TestWrapper>
        <AuditLog />
      </TestWrapper>
    )

    const actionTypeInput: HTMLInputElement = screen.getByLabelText('Action Type')
    const portalUserNameInput: HTMLInputElement =
      screen.getByLabelText('Portal User Name')
    const searchButton = screen.getByText('Search')

    fireEvent.change(actionTypeInput, { target: { value: 'Access' } })
    fireEvent.change(portalUserNameInput, { target: { value: 'DFSP 1 Admin 1' } })
    fireEvent.click(searchButton)

    await waitFor(() => Promise.resolve())

    expect(refetchSpy).toHaveBeenCalled()
  })
})
