import { Box, type BoxProps } from '@chakra-ui/react'

const Skeleton = (props: BoxProps) => {
  return (
    <Box
      position='relative'
      bg='#c2cdd8'
      overflow='hidden'
      _after={{
        content: '""',
        position: 'absolute',
        inset: 0,
        transform: 'translateX(-100%)',
        backgroundImage: 'linear-gradient(to right, transparent, #b1bac7, transparent)',
        animation: 'shimmer 2s infinite',
      }}
      {...props}
    />
  )
}

export default Skeleton
