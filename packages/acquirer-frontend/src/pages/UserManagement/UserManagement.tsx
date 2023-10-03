import { useMemo } from 'react'
import { createColumnHelper } from '@tanstack/react-table'
import { Flex, Heading, Stack, Switch } from '@chakra-ui/react'

import type { User } from '@/types/users'
import { useUsers } from '@/api/hooks/users'
import { useTable } from '@/hooks'
import { CustomLink, DataTable, EmptyState, TableSkeleton } from '@/components/ui'

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

  const users = useUsers()
  let data

  if (users.isSuccess && !users.isFetching) {
    data = users.data.map(({ id, name, email, role }) => ({
      no: id,
      name,
      email,
      role: role.description,
    }))
  }

  const table = useTable({
    data: data || [],
    columns,
  })

  return (
    <Stack
      minH='full'
      bg='primaryBackground'
      pt='6'
      px={{ base: '4', sm: '6', md: '12', xl: '20' }}
      pb='14'
      flexGrow='1'
    >
      <Flex justify='space-between' mb='10'>
        <Heading size='md'>User Management</Heading>

        <CustomLink to='/portal-user-management/user-management/add-new-user'>
          Add New User
        </CustomLink>
      </Flex>

      {users.isFetching && <TableSkeleton breakpoint='lg' />}

      {data && (
        <>
          <DataTable table={table} breakpoint='lg' alwaysVisibleColumns={[0, 1]} />

          {data.length === 0 && (
            <EmptyState text='There are no users right now.' mt='14' />
          )}
        </>
      )}
    </Stack>
  )
}

export default UserManagement
