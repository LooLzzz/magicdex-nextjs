import { createClient } from 'https://cdn.skypack.dev/@supabase/supabase-js'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'


console.log('Function "supabase-update-mtg-cards-edge-function" up and running!', { ver: '1.3' })

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
const allCardFields = [
  'all_parts', 'arena_id', 'artist', 'artist_id', 'artist_ids', 'attraction_lights', 'booster', 'border_color', 'card_back_id', 'card_faces', 'cardmarket_id', 'cmc', 'collector_number', 'color_identity', 'color_indicator', 'colors', 'content_warning', 'defense', 'digital', 'edhrec_rank', 'finishes', 'flavor_text', 'foil', 'frame', 'frame_effects', 'full_art', 'games', 'hand_modifier', 'highres_image', 'illustration_id', 'image_status', 'image_uris', 'keywords', 'lang', 'layout', 'legalities', 'life_modifier', 'loyalty', 'mana_cost',
  'mtgo_foil_id', 'mtgo_id', 'multiverse_ids', 'name', 'nonfoil', 'object', 'oracle_id', 'oracle_text', 'oversized', 'penny_rank', 'power', 'preview', 'prints_search_uri', 'produced_mana', 'promo', 'promo_types', 'rarity', 'related_uris', 'released_at', 'reprint', 'reserved', 'rulings_uri', 'scryfall_set_uri', 'scryfall_uri', 'security_stamp', 'set', 'set_id', 'set_name', 'set_search_uri', 'set_type', 'set_uri', 'story_spotlight', 'tcgplayer_etched_id', 'tcgplayer_id', 'textless', 'toughness', 'type_line', 'uri', 'variation', 'watermark',
  'flavor_name'
]


serve(async (req: Request) => {
  console.log('Request incoming', { url: req.url, method: req.method, headers: req.headers })

  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create a Supabase client with the Auth context of the logged in user.
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // get latest card creation date
    const { data: latestCardsData, error }: { data: object[], error: Error } = (
      await supabaseClient
        .from('mtg_cards')
        .select('updated_at', { limit: 1, order: 'desc' })
    )
    if (error)
      throw error

    let newCards: object[] = []
    if (latestCardsData.length > 0) {
      console.log('Fetching new cards from scryfall...')

      const latestCardDate = (
        new Date(latestCardsData[0]['created_at'])
          .toISOString()
          .split('T')[0]
      )
      console.log({ latestCardDate })

      newCards = await scryfallSearch(`date>=${latestCardDate}`)
    }
    else {
      console.log('No cards found in the database, fetching bulk data from scryfall...')

      let resp = await fetch('https://api.scryfall.com/bulk-data')
      if (!resp.ok)
        throw new Error(`Error fetching scryfall data: ${resp.statusText}`)

      const { data } = await resp.json()
      const downloadUri = data.find(d => d.type === 'oracle_cards')['download_uri']

      console.log('Fetching bulk data from uri...', { oracleCardsUri: downloadUri })
      resp = await fetch(downloadUri)
      if (!resp.ok)
        throw new Error(`Error fetching bulk scryfall data: ${resp.statusText}`)

      newCards = await resp.json()
    }

    console.debug({newCards})

    const newCardsFlattened = newCards.map(card => {
      if (card['card_faces']) {
        // in case of double faced cards
        // ignore some fields from the first card face and merge them with the base card
        const { object, type_line, name, ...rest } = card['card_faces'][0]
        card = { ...card, ...rest }
      }

      // ignore some fields from the base card
      delete card['id'] // this is the scryfall id, we're using oracle_id as the unique id instead
      delete card['prices'] // not relevant to keep in the database

      // add missing fields
      const missingFields = allCardFields.filter(field => !card[field])
      missingFields.map(field => card[field] = null)
      return card
    })
    console.log({ newCardsFlattened })

    // insert new cards into the database in 500 card batches
    console.log(`Inserting new cards into the database... (${newCardsFlattened.length} total)`)
    const batchSize = 500
    for (let i = 0; i < newCardsFlattened.length; i += batchSize) {
      console.log(`Inserting cards ${i} to ${i + batchSize}...`)
      const batch = newCardsFlattened.slice(i, i + batchSize)
      const { error, ...rest } = (
        await supabaseClient
          .from('mtg_cards')
          .upsert(batch, { onConflict: 'oracle_id' })
      )
      if (error)
        throw error
    }

    console.log('Done!')

    return new Response(JSON.stringify({ newCardsFlattened }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error(error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})


/**
 * Recursively fetches all pages of a scryfall search
 */
async function fetchAllPages(url: string): Promise<object[]> {
  console.debug('Fetching next page', { url })
  const resp = await fetch(url)

  if (!resp.ok)
    throw new Error(`Error fetching scryfall data: ${resp.statusText}`)
  const { data, has_more, next_page }: { data: object[], has_more: boolean, next_page: string } = await resp.json()

  if (!has_more)
    return data

  const moreData = await fetchAllPages(next_page)
  return [...data, ...moreData]
}

/**
 * Fetches all cards from a scryfall search
 * @param query Scryfall search query
 * @returns Array of card objects
 */
async function scryfallSearch(query: string) {
  try {
    return await fetchAllPages(`https://api.scryfall.com/cards/search?q=${query}&unique=cards`)
  } catch (error) {
    console.error('error fetching scryfall data', error)
    return []
  }
}
