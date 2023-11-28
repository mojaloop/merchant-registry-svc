import {
  Box,
  Drawer as ChakraDrawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerOverlay,
  Stack,
  VStack,
} from '@chakra-ui/react'

import { useDrawerDisclosure } from '@/contexts/DrawerDisclosureContext'
import { useNavItems } from '@/contexts/NavItemsContext'
import DrawerNavAccordion from './DrawerNavAccordion'
import DrawerNavItem from './DrawerNavItem'

const Drawer = () => {
  const { isOpen, onClose } = useDrawerDisclosure()
  const { navItems } = useNavItems()

  return (
    <ChakraDrawer isOpen={isOpen} placement='left' onClose={onClose}>
      <DrawerOverlay bg='hsl(0, 0%, 100%, 0.6)' backdropFilter='blur(4px)' />
      <DrawerContent w='72 !important'>
        <Box bg='white' h='12' shadow='sm' zIndex='sticky'>
          <DrawerCloseButton />
        </Box>

        <DrawerBody px='0'>
          <VStack w='72' h='full' position='fixed' bg='white' zIndex='sticky' py='6'>
            <Stack w='64' h='full' spacing='4'>
              {navItems.map(navItem =>
                navItem.subNavItems ? (
                  <DrawerNavAccordion key={navItem.name} navAccordion={navItem} />
                ) : (
                  <DrawerNavItem key={navItem.name} navItem={navItem} />
                )
              )}
            </Stack>
          </VStack>
        </DrawerBody>
      </DrawerContent>
    </ChakraDrawer>
  )
}

export default Drawer
