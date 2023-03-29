import { apiRoutes } from '@/routes'
import { CardData } from '@/types'
import useSWR, { SWRConfiguration } from 'swr'


export function useUserCards(options: SWRConfiguration = {}) {
  const {
    data,
    error,
    isLoading,
    mutate
  } = useSWR(apiRoutes.userCards, options)

  return {
    cards: data as CardData[],
    isLoading,
    error: error as Error,
    mutate,
  }
}
