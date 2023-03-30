import { authOptions } from '@/api/auth/[...nextauth]'
import * as handlers from '@/handlers'
import { stringToBoolean } from '@/utils'
import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  const { method, body, query } = req

  if (!session) {
    res.status(401).json({
      success: false,
      message: 'Unauthorized',
    })
    return
  }

  if (method === 'GET') {
    try {
      res.status(200).json(
        await handlers.getCardsDataByUserIdHandler({
          id: session.user.id,
          populateScryfallData: stringToBoolean(query.populateScryfallData as string)
        })
      )
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error,
      })
    }
  }

  // TODO: implement POST method
  else if (method === 'POST') {
    res.status(200).json({
      success: false,
      message: 'Method not implemented yet',
      body,
      session,
    })
  }

  else {
    res.setHeader('Allow', ['GET', 'POST'])
    res.status(405).end(`Method ${method} Not Allowed`)
  }
}
