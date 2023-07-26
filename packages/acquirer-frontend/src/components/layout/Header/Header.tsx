import { HStack, IconButton, Image } from '@chakra-ui/react'
import { FiMenu } from 'react-icons/fi'
import { MdOutlineNotifications } from 'react-icons/md'

import mojaloopLogo from '@/assets/mojaloop-logo.png'
import { useDrawerDisclosure } from '@/context/DrawerDisclosureContext'
import { Drawer } from '@/components/layout'

const Header = () => {
  const { onOpen } = useDrawerDisclosure()

  return (
    <HStack
      as='header'
      w={{ base: 'full', md: 'calc(100% - 6rem)' }}
      h='14'
      justify='space-between'
      ml={{ base: '0', lg: '24' }}
      px={{ base: '2', sm: '4', md: '6', lg: '8' }}
      shadow='sm'
      position='fixed'
      bg='white'
      zIndex='sticky'
    >
      <IconButton
        aria-label='Open sidebar'
        icon={<FiMenu />}
        display={{ base: 'flex', md: 'none' }}
        fontSize='22px'
        color='primary'
        bg='transparent'
        _hover={{ bg: 'secondary' }}
        onClick={onOpen}
      />

      <Image
        src={mojaloopLogo}
        h='9'
        display={{ base: 'none', md: 'block' }}
        alt='Mojaloop Logo'
      />

      <Drawer />

      <IconButton
        aria-label='View notifications'
        icon={<MdOutlineNotifications />}
        variant='unstyled'
        minW='auto'
        mr='2'
        color='accent'
        fontSize='22px'
      />
    </HStack>
  )
}

export default Header
