import { UserData } from '@/types/firestore'
import { collections } from './index'


export async function getUserDocumentById(id: string) {
  return (
    await collections
      .users
      .doc(id)
      .get()
  )
}

export async function getUserDataById(id: string): Promise<UserData> {
  const userDoc = await getUserDocumentById(id)

  return ({
    id: userDoc.id,
    ...userDoc.data(),
  })
}
