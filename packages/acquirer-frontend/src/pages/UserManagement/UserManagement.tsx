import { useMemo } from 'react'
import { createColumnHelper } from '@tanstack/react-table'
import { HStack, Heading, Stack, Switch } from '@chakra-ui/react'

import type { User } from '@/types/user'
import { CustomButton, DataTable } from '@/components/ui'

const dummyData: User = {
  no: 1,
  name: 'tester1',
  email: 'tester1@test.com',
  role: 'Super Admin',
}

const data = new Array(8).fill(0).map((_, index) => ({ ...dummyData, no: index + 1 }))

const UserManagement = () => {
  const columns = useMemo(() => {
    const columnHelper = createColumnHelper<User>()

    return [
      columnHelper.accessor('no', {
        cell: info => info.getValue(),
        header: 'No',
      }),
      columnHelper.accessor('name', {
        cell: info => info.getValue(),
        header: 'Name',
      }),
      columnHelper.accessor('email', {
        cell: info => info.getValue(),
        header: 'Email',
      }),
      columnHelper.accessor('role', {
        cell: info => info.getValue(),
        header: 'Role',
      }),
      columnHelper.display({
        id: 'action',
        header: 'Action',
        cell: () => <Switch />,
      }),
    ]
  }, [])

  return (
    <Stack
      minH='full'
      bg='primaryBackground'
      pt='6'
      px={{ base: '4', sm: '6', md: '12', xl: '20' }}
      pb='14'
      flexGrow='1'
    >
      <HStack justify='space-between' mb='10'>
        <Heading size='md'>User Management</Heading>

        <CustomButton>Add New User</CustomButton>
      </HStack>

      <DataTable
        columns={columns}
        data={data}
        breakpoint='md'
        alwaysVisibleColumns={[0, 1]}
      />
    </Stack>
  )
}

export default UserManagement
