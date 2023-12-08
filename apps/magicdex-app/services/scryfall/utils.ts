import { ScryfallCardData } from '@/types/scryfall'
import axios from 'axios'


/**
 * recursively fetches all pages of a scryfall query
 */
export async function fetchAllDataFromScryfallPages({ data, has_more, next_page }: {
  data: ScryfallCardData[],
  has_more: boolean,
  next_page: string,
}): Promise<ScryfallCardData[]> {
  if (!has_more)
    return data

  const { data: nextData } = await axios.get(next_page)
  return await fetchAllDataFromScryfallPages({
    ...nextData,
    data: [...data, ...nextData.data],
  })
}
