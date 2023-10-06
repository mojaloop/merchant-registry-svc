import { useEffect, useState } from 'react'
import { Box, IconButton, Stack } from '@chakra-ui/react'
import { FiMenu } from 'react-icons/fi'

import { useNavItems } from '@/contexts/NavItemsContext'
import DrawerNavAccordion from '@/components/layout/Drawer/DrawerNavAccordion'
import DrawerNavItem from '@/components/layout/Drawer/DrawerNavItem'
import SidebarNavAccordion from './SidebarNavAccordion'
import SidebarNavItem from './SidebarNavItem'

const Sidebar = () => {
  const [isExpanded, setIsExpanded] = useState(false)

  const { navItems } = useNavItems()

  useEffect(() => {
    setIsExpanded(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname])

  return (
    <>
      {isExpanded && (
        <Box
          position='fixed'
          w='full'
          h='full'
          bg='hsl(0, 0%, 100%, 0.6)'
          backdropFilter='blur(4px)'
          zIndex='overlay'
          aria-hidden='true'
          onClick={() => setIsExpanded(false)}
        />
      )}

      <Stack
        as='aside'
        spacing='6'
        w={isExpanded ? '20.5rem' : '24'}
        h='full'
        px='7'
        py='2'
        display={{ base: 'none', lg: 'flex' }}
        position='fixed'
        bg='white'
        shadow={isExpanded ? 'md' : ''}
        zIndex='overlay'
        borderRight={isExpanded ? '' : '1px'}
        borderColor={isExpanded ? '' : 'gray.100'}
        transitionProperty='width'
        transitionDuration='0.2s'
        transitionTimingFunction='ease-out'
      >
        <IconButton
          aria-label={`${isExpanded ? 'Shrink' : 'Expand'} sidebar`}
          icon={<FiMenu />}
          mb='4'
          w='10'
          fontSize='22px'
          color='primary'
          bg='transparent'
          _hover={{ bg: 'secondary' }}
          onClick={() => setIsExpanded(prevState => !prevState)}
        />

        {isExpanded ? (
          <>
            {navItems.map(navItem =>
              navItem.subNavItems ? (
                <DrawerNavAccordion
                  key={navItem.name}
                  navAccordion={navItem}
                  buttonStyle={{ h: '10', pl: '0.6rem' }}
                />
              ) : (
                <DrawerNavItem key={navItem.name} navItem={navItem} h='10' px='2.5' />
              )
            )}
          </>
        ) : (
          <>
            {navItems.map(navItem =>
              navItem.subNavItems ? (
                <SidebarNavAccordion key={navItem.name} navAccordion={navItem} />
              ) : (
                <SidebarNavItem key={navItem.name} navItem={navItem} />
              )
            )}
          </>
        )}
      </Stack>
    </>
  )
}

export default Sidebar
