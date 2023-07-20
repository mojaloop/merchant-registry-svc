import { NavLink, useLocation } from 'react-router-dom'
import { Icon, IconButton, Link, VStack } from '@chakra-ui/react'
import { FiMenu } from 'react-icons/fi'

import { navItems } from './navItems'
import NavItemAccordion from './NavItemAccordion'
import TooltipShell from './TooltipShell'

const Sidebar = () => {
  const location = useLocation()

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
          <NavItemAccordion key={navItem.tooltipLabel} navItemAccordion={navItem} />
        ) : (
          <TooltipShell key={navItem.tooltipLabel} label={navItem.tooltipLabel}>
            <Link
              as={NavLink}
              to={navItem.to}
              p='0'
              aria-label={navItem.label}
              h='10'
              w='10'
              display='flex'
              alignItems='center'
              justifyContent='center'
              bg={location.pathname === navItem.to ? 'secondary' : 'transparent'}
              fontSize='20px'
              color='primary'
              _hover={{ bg: 'secondary' }}
              rounded='md'
            >
              <Icon as={navItem.icon} />
            </Link>
          </TooltipShell>
        )
      )}
    </VStack>
  )
}

export default Sidebar
