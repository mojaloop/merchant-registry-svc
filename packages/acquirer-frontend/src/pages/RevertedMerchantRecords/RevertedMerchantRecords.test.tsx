import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { vi } from 'vitest'

import TestWrapper from '@/__tests__/TestWrapper'
import { RevertedMerchantRecords } from '..'

const hoistedValues = vi.hoisted(() => ({
  revertedMerchants: [
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
      registrationStatus: 'Reverted',
      maker: {
        id: 5,
        name: 'DFSP 1 Admin 1',
      },
    },
  ],
  users: [
    { id: 5, name: 'DFSP 1 Admin 1' },
    { id: 6, name: 'DFSP 1 Admin 2' },
  ],
}))

const mockRevertedMerchants = vi.fn()
vi.mock('@/api/hooks/merchants', () => ({
  useRevertedMerchants: () => mockRevertedMerchants(),
  useExportMerchants: () => ({
    mutateAsync: () => vi.fn(),
  }),
  useMerchant: () => ({}),
}))

const mockUsers = vi.fn()
vi.mock('@/api/hooks/users', () => ({
  useUsers: () => mockUsers(),
}))

vi.mock('@/utils', () => ({
  downloadMerchantsBlobAsXlsx: () => vi.fn(),
}))

describe('RevertedMerchantRecords', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should render form skeleton when users data is loading', () => {
    mockUsers.mockReturnValue({ data: null, isLoading: true })
    mockRevertedMerchants.mockReturnValue({
      data: { data: hoistedValues.revertedMerchants, totalPages: 1 },
      isFetching: false,
      isSuccess: true,
    })

    render(
      <TestWrapper>
        <RevertedMerchantRecords />
      </TestWrapper>
    )

    expect(screen.getByTestId('form-skeleton')).toBeInTheDocument()
  })

  it('should render filter form when users data is successfully loaded', () => {
    mockUsers.mockReturnValue({ data: hoistedValues.users, isLoading: false })
    mockRevertedMerchants.mockReturnValue({
      data: { data: hoistedValues.revertedMerchants, totalPages: 1 },
      isFetching: false,
      isSuccess: true,
    })

    render(
      <TestWrapper>
        <RevertedMerchantRecords />
      </TestWrapper>
    )

    expect(screen.getByTestId('filter-form')).toBeInTheDocument()
  })

  it('should render table skeleton when reverted merchants data is loading', () => {
    mockUsers.mockReturnValue({ data: hoistedValues.users, isLoading: false })
    mockRevertedMerchants.mockReturnValue({
      data: null,
      isFetching: true,
      isSuccess: false,
    })

    render(
      <TestWrapper>
        <RevertedMerchantRecords />
      </TestWrapper>
    )

    expect(screen.getByTestId('table-skeleton')).toBeInTheDocument()
  })

  it('should render table content when reverted merchants data is successfully loaded', () => {
    mockUsers.mockReturnValue({ data: hoistedValues.users, isLoading: false })
    mockRevertedMerchants.mockReturnValue({
      data: { data: hoistedValues.revertedMerchants, totalPages: 1 },
      isFetching: false,
      isSuccess: true,
    })

    render(
      <TestWrapper>
        <RevertedMerchantRecords />
      </TestWrapper>
    )

    expect(screen.getByTestId('table')).toBeInTheDocument()
    expect(screen.getByText('Export')).toBeInTheDocument()
  })

  it('should reset the filter form values when "Clear Filter" button is clicked', () => {
    mockUsers.mockReturnValue({ data: hoistedValues.users, isLoading: false })
    mockRevertedMerchants.mockReturnValue({
      data: { data: hoistedValues.revertedMerchants, totalPages: 1 },
      isFetching: false,
      isSuccess: true,
      refetch: () => vi.fn,
    })

    render(
      <TestWrapper>
        <RevertedMerchantRecords />
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

  it('should call "revertedMerchants.refetch" function when the filter form is submitted', async () => {
    mockUsers.mockReturnValue({ data: hoistedValues.users, isLoading: false })
    mockRevertedMerchants.mockReturnValue({
      data: { data: hoistedValues.revertedMerchants, totalPages: 1 },
      isFetching: false,
      isSuccess: true,
      refetch: () => vi.fn(),
    })
    const refetchSpy = vi.spyOn(vi, 'fn')

    render(
      <TestWrapper>
        <RevertedMerchantRecords />
      </TestWrapper>
    )

    const filterForm = screen.getByTestId('filter-form')
    fireEvent.submit(filterForm)

    await waitFor(() => Promise.resolve)

    expect(refetchSpy).toHaveBeenCalled()
  })

  it('should call "exportMerchants.mutateAsync" function when "Export" button is clicked', () => {
    mockUsers.mockReturnValue({ data: hoistedValues.users, isLoading: false })
    mockRevertedMerchants.mockReturnValue({
      data: { data: hoistedValues.revertedMerchants, totalPages: 1 },
      isFetching: false,
      isSuccess: true,
    })
    const exportMerchantsSpy = vi.spyOn(vi, 'fn')

    render(
      <TestWrapper>
        <RevertedMerchantRecords />
      </TestWrapper>
    )

    const exportButton = screen.getByText('Export')
    fireEvent.click(exportButton)

    expect(exportMerchantsSpy).toHaveBeenCalled()
  })

  it('should render merchant info modal when "View Details" button is clicked', () => {
    mockUsers.mockReturnValue({ data: hoistedValues.users, isLoading: false })
    mockRevertedMerchants.mockReturnValue({
      data: { data: hoistedValues.revertedMerchants, totalPages: 1 },
      isFetching: false,
      isSuccess: true,
    })

    render(
      <TestWrapper>
        <RevertedMerchantRecords />
      </TestWrapper>
    )

    const table = screen.getByTestId('table')
    const viewDetailsButton = within(table).getByText('View Details')
    fireEvent.click(viewDetailsButton)

    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('should set merchantId to localStorage when "Proceed" button is clicked', () => {
    mockUsers.mockReturnValue({ data: hoistedValues.users, isLoading: false })
    mockRevertedMerchants.mockReturnValue({
      data: { data: hoistedValues.revertedMerchants, totalPages: 1 },
      isFetching: false,
      isSuccess: true,
    })
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem')

    render(
      <TestWrapper>
        <RevertedMerchantRecords />
      </TestWrapper>
    )

    const table = screen.getByTestId('table')
    const proceedButton = within(table).getByText('Proceed')
    fireEvent.click(proceedButton)

    expect(setItemSpy).toHaveBeenCalledWith('merchantId', '1')
  })
})
