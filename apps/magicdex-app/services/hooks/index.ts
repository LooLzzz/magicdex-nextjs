import { CardData } from '@/types'
import useSWR, { SWRConfiguration } from 'swr'


export function useUserCards(options: SWRConfiguration = {}) {
  const {
    data,
    error,
    isLoading,
    mutate
  } = useSWR('/api/me/cards', options)

  return {
    cards: data as CardData[],
    isLoading,
    error: error as Error,
    mutate,
  }
}
