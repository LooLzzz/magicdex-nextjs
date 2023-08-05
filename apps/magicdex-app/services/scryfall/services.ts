import { ScryfallCardData } from '@/types/scryfall'
import { splitArrayToChunks } from '@/utils'
import axios from 'axios'
import apiRoutes from './apiRoutes'
import { fetchAllDataFromScryfallPages } from './utils'


export interface SearchParams {
  name: string,
  set?: string,
  collector_number?: string,
  lang?: string,
  foil?: boolean,
}

export interface SearchOptions {
  exact?: boolean,
  order?: '' | 'name' | 'released' | 'set',
  unique?: '' | 'prints' | 'art' | 'cards',
  fetchAllPages?: boolean,
}

interface ScryfallSearchResult {
  data: ScryfallCardData[],
  total_cards: number,
  has_more: boolean,
  next_page: string,
}

export interface ScryfallSearchReturnType {
  data: ScryfallCardData[],
  metadata: {
    total_cards: number,
  }
}

/**
 * Barebone implementation of Scryfall's `POST /cards/collection` endpoint.
 */
export async function scryfallCardsCollectionEndpoint([...ids]) {
  const resp = await axios.post(
    apiRoutes.cards.collection,
    {
      identifiers: ids.map(id => ({ id })),
    }
  )
  return resp.data.data as {
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

export async function search(searchParams: SearchParams, options: SearchOptions = {}): Promise<ScryfallSearchReturnType> {
  try {
    const { exact = false, order = 'release', unique = 'prints', fetchAllPages = false } = options
    const { name, set, collector_number: cn, lang, foil } = searchParams

    const { data } = await axios.get<ScryfallSearchResult>(
      apiRoutes.cards.search,
      {
        params: {
          order,
          unique,
          q: [
            exact ? `!"${name}"` : `"${name}"`,
            set && `s:${set}`,
            cn && `cn:${cn}`,
            lang && `lang:${lang}`,
            foil && 'is:foil',
            'game:paper',
          ].filter(Boolean).join(' '),
        },
      },
    )
    return {
      data: fetchAllPages ? await fetchAllDataFromScryfallPages(data) : data.data,
      metadata: {
        total_cards: data.total_cards,
      },
    }
  }

  catch (error) {
    console.error(error)
    return {
      data: [],
      metadata: {
        total_cards: 0,
      },
    }
  }
}
