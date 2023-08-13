import { UserCardData } from '@/types/supabase'
import { FilterFn } from '@tanstack/table-core'
import { MRT_ColumnFiltersState } from 'mantine-react-table'
import { Dispatch, SetStateAction, createContext } from 'react'


const filterFns = {
  arrIncludesAll: () => undefined,
  arrIncludesAny: () => undefined,
  arrExcludesAny: () => undefined,
} as { [key: string]: FilterFn<UserCardData> }

const localization = {
  filterArrIncludesAll: 'Include All',
  filterArrIncludesAny: 'Include Any',
  filterArrExcludesAny: 'Exclude Any',
}

const filtersDef = {
  filterFns,
  localization,
}

const ColumnFiltersContext = createContext<[MRT_ColumnFiltersState, Dispatch<SetStateAction<MRT_ColumnFiltersState>>]>([[], prev => prev])

export {
  ColumnFiltersContext,
  filterFns,
  filtersDef as default,
  filtersDef,
  localization,
}

