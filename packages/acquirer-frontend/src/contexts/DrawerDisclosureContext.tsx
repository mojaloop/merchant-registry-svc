/* eslint-disable @typescript-eslint/no-empty-function */

import { createContext, useContext } from 'react'
import { useDisclosure } from '@chakra-ui/react'

const DrawerDisclosureContext = createContext({
  isOpen: false,
  onOpen: () => {},
  onClose: () => {},
})

export const useDrawerDisclosure = () => useContext(DrawerDisclosureContext)

const DrawerDisclosureProvider = ({ children }: { children: React.ReactNode }) => {
  const { isOpen, onOpen, onClose } = useDisclosure()

  return (
    <DrawerDisclosureContext.Provider value={{ isOpen, onOpen, onClose }}>
      {children}
    </DrawerDisclosureContext.Provider>
  )
}

export default DrawerDisclosureProvider
