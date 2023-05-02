import { UserCardData } from '@/types/supabase'
import { FilterFn } from '@tanstack/table-core'


export const filterFns = {
  arrIncludesAll: () => undefined,
  arrIncludesAny: () => undefined,
  arrExcludesAny: () => undefined,
} as { [key: string]: FilterFn<UserCardData> }

export const localization = {
  filterArrIncludesAll: 'Include All',
  filterArrIncludesAny: 'Include Any',
  filterArrExcludesAny: 'Exclude Any',
}

export const filtersDef = {
  filterFns,
  localization,
}

export default filtersDef
