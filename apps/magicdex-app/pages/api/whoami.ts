import { authOptions } from '@/api/auth/[...nextauth]'
import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  const { method } = req

  if (!session) {
    res.status(401).json({
      success: false,
      message: 'Unauthorized',
    })
    return
  }

  switch (method) {
    case 'GET':
      try {
        res.status(200).json(session.user)
      } catch (error) {
        res.status(400).json({
          success: false,
          message: error,
        })
      }
      break

    default:
      res.setHeader('Allow', ['GET'])
      res.status(405).end(`Method ${method} Not Allowed`)
      break
  }
}
