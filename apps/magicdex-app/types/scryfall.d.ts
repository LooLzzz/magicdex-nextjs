
export type CardBorderColor = 'black' | 'borderless' | 'gold' | 'silver' | 'white'
export type CardColor = 'W' | 'U' | 'B' | 'R' | 'G'
export type CardColorColorless = CardColor | '∅'
export type CardFaceObject = 'card_face'
export type CardFinish = 'foil' | 'nonfoil' | 'etched'
export type CardGameType = 'paper' | 'arena' | 'mtgo'
export type CardImageStatus = 'missing' | 'placeholder' | 'lowres' | 'highres_scan'
export type CardLayout = 'normal' | 'split' | 'flip' | 'transform' | 'modal_dfc' | 'meld' | 'leveler' | 'class' | 'saga' | 'adventure' | 'battle' | 'planar' | 'scheme' | 'vanguard' | 'token' | 'double_faced_token' | 'emblem' | 'augment' | 'host' | 'art_series' | 'reversible_card'
export type CardLegality = 'legal' | 'not_legal'
export type CardObject = 'card'
export type CardRarity = 'common' | 'uncommon' | 'rare' | 'mythic' | 'special' | 'bonus'
export type CardSecurityStamp = 'oval' | 'triangle' | 'acorn' | 'circle' | 'arena' | 'heart'

export interface BaseCardProps {
  artist_id: string,
  artist: string,
  color_indicator: CardColor[],
  colors: CardColor[],
  flavor_text?: string,
  illustration_id: string,
  image_uris: CardImageUris,
  layout: CardLayout,
  loyalty?: string,
  mana_cost: string,
  name: string,
  object: string,
  oracle_text?: string,
  power?: string,
  toughness?: string,
  type_line: string,
}

export interface CardImageUris {
  art_crop: string,
  border_crop: string,
  large: string,
  normal: string,
  png: string,
  small: string,
}

export interface CardLegalities {
  alchemy: CardLegality,
  brawl: CardLegality,
  commander: CardLegality,
  duel: CardLegality,
  explorer: CardLegality,
  future: CardLegality,
  gladiator: CardLegality,
  historic: CardLegality,
  historicbrawl: CardLegality,
  legacy: CardLegality,
  modern: CardLegality,
  oathbreaker: CardLegality,
  oldschool: CardLegality,
  pauper: CardLegality,
  paupercommander: CardLegality,
  penny: CardLegality,
  pioneer: CardLegality,
  predh: CardLegality,
  premodern: CardLegality,
  standard: CardLegality,
  vintage: CardLegality,
}

export interface CardPrices {
  eur_foil?: string,
  eur?: string,
  tix?: string,
  usd_etched?: string,
  usd_foil?: string,
  usd?: string,
}

export interface CardRelatedUris {
  edhrec: string,
  gatherer: string,
  tcgplayer_infinite_articles: string,
  tcgplayer_infinite_decks: string,
}

export interface CardPurchaseUris {
  cardhoarder: string,
  cardmarket: string,
  tcgplayer: string,
}

export interface ScryfallCardData extends BaseCardProps {
  booster: boolean,
  border_color: CardBorderColor,
  card_back_id: string,
  card_faces?: ({ object: CardFaceObject } & BaseCardProps)[],
  cardmarket_id: number,
  cmc: number,
  collector_number: string,
  color_identity: CardColor[],
  digital: boolean,
  edhrec_rank: number,
  finishes: CardFinish[],
  foil: boolean,
  frame: string,
  full_art: boolean,
  games: CardGameType,
  highres_image: boolean,
  id: string,
  image_status: CardImageStatus,
  image_uris?: CardImageUris,
  keywords: string[],
  lang: string,
  legalities: CardLegalities,
  multiverse_ids: number[],
  nonfoil: boolean,
  object: CardObject,
  oracle_id: string,
  oversized: boolean,
  penny_rank: number,
  prices: CardPrices,
  prints_search_uri: string,
  promo: boolean,
  purchase_uris: CardpurchaseUris,
  rarity: CardRarity,
  related_uris: CardRelatedUris,
  released_at: string,
  reprint: boolean,
  reserved: boolean,
  rulings_uri: string,
  scryfall_set_uri: string,
  scryfall_uri: string,
  security_stamp: CardSecurityStamp,
  set_id: string,
  set_name: string,
  set_search_uri: string,
  set_type: string,
  set_uri: string,
  set: string,
  story_spotlight: boolean,
  tcgplayer_id: number,
  textless: boolean,
  uri: string,
  variation: boolean,
}
