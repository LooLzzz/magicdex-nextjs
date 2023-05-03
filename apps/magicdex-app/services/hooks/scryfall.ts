import { ScryfallCardData } from '@/types/scryfall'
import { UseQueryOptions, useQuery } from '@tanstack/react-query'
import axios from 'axios'

export type ScryfallAutocompleteReturnType = { data: string[], metadata: { total_values: number } }
export type ScryfallCardPrintsReturnType = { data: ScryfallCardData[], metadata: { total_cards: number } }


/**
 * recursively fetches all pages of a scryfall query
 */
async function _fetchAllPages({ data, has_more, next_page }: {
  data: ScryfallCardData[],
  has_more: boolean,
  next_page: string,
}): Promise<ScryfallCardData[]> {
  if (!has_more)
    return data

  const { data: nextData } = await axios.get(next_page)
  return await _fetchAllPages({
    ...nextData,
    data: [...data, ...nextData.data],
  })
}

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
      } = await axios.get('https://api.scryfall.com/cards/autocomplete', {
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
      enabled: typeof query === 'string' && query.length > 0,
      ...options
    }
  )
}

export function useScryfallCardPrintsQuery(
  params: {
    collector_number?: string,
    lang?: string,
    name?: string,
    order?: '' | 'name' | 'released' | 'set',
    set?: string,
    unique?: '' | 'prints' | 'art' | 'cards',
  } = {},
  options: Omit<UseQueryOptions<ScryfallCardPrintsReturnType>, 'queryKey' | 'queryFn' | 'initialData'> = {},
) {
  const {
    collector_number,
    lang,
    name,
    order = 'released',
    set,
    unique = 'prints',
  } = params

  return useQuery<ScryfallCardPrintsReturnType>(
    ['scryfall', 'card-prints', name, set, collector_number, unique, order, lang],
    async () => {
      const { data }: {
        data: {
          data: ScryfallCardData[],
          total_cards: number,
          has_more: boolean,
          next_page: string,
        }
      } = await axios.get('https://api.scryfall.com/cards/search', {
        params: {
          q: [
            name ? `!"${name}"` : null,
            lang ? `lang:"${lang}"` : null,
            set ? `set:"${set}"` : null,
            collector_number ? `cn:"${collector_number}"` : null,
            'game:"paper"',
          ].filter(Boolean).join(' '),
          unique,
          order,
        },
      })

      return {
        data: await _fetchAllPages(data),
        metadata: {
          total_cards: data.total_cards,
        },
      } as undefined
    },
    {
      enabled: name?.length > 0 || set?.length > 0 || collector_number?.length > 0,
      ...options
    }
  )
}
