import { scryfallApiRoutes, scryfallSearch } from '@/services/scryfall'
import { ScryfallCardData } from '@/types/scryfall'
import { UseQueryOptions, useQueries, useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { useCallback, useMemo } from 'react'

export type ScryfallAutocompleteReturnType = { data: string[], metadata: { total_values: number } }
export type ScryfallCardPrintsReturnType = { data: ScryfallCardData[], metadata: { total_cards: number } }


export function useScryfallAutocompleteQuery(
  query: string,
  options: Omit<UseQueryOptions<ScryfallAutocompleteReturnType>, 'queryKey' | 'queryFn' | 'initialData'> = {}
) {
  return useQuery<ScryfallAutocompleteReturnType>(
    ['scryfall', 'autocomplete', query],
    async () => {
      const { data }: {
        data: {
          data: string[],
          total_values: number,
          object: string,
        }
      } = await axios.get(scryfallApiRoutes.cards.autocomplete, {
        params: {
          q: query
        }
      })

      return {
        data: data.data,
        metadata: {
          total_values: data.total_values,
        },
      } as undefined
    },
    {
      enabled: typeof query === 'string' && query.length > 1,
      refetchOnWindowFocus: false,
      ...options
    }
  )
}

export function useScryfallCardPrintsQuery(
  params: {
    collector_number?: string,
    lang?: string,
    name?: string,
    foil?: boolean,
    order?: '' | 'name' | 'released' | 'set',
    set?: string,
    unique?: '' | 'prints' | 'art' | 'cards',
    exact?: boolean
    fetchAllPages?: boolean,
  } = {},
  options: Omit<UseQueryOptions<ScryfallCardPrintsReturnType>, 'queryFn' | 'initialData'> = {},
) {
  const { queryKey = [], ...restOptions } = options
  const {
    collector_number: cn,
    lang,
    name,
    set,
    foil,
    order = 'released',
    unique = 'prints',
    exact = true,
    fetchAllPages = true,
  } = params

  return useQuery<ScryfallCardPrintsReturnType>(
    ['scryfall', 'search', name, set, cn, unique, order, lang, foil, exact, fetchAllPages, ...queryKey],
    async () => await scryfallSearch(
      { name, set, collector_number: cn, lang, foil },
      { order, unique, exact, fetchAllPages }
    ),
    {
      enabled: !!name || !!set || !!cn,
      refetchOnWindowFocus: false,
      ...restOptions
    }
  )
}

export function useScryfallBulkQuery(
  params: {
    collector_number?: string,
    lang?: string,
    name?: string,
    foil?: boolean,
    order?: '' | 'name' | 'released' | 'set',
    set?: string,
    unique?: '' | 'prints' | 'art' | 'cards',
    fetchAllPages?: boolean,
  }[] = [],
  options: Omit<UseQueryOptions<ScryfallCardData[]>, 'queryFn' | 'initialData'> = {},
) {
  const { queryKey = [], ...restOptions } = options
  const exact = true

  const queries = useQueries({
    queries: params.map(({
      collector_number: cn,
      lang,
      name,
      set,
      foil,
      order = 'released',
      unique = 'prints',
      fetchAllPages = true,
    }, i) => ({
      queryKey: ['scryfall', 'search', name, set, cn, unique, order, lang, foil, exact, fetchAllPages, ...queryKey],
      queryFn: async () => {
        const { data } = await scryfallSearch(
          { name, set, collector_number: cn, lang, foil },
          { order, unique, exact, fetchAllPages }
        )
        return data?.[0] ?? null
      },
      enabled: !!name || !!set || !!cn,
      refetchOnWindowFocus: false,
      ...restOptions,
    }))
  })

  const flatData = useMemo(() => queries.flatMap(({ data }) => data), [queries])
  const isLoading = useMemo(() => queries.some(({ isLoading }) => isLoading), [queries])
  const isError = useMemo(() => queries.some(({ isError }) => isError), [queries])
  const error = useMemo(() => queries.flatMap(({ error }) => error), [queries])
  const isSuccess = useMemo(() => queries.every(({ isSuccess }) => isSuccess), [queries])
  const refetchAll = useCallback(() => queries.forEach(({ refetch }) => refetch()), [queries])

  return {
    queries, flatData, isLoading, isError, error, isSuccess, refetchAll,
  }
}
