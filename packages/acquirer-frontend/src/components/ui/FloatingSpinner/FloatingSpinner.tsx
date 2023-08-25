import { Box, Portal, Spinner } from '@chakra-ui/react'

const FloatingSpinner = () => {
  return (
    <Portal>
      <Box
        position='absolute'
        inset='0'
        display='flex'
        alignItems='center'
        justifyContent='center'
        bg='hsl(0, 0%, 100%, 0.6)'
        backdropFilter='blur(4px)'
      >
        <Spinner color='primary' size='xl' thickness='2px' />
      </Box>
    </Portal>
  )
}

export default FloatingSpinner
