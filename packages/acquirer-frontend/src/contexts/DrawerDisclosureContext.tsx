import { createContext, useContext } from 'react'
import { useDisclosure } from '@chakra-ui/react'

interface DrawerDisclosureContextProps {
  isOpen: boolean
  onOpen: () => void
  onClose: () => void
}

const DrawerDisclosureContext = createContext<DrawerDisclosureContextProps | null>(null)

export const useDrawerDisclosure = () => {
  const context = useContext(DrawerDisclosureContext)

  if (!context) {
    throw new Error(
      '`useDrawerDisclosure` hook must be called inside `DrawerDisclosureProvider`'
    )
  }

  return context
}

const DrawerDisclosureProvider = ({ children }: { children: React.ReactNode }) => {
  const { isOpen, onOpen, onClose } = useDisclosure()

  return (
    <DrawerDisclosureContext.Provider value={{ isOpen, onOpen, onClose }}>
      {children}
    </DrawerDisclosureContext.Provider>
  )
}

export default DrawerDisclosureProvider
