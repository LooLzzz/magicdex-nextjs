import { cardServices } from '@/services/firestore'
import scryfallServices from '@/services/scryfall'


async function getCardsDataByUserIdHandler({ id, populateScryfallData }: {
  id: string,
  populateScryfallData: boolean
}) {
  const userCards = await cardServices.getCardsDataByUserId(id)

  let scryfallCards = { data: [], missing: [] }
  if (populateScryfallData) {
    scryfallCards = await scryfallServices.getCardsDataByIds(
      userCards.map(card => card.scryfallId)
    )
    const scryfallCardsMap = scryfallCards.data.reduce((acc, card) => {
      acc[card.id] = card
      return acc
    }, {})

    userCards.forEach(card => {
      card.scryfallData = scryfallCardsMap[card.scryfallId]
    })
  }

  return {
    data: userCards,
    missing: scryfallCards.missing
  }
}


const cardHandlers = {
  getCardsDataByUserIdHandler,
}

export {
  cardHandlers as default,
  getCardsDataByUserIdHandler
}
