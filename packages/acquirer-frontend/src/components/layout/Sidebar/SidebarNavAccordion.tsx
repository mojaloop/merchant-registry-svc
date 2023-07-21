import { NavLink, useLocation } from 'react-router-dom'
import {
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
  Icon,
  Link,
} from '@chakra-ui/react'

import type { NavAccordion } from './navItems'
import TooltipShell from './TooltipShell'

interface SidebarNavAccordionProps {
  navAccordion: NavAccordion
}

const SidebarNavAccordion = ({
  navAccordion: { name, label, icon, subNavItems },
}: SidebarNavAccordionProps) => {
  const location = useLocation()

  // This is to control the state of the accordion.
  // An accordion will initially be expanded if one of the nav items inside it is active.
  const isOpen = subNavItems.some(subNavItem => subNavItem.to === location.pathname)
  const initialIndex = isOpen ? 0 : 1

  return (
    <Accordion allowToggle defaultIndex={initialIndex}>
      <AccordionItem border='0' display='flex' flexDir='column' alignItems='center'>
        <TooltipShell label={name}>
          <AccordionButton
            p='0'
            aria-label={label}
            h='10'
            w='10'
            display='flex'
            alignItems='center'
            justifyContent='center'
            bg='transparent'
            fontSize='20px'
            color='primary'
            _hover={{ bg: 'secondary' }}
            rounded='md'
          >
            <Icon as={icon} />
          </AccordionButton>
        </TooltipShell>

        <AccordionPanel
          p='0'
          px='1'
          pb='1'
          mt='4'
          display='flex'
          flexDir='column'
          alignItems='center'
          gap='4'
        >
          {subNavItems.map(({ name, shortName, to }) => (
            <TooltipShell key={name} label={name}>
              <Link
                as={NavLink}
                to={to}
                w='20'
                py='1.5'
                bg={location.pathname === to ? 'secondary' : 'transparent'}
                textAlign='center'
                fontSize='sm'
                fontWeight='medium'
                rounded='md'
                _hover={{ bg: 'secondary' }}
              >
                {shortName}
              </Link>
            </TooltipShell>
          ))}
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  )
}

export default SidebarNavAccordion
