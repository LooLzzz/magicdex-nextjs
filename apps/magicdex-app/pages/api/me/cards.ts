import { cardHandlers } from '@/api/(handlers)'
import { authOptions } from '@/api/auth/[...nextauth]'
import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'


type JsonObject = {
  [key: string]: string | number | boolean | null | JsonObject | JsonObject[]
}

export default async function handler(
  req: Omit<NextApiRequest, 'body'> & { query: JsonObject, body: JsonObject },
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
        pagination: JSON.parse(query.pagination as string ?? '{}'),
        filters: JSON.parse(query.filters as string ?? '{}'),
        globalFilter: query.globalFilter as string,
        sort: JSON.parse(query.sort as string ?? '[]'),
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
        await cardHandlers.getCardsDataByUserSessionHandler(
          session,
          { pagination, globalFilter, filters, sort }
        )
      )
    } catch (error) {
      console.error(error)
      res.status(400).json({
        success: false,
        message: error.toString(),
      })
    }
  }

  else if (method === 'POST') {
    try {
      res.status(200).json(
        await cardHandlers.updateCardsDataByUserSessionHandler(session, body as undefined)
      )
    } catch (error) {
      console.error(error)
      res.status(400).json({
        success: false,
        message: error.toString(),
      })
    }
  }

  else {
    res.setHeader('Allow', ['GET', 'POST'])
    res.status(405).end(`Method ${method} Not Allowed`)
  }
}
