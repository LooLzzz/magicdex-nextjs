import { authOptions } from '@/api/auth/[...nextauth]'
import { cardServices } from '@/services/firestore'
import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  const { method, body } = req

  switch (method) {
    case 'GET':
      try {
        res.status(200).json(await cardServices.getCardsDataByUserId(session.user.id))
      } catch (error) {
        res.status(400).json({ success: false })
      }
      break

    case 'POST':
      res.status(200).json({
        message: 'Method not implemented yet',
        body,
        session
      })
      break

    default:
      res.setHeader('Allow', ['GET', 'POST'])
      res.status(405).end(`Method ${method} Not Allowed`)
      break
  }
}
