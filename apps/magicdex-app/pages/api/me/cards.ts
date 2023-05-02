import { cardHandlers } from '@/api/(handlers)'
import { authOptions } from '@/api/auth/[...nextauth]'
import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'


export default async function handler(
  req: NextApiRequest & { query: { [key: string]: undefined } },
  res: NextApiResponse
) {
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
      const { pagination, filters, globalFilter, sort } = {
        pagination: JSON.parse(query.pagination ?? '{}'),
        filters: JSON.parse(query.filters ?? '{}'),
        globalFilter: query.globalFilter,
        sort: JSON.parse(query.sort ?? '[]'),
      }

      // replace '-' with '—' for 'type_line' filter
      if (filters?.type_line)
        filters.type_line.value = (filters.type_line.value as string).replace(/-/g, '—')

      // if 'set' or 'set_name' sort is present, add 'rarity' secondary sort
      const sortFieldIdx = {
        set: sort.findIndex(item => ['set', 'set_name'].includes(item.id)),
        rarity: sort.findIndex(item => ['rarity'].includes(item.id)),
      }
      if (sortFieldIdx.set !== -1 && sortFieldIdx.rarity === -1)
        sort.splice(
          sortFieldIdx.set + 1,
          0,
          { id: 'rarity', desc: false }
        )

      res.status(200).json(
        await cardHandlers.getCardsDataByUserSessionHandler(session, { pagination, globalFilter, filters, sort })
      )
    } catch (error) {
      console.error(error)
      res.status(400).json({
        success: false,
        message: error.toString(),
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
