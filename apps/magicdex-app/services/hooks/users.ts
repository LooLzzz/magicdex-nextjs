import { apiRoutes } from '@/routes'
import { UserCardData } from '@/types/supabase'
import { useQuery } from '@tanstack/react-query'
import axios, { AxiosError } from 'axios'


const fieldNameMap = {
  mana_cost: 'cmc',
  set: 'set_name',
}

const fieldTypeMap = {
  amount: (value: string) => Number(value),
}

export function useUserCardsQuery({
  queryKeys: {
    columnFilterFns,
    columnFilters,
    globalFilter,
    pagination: { pageIndex, pageSize },
    sorting,
    ...restQueryKeys
  }
}) {
  return useQuery<{
    data: UserCardData[],
    metadata: {
      totalRowCount: number,
      allSets: { set_name: string, set_id: string, released_at: Date }[],
    }
  }>({
    keepPreviousData: true,
    refetchOnWindowFocus: false,
    queryKey: [
      'user-card-data',
      columnFilterFns,
      columnFilters,
      globalFilter,
      pageIndex,
      pageSize,
      sorting,
      ...Object.values(restQueryKeys)
    ],
    queryFn: async () => {
      const fetchURL = new URL(apiRoutes.userCards, window.location.origin)
      fetchURL.searchParams.set('pagination', JSON.stringify({
        // 'from->to' inclusive
        from: pageIndex * pageSize,
        to: ((pageIndex + 1) * pageSize) - 1,
      }))
      fetchURL.searchParams.set('globalFilter', globalFilter ?? '')
      fetchURL.searchParams.set('filters', JSON.stringify(
        columnFilters?.reduce((agg, field) => ({
          ...agg,
          [fieldNameMap[field.id] ?? field.id]: {
            value: fieldTypeMap[field.id] ? fieldTypeMap[field.id](field.value) : field.value,
            operator: columnFilterFns[field.id],
          },
        }), {}
        ) ?? {})
      )
      fetchURL.searchParams.set('sort', JSON.stringify(
        sorting?.map(field => ({
          id: fieldNameMap[field.id] ?? field.id,
          desc: field.desc,
        })) ?? []
      ))

      try {
        const { data } = await axios.get(fetchURL.href)
        return data
      } catch (error) {
        const axiosError = error as AxiosError
        const errorMessage = axiosError.response?.data['message'] ?? axiosError.message
        throw new Error(`HTTP status code: ${axiosError.response?.status}, message: ${errorMessage}`)
      }
    },
  })
}