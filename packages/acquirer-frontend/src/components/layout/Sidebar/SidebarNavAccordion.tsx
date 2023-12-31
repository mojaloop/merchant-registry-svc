import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
  Icon,
  Link,
} from '@chakra-ui/react'

import type { NavAccordion } from '@/types/navItems'
import TooltipShell from './TooltipShell'

interface SidebarNavAccordionProps {
  navAccordion: NavAccordion
}

const SidebarNavAccordion = ({
  navAccordion: { name, label, icon, subNavItems },
}: SidebarNavAccordionProps) => {
  // This is to control the state of the accordion.
  // An accordion will initially be expanded if one of the nav items inside it is active.
  const isOpen = subNavItems.some(subNavItem => location.pathname.includes(subNavItem.to))
  const initialIndex = isOpen ? 0 : 1

  const [activeIndex, setActiveIndex] = useState(initialIndex)

  useEffect(() => {
    setActiveIndex(isOpen ? 0 : 1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, isOpen])

  return (
    <Accordion
      allowToggle
      index={activeIndex}
      onChange={expandedIndex => {
        setActiveIndex(expandedIndex as number)
      }}
    >
      <AccordionItem display='flex' flexDir='column' alignItems='center' border='0'>
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
                bg={location.pathname.includes(to) ? 'secondary' : 'transparent'}
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
