import { ScryfallCardData } from '@/types/scryfall'
import scryfallCache from './cache'
import { fetchCardsDataByIds } from './services'


/**
 * Works around Scryfall's 75 cards per request limit for `POST /cards/collection` endpoint.
 * As well as caching cards data server-side for future incoming requests.
 */
async function getCardsDataByIds([...ids]: string[]) {
  // get cache hits
  const { hits, misses } = scryfallCache.getHitMiss(ids)

  // fetch missing cards
  const { newCardsData, notFoundCards } = await fetchCardsDataByIds(misses)

  // set cache for new cards
  newCardsData.map(card =>
    scryfallCache.set(card.id, card)
  )
  notFoundCards.map(cardId =>
    scryfallCache.set(cardId, {})
  )

  // split 'not_found' cards (empty objects) from 'hits'
  const { data, missing } = Object.entries(hits).reduce(
    (acc, [id, card]) => {
      if (Object.keys(card).length === 0)
        acc.missing.push(id)
      else
        acc.data.push(card)
      return acc
    }, {
    data: newCardsData as ScryfallCardData[],
    missing: notFoundCards as string[]
  })

  return { data, missing }
}


const scryfall = {
  getCardsDataByIds,
}

export default scryfall
