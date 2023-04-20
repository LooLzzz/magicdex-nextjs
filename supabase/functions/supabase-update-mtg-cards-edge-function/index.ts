import { createClient, SupabaseClient } from 'https://cdn.skypack.dev/@supabase/supabase-js'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'


console.log('Function "supabase-update-mtg-cards-edge-function" up and running!', { ver: '1.3' })

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
const allCardFields = [
  'all_parts', 'arena_id', 'artist', 'artist_id', 'artist_ids', 'attraction_lights', 'booster', 'border_color', 'card_back_id', 'card_faces', 'cardmarket_id', 'cmc', 'collector_number', 'color_identity', 'color_indicator', 'colors', 'content_warning', 'defense', 'digital', 'edhrec_rank', 'finishes', 'flavor_text', 'foil', 'frame', 'frame_effects', 'full_art', 'games', 'hand_modifier', 'highres_image', 'illustration_id', 'image_status', 'image_uris', 'keywords', 'lang', 'layout', 'legalities', 'life_modifier', 'loyalty', 'mana_cost',
  'mtgo_foil_id', 'mtgo_id', 'multiverse_ids', 'name', 'nonfoil', 'object', 'oracle_id', 'oracle_text', 'oversized', 'penny_rank', 'power', 'preview', 'prices', 'prints_search_uri', 'produced_mana', 'promo', 'promo_types', 'rarity', 'related_uris', 'released_at', 'reprint', 'reserved', 'rulings_uri', 'scryfall_set_uri', 'scryfall_uri', 'security_stamp', 'set', 'set_id', 'set_name', 'set_search_uri', 'set_type', 'set_uri', 'story_spotlight', 'tcgplayer_etched_id', 'tcgplayer_id', 'textless', 'toughness', 'type_line', 'uri', 'variation', 'watermark',
  'flavor_name'
]
const scryfallSearchApi = 'https://api.scryfall.com/cards/search'
const scryfallBulkDataApi = 'https://api.scryfall.com/bulk-data'
const scryfallTargetBulkDataType = 'default_cards'
// const scryfallTargetBulkDataType = 'oracle_cards'
const cardsTableName = 'mtg_cards'
// const upsertBatchSize = 500


async function fetchWrapper(url: string, options: object = {}) {
  const resp = await fetch(url, options)
  if (!resp.ok)
    throw new Error(`Error fetching scryfall data: ${resp.statusText}`)
  return resp.json()
}

async function scryfallSearchCardsGenerator(options: { q: string, [key: string]: string | number | boolean | undefined }) {
  async function* getCardsGenerator() {
    yield data['data'] as object[]

    while (data['has_more']) {
      data = await fetchWrapper(data['next_page'])
      yield data['data'] as object[]
    }
  }

  const firstPageUrl = `${scryfallSearchApi}?${Object.entries(options).map(([key, val]) => `${key}=${val}`).join('&')}`
  let data = await fetchWrapper(firstPageUrl)
  console.log(`Search query resulted in ${data['total_cards']} cards`)

  return {
    totalCards: data['total_cards'] as number,
    cardsGenerator: getCardsGenerator()
  }
}

function processScryfallCard(card: object) {
  if (card['card_faces']) {
    // in case of double faced cards
    // ignore some fields from the first card face and merge them with the base card
    const { object, type_line, name, ...rest } = card['card_faces'][0]
    card = { ...card, ...rest }
  }

  // ignore some fields from the base card
  delete card['id'] // this is the scryfall id, we're using oracle_id as the unique id instead

  // // add missing fields
  // allCardFields
  //   .filter(field => !card[field])
  //   .map(field => { card[field] = null })
  return card
}

async function insertCardsToSupabase(supabaseClient: SupabaseClient, cards: object[], { upsert = false }) {
  const { error, ...rest }: { error: Error } = (
    upsert
      ? await supabaseClient
        .from(cardsTableName)
        .upsert(cards)
      : await supabaseClient
        .from(cardsTableName)
        .insert(cards)
  )
  if (error)
    throw error
  return rest
}

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

    const searchParams = { q: 'date>=1990-01-01+game:paper', 'unique': 'prints' }
    console.log('Creating scryfall card data generator...', { searchParams })
    const { cardsGenerator, totalCards } = await scryfallSearchCardsGenerator(searchParams)

    let agg = 0
    for await (const cards of cardsGenerator) {
      agg += cards.length
      const cardsProcessed = cards.map(processScryfallCard)

      // aggregate all keys to a list with unique values
      const allKeys = cardsProcessed
        .reduce((acc: string[], card) => [...acc, ...Object.keys(card)], [])
        .filter((key, index, self) => self.indexOf(key) === index)

      // add missing fields
      cardsProcessed.map(card => {
        allKeys
          .filter(key => !card[key])
          .map(key => { card[key] = null })
        return card
      })

      console.log(`Inserting processed cards (batch ${Math.floor(agg / 175)}/${Math.ceil(totalCards / 175)}) into the database...`)
      await insertCardsToSupabase(supabaseClient, cardsProcessed, { upsert: true })
    }

    console.log('Done!')

    return new Response(JSON.stringify({ message: `Successfully updated ${totalCards} cards` }), {
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
