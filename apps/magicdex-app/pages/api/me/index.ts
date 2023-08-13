import { userHandlers } from '@/api/(handlers)'
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
      res.status(301).redirect('/api/whoami')
      break

    case 'POST': {
      const updateResult = await userHandlers.updateUserHandler(session, req.body)
      res.status(updateResult.success ? 200 : 400).json(updateResult)
      break
    }

    case 'DELETE': {
      const deleteResult = await userHandlers.deleteUserHandler(session)
      res.status(deleteResult.success ? 200 : 400).json(deleteResult)
      break
    }

    default:
      res.setHeader('Allow', ['GET', 'POST', 'DELETE'])
      res.status(405).end(`Method ${method} Not Allowed`)
      break
  }
}
