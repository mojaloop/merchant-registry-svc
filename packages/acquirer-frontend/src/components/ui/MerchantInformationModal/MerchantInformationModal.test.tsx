import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'

import TestWrapper from '@/__tests__/TestWrapper'
import { MerchantInformationModal } from '..'

const hoistedValues = vi.hoisted(() => ({
  merchant: {
    business_licenses: [
      {
        license_document_link: 'http://example.com',
      },
    ],
    business_owners: [],
    category_code: {},
    checkout_counters: [
      {
        qr_code_link: null,
      },
    ],
    contact_persons: [],
    currency_code: {},
    dba_trading_name: 'marco',
    employees_num: '6 - 10',
    id: 1,
    locations: [],
    merchant_type: 'Individual',
    monthly_turnover: '',
    registered_name: '',
    registration_status: 'Draft',
    registration_status_reason: 'Draft Merchant by d1superadmin1@email.com',
  },
}))

const mockMerchant = vi.fn()
vi.mock('@/api/hooks/merchants', () => ({
  useMerchant: () => mockMerchant(),
}))

describe('MerchantInformationModal', () => {
  it('should render skeleton loading when merchant data is loading', () => {
    mockMerchant.mockReturnValue({ data: null, isLoading: true, isSuccess: false })

    render(
      <TestWrapper>
        <MerchantInformationModal isOpen onClose={() => vi.fn()} selectedMerchantId={1} />
      </TestWrapper>
    )

    expect(screen.getByTestId('skeleton-loading')).toBeInTheDocument()
  })

  it('should render merchant information when merchant data is successfully loaded', () => {
    mockMerchant.mockReturnValue({
      data: hoistedValues.merchant,
      isLoading: false,
      isSuccess: true,
    })

    render(
      <TestWrapper>
        <MerchantInformationModal isOpen onClose={() => vi.fn()} selectedMerchantId={1} />
      </TestWrapper>
    )

    expect(screen.getByTestId('merchant-information')).toBeInTheDocument()
    expect(screen.getByTestId('license-document-link')).toBeInTheDocument()
  })
})
