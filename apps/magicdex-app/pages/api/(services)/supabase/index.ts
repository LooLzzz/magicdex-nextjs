import { VerboseOperator } from '@/api/(types)'
import { PostgrestFilterBuilder } from '@supabase/postgrest-js'
import { createClient } from '@supabase/supabase-js'
import { Client as PgClient } from 'pg'


const supabasePublicClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
)

const supabaseNextAuthClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    db: {
      schema: 'next_auth',
    }
  }
)

const createClientWithRLS = async (supabaseAccessToken: string) => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      global: {
        headers: {
          Authorization: `Bearer ${supabaseAccessToken}`,
        },
      },
    }
  )
}

const createPgClient = () => (
  new PgClient({
    connectionString: process.env.SUPABASE_POSTGRES_CONNECTION_URI,
  })
)

function applyVerboseOperator(
  builder: PostgrestFilterBuilder<undefined, undefined, { [x: string]: undefined }[]>,
  { key, operator, value }: { key: string, operator: VerboseOperator, value: string | string[] | boolean | number }
) {
  switch (operator) {
    case 'equals':
      return builder.eq(key, value)

    case 'notEquals':
      return builder.neq(key, value)

    case 'fuzzy':
      // TODO: make 'SIMILARITY()' postgres function work somehow
      // builder = builder.select(`SIMILARITY(${key}, '${value}')`)
      // return builder.ilike(key, `%${value}%`)
      return builder.textSearch(key, `${value}%`, { type: 'websearch' })

    case 'arrIncludesAny':
      return builder.in(key, value as string[])

    case 'arrIncludesAll':
      return builder.contains(key, value as string[])

    case 'arrExcludesAny':
      for (const val of value as string[])
        builder = builder.not(key, 'cs', `{"${val}"}`)
      return builder

    case 'lessThanOrEqualTo':
      return builder.lte(key, value)

    case 'greaterThanOrEqualTo':
      return builder.gte(key, value)

    case 'lessThan':
      return builder.lt(key, value)

    case 'greaterThan':
      return builder.gt(key, value)

    default:
      return undefined
  }
}

function applyScryfallGlobalFilter(
  builder: PostgrestFilterBuilder<undefined, undefined, { [x: string]: undefined }[]>,
  globalFilter: string,
) {
  // TODO: implement scryfall's search syntax for globalFilter
  builder = builder.or(
    `name.ilike.%${globalFilter}%`
    + `, type_line.ilike.%${globalFilter}%`
    + `, oracle_text.ilike.%${globalFilter}%`
    + `, tags.cs.{"${globalFilter}"}`
  )
  return builder
}

export {
  applyScryfallGlobalFilter,
  applyVerboseOperator,
  createClientWithRLS,
  createPgClient,
  supabaseNextAuthClient,
  supabasePublicClient as default,
}
