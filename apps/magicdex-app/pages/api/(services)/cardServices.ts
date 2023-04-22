import { applyVerboseOperator, createClientWithRLS } from '@/api/(services)/supabase'
import { QueryProps } from '@/api/(types)'
import { Session } from 'next-auth'


/**
 * Get all cards data of user using the access token stored in the user session.
 * This uses the RLS feature of Supabase to filter the data by the user id.
 *
 * #TODO: handle 'options.globalFilter', maybe implement scryfall's search syntax
 */
export async function getCardsDataByUserSession(session: Session, options: QueryProps = {}) {
  const supabaseClient = await createClientWithRLS(session.supabaseAccessToken)

  // SELECT
  let builder = (
    supabaseClient
      .from('user_cards_with_mtg_cards')
      .select('*')
  )

  // WHERE
  Object
    .entries(options.filters)
    // use 'Object.filter()' to drop empty values
    .filter(([_key, { value }]) => !(value === null || value === '' || (Array.isArray(value) && value.length === 0)))
    .forEach(([key, { operator, value }]) => {
      builder = applyVerboseOperator(builder, { key, operator, value })
    })

  // ORDER BY
  options.sort.forEach(({ id, desc }) => {
    builder = builder.order(id, { ascending: !desc })
  })

  // LIMIT
  if (typeof options.pagination.from === 'number' && typeof options.pagination.to === 'number')
    builder = builder.range(options.pagination.from, options.pagination.to)

  // EXECUTE
  const { data, error } = await builder
  if (error)
    throw new Error(error.message)
  return data
}

export async function getTotalCardsCountByUserSession(session: Session) {
  const supabaseClient = await createClientWithRLS(session.supabaseAccessToken)

  const { count, error } = (
    await supabaseClient
      .from('user_cards')
      .select('*', { count: 'exact', head: true }) // {head: true} means only return the count, no actual row fetching is performed
  )

  if (error)
    throw new Error(error.message)
  return count
}

export async function getAllSetsByUserSession(session: Session) {
  const supabaseClient = await createClientWithRLS(session.supabaseAccessToken)

  const { data, error } = (
    await supabaseClient
      .from('user_cards_with_mtg_cards')
      .select('set_name')
      .order('released_at', { ascending: false })
  )

  if (error)
    throw new Error(error.message)
  // return unique values only
  return [...new Set(data.map(({ set_name }) => set_name))]
}
