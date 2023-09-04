import { createColumnHelper } from '@tanstack/react-table'
import { Checkbox, Heading, Stack } from '@chakra-ui/react'
import camelCase from 'lodash.camelcase'

import { useRoles } from '@/api/hooks/roles'
import { DataTable } from '@/components/ui'

const RoleManagement = () => {
  const roles = useRoles()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const columnHelper = createColumnHelper<any>()

  const columns = [
    columnHelper.accessor('action', {
      cell: info => info.getValue(),
      header: 'Action',
    }),
  ]

  if (roles.isLoading || roles.isError) return <p>Loading...</p>

  roles.data.data.forEach(role =>
    columns.push(
      columnHelper.accessor(camelCase(role.name), {
        cell: info => <Checkbox isChecked={info.getValue()} />,
        header: role.name,
      })
    )
  )

  const data = roles.data.permissions.map(permission => {
    const permissionObj: Record<string, boolean> = {}
    roles.data.data.forEach(role => {
      permissionObj[camelCase(role.name)] = role.permissions.includes(permission)
    })

    return {
      action: permission,
      ...permissionObj,
    }
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
      <Heading size='md' mb='10'>
        Role Management
      </Heading>

      {!roles.isLoading && !roles.isFetching && !roles.isError && (
        <DataTable
          columns={columns}
          data={data}
          breakpoint='md'
          alwaysVisibleColumns={[0]}
        />
      )}
    </Stack>
  )
}

export default RoleManagement
