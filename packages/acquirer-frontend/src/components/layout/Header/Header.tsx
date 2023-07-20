import { HStack } from '@chakra-ui/react'

const Header = () => {
  return (
    <HStack
      as='header'
      w='full'
      h='12'
      justify={{ base: 'space-between', md: 'flex-end' }}
      px='4'
      shadow='sm'
      position='fixed'
      bg='white'
      zIndex='sticky'
    ></HStack>
  )
}

export default Header
