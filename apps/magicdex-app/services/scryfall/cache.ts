import { ScryfallCardData } from '@/types/scryfall'
import NodeCache from 'node-cache'


export class ScryfallCache extends NodeCache {
  getHitMiss([...ids]) {
    const { hits, misses } = ids.reduce((acc, id) => {
      const cachedData: ScryfallCardData = scryfallCache.get(id)
      if (cachedData)
        acc.hits[id] = cachedData
      else
        acc.misses.push(id)
      return acc
    }, {
      hits: {},
      misses: [],
    }) as {
      hits: { [key: string]: ScryfallCardData },
      misses: string[],
    }

    return { hits, misses }
  }
}

const scryfallCache = new ScryfallCache({ stdTTL: 60 * 60 * 24 })  // 1 day

export default scryfallCache
