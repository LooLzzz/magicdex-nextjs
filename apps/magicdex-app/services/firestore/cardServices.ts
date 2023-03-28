import firestore from './index'
import { Card } from './types'
import { getUserDocumentById } from './userServices'


export async function getCardsDataByUserId(id: string) {
  return (
    (await firestore
      .collection('cards')
      .where('owner', '==', await getUserDocumentById({ id, ref: true }))
      .get())
      .docs
      .map(doc => {
        const { owner, ...docData } = doc.data()
        return {
          id: doc.id,
          owner: owner.id,
          ...docData
        }
      })
  ) as Card[]
}
