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

export {
  firestore as default,
  cardServices,
  dbServices,
  userServices,
}
