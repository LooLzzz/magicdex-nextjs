import { useUserCardsInfiniteQuery } from '@/services/hooks/users'
import { UserCardData } from '@/types/supabase'
import { ActionIcon, Group, Text, Tooltip } from '@mantine/core'
import { useHotkeys, useMediaQuery, usePrevious, useViewportSize } from '@mantine/hooks'
import { IconEraser, IconRefresh } from '@tabler/icons-react'
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
import filtersDef, { ColumnFiltersContext } from './filtersDef'
import useStyles from './styles'


export default function CardsTable({
  onHoveredRowChange
}: {
  onHoveredRowChange?: OnChangeFn<MRT_Row<UserCardData>>
}) {
  const { theme, classes } = useStyles()
  const { height: vheight } = useViewportSize()
  const tableInstanceRef = useRef<MRT_TableInstance<UserCardData>>(null)
  const tableContainerRef = useRef<HTMLDivElement>(null)
  const rowVirtualizerInstanceRef = useRef<MRT_Virtualizer<HTMLDivElement, HTMLTableRowElement>>(null)
  const isLargerThanLg = useMediaQuery('(min-width: 1226px)', false)
  const [expandedRows, setExpandedRows] = useState<MRT_ExpandedState>({})
  const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>([])
  const columnFilterFns = tableInstanceRef.current?.getState().columnFilterFns
  const [globalFilter, setGlobalFilter] = useState(undefined)
  const [sorting, setSorting] = useState<MRT_SortingState>([{
    id: 'price_usd',
    desc: true
  }])
  const { data, isError, isFetching, isLoading, fetchNextPage, refetch, error } = useUserCardsInfiniteQuery({
    queryKeys: {
      columnFilterFns: { ...columnFilterFns, 'tags': 'arrIncludesAll' },
      columnFilters,
      globalFilter,
      pageSize: Math.max(10, Math.floor((vheight - 250) / 60)),
      sorting,
    },
  })
  const prevMetadata = usePrevious(data?.pages?.[0].metadata)
  const { columns, initialColumnSizing, initialColumnVisibility } = useColumnsDef(
    data?.pages?.[0]?.metadata?.allSets || []
  )

  const flatData = useMemo(
    () => data?.pages.flatMap(page => page.data) ?? [],
    [data],
  )
  const prevFlatData = usePrevious(flatData)

  const totalRowCount = data?.pages?.[0]?.metadata?.totalRowCount ?? 0
  const totalFetched = flatData.length

  useHotkeys([
    // close expanded row on Escape
    ['Escape', () => setExpandedRows({})],
  ])

  useEffect(() => {
    if (expandedRows && prevMetadata?.totalRowCount !== data?.pages?.[0]?.metadata?.totalRowCount) {
      const expandedRowIdx = Object.keys(expandedRows)[0]
      if (expandedRowIdx === undefined)
        return

      const prevExpandedCard = prevFlatData?.[Number(expandedRowIdx)]
      const newExpandedCard = flatData?.[Number(expandedRowIdx)]

      if ((!newExpandedCard || !prevExpandedCard) || newExpandedCard.id !== prevExpandedCard.id)
        setExpandedRows({})
    }
  }, [prevMetadata?.totalRowCount, data?.pages, expandedRows, flatData, prevFlatData])

  // scroll to top of table when sorting or filters change
  useEffect(() => {
    rowVirtualizerInstanceRef?.current?.scrollToIndex(0)
  }, [sorting, columnFilters, globalFilter, columnFilterFns])

  const handleScroll = useCallback(
    (containerRefElement?: HTMLDivElement) => {
      if (containerRefElement) {
        const { scrollTop, scrollHeight, clientHeight } = containerRefElement
        // once the user has scrolled within 250px of the bottom of the table, fetch more data if we can
        if (scrollHeight - scrollTop - clientHeight <= 250
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
      <ColumnFiltersContext.Provider value={[columnFilters, setColumnFilters]}>
        <MantineReactTable
          tableInstanceRef={tableInstanceRef}
          rowVirtualizerInstanceRef={rowVirtualizerInstanceRef}
          columns={columns}
          data={flatData}
          initialState={{
            showGlobalFilter: true,
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

          // autoResetExpanded
          // enableColumnOrdering
          // enablePinning
          // enableRowVirtualization  // doesnt work as well i thought it would
          enableColumnFilterModes
          enableColumnResizing
          enableDensityToggle={false}
          enableExpandAll={false}
          enableFullScreenToggle={false}
          enableMultiSort
          enablePagination={false}
          enableStickyHeader
          manualFiltering
          manualSorting

          renderDetailPanel={DetailsPanel}
          renderTopToolbarCustomActions={() => (
            <Group spacing={0}>
              <Tooltip withArrow label='Refresh Data'>
                <ActionIcon onClick={() => refetch()}>
                  <IconRefresh />
                </ActionIcon>
              </Tooltip>
              {
                (globalFilter || columnFilters.length > 0) &&
                <Tooltip withArrow label='Clear all Filters'>
                  <ActionIcon onClick={() => { setColumnFilters([]); setGlobalFilter(undefined) }}>
                    <IconEraser />
                  </ActionIcon>
                </Tooltip>
              }
            </Group>
          )}
          renderBottomToolbarCustomActions={() => (
            <Text>
              Fetched {totalFetched} of {totalRowCount} total cards.
            </Text>
          )}

          rowVirtualizerProps={{ overscan: 8 }}
          mantineTableContainerProps={{
            className: classes.tableContainer,
            ref: tableContainerRef,
            sx: { maxHeight: vheight - 210 ?? 500 },
            onScroll: event => handleScroll(event.target as HTMLDivElement),
          }}
          mantineTableProps={() => ({
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
      </ColumnFiltersContext.Provider>
    </>
  )
}
