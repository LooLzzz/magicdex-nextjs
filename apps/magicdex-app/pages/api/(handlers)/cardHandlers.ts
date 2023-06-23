import { cardServices } from '@/api/(services)'
import { UserCardQueryProps } from '@/api/(types)'
import { UserCardMutationVariables } from '@/services/hooks/types'
import { Session } from 'next-auth'


export async function getCardsDataByUserSessionHandler(session: Session, options: UserCardQueryProps = {}) {
  const [data, totalRowCount, allSets] = await Promise.all([
    cardServices.getCardsDataByUserSession(session, options),
    cardServices.getTotalCardsCountByUserSession(session, options),
    cardServices.getAllSetsByUserSession(session),
  ])

  // background process to update card prices,
  // if older than 'priceUpdatedAtThreshold' (default: 7 days)
  cardServices.updateCardPricesByIds(session, data)

  return {
    data,
    metadata: {
      totalRowCount,
      allSets,
    },
  }
}

export async function updateCardsDataByUserSessionHandler(session: Session, cards: UserCardMutationVariables) {
  // remove duplicates from 'card.tags' & sort it
  cards = cards.map(({ tags = [], ...rest }) => ({
    ...rest,
    tags: [...new Set(tags)].sort()
  }))

  // sum 'card.amount' of cards with same key-fields
  cards = Object.values(
    cards.reduce((acc, card) => {
      const { amount, scryfall_id, condition, foil, signed, altered, misprint, tags, override_card_data } = card

      const overridesSortedByKey = (
        Object
          .entries(override_card_data ?? {})
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([key, value]) => `${key}:"${value}"`)
          .join(',')
      )

      const key = [scryfall_id, condition, foil, signed, altered, misprint, tags, overridesSortedByKey].join('|')
      if (acc[key]?.amount !== undefined)
        acc[key].amount += amount
      else
        acc[key] = card
      return acc
    }, {})
  )

  const {
    affectedRows,
    insertedRowCount,
    updatedRowCount,
    deletedRowCount,
  } = await cardServices.updateCardsDataByUserSession(session, cards)

  return {
    affectedRows,
    metadata: {
      insertedRowCount,
      updatedRowCount,
      deletedRowCount,
    },
  }
}
