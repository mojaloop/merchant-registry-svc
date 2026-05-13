import { MerchantRegistrationStatus } from 'shared-lib'

import { useDrafts } from '@/api/hooks/merchants'
import { MerchantRecordsPageTemplate } from '@/components/ui'

const DraftApplications = () => {
  return (
    <MerchantRecordsPageTemplate
      title='Merchant Acquiring System > Draft Applications'
      emptyStateText='There are no drafts.'
      registrationStatus={MerchantRegistrationStatus.DRAFT}
      useMerchantsHook={useDrafts}
      columnOptions={{
        includeRegisteredName: true,
        includeLEI: false,
        showProceedColumn: true,
      }}
    />
  )
}

export default DraftApplications
