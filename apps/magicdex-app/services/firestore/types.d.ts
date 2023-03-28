
export type User = {
  id: string
  email: string
  name: string
  image?: string
}

export type Card = {
  id: string
  owner: string
  scryfallId: string
  amount: number
}
