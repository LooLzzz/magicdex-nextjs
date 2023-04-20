// import { apiRoutes } from '@/routes'
// // import { CardDocumentData } from '@/types/firestore'
// import useSWR, { SWRConfiguration } from 'swr'


// export function useUserCards({
//   swrConfig = {},
// }: {
//   swrConfig?: SWRConfiguration
//   populateScryfallData?: boolean
// } = {}) {
//   const { data, error, isLoading, mutate } = useSWR(
//     apiRoutes.userCards,
//     {
//       fallbackData: { data: [], missing: [] },
//       ...swrConfig
//     }
//   )

//   const { data: cardsData } = data

//   return {
//     cards: cardsData as CardDocumentData[],
//     isLoading,
//     error: error as Error,
//     mutate,
//   }
// }

export {

}
