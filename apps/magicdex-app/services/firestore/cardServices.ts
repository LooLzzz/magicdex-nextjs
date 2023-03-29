import { CardData } from '@/types'
import { collections } from './index'
import { getUserDocumentById } from './userServices'


export async function getCardDocumentById(id: string) {
  return (
    await collections
      .cards
      .doc(id)
      .get()
  )
}

export async function getCardsDataByUserId(id: string): Promise<CardData[]> {
  const userDoc = await getUserDocumentById(id)

  return (
    (await collections
      .cards
      .where('owner', '==', userDoc.ref)
      .get())
      .docs
      .map(doc => {
        const { owner, ...docData } = doc.data()
        return {
          id: doc.id,
          ownerId: owner.id,
          ...docData
        }
      })
  )
}
