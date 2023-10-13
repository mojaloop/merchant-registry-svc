import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import {
  Avatar,
  Box,
  Button,
  HStack,
  Icon,
  IconButton,
  Image,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  Text,
} from '@chakra-ui/react'
import { FiMenu } from 'react-icons/fi'
import { TbLogout } from 'react-icons/tb'
import { AiOutlineMail, AiOutlineUser } from 'react-icons/ai'
import { MdLockOutline } from 'react-icons/md'

import mojaloopLogo from '@/assets/mojaloop-logo.png'
import { useUserProfile } from '@/api/hooks/users'
import { useDrawerDisclosure } from '@/contexts/DrawerDisclosureContext'
import { Drawer } from '@/components/layout'

const Header = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { onOpen } = useDrawerDisclosure()

  const userProfile = useUserProfile()

  return (
    <HStack
      as='header'
      w={{ base: 'full', lg: 'calc(100% - 6rem)' }}
      h='14'
      justify='space-between'
      ml={{ base: '0', lg: '24' }}
      px={{ base: '2', sm: '4', md: '6', lg: '8' }}
      shadow='sm'
      position='fixed'
      bg='white'
      zIndex='sticky'
    >
      <IconButton
        aria-label='Open sidebar'
        icon={<FiMenu />}
        display={{ base: 'flex', lg: 'none' }}
        fontSize='22px'
        color='primary'
        bg='transparent'
        _hover={{ bg: 'secondary' }}
        onClick={onOpen}
      />

      <Image src={mojaloopLogo} h='9' alt='Mojaloop Logo' />

      <Drawer />

      <HStack spacing='4'>
        {/* <IconButton
          aria-label='View notifications'
          icon={<MdOutlineNotifications />}
          variant='unstyled'
          h='auto'
          minW='auto'
          mr='2'
          color='accent'
          fontSize='22px'
        /> */}

        <Popover offset={[-125, 0]}>
          <PopoverTrigger>
            <Button variant='unstyled'>
              <Avatar size='sm' />
            </Button>
          </PopoverTrigger>

          <PopoverContent shadow='lg' w='72'>
            <PopoverHeader fontWeight='medium' borderColor='gray.100'>
              Profile
            </PopoverHeader>

            <PopoverBody display='flex' flexDir='column'>
              <HStack spacing='2' p='1.5'>
                <Box w='6' h='6' display='flex' justifyItems='center' alignItems='center'>
                  <Icon as={AiOutlineUser} w='6' />
                </Box>
                <Text fontSize='sm' wordBreak='break-all'>
                  {userProfile.data?.name || ''}
                </Text>
              </HStack>

              <HStack spacing='2' p='1.5'>
                <Box w='6' h='6' display='flex' justifyItems='center' alignItems='center'>
                  <Icon as={AiOutlineMail} w='6' />
                </Box>
                <Text fontSize='sm' wordBreak='break-all'>
                  {userProfile.data?.email || ''}
                </Text>
              </HStack>

              <Button variant='unstyled' h='auto' p='1.5' _hover={{ bg: 'gray.100' }}>
                <HStack spacing='2'>
                  <Box
                    w='6'
                    h='6'
                    display='flex'
                    justifyItems='center'
                    alignItems='center'
                  >
                    <Icon as={MdLockOutline} w='6' />
                  </Box>
                  <Box as='span' fontSize='sm' fontWeight='normal'>
                    Change Password
                  </Box>
                </HStack>
              </Button>

              <Button
                variant='unstyled'
                h='auto'
                p='1.5'
                _hover={{ bg: 'gray.100' }}
                onClick={() => {
                  localStorage.removeItem('token')
                  navigate('/login')
                  queryClient.removeQueries()
                }}
              >
                <HStack spacing='2'>
                  <Box
                    w='6'
                    h='6'
                    display='flex'
                    justifyItems='center'
                    alignItems='center'
                  >
                    <Icon as={TbLogout} w='6' />
                  </Box>
                  <Box as='span' fontSize='sm' fontWeight='normal'>
                    Logout
                  </Box>
                </HStack>
              </Button>
            </PopoverBody>
          </PopoverContent>
        </Popover>

        {/* <Tooltip label='Logout' hasArrow bg='primary'>
          <IconButton
            aria-label='Logout'
            icon={<TbLogout />}
            variant='unstyled'
            h='auto'
            minW='auto'
            mr='2'
            color='accent'
            fontSize='22px'
            onClick={() => {
              localStorage.removeItem('token')
              navigate('/login')
              queryClient.removeQueries()
            }}
          />
        </Tooltip> */}
      </HStack>
    </HStack>
  )
}

export default Header
