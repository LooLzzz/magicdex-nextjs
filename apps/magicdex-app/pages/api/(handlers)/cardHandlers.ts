import { cardServices } from '@/api/(services)'
import { QueryProps } from '@/api/(types)'
import { UserCardMutationVariables } from '@/services/hooks/types'
import { Session } from 'next-auth'


export async function getCardsDataByUserSessionHandler(session: Session, options: QueryProps = {}) {
  const [data, totalRowCount, getAllSets] = [
    cardServices.getCardsDataByUserSession(session, options),
    cardServices.getTotalCardsCountByUserSession(session),
    cardServices.getAllSetsByUserSession(session),
  ]

  return {
    data: await data,
    metadata: {
      totalRowCount: await totalRowCount,
      allSets: await getAllSets,
    },
  }
}

export async function updateCardsDataByUserSessionHandler(session: Session, cards: UserCardMutationVariables) {
  // remove duplicates from 'card.tags' & sort it
  cards = cards.map(({ tags, ...rest }) => ({
    ...rest,
    tags: [...new Set(tags)].sort()
  }))

  // sum 'card.amount' of cards with same key-fields
  cards = Object.values(
    cards.reduce((acc, card) => {
      const { amount, ...keys } = card
      const { scryfall_id, condition, foil, signed, altered, misprint, tags, override_card_data } = keys

      const overridesSortedByKey = (
        Object
          .entries(override_card_data)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([key, value]) => `${key}:"${value}"`)
          .join(',')
      )

      const key = [scryfall_id, condition, foil, signed, altered, misprint, tags, overridesSortedByKey].join('|')
      if (acc[key])
        acc[key].amount += amount
      else
        acc[key] = card
      return acc
    }, {})
  )

  const {
    affectedRows,
    affectedRowCount,
    insertedRowCount,
    updatedRowCount,
  } = await cardServices.updateCardsDataByUserSession(session, cards)

  return {
    affectedRows,
    metadata: {
      affectedRowCount,
      insertedRowCount,
      updatedRowCount,
    },
  }
}
