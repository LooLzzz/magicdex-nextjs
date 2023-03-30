
export type CardBorderColor = 'black' | 'borderless' | 'gold' | 'silver' | 'white'
export type CardColor = 'W' | 'U' | 'B' | 'R' | 'G'
export type CardFinish = 'foil' | 'nonfoil' | 'etched'
export type CardGameType = 'paper' | 'arena' | 'mtgo'
export type CardImageStatus = 'missing' | 'placeholder' | 'lowres' | 'highres_scan'
export type CardLegality = 'legal' | 'not_legal'
export type CardObject = 'card'
export type CardRarity = 'common' | 'uncommon' | 'rare' | 'mythic' | 'special' | 'bonus'
export type CardSecurityStamp = 'oval' | 'triangle' | 'acorn' | 'circle' | 'arena' | 'heart'

export interface ScryfallCardData {
  object: CardObject
  id: string
  oracle_id: string
  multiverse_ids: number[]
  tcgplayer_id: number
  cardmarket_id: number
  name: string
  lang: string
  released_at: string
  uri: string
  scryfall_uri: string
  layout: string
  highres_image: boolean
  image_status: CardImageStatus
  image_uris: {
    small: string,
    normal: string,
    large: string,
    png: string,
    art_crop: string,
    border_crop: string,
  }
  mana_cost: string
  cmc: number
  type_line: string
  oracle_text: string
  colors: CardColor[]
  color_identity: CardColor[]
  keywords: string[]
  legalities: {
    standard: CardLegality,
    future: CardLegality,
    historic: CardLegality,
    gladiator: CardLegality,
    pioneer: CardLegality,
    explorer: CardLegality,
    modern: CardLegality,
    legacy: CardLegality,
    pauper: CardLegality,
    vintage: CardLegality,
    penny: CardLegality,
    commander: CardLegality,
    oathbreaker: CardLegality,
    brawl: CardLegality,
    historicbrawl: CardLegality,
    alchemy: CardLegality,
    paupercommander: CardLegality,
    duel: CardLegality,
    oldschool: CardLegality,
    premodern: CardLegality,
    predh: CardLegality,
  }
  games: CardGameType
  reserved: boolean
  foil: boolean
  nonfoil: boolean
  finishes: CardFinish[]
  oversized: boolean
  promo: boolean
  reprint: boolean
  variation: boolean
  set_id: string
  set: string
  set_name: string
  set_type: string
  set_uri: string
  set_search_uri: string
  scryfall_set_uri: string
  rulings_uri: string
  prints_search_uri: string
  collector_number: string
  digital: boolean
  rarity: CardRarity
  card_back_id: string
  artist: string
  artist_ids: string[]
  illustration_id: string
  border_color: CardBorderColor
  frame: string
  security_stamp: CardSecurityStamp
  full_art: boolean
  textless: boolean
  booster: boolean
  story_spotlight: boolean
  edhrec_rank: number
  penny_rank: number
  prices: {
    usd?: string
    usd_foil?: string
    usd_etched?: string
    eur?: string
    eur_foil?: string
    tix?: string
  }
  related_uris: {
    gatherer: string
    tcgplayer_infinite_articles: string
    tcgplayer_infinite_decks: string
    edhrec: string
  }
  purchase_uris: {
    tcgplayer: string
    cardmarket: string
    cardhoarder: string
  }
}
