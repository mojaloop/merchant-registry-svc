/* eslint-disable @typescript-eslint/no-empty-function */

import { DraftData } from '@/types/form'
import { createContext, useContext, useState } from 'react'

const DraftDataContext = createContext<{
  draftData: DraftData | null
  setDraftData: React.Dispatch<React.SetStateAction<DraftData | null>>
}>({
  draftData: null,
  setDraftData: () => {},
})

export const useDraftData = () => useContext(DraftDataContext)

const DraftDataProvider = ({ children }: { children: React.ReactNode }) => {
  const [draftData, setDraftData] = useState<DraftData | null>(null)

  return (
    <DraftDataContext.Provider value={{ draftData, setDraftData }}>
      {children}
    </DraftDataContext.Provider>
  )
}

export default DraftDataProvider
