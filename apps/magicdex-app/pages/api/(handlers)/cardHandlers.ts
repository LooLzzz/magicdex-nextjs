import { cardServices } from '@/api/(services)'
import { QueryProps } from '@/api/(types)'
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
