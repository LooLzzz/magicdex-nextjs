import { ScryfallCardData } from './scryfall'


export type CardCondition = 'NM' | 'LP' | 'MP' | 'HP' | 'DMG'

export interface UserCardData extends ScryfallCardData {
  altered: boolean
  amount: number
  // card_data: ScryfallCardData
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
