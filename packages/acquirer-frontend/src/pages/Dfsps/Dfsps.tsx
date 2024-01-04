import { useMemo, useState } from 'react';
import { createColumnHelper, type PaginationState } from '@tanstack/react-table';
import { Box, Flex, HStack, Heading, Stack, useDisclosure } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import dayjs from 'dayjs';
import { AuditActionType } from 'shared-lib';

import type { DfspType } from '@/types/dfsp';
import { useDfsps } from '@/api/hooks/dfsps';
import { useTable } from '@/hooks';
import { CustomButton, DataTable, EmptyState, TableSkeleton } from '@/components/ui';
import { FormSelect } from '@/components/form';
import FilterFormSkeleton from './FilterFormSkeleton';


const Dfsps = () => {
    const { isOpen, onOpen, onClose } = useDisclosure();

    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });

    const columns = useMemo(() => {
        const columnHelper = createColumnHelper<DfspType>();

        return [
            columnHelper.display({
                id: 'no',
                header: 'No',
                cell: (props) => <span>{props.row.index + 1}</span>,
            }),
            columnHelper.accessor('dfspId', {
                cell: info => info.getValue(),
                header: 'DFSP ID',
            }),
            columnHelper.accessor('dfspName', {
                cell: info => info.getValue(),
                header: 'DFSP Name',
            }),
            columnHelper.accessor('businessLicenseId', {
                cell: info => info.getValue(),
                header: 'Business License ID',
            }),
            columnHelper.accessor('whetherMojaloopMerchantAcquiringPortalIsUsed', {
                cell: info => (info.getValue() ? 'Yes' : 'No'),
                header: 'whether Mojaloop Merchant Acquiring Portal is used',
            }),
        ];
    }, []);


    const dfsps = useDfsps({

        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
    });

    const table = useTable({
        data: dfsps.data?.data || [],
        columns,
        pagination,
        setPagination,
    });

    const onSubmit = () => {
        dfsps.refetch();
    };

    return (
        <Stack minH='full' px={{ base: '4', sm: '6', lg: '8' }} pt='0' pb='14'>
            <Box
                bg='primaryBackground'
                mx={{ base: '-4', sm: '-6', lg: '-8' }}
                mt='5'
                pt='0'
                px='4'
                pb='14'
                flexGrow='1'
                mb='-14'
            >

                <Heading size='md' mb='10'>
                    DFSP List
                </Heading>
                {dfsps.isFetching && (
                    <TableSkeleton breakpoint='xl' mt={{ base: '3', xl: '4' }} />
                )}


                <DataTable
                    table={table}
                    totalPages={dfsps.data?.totalPages || 0}
                    breakpoint='xl'
                    alwaysVisibleColumns={[0]}

                    showHeader={!dfsps.isLoading}
                />

                {/* Show "No DFSPs" message */}
                {!dfsps.isLoading && dfsps.data?.data.length === 0 && (
                    <EmptyState text='There are no DFSPs.' mt='10' />
                )}

                {/* Show TableSkeleton while fetching data */}
                {dfsps.isLoading && (
                    <TableSkeleton breakpoint='xl' mt={{ base: '3', xl: '4' }} />
                )}
            </Box>
        </Stack>
    );
};

export default Dfsps;
