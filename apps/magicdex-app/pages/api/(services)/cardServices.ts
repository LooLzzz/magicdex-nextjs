import { applyScryfallGlobalFilter, applyVerboseOperator, createClientWithRLS, createPgClient } from '@/api/(services)/supabase'
import { UserCardQueryProps } from '@/api/(types)'
import { UserCardMutationVariables } from '@/services/hooks/types'
import scryfall from '@/services/scryfall'
import { UserCardBaseData, UserCardData } from '@/types/supabase'
import { Session } from 'next-auth'


/**
 * Get all cards data of user using the access token stored in the user session.
 * This uses the RLS feature of Supabase to filter the data by the user id.
 */
export async function getCardsDataByUserSession(session: Session, options: UserCardQueryProps = {}): Promise<UserCardData[]> {
  const supabaseClient = await createClientWithRLS(session.supabaseAccessToken)

  // SELECT
  let builder = (
    supabaseClient
      .from('user_cards_with_mtg_cards')
      .select('*')
  )

  // WHERE - globalFilter
  if (options.globalFilter)
    builder = applyScryfallGlobalFilter(builder, options.globalFilter)

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
  return data as UserCardData[]
}

export async function getTotalCardsCountByUserSession(session: Session, { globalFilter, filters }: UserCardQueryProps = {}) {
  const supabaseClient = await createClientWithRLS(session.supabaseAccessToken)

  // SELECT
  // {head: true} means only return the count, no actual row fetching is performed
  let builder = (
    supabaseClient
      .from('user_cards_with_mtg_cards')
      .select('*', { count: 'exact', head: true })
  )

  // WHERE - globalFilter
  if (globalFilter)
    builder = applyScryfallGlobalFilter(builder, globalFilter)

  // WHERE
  Object
    .entries(filters || {})
    // use 'Object.filter()' to drop empty values
    .filter(([_key, { value }]) => !(value === null || value === '' || (Array.isArray(value) && value.length === 0)))
    .forEach(([key, { operator, value }]) => {
      builder = applyVerboseOperator(builder, { key, operator, value })
    })

  // EXECUTE
  const { count, error } = await builder
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

export async function updateCardsDataByUserSession(session: Session, cards: UserCardMutationVariables) {
  await createMissingMtgCards(session, cards.map(card => card.scryfall_id))

  const { affectedRows: affectedRowsUpsert } = await _upsertUserCardsDataPgql(session, cards.filter(item => !item.id))
  const { affectedRows: affectedRowsUpdate } = await _updateUserCardPgql(session, cards.filter(item => item.id))
  const affectedRows = [...affectedRowsUpsert, ...affectedRowsUpdate]

  let [insertedRowCount, updatedRowCount, deletedRowCount] = [0, 0, 0]
  for (const row of affectedRows) {
    if (row.amount <= 0)
      deletedRowCount++
    else if (new Date(row.created_at).getTime() !== new Date(row.updated_at).getTime())
      updatedRowCount++
    else
      insertedRowCount++
  }

  return {
    affectedRows,
    insertedRowCount,
    updatedRowCount,
    deletedRowCount,
  }
}

export async function createMissingMtgCards(session: Session, scryfallIds: string[]) {
  const supabaseClient = await createClientWithRLS(session.supabaseAccessToken)

  const { data: presentCardsData } = (
    await supabaseClient
      .from('mtg_cards')
      .select('id')
      .in('id', scryfallIds)
  )

  const missingCardIds = scryfallIds.filter(id =>
    !presentCardsData.find(card => card.id === id)
  )

  if (!missingCardIds)
    return {}

  const { data: newCardsData } = await scryfall.getCardsDataByIds(missingCardIds)
  const processedNewCardsData = newCardsData.map(card => {
    if (card['card_faces']) {
      // in case of double faced cards
      // ignore some fields from the first card face and merge them with the base card
      const { object, type_line, name, ...rest } = card['card_faces'][0]
      card = { ...card, ...rest }
    }
    return card
  })

  return (
    await supabaseClient
      .from('mtg_cards')
      .insert(processedNewCardsData)
  )
}

export async function updateCardPricesByIds(
  session: Session,
  cards: UserCardData[],
  { priceUpdatedAtThreshold = 1000 * 60 * 60 * 24 * 7 /* 7 days */ } = {}
) {
  const supabaseClient = await createClientWithRLS(session.supabaseAccessToken)
  const utcNow = new Date()

  const { data: newCards } = await scryfall.getCardsDataByIds(
    cards
      .filter(card => new Date(card.prices_updated_at).getTime() < utcNow.getTime() - priceUpdatedAtThreshold)
      .map(card => card.scryfall_id)
  )

  const res = await Promise.all(
    newCards.map(async (item) =>
      await supabaseClient
        .from('mtg_cards')
        .update({
          prices_updated_at: utcNow.toISOString(),
          prices: item.prices,
        })
        .eq('id', item.id)
        .select('id')
    )
  )

  const { data, error } = res.reduce((acc, { data, error }) => {
    error && acc.error.push(error)
    data && acc.data.push(data)
    return acc
  }, { data: [], error: [] })

  if (error.length > 0)
    throw error
  return data
}

async function _upsertUserCardsDataPgql(session: Session, cards: UserCardMutationVariables) {
  if (cards?.length === 0)
    return { affectedRows: [], affectedRowCount: 0 }

  const pgClient = createPgClient()
  const queryText = `
    INSERT INTO user_cards(owner_id, scryfall_id, amount, altered, condition, foil, misprint, signed, tags, override_card_data)
    VALUES
      ${cards.map(card => `(
        '${session.user.id}',
        '${card.scryfall_id}',
        ${card.amount ?? 0},
        ${card.altered ?? false},
        '${card.condition ?? 'NM'}',
        ${card.foil ?? false},
        ${card.misprint ?? false},
        ${card.signed ?? false},
        '{${card.tags?.join(',') ?? ''}}',
        '${JSON.stringify(card.override_card_data ?? {})}'
      )`).join(',')}
    ON CONFLICT (owner_id, scryfall_id, altered, condition, foil, misprint, signed, tags, override_card_data)
    DO UPDATE SET amount = user_cards.amount + EXCLUDED.amount
    RETURNING *;
  `
  pgClient.connect()
  const {
    rows: affectedRows,
    rowCount: affectedRowCount
  } = await pgClient.query(queryText) as { rows: UserCardBaseData[], rowCount: number }
  pgClient.end()

  return { affectedRows, affectedRowCount }
}

async function _updateUserCardPgql(session: Session, cards: UserCardMutationVariables) {
  const supabaseClient = await createClientWithRLS(session.supabaseAccessToken)
  const affectedRows: UserCardBaseData[] = []
  let affectedRowCount = 0

  for (const newCard of cards) {
    const { data, error } = (
      await supabaseClient
        .from('user_cards')
        .update(newCard)
        .eq('id', newCard.id)
        .select('*')
    )

    if (error?.message.match(/violates unique constraint/i)) {
      // merge with existing card
      const oldCard = (
        await supabaseClient
          .from('user_cards')
          .select('id, scryfall_id, amount, altered, condition, foil, misprint, signed, tags, override_card_data')
          .eq('scryfall_id', newCard.scryfall_id)
          .eq('altered', newCard.altered)
          .eq('condition', newCard.condition)
          .eq('foil', newCard.foil)
          .eq('misprint', newCard.misprint)
          .eq('signed', newCard.signed)
          .contains('tags', newCard.tags)
          .containedBy('tags', newCard.tags)
          .contains('override_card_data', newCard.override_card_data)
      ).data[0]

      const mergedCard = {
        ...newCard,
        amount: oldCard.amount + newCard.amount,
      }

      const { data: deletedData } = (
        await supabaseClient
          .from('user_cards')
          .delete()
          .eq('id', oldCard.id)
          .select('*')
      )

      const { data: updatedData } = (
        await supabaseClient
          .from('user_cards')
          .update(mergedCard)
          .eq('id', mergedCard.id)
          .select('*')
      )

      affectedRows.push(...deletedData as UserCardBaseData[], ...updatedData as UserCardBaseData[])
      affectedRowCount++
    }

    else if (data) {
      affectedRows.push(...data as UserCardBaseData[])
      affectedRowCount++
    }
  }

  return { affectedRows, affectedRowCount }
}
