import { applyVerboseOperator, createClientWithRLS } from '@/api/(services)/supabase'
import { QueryProps } from '@/api/(types)'
import { UserCardMutationVariables } from '@/services/hooks/types'
import { UserCardBaseData } from '@/types/supabase'
import { Session } from 'next-auth'
import { Client as PgClient } from 'pg'


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
    throw error
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
    throw error
  return count
}

/**
 * Get distinct card sets of user using the access token stored in the user session.
 */
export async function getAllSetsByUserSession(session: Session) {
  const supabaseClient = await createClientWithRLS(session.supabaseAccessToken)

  const { data, error } = (
    await supabaseClient
      .from('distinct_user_cards_sets')
      .select('set_name, set_id:set, released_at')
      .order('released_at', { ascending: false })
  )

  if (error)
    throw error
  return data
}

// TODO: make this work with 'SupabaseClient' somehow
export async function updateCardsDataByUserSession(session: Session, cards: UserCardMutationVariables) {
  const pgClient = new PgClient({
    connectionString: process.env.SUPABASE_POSTGRES_CONNECTION_URI,
  })
  pgClient.connect()
  const { rows: affectedRows, rowCount: affectedRowCount } = await pgClient.query(`
    INSERT INTO user_cards(owner_id, amount, altered, condition, foil, misprint, scryfall_id, signed, tags, override_card_data)
    VALUES
      ${cards.map(card => `(
        '${session.user.id}',
        ${card.amount},
        ${card.altered},
        '${card.condition}',
        ${card.foil},
        ${card.misprint},
        '${card.scryfall_id}',
        ${card.signed},
        '{${card.tags.join(',')}}',
        '${JSON.stringify(card.override_card_data)}'
      )`).join(',')}
    ON CONFLICT (owner_id, altered, condition, foil, misprint, scryfall_id, signed, tags, override_card_data)
    DO UPDATE SET amount = user_cards.amount + EXCLUDED.amount
    RETURNING *;
  `) as { rows: UserCardBaseData[], rowCount: number }
  pgClient.end()

  let [insertedRowCount, updatedRowCount] = [0, 0]
  for (const row of affectedRows)
    row.created_at.getTime() === row.updated_at.getTime() ? insertedRowCount++ : updatedRowCount++

  return {
    affectedRows,
    affectedRowCount,
    insertedRowCount,
    updatedRowCount,
  } as {
    affectedRows: UserCardBaseData[],
    affectedRowCount: number,
    insertedRowCount: number,
    updatedRowCount: number,
  }
}
