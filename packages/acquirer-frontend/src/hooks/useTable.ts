import { useState } from 'react'
import {
  type ColumnDef,
  type PaginationState,
  type SortingState,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type OnChangeFn,
} from '@tanstack/react-table'

interface UseTableProps<T> {
  data: T[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns: ColumnDef<T, any>[]
  pagination: PaginationState
  setPagination: OnChangeFn<PaginationState>
}

export default function useTable<T>({
  data,
  columns,
  pagination,
  setPagination,
}: UseTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [rowSelection, setRowSelection] = useState({})

  return useReactTable({
    data,
    columns,
    state: {
      pagination,
      sorting,
      rowSelection,
    },
    enableRowSelection: true,
    manualPagination: true,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })
}
