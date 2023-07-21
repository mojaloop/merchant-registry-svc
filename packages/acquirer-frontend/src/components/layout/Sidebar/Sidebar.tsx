import { IconButton, VStack } from '@chakra-ui/react'
import { FiMenu } from 'react-icons/fi'

import { navItems } from './navItems'
import SidebarNavAccordion from './SidebarNavAccordion'
import SidebarNavItem from './SidebarNavItem'

const Sidebar = () => {
  return (
    <VStack
      as='aside'
      spacing='6'
      w='24'
      h='full'
      display={{ base: 'none', md: 'flex' }}
      position='fixed'
      bg='white'
      zIndex='sticky'
      borderRight='1px'
      borderColor='gray.100'
      py='2'
    >
      <IconButton
        aria-label='Expand sidebar'
        icon={<FiMenu />}
        mb='4'
        fontSize='22px'
        color='primary'
        bg='transparent'
        _hover={{ bg: 'secondary' }}
      />

      {navItems.map(navItem =>
        navItem.subNavItems ? (
          <SidebarNavAccordion key={navItem.name} navAccordion={navItem} />
        ) : (
          <SidebarNavItem navItem={navItem} />
        )
      )}
    </VStack>
  )
}

export default Sidebar
