import { useUserCardsInfiniteQuery } from '@/services/hooks/users'
import { UserCardData } from '@/types/supabase'
import { ActionIcon, Text, Tooltip } from '@mantine/core'
import { useHotkeys, useMediaQuery } from '@mantine/hooks'
import { IconRefresh } from '@tabler/icons-react'
import { OnChangeFn } from '@tanstack/react-table'
import {
  MRT_ColumnFiltersState,
  MRT_ExpandedState,
  MRT_Row,
  MRT_SortingState,
  MRT_TableInstance,
  MRT_Virtualizer,
  MantineReactTable,
} from 'mantine-react-table'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import DetailsPanel from './DetailsPanel'
import useColumnsDef from './columnsDef'
import filtersDef from './filtersDef'
import useStyles from './styles'


export default function CardsTable({
  onHoveredRowChange
}: {
  onHoveredRowChange?: OnChangeFn<MRT_Row<UserCardData>>
}) {
  const { theme, classes } = useStyles()
  const tableInstanceRef = useRef<MRT_TableInstance<UserCardData>>(null)
  const tableContainerRef = useRef<HTMLDivElement>(null)
  const rowVirtualizerInstanceRef = useRef<MRT_Virtualizer<HTMLDivElement, HTMLTableRowElement>>(null)
  const isLargerThanLg = useMediaQuery('(min-width: 1226px)', false)
  const [expandedRows, setExpandedRows] = useState<MRT_ExpandedState>({})
  const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [sorting, setSorting] = useState<MRT_SortingState>([{
    id: 'price_usd',
    desc: true
  }])
  const { data, isError, isFetching, isLoading, fetchNextPage, refetch, error } = useUserCardsInfiniteQuery({
    queryKeys: {
      columnFilterFns: tableInstanceRef.current?.getState().columnFilterFns,
      columnFilters,
      globalFilter,
      sorting
    },
  })
  const { columns, initialColumnSizing, initialColumnVisibility } = useColumnsDef(
    data?.pages?.[0]?.metadata?.allSets || []
  )

  const flatData = useMemo(
    () => data?.pages.flatMap(page => page.data) ?? [],
    [data],
  )

  const totalRowCount = data?.pages?.[0]?.metadata?.totalRowCount ?? 0
  const totalFetched = flatData.length

  useHotkeys([
    // close expanded row on Escape
    ['Escape', () => tableInstanceRef.current?.setExpanded({})],
  ])

  //scroll to top of table when sorting or filters change
  useEffect(() => {
    rowVirtualizerInstanceRef?.current?.scrollToIndex(0)
  }, [sorting, columnFilters, globalFilter])

  const fetchMoreOnBottomReached = useCallback(
    (containerRefElement?: HTMLDivElement | null) => {
      if (containerRefElement) {
        const { scrollHeight, scrollTop, clientHeight } = containerRefElement
        // once the user has scrolled within 400px of the bottom of the table, fetch more data if we can
        if (scrollHeight - scrollTop - clientHeight < 400
          && !isFetching
          && totalFetched < totalRowCount) {
          fetchNextPage()
        }
      }
    },
    [fetchNextPage, isFetching, totalFetched, totalRowCount],
  )

  return (
    <>
      <MantineReactTable
        tableInstanceRef={tableInstanceRef}
        rowVirtualizerInstanceRef={rowVirtualizerInstanceRef}
        columns={columns}
        data={flatData}
        initialState={{
          // showColumnFilters: true
          columnSizing: initialColumnSizing,
          columnVisibility: initialColumnVisibility,
          density: 'sm',
        }}
        rowCount={totalRowCount}
        state={{
          columnFilters,
          expanded: expandedRows,
          globalFilter,
          isLoading,
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
        enablePagination={false}
        // enableRowVirtualization
        manualFiltering
        manualSorting

        renderDetailPanel={DetailsPanel}
        renderTopToolbarCustomActions={() => (
          <Tooltip withArrow label='Refresh Data'>
            <ActionIcon onClick={() => refetch()}>
              <IconRefresh />
            </ActionIcon>
          </Tooltip>
        )}
        renderBottomToolbarCustomActions={() => (
          <Text ta='right'>
            Fetched {totalFetched} of {totalRowCount} total rows.
          </Text>
        )}

        rowVirtualizerProps={{ overscan: 10 }}
        mantineTableContainerProps={{
          className: classes.tableContainer,
          ref: tableContainerRef,
          sx: { maxHeight: '500px' },
          onScroll: event => fetchMoreOnBottomReached(event.target as HTMLDivElement),
        }}
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
            alignItems: 'center',
            backgroundColor: (
              theme.colorScheme === 'dark'
                ? theme.colors.dark[6]
                : theme.colors.gray[2]
            ),
          }
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
    </>
  )
}
