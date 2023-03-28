import firestore from './index'


export async function getUserDocumentById({ id, ref = false }: { id: string, ref?: boolean }) {
  const doc = (
    firestore
      .collection('users')
      .doc(id)
  )

  return (
    ref
      ? doc
      : await doc.get()
  )
}
