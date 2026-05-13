import { MerchantRegistrationStatus } from 'shared-lib'

import { useRejectedMerchants } from '@/api/hooks/merchants'
import { MerchantRecordsPageTemplate } from '@/components/ui'

const RejectedMerchantRecords = () => {
  return (
    <MerchantRecordsPageTemplate
      title='Rejected Merchant Report'
      emptyStateText='There are no rejected merchant records.'
      registrationStatus={MerchantRegistrationStatus.REJECTED}
      useMerchantsHook={useRejectedMerchants}
    />
  )
}

export default RejectedMerchantRecords
