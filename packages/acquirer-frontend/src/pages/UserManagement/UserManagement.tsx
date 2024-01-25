import { useMemo, useState } from 'react'
import { createColumnHelper } from '@tanstack/react-table'
import { CheckCircleIcon, NotAllowedIcon, WarningIcon } from '@chakra-ui/icons'
import { Box, Flex, Heading, Stack, Text, Tooltip } from '@chakra-ui/react'
import { PortalUserStatus } from 'shared-lib'

import type { User } from '@/types/users'
import { useUsers, useUserStatusUpdate } from '@/api/hooks/users'
import { useTable } from '@/hooks'
import {
  AlertDialog,
  CustomButton,
  CustomLink,
  DataTable,
  EmptyState,
  TableSkeleton,
} from '@/components/ui'

const UserManagement = () => {
  const { mutate: updateUserStatus } = useUserStatusUpdate()
  const [isOpenBlockModal, setIsOpenBlockModal] = useState(false)
  const [isOpenDisableModal, setIsOpenDisableModal] = useState(false)
  const [isOpenActivateModal, setIsOpenActivateModal] = useState(false)

  const [selectedUser, setSelectedUser] = useState<User | null>(null)

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
      columnHelper.accessor('dfsp', {
        cell: info => info.getValue(),
        header: 'DFSP',
      }),
      columnHelper.accessor('status', {
        cell: info => {
          const status = info.getValue()
          let statusIcon
          switch (status) {
            case PortalUserStatus.ACTIVE:
              statusIcon = <CheckCircleIcon color='green.500' />
              break
            case PortalUserStatus.UNVERIFIED:
              statusIcon = <WarningIcon color='yellow.500' />
              break
            case PortalUserStatus.RESETPASSWORD:
              statusIcon = <WarningIcon color='yellow.500' />
              break
            case PortalUserStatus.DISABLED:
              statusIcon = <WarningIcon color='yellow.500' />
              break
            case PortalUserStatus.BLOCKED:
              statusIcon = <NotAllowedIcon color='red.500' />
              break
            default:
              statusIcon = null
          }
          return (
            <Flex alignItems='center' justifyContent='center'>
              {statusIcon}
              <Text ml={2}>{status}</Text>
            </Flex>
          )
        },
        header: 'Status',
      }),
      columnHelper.display({
        id: 'action',
        header: 'Action',
        cell: info => {
          const status = info.row.original.status
          const user = info.row.original

          const BlockButton = () => {
            return (
              <Tooltip label='Non-reversible Permanently Block. ' hasArrow>
                <CustomButton
                  colorVariant='danger'
                  onClick={() => {
                    setIsOpenBlockModal(true)
                    setSelectedUser(user)
                  }}
                  mx='2'
                >
                  Block
                </CustomButton>
              </Tooltip>
            )
          }

          const DisableButton = () => {
            return (
              <Tooltip label='Temporary Disable' hasArrow>
                <CustomButton
                  colorVariant='accent-outline'
                  onClick={() => {
                    setIsOpenDisableModal(true)
                    setSelectedUser(user)
                  }}
                  mx='2'
                >
                  Disable
                </CustomButton>
              </Tooltip>
            )
          }

          const ActivateButton = () => {
            return (
              <Tooltip label='Activate' hasArrow>
                <CustomButton
                  colorVariant='info'
                  onClick={() => {
                    setIsOpenActivateModal(true)
                    setSelectedUser(user)
                  }}
                  mx='2'
                >
                  Activate
                </CustomButton>
              </Tooltip>
            )
          }

          let actionButtons
          if (status === PortalUserStatus.ACTIVE) {
            actionButtons = (
              <>
                <DisableButton />
                <BlockButton />
              </>
            )
          } else if (status === PortalUserStatus.DISABLED) {
            actionButtons = (
              <>
                <ActivateButton />
                <BlockButton />
              </>
            )
          } else {
            actionButtons = <></> // No buttons for any other status
          }

          return <Box>{actionButtons}</Box>
        },
      }),
    ]
  }, [])

  const users = useUsers()
  let data

  if (users.isSuccess && !users.isFetching) {
    data = users.data.map(({ id, name, email, role, status, dfsp }) => ({
      no: id,
      name,
      email,
      status,
      role: role.description,
      dfsp: dfsp?.name || 'N/A',
    }))
  }

  const table = useTable({
    data: data || [],
    columns,
    pagination: {
      pageIndex: 0,
      pageSize: 100,
    },
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
          <DataTable hidePagination={true} table={table} breakpoint='lg' alwaysVisibleColumns={[0, 1]} />

          {data.length === 0 && (
            <EmptyState text='There are no users right now.' mt='14' />
          )}
        </>
      )}

      {/* Disable User Modal */}
      <AlertDialog
        alertText={`Disable User ${selectedUser?.email}?`}
        isOpen={isOpenDisableModal}
        onClose={() => setIsOpenDisableModal(false)}
        onConfirm={() => {
          updateUserStatus({
            userId: selectedUser?.no ?? 0,
            newStatus: PortalUserStatus.DISABLED,
          })
          setIsOpenDisableModal(false)
        }}
      />

      {/* Block User Modal*/}
      <AlertDialog
        alertText={`Permanently Block User ${selectedUser?.email}?`}
        isOpen={isOpenBlockModal}
        onClose={() => setIsOpenBlockModal(false)}
        onConfirm={() => {
          updateUserStatus({
            userId: selectedUser?.no ?? 0,
            newStatus: PortalUserStatus.BLOCKED,
          })
          setIsOpenBlockModal(false)
        }}
      />

      {/* Activate User Modal*/}
      <AlertDialog
        alertText={`Activate User ${selectedUser?.email}?`}
        isOpen={isOpenActivateModal}
        onClose={() => setIsOpenActivateModal(false)}
        onConfirm={() => {
          updateUserStatus({
            userId: selectedUser?.no ?? 0,
            newStatus: PortalUserStatus.ACTIVE,
          })
          setIsOpenActivateModal(false)
        }}
      />
    </Stack>
  )
}

export default UserManagement
