import { useUserCardsQuery } from '@/services/hooks'
import { UserCardData } from '@/types/supabase'
import { ActionIcon, Tooltip, useMantineTheme } from '@mantine/core'
import { useHotkeys, useMediaQuery } from '@mantine/hooks'
import { IconRefresh } from '@tabler/icons-react'
import { OnChangeFn } from '@tanstack/react-table'
import {
  MRT_ColumnFiltersState,
  MRT_ExpandedState,
  MRT_PaginationState,
  MRT_Row,
  MRT_SortingState,
  MRT_TableInstance,
  MantineReactTable
} from 'mantine-react-table'
import { useRef, useState } from 'react'
import DetailsPanel from './DetailsPanel'
import useColumnsDef from './columnsDef'
import filtersDef from './filtersDef'


export default function CardsTable({
  onHoveredRowChange
}: {
  onHoveredRowChange?: OnChangeFn<MRT_Row<UserCardData>>
}) {
  const theme = useMantineTheme()
  const tableInstanceRef = useRef<MRT_TableInstance<UserCardData>>(null)
  const isLargerThanLg = useMediaQuery('(min-width: 1226px)', false)
  const [expandedRows, setExpandedRows] = useState<MRT_ExpandedState>({})
  const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [sorting, setSorting] = useState<MRT_SortingState>([{
    id: 'price_usd',
    desc: true
  }])
  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 15,
  })
  const { data, isError, isFetching, isLoading, refetch, error } = useUserCardsQuery({
    queryKeys: {
      columnFilterFns: tableInstanceRef.current?.getState().columnFilterFns,
      columnFilters,
      globalFilter,
      pagination,
      sorting
    },
  })
  const { columns, initialColumnSizing, initialColumnVisibility } = useColumnsDef(data?.metadata?.allSets || [])

  useHotkeys([
    // close expanded row on Escape
    ['Escape', () => tableInstanceRef.current?.setExpanded({})],
  ])

  return (
    <MantineReactTable
      tableInstanceRef={tableInstanceRef}
      columns={columns}
      data={data?.data ?? []}
      initialState={{
        // showColumnFilters: true
        columnSizing: initialColumnSizing,
        columnVisibility: initialColumnVisibility,
        density: 'sm',
      }}
      rowCount={data?.metadata?.totalRowCount ?? 0}
      state={{
        columnFilters,
        expanded: expandedRows,
        globalFilter,
        isLoading,
        pagination,
        showAlertBanner: isError,
        showProgressBars: isFetching,
        sorting,
      }}

      filterFns={filtersDef.filterFns}
      localization={filtersDef.localization as unknown}

      // enableEditing
      // editingMode='row'

      // enableColumnOrdering
      // enablePinning
      autoResetExpanded
      enableColumnFilterModes
      enableColumnResizing
      enableDensityToggle={false}
      enableExpandAll={false}
      enableFullScreenToggle={false}
      enableMultiSort
      manualFiltering
      manualPagination
      manualSorting

      renderDetailPanel={DetailsPanel}
      renderTopToolbarCustomActions={() => (
        <Tooltip withArrow label='Refresh Data'>
          <ActionIcon onClick={() => refetch()}>
            <IconRefresh />
          </ActionIcon>
        </Tooltip>
      )}

      mantineTableProps={({ table }) => ({
        sx: {
          // hide 'Edit' & 'Expand' labels (first 2 columns)
          '& th:nth-of-type(-n+1)': {
            '& :last-child': {
              display: 'none',
            },
          },
        },
      })}
      mantineTableHeadCellProps={{
        sx: {
          backgroundColor: (
            theme.colorScheme === 'dark'
              ? theme.colors.dark[6]
              : theme.colors.gray[2]
          ),
        }
      }}
      mantineTopToolbarProps={{
        sx: {
          backgroundColor: (
            theme.colorScheme === 'dark'
              ? theme.colors.dark[6]
              : theme.colors.gray[2]
          ),
        }
      }}
      mantineBottomToolbarProps={{
        sx: {
          backgroundColor: (
            theme.colorScheme === 'dark'
              ? theme.colors.dark[6]
              : theme.colors.gray[2]
          ),
        }
      }}
      mantinePaginationProps={{
        rowsPerPageOptions: ['5', '10', '25', '50', '100'],
      }}
      mantineTableBodyRowProps={({ table, row }) => ({
        style: { cursor: 'pointer' },
        onMouseEnter: () => isLargerThanLg && onHoveredRowChange?.(row),
        onClick: () => table.setExpanded({ [row.id]: !table.getState().expanded[row.id] }),
      })}
      mantineDetailPanelProps={{
        style: { cursor: 'default' },
        onClick: e => { e.stopPropagation() },
      }}
      mantineToolbarAlertBannerProps={
        isError
          ? {
            color: 'error',
            children: `Error loading data: ${error}`,
          }
          : undefined
      }

      onColumnFiltersChange={updater => {
        setColumnFilters(
          (
            typeof updater === 'function'
              ? updater(columnFilters)
              : updater
          ).filter(item =>
            Array.isArray(item?.value)
              ? item?.value.length > 0
              : item.value !== undefined && item.value !== null && item.value !== ''
          )
        )
      }}
      onGlobalFilterChange={setGlobalFilter}
      onPaginationChange={setPagination}
      onSortingChange={setSorting}
      // onHoveredRowChange={onHoveredRowChange}
      onExpandedChange={expandedUpdater => {
        if (typeof expandedUpdater === 'boolean' || typeof expandedUpdater === 'object') {
          // expand/close all
          setExpandedRows(expandedUpdater)
        } else {
          // single row expand/close
          // keep only a single row open at a time
          const expandedUpdaterResult = expandedUpdater(expandedRows)
          if (Object.keys(expandedUpdaterResult).length > 1) {
            const diff = Object.keys(expandedUpdaterResult).filter(key => !Object.keys(expandedRows).includes(key))
            setExpandedRows({ [diff[0]]: true })
          } else {
            setExpandedRows(expandedUpdaterResult)
          }
        }
      }}
    />
  )
}
