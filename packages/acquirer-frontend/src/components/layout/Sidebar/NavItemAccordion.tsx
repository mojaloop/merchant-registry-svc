import { NavLink, useLocation } from 'react-router-dom'
import {
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
  Icon,
  Link,
  Tooltip,
} from '@chakra-ui/react'

import type { NavItemAccordion as NavItemAccordionType } from './navItems'

interface NavItemAccordionProps {
  navItemAccordion: NavItemAccordionType
}

const NavItemAccordion = ({ navItemAccordion }: NavItemAccordionProps) => {
  const location = useLocation()

  const { tooltipLabel, label, icon, subNavItems } = navItemAccordion

  return (
    <Accordion allowToggle>
      <AccordionItem border='0' display='flex' flexDir='column' alignItems='center'>
        <Tooltip label={tooltipLabel} hasArrow placement='right' bg='primary'>
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
        </Tooltip>

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
          {subNavItems.map(({ tooltipLabel, name, to }) => (
            <Tooltip
              key={tooltipLabel}
              label={tooltipLabel}
              hasArrow
              placement='right'
              bg='primary'
            >
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
                {name}
              </Link>
            </Tooltip>
          ))}
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  )
}

export default NavItemAccordion
