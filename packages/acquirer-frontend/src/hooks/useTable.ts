import { useState } from 'react'
import {
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type OnChangeFn,
  type PaginationState,
  type SortingState,
  type TableOptions,
} from '@tanstack/react-table'

interface UseTableProps<T> {
  data: T[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns: ColumnDef<T, any>[]
  pagination?: PaginationState
  setPagination?: OnChangeFn<PaginationState>
}

export default function useTable<T>({
  data,
  columns,
  pagination,
  setPagination,
}: UseTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [rowSelection, setRowSelection] = useState({})

  const tableOptions: TableOptions<T> = {
    data,
    columns,
    state: {
      sorting,
      rowSelection,
    },
    enableRowSelection: true,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  }

  if (pagination) {
    tableOptions.state = {
      ...tableOptions.state,
      pagination,
    }
    tableOptions.manualPagination = true
    tableOptions.onPaginationChange = setPagination
  } else {
    tableOptions.getPaginationRowModel = getPaginationRowModel()
  }

  return useReactTable(tableOptions)
}
