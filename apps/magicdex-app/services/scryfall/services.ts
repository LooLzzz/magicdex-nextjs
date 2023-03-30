import { ScryfallCardData } from '@/types/scryfall'
import { splitArrayToChunks } from '@/utils'
import apiRoutes from './apiRoutes'


/**
 * Barebone implementation of Scryfall's `POST /cards/collection` endpoint.
 */
export async function scryfallCardsCollectionEndpoint([...ids]) {
  const resp = await fetch(
    apiRoutes.cards.collection,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifiers: ids.map(id => ({ id })),
      }),
    }
  )
  return await resp.json() as {
    data: ScryfallCardData[],
    not_found: string[]
  }
}

/**
 * Works around Scryfall's 75 cards per request limit for `POST /cards/collection` endpoint.
 * Splits the array of ids into chunks of `chunkMaxSize` items per chunk (defaults to 75 obviously) and fetches them in parallel.
 */
export async function fetchCardsDataByIds([...ids], chunkMaxSize = 75) {
  return await splitArrayToChunks(ids, chunkMaxSize).reduce(
    async (accPromise, chunk) => {
      const acc = await accPromise
      const chunkResp = await scryfallCardsCollectionEndpoint(chunk)
      acc.newCardsData = [...acc.newCardsData, ...chunkResp.data]
      acc.notFoundCards = [...acc.notFoundCards, ...chunkResp.not_found]
      return acc
    },
    Promise.resolve({
      newCardsData: [] as ScryfallCardData[],
      notFoundCards: [] as string[]
    })
  )
}
