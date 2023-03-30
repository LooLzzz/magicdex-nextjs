import { apiRoutes } from '@/routes'
import { CardData } from '@/types/firestore'
import { appendUrlParams } from '@/utils'
import useSWR, { SWRConfiguration } from 'swr'


export function useUserCards({
  swrConfig = {},
  populateScryfallData = false,
}: {
  swrConfig?: SWRConfiguration
  populateScryfallData?: boolean
} = {}) {
  const { data, error, isLoading, mutate } = useSWR(
    appendUrlParams(
      apiRoutes.userCards,
      { 'populateScryfallData': String(populateScryfallData) }
    ),
    {
      fallbackData: { data: [], missing: [] },
      ...swrConfig
    }
  )

  // TODO: how should 'missingCards' be handled?
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { data: cardsData, missing: missingCards } = data

  return {
    cards: cardsData as CardData[],
    isLoading,
    error: error as Error,
    mutate,
  }
}
