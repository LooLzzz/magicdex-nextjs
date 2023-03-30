import { CardDocument, UserDocument } from '@/types/firestore'
import { initFirestore } from '@next-auth/firebase-adapter'
import { cert } from 'firebase-admin/app'
import * as cardServices from './cardServices'
import * as dbServices from './dbServices'
import * as userServices from './userServices'


const firestore = initFirestore({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY,
  })
})

/**
 * This helper function pipes your types through a firestore converter
 */
function converter<T>(): FirebaseFirestore.FirestoreDataConverter<T> {
  return ({
    toFirestore: (data: T): FirebaseFirestore.DocumentData => {
      return data as FirebaseFirestore.DocumentData
    },
    fromFirestore: (snapshot: FirebaseFirestore.QueryDocumentSnapshot) => snapshot.data() as T
  })
}

/**
 * This helper function exposes a 'typed' version of `firestore().collection(collectionPath)`
 * Pass it a `collectionPath` string as the path to the collection in firestore
 * Pass it a type argument representing the 'type' (schema) of the docs in the collection
 */
function dataPoint<T>(collectionPath: string) {
  return firestore
    .collection(collectionPath)
    .withConverter(converter<T>())
}

const collections = {
  cards: dataPoint<CardDocument>('cards'),
  users: dataPoint<UserDocument>('users'),
}

export {
  firestore as default,
  cardServices,
  collections,
  dbServices,
  userServices,
}
