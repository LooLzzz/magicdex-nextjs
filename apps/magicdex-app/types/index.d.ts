
export type UserDocument = {
  email: string
  name: string
  image?: string
}

export type UserData = {
  id: string
  email: string
  name: string
  image?: string
}

export type CardDocument = {
  owner: FirebaseFirestore.DocumentReference
  scryfallId: string
  amount: number
}

export type CardData = {
  id: string
  ownerId: string
  scryfallId: string
  amount: number
}
