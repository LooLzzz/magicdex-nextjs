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

export const filtersDefinition = {
  filterFns,
  localization,
}

export default filtersDefinition
