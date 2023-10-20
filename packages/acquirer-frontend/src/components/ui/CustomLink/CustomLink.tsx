import { forwardRef } from 'react'
import { type NavLinkProps, Link as ReactRouterLink } from 'react-router-dom'
import { Link as ChakraLink, type LinkProps } from '@chakra-ui/react'

type CustomLinkProps = LinkProps &
  NavLinkProps & {
    colorVariant?: 'accent' | 'accent-outline' | 'success' | 'danger' | 'info'
    isDisabled?: boolean
  }

const CustomLink = forwardRef<HTMLAnchorElement, CustomLinkProps>(
  ({ children, colorVariant = 'accent', isDisabled, ...props }, ref) => {
    const variants: Record<typeof colorVariant, LinkProps> = {
      accent: {
        color: 'white',
        bg: 'accent',
        _hover: { opacity: 0.7 },
        _active: { bg: 'accent' },
      },
      'accent-outline': {
        color: 'accent',
        bg: 'transparent',
        border: '1px',
        borderColor: 'accent',
        _hover: { opacity: 0.6, bg: 'transparent' },
      },
      success: {
        color: 'white',
        bg: 'success',
        _hover: { opacity: 0.7 },
        _active: { bg: 'success' },
      },
      danger: {
        color: 'white',
        bg: 'danger',
        _hover: { opacity: 0.7 },
        _active: { bg: 'danger' },
      },
      info: {
        color: 'white',
        bg: 'info',
        _hover: { opacity: 0.7 },
        _active: { bg: 'info' },
      },
    }

    const disabledProps: LinkProps = isDisabled
      ? {
          cursor: 'not-allowed',
          opacity: 0.4,
        }
      : {}

    return (
      <ChakraLink
        as={ReactRouterLink}
        ref={ref}
        position='relative'
        display='inline-flex'
        justifyContent='center'
        alignItems='center'
        height='8'
        minW='8'
        px='3'
        fontSize='sm'
        fontWeight='semibold'
        rounded='md'
        whiteSpace='nowrap'
        userSelect='none'
        transition='all 0.3s ease-out'
        aria-disabled={isDisabled}
        {...variants[colorVariant]}
        {...disabledProps}
        {...props}
      >
        {children}
      </ChakraLink>
    )
  }
)

export default CustomLink
