import { useNavigate } from 'react-router-dom'
import { HStack, IconButton, Image, Tooltip } from '@chakra-ui/react'
import { FiMenu } from 'react-icons/fi'
import { TbLogout } from 'react-icons/tb'

import mojaloopLogo from '@/assets/mojaloop-logo.png'
import { useDrawerDisclosure } from '@/contexts/DrawerDisclosureContext'
import { Drawer } from '@/components/layout'

const Header = () => {
  const navigate = useNavigate()
  const { onOpen } = useDrawerDisclosure()

  return (
    <HStack
      as='header'
      w={{ base: 'full', lg: 'calc(100% - 6rem)' }}
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
        display={{ base: 'flex', lg: 'none' }}
        fontSize='22px'
        color='primary'
        bg='transparent'
        _hover={{ bg: 'secondary' }}
        onClick={onOpen}
      />

      <Image src={mojaloopLogo} h='9' alt='Mojaloop Logo' />

      <Drawer />

      <HStack spacing='4'>
        {/* <IconButton
          aria-label='View notifications'
          icon={<MdOutlineNotifications />}
          variant='unstyled'
          h='auto'
          minW='auto'
          mr='2'
          color='accent'
          fontSize='22px'
        /> */}

        <Tooltip label='Logout' hasArrow bg='primary'>
          <IconButton
            aria-label='Logout'
            icon={<TbLogout />}
            variant='unstyled'
            h='auto'
            minW='auto'
            mr='2'
            color='accent'
            fontSize='22px'
            onClick={() => {
              sessionStorage.removeItem('token')
              navigate('/login')
            }}
          />
        </Tooltip>
      </HStack>
    </HStack>
  )
}

export default Header
