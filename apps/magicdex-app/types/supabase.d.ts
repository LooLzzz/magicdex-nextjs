import { ScryfallCardData } from './scryfall'


export type CardCondition = '' | 'NM' | 'LP' | 'MP' | 'HP' | 'DMG'

export interface UserCardBaseData {
  altered: boolean
  amount: number
  condition: CardCondition
  created_at: Date
  foil: boolean
  id: string
  misprint: boolean
  override_card_data: object
  owner_id: string
  scryfall_id: string
  signed: boolean
  tags: string[]
  updated_at: Date
}

export interface UserCardData extends UserCardBaseData, ScryfallCardData {
  // card_data: ScryfallCardData
  price_usd: number
}
