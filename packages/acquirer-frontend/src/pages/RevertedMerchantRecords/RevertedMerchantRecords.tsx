import { MerchantRegistrationStatus } from 'shared-lib'

import { useRevertedMerchants } from '@/api/hooks/merchants'
import { MerchantRecordsPageTemplate } from '@/components/ui'

const RevertedMerchantRecords = () => {
  return (
    <MerchantRecordsPageTemplate
      title='To be Reverted Report'
      emptyStateText='There are no reverted merchant records.'
      registrationStatus={MerchantRegistrationStatus.REVERTED}
      useMerchantsHook={useRevertedMerchants}
      columnOptions={{
        includeRegisteredName: true,
        includeLEI: false,
        showProceedColumn: true,
      }}
    />
  )
}

export default RevertedMerchantRecords
