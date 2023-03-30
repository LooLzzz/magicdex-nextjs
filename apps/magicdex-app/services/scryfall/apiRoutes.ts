
const baseUrl = 'https://api.scryfall.com'

const apiRoutes = {
  cards: {
    autocomplete: `${baseUrl}/cards/autocomplete`,
    collection: `${baseUrl}/cards/collection`,
    id: (cardId: string) => `${baseUrl}/cards/${cardId}`,
    named: `${baseUrl}/cards/named`,
    search: `${baseUrl}/cards/search`,
  },
  rulings: {
    cardId: (cardId: string) => `${baseUrl}/cards/${cardId}/rulings`,
  },
}

export {
  apiRoutes as default,
  baseUrl,
}
