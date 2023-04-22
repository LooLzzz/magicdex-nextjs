import { VerboseOperator } from '@/api/(types)'
import { PostgrestFilterBuilder } from '@supabase/postgrest-js'
import { createClient, SupabaseClient } from '@supabase/supabase-js'


const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
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

export {
  createClientWithRLS,
  supabase as default,
  applyVerboseOperator,
}
