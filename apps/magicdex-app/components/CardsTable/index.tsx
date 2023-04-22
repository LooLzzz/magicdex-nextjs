import { apiRoutes } from '@/routes'
import { UserCardData } from '@/types/supabase'
import { ActionIcon, Grid, JsonInput, Tooltip } from '@mantine/core'
import { IconRefresh } from '@tabler/icons-react'
import { useQuery } from '@tanstack/react-query'
import axios, { AxiosError } from 'axios'
import {
  MantineReactTable,
  MRT_ColumnFiltersState,
  MRT_ExpandedState,
  MRT_PaginationState,
  MRT_SortingState,
  MRT_TableInstance
} from 'mantine-react-table'
import Image from 'next/image'
import { useRef, useState } from 'react'
import { cardbackSmallBase64 } from './cardbackBase64'
import filtersDefinition from './filtersDefinitions'
import { useColumnsDef } from './tableDefinitions'


const fieldNameMap = {
  mana_cost: 'cmc',
  set: 'set_name',
}

const fieldTypeMap = {
  amount: (value: string) => Number(value),
}

export default function CardsTable() {
  const tableInstanceRef = useRef<MRT_TableInstance<UserCardData>>(null)
  const [expandedRows, setExpandedRows] = useState<MRT_ExpandedState>({})
  const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [sorting, setSorting] = useState<MRT_SortingState>([{
    // id: 'name',
    id: 'prices->usd',
    desc: true
  }])
  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 15,
  })
  const { data, isError, isFetching, isLoading, refetch, error } =
    useQuery<{ data: UserCardData[], metadata: { totalRowCount: number, allSets: string[] } }>({
      keepPreviousData: true,
      refetchOnWindowFocus: false,
      queryKey: [
        'user-cards-table',
        columnFilters, //refetch when columnFilters changes
        globalFilter, //refetch when globalFilter changes
        pagination.pageIndex, //refetch when pagination.pageIndex changes
        pagination.pageSize, //refetch when pagination.pageSize changes
        sorting, //refetch when sorting changes
      ],
      queryFn: async () => {
        const fetchURL = new URL(apiRoutes.userCards, window.location.origin)
        fetchURL.searchParams.set('pagination', JSON.stringify({
          // 'from->to' inclusive
          from: pagination.pageIndex * pagination.pageSize,
          to: ((pagination.pageIndex + 1) * pagination.pageSize) - 1,
        }))
        fetchURL.searchParams.set('globalFilter', globalFilter ?? '')
        fetchURL.searchParams.set('filters', JSON.stringify(
          columnFilters?.reduce((agg, field) => ({
            ...agg,
            [fieldNameMap[field.id] ?? field.id]: {
              value: fieldTypeMap[field.id] ? fieldTypeMap[field.id](field.value) : field.value,
              operator: tableInstanceRef.current?.getState().columnFilterFns[field.id],
            },
          }), {}
          ) ?? {})
        )
        fetchURL.searchParams.set('sort', JSON.stringify(sorting ?? []))

        try {
          const { data } = await axios.get(fetchURL.href)
          return data // data: { data: object[], meta: object }
        } catch (error) {
          const axiosError = error as AxiosError
          const errorMessage = axiosError.response?.data['message'] ?? axiosError.message
          throw new Error(`HTTP status code: ${axiosError.response?.status}, message: ${errorMessage}`)
        }
      },
    })
  const columns = useColumnsDef(data?.metadata?.allSets || [])

  return (
    <MantineReactTable
      tableInstanceRef={tableInstanceRef}
      columns={columns}
      data={data?.data ?? []}
      initialState={{
        // showColumnFilters: true
        density: 'sm',
        columnVisibility: {
          rarity: false,
          color_identity: false,
        },
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
      mantineTableProps={{
        sx: {
          // hide 'Expand' label
          '& th:first-of-type': {
            '& :last-child': {
              display: 'none',
            },
          },
        },
      }}

      filterFns={filtersDefinition.filterFns}
      localization={filtersDefinition.localization as unknown}

      manualFiltering
      manualPagination
      manualSorting
      enableColumnFilterModes
      enableColumnResizing
      autoResetExpanded
      enableMultiSort
      // enableEditing
      enableColumnOrdering
      enableDensityToggle={false}

      renderTopToolbarCustomActions={() => (
        <Tooltip withArrow label="Refresh Data">
          <ActionIcon onClick={() => refetch()}>
            <IconRefresh />
          </ActionIcon>
        </Tooltip>
      )}

      mantineToolbarAlertBannerProps={
        isError
          ? {
            color: 'error',
            children: `Error loading data: ${error}`,
          }
          : undefined
      }

      onColumnFiltersChange={setColumnFilters}
      onGlobalFilterChange={setGlobalFilter}
      onPaginationChange={setPagination}
      onSortingChange={setSorting}
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

      renderDetailPanel={cell => (
        <Grid columns={2}>
          <Grid.Col span='content' sx={{ textAlign: 'center' }}>
            <Image
              src={cell.row.original.image_uris?.png}
              alt={cell.row.original.name}
              placeholder='blur'
              blurDataURL={cardbackSmallBase64}
              width={256}
              height={357}
            />
          </Grid.Col>
          <Grid.Col md={2} lg={1}>
            <JsonInput
              formatOnBlur
              minRows={20}
              defaultValue={JSON.stringify(cell.row.original)}
            />
          </Grid.Col>
        </Grid>
      )}
    />
  )
}
