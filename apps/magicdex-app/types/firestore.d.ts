import { ScryfallCardData } from './scryfall'


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
  owner: FirebaseFirestore.DocumentReference
  scryfallId: string
  amount: number
}

export interface CardData {
  id: string
  ownerId: string
  scryfallId: string
  amount: number
  scryfallData?: ScryfallCardData | Record<string, never>  // either 'ScryfallCardData' or 'EmptyObject'
}
