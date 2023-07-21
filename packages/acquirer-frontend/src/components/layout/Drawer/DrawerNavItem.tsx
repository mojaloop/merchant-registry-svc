import { NavLink } from 'react-router-dom'
import { Box, Flex, HStack, Icon, Link } from '@chakra-ui/react'

import type { NavItem } from '@/components/layout/Sidebar/navItems'
import { useDrawerDisclosure } from '@/context/DrawerDisclosureContext'

interface DrawerNavItemProps {
  navItem: NavItem
}

const DrawerNavItem = ({ navItem: { name, to, icon } }: DrawerNavItemProps) => {
  const { onClose } = useDrawerDisclosure()

  return (
    <Link
      as={NavLink}
      to={to}
      onClick={onClose}
      w='full'
      px='3'
      py='2'
      display='inline-block'
      borderRadius='md'
      bg={location.pathname === to ? 'secondary' : ''}
      _hover={{ bg: 'secondary' }}
    >
      <HStack>
        {icon && (
          <Flex w='5' justify='center' align='center'>
            <Icon as={icon} color='primary' fontSize='20px' />
          </Flex>
        )}
        <Box as='span' fontSize='sm' fontWeight='medium'>
          {name}
        </Box>
      </HStack>
    </Link>
  )
}

export default DrawerNavItem
