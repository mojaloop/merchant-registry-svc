import { vi } from 'vitest'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'

import TestWrapper from '@/__tests__/TestWrapper'
import { PendingMerchantRecords } from '..'

const hoistedValues = vi.hoisted(() => ({
  pendingMerchants: [
    {
      no: 1,
      dbaName: 'marco',
      registeredName: 'N/A',
      payintoAccountId: 'N/A',
      merchantType: 'Small Shop',
      town: 'Townsville',
      countrySubdivision: 'Western Australia',
      counterDescription: 'N/A',
      registeredDfspName: 'DFSP 1',
      registrationStatus: 'Pending',
      maker: {
        id: 5,
        name: 'DFSP 1 Super Admin 1',
      },
    },
  ],
  users: [
    { id: 5, name: 'DFSP 1 Super Admin 1' },
    { id: 6, name: 'DFSP 1 Admin 1' },
  ],
}))

vi.mock('@tanstack/react-query', async () => {
  const tanstackQuery: object = await vi.importActual('@tanstack/react-query')

  return {
    ...tanstackQuery,
    useQueryClient: () => ({
      invalidateQueries: () => vi.fn(),
    }),
  }
})

const mockPendingMerchants = vi.fn()
vi.mock('@/api/hooks/merchants', () => ({
  usePendingMerchants: () => mockPendingMerchants(),
  useExportMerchants: () => ({
    mutateAsync: () => vi.fn(),
  }),
  useApproveMerchants: () => ({
    mutateAsync: () => vi.fn(),
  }),
  useRejectMerchants: () => ({
    mutateAsync: () => vi.fn(),
  }),
  useRevertMerchants: () => ({
    mutateAsync: () => vi.fn(),
  }),
  useMerchant: () => ({}),
}))

const mockUsers = vi.fn()
const mockUserProfile = vi.fn()
vi.mock('@/api/hooks/users', () => ({
  useUsers: () => mockUsers(),
  useUserProfile: () => mockUserProfile(),
}))

vi.mock('@/utils', () => ({
  downloadMerchantsBlobAsXlsx: () => vi.fn(),
}))

describe('PendingMerchantRecords', () => {
  it('should render form skeleton when users data is loading', () => {
    mockUserProfile.mockReturnValue({ data: { id: 6, name: 'DFSP 1 Admin 1' } })
    mockUsers.mockReturnValue({ data: null, isLoading: true })
    mockPendingMerchants.mockReturnValue({
      data: { data: hoistedValues.pendingMerchants, totalPages: 1 },
      isFetching: false,
      isSuccess: true,
    })

    render(
      <TestWrapper>
        <PendingMerchantRecords />
      </TestWrapper>
    )

    expect(screen.getByTestId('form-skeleton')).toBeInTheDocument()
  })

  it('should render filter form when users data is successfully loaded', () => {
    mockUserProfile.mockReturnValue({ data: { id: 6, name: 'DFSP 1 Admin 1' } })
    mockUsers.mockReturnValue({ data: hoistedValues.users, isLoading: false })
    mockPendingMerchants.mockReturnValue({
      data: { data: hoistedValues.pendingMerchants, totalPages: 1 },
      isFetching: false,
      isSuccess: true,
    })

    render(
      <TestWrapper>
        <PendingMerchantRecords />
      </TestWrapper>
    )

    expect(screen.getByTestId('filter-form')).toBeInTheDocument()
  })

  it('should render table skeleton when pending merchants data is loading', () => {
    mockUserProfile.mockReturnValue({ data: { id: 6, name: 'DFSP 1 Admin 1' } })
    mockUsers.mockReturnValue({ data: hoistedValues.users, isLoading: false })
    mockPendingMerchants.mockReturnValue({
      data: null,
      isFetching: true,
      isSuccess: false,
    })

    render(
      <TestWrapper>
        <PendingMerchantRecords />
      </TestWrapper>
    )

    expect(screen.getByTestId('table-skeleton')).toBeInTheDocument()
  })

  it('should render table content when pending merchants data is successfully loaded', () => {
    mockUserProfile.mockReturnValue({ data: { id: 6, name: 'DFSP 1 Admin 1' } })
    mockUsers.mockReturnValue({ data: hoistedValues.users, isLoading: false })
    mockPendingMerchants.mockReturnValue({
      data: { data: hoistedValues.pendingMerchants, totalPages: 1 },
      isFetching: false,
      isSuccess: true,
    })

    render(
      <TestWrapper>
        <PendingMerchantRecords />
      </TestWrapper>
    )

    expect(screen.getByTestId('table')).toBeInTheDocument()
    expect(screen.getByText('Export')).toBeInTheDocument()
    expect(screen.getByText('Reject')).toBeInTheDocument()
    expect(screen.getByText('Approve')).toBeInTheDocument()
    expect(screen.getByText('Revert')).toBeInTheDocument()
  })

  it('should reset the filter form values when "Clear Filter" button is clicked', () => {
    mockUserProfile.mockReturnValue({ data: { id: 6, name: 'DFSP 1 Admin 1' } })
    mockUsers.mockReturnValue({ data: hoistedValues.users, isLoading: false })
    mockPendingMerchants.mockReturnValue({
      data: { data: hoistedValues.pendingMerchants, totalPages: 1 },
      isFetching: false,
      isSuccess: true,
      refetch: () => vi.fn(),
    })

    render(
      <TestWrapper>
        <PendingMerchantRecords />
      </TestWrapper>
    )

    const addedByInput: HTMLSelectElement = screen.getByLabelText('Added By')
    const approvedBy: HTMLSelectElement = screen.getByLabelText('Approved By')
    const addedTimeInput: HTMLInputElement = screen.getByLabelText('Added Time')
    const updatedTimeInput: HTMLInputElement = screen.getByLabelText('Updated Time')
    const dbaNameInput: HTMLInputElement = screen.getByLabelText('DBA Name')
    const merchantId: HTMLInputElement = screen.getByLabelText('Merchant ID')
    const payintoAccountId: HTMLInputElement = screen.getByLabelText('Payinto Account ID')

    fireEvent.change(addedByInput, { target: { value: 5 } })
    fireEvent.change(approvedBy, { target: { value: 6 } })
    fireEvent.change(addedTimeInput, { target: { value: '2021-01-01' } })
    fireEvent.change(updatedTimeInput, { target: { value: '2021-01-01' } })
    fireEvent.change(dbaNameInput, { target: { value: 'marco' } })
    fireEvent.change(merchantId, { target: { value: '123456' } })
    fireEvent.change(payintoAccountId, { target: { value: '123456' } })

    const clearFilterButton = screen.getByText('Clear Filter')
    fireEvent.click(clearFilterButton)

    expect(addedByInput.value).toEqual('')
    expect(approvedBy.value).toEqual('')
    expect(addedTimeInput.value).toEqual('')
    expect(updatedTimeInput.value).toEqual('')
    expect(dbaNameInput.value).toEqual('')
    expect(merchantId.value).toEqual('')
    expect(payintoAccountId.value).toEqual('')
  })

  it('should call "pendingMerchants.refetch" function when the filter form is submitted', async () => {
    mockUserProfile.mockReturnValue({ data: { id: 6, name: 'DFSP 1 Admin 1' } })
    mockUsers.mockReturnValue({ data: hoistedValues.users, isLoading: false })
    mockPendingMerchants.mockReturnValue({
      data: { data: hoistedValues.pendingMerchants, totalPages: 1 },
      isFetching: false,
      isSuccess: true,
      refetch: () => vi.fn(),
    })
    const refetchSpy = vi.spyOn(vi, 'fn')

    render(
      <TestWrapper>
        <PendingMerchantRecords />
      </TestWrapper>
    )

    const filterForm = screen.getByTestId('filter-form')
    fireEvent.submit(filterForm)

    await waitFor(() => Promise.resolve())

    expect(refetchSpy).toHaveBeenCalled()
  })

  it('should disable row select checkbox when the logged in user is the maker', () => {
    mockUserProfile.mockReturnValue({ data: { id: 5, name: 'DFSP 1 Super Admin 1' } })
    mockUsers.mockReturnValue({ data: hoistedValues.users, isLoading: false })
    mockPendingMerchants.mockReturnValue({
      data: { data: hoistedValues.pendingMerchants, totalPages: 1 },
      isFetching: false,
      isSuccess: true,
      refetch: () => vi.fn(),
    })

    render(
      <TestWrapper>
        <PendingMerchantRecords />
      </TestWrapper>
    )

    const table = screen.getByTestId('table')
    const selectRowCheckBox = within(table).getByLabelText('Select row')

    expect(selectRowCheckBox).toBeDisabled()
  })

  it('should call "exportMerchants.mutateAsync" function when "Export" button is clicked', () => {
    mockUserProfile.mockReturnValue({ data: { id: 6, name: 'DFSP 1 Admin 1' } })
    mockUsers.mockReturnValue({ data: hoistedValues.users, isLoading: false })
    mockPendingMerchants.mockReturnValue({
      data: { data: hoistedValues.pendingMerchants, totalPages: 1 },
      isFetching: false,
      isSuccess: true,
    })
    const exportMerchantsSpy = vi.spyOn(vi, 'fn')

    render(
      <TestWrapper>
        <PendingMerchantRecords />
      </TestWrapper>
    )

    const exportButton = screen.getByText('Export')
    fireEvent.click(exportButton)

    expect(exportMerchantsSpy).toHaveBeenCalled()
  })

  it('should call "rejectMerchants.mutateAsync" function when "Reject" button is clicked', async () => {
    mockUserProfile.mockReturnValue({ data: { id: 6, name: 'DFSP 1 Admin 1' } })
    mockUsers.mockReturnValue({ data: hoistedValues.users, isLoading: false })
    mockPendingMerchants.mockReturnValue({
      data: { data: hoistedValues.pendingMerchants, totalPages: 1 },
      isFetching: false,
      isSuccess: true,
      refetch: () => vi.fn(),
    })
    const mockSpy = vi.spyOn(vi, 'fn')

    render(
      <TestWrapper>
        <PendingMerchantRecords />
      </TestWrapper>
    )

    const table = screen.getByTestId('table')
    const selectRowCheckBox = within(table).getByLabelText('Select row')
    const rejectButton = screen.getByText('Reject')
    fireEvent.click(selectRowCheckBox)
    fireEvent.click(rejectButton)

    const yesButton = screen.getByText('Yes')
    fireEvent.click(yesButton)

    const reasonInput = screen.getByPlaceholderText('Enter reason')
    const submitButton = screen.getByText('Submit')
    fireEvent.change(reasonInput, { target: { value: 'Invalid data' } })
    fireEvent.submit(submitButton)

    await waitFor(() => Promise.resolve())

    expect(mockSpy).toHaveBeenCalledTimes(4)
  })

  it('should call "approveMerchants.mutateAsync" function when "Approve" button is clicked', async () => {
    mockUserProfile.mockReturnValue({ data: { id: 6, name: 'DFSP 1 Admin 1' } })
    mockUsers.mockReturnValue({ data: hoistedValues.users, isLoading: false })
    mockPendingMerchants.mockReturnValue({
      data: { data: hoistedValues.pendingMerchants, totalPages: 1 },
      isFetching: false,
      isSuccess: true,
      refetch: () => vi.fn(),
    })
    const mockSpy = vi.spyOn(vi, 'fn')

    render(
      <TestWrapper>
        <PendingMerchantRecords />
      </TestWrapper>
    )

    const table = screen.getByTestId('table')
    const selectRowCheckBox = within(table).getByLabelText('Select row')
    const approveButton = screen.getByText('Approve')
    fireEvent.click(selectRowCheckBox)
    fireEvent.click(approveButton)

    const yesButton = screen.getByText('Yes')
    fireEvent.click(yesButton)

    await waitFor(() => Promise.resolve())

    expect(mockSpy).toHaveBeenCalledTimes(4)
  })

  it('should call "revertMerchants.mutateAsync" function when "Revert" button is clicked', async () => {
    mockUserProfile.mockReturnValue({ data: { id: 6, name: 'DFSP 1 Admin 1' } })
    mockUsers.mockReturnValue({ data: hoistedValues.users, isLoading: false })
    mockPendingMerchants.mockReturnValue({
      data: { data: hoistedValues.pendingMerchants, totalPages: 1 },
      isFetching: false,
      isSuccess: true,
      refetch: () => vi.fn(),
    })
    const mockSpy = vi.spyOn(vi, 'fn')

    render(
      <TestWrapper>
        <PendingMerchantRecords />
      </TestWrapper>
    )

    const table = screen.getByTestId('table')
    const selectRowCheckBox = within(table).getByLabelText('Select row')
    const revertButton = screen.getByText('Revert')
    fireEvent.click(selectRowCheckBox)
    fireEvent.click(revertButton)

    const yesButton = screen.getByText('Yes')
    fireEvent.click(yesButton)

    const reasonInput = screen.getByPlaceholderText('Enter reason')
    const submitButton = screen.getByText('Submit')
    fireEvent.change(reasonInput, { target: { value: 'Invalid data' } })
    fireEvent.submit(submitButton)

    await waitFor(() => Promise.resolve())

    expect(mockSpy).toHaveBeenCalledTimes(4)
  })

  it('should render merchant info modal when "View Details" button is clicked', () => {
    mockUserProfile.mockReturnValue({ data: { id: 6, name: 'DFSP 1 Admin 1' } })
    mockUsers.mockReturnValue({ data: hoistedValues.users, isLoading: false })
    mockPendingMerchants.mockReturnValue({
      data: { data: hoistedValues.pendingMerchants, totalPages: 1 },
      isFetching: false,
      isSuccess: true,
    })

    render(
      <TestWrapper>
        <PendingMerchantRecords />
      </TestWrapper>
    )

    const table = screen.getByTestId('table')
    const viewDetailsButton = within(table).getByText('View Details')
    fireEvent.click(viewDetailsButton)

    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })
})
