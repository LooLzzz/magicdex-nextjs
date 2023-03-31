import { ScryfallCardData } from './scryfall'


export type CardCondition = 'NM' | 'LP' | 'MP' | 'HP' | 'DMG'

export interface UserDocument {
  email: string
  name: string
  image?: string
}

export interface UserData {
  id: string
  email: string
  name: string
  image?: string
}

export interface CardDocument {
  altered: boolean
  amount: number
  condition: CardCondition
  createdAt: FirebaseFirestore.Timestamp
  foil: boolean
  misprint: boolean
  owner: FirebaseFirestore.DocumentReference
  scryfallId: string
  signed: boolean
  tags: string[]
  updatedAt: FirebaseFirestore.Timestamp
}

export interface CardData {
  altered: boolean
  amount: number
  condition: CardCondition
  createdAt: Date
  foil: boolean
  id: string
  misprint: boolean
  ownerId: string
  scryfallData?: ScryfallCardData | Record<string, never>  // either 'ScryfallCardData' or 'EmptyObject'
  scryfallId: string
  signed: boolean
  tags: string[]
  updatedAt: Date
}
