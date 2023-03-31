import { CardData } from '@/types/firestore'
import { CardColorColorless } from '@/types/scryfall'
import { FilterFn } from '@tanstack/table-core'


function _ifArrayEmpty<T>(array: T[], value: T[]) {
  return array?.length ? array : value
}

export const filterFns = {
  setName: (row, _id, filterValue: string) => !filterValue || row.original.scryfallData.set_name === filterValue,
  setNameMulti: (row, _id, filterValue: string[]) => !filterValue?.length || filterValue.includes(row.original.scryfallData.set_name),
  colorArrayIncludesAll: (row, _id, filterValue: CardColorColorless[]) => !filterValue?.length || filterValue.every(color => _ifArrayEmpty(row.original.scryfallData.color_identity, ['∅']).includes(color)),
  colorArrayIncludesAny: (row, _id, filterValue: CardColorColorless[]) => !filterValue?.length || filterValue.some(color => _ifArrayEmpty(row.original.scryfallData.color_identity, ['∅']).includes(color)),
  colorArrayExcludesAny: (row, _id, filterValue: CardColorColorless[]) => !filterValue?.length || !filterValue.some(color => _ifArrayEmpty(row.original.scryfallData.color_identity, ['∅']).includes(color)),
  colorArrayExcludesAll: (row, _id, filterValue: CardColorColorless[]) => !filterValue?.length || !filterValue.every(color => _ifArrayEmpty(row.original.scryfallData.color_identity, ['∅']).includes(color)),
  weakIncludes: (row, id, filterValue: string[]) => !filterValue?.length || filterValue.some(value => row.getValue<string>(id).toLowerCase() === value.toLowerCase()),
  cmcEquals: (row, _id, filterValue: string) => !filterValue || Number.parseInt(filterValue) === row.original.scryfallData.cmc,
  cmcNotEquals: (row, _id, filterValue: string) => !filterValue || Number.parseInt(filterValue) !== row.original.scryfallData.cmc,
  cmcGreaterThan: (row, _id, filterValue: string) => !filterValue || Number.parseInt(filterValue) > row.original.scryfallData.cmc,
  cmcGreaterThanOrEqualTo: (row, _id, filterValue: string) => !filterValue || Number.parseInt(filterValue) >= row.original.scryfallData.cmc,
  cmcLessThan: (row, _id, filterValue: string) => !filterValue || Number.parseInt(filterValue) < row.original.scryfallData.cmc,
  cmcLessThanOrEqualTo: (row, _id, filterValue: string) => !filterValue || Number.parseInt(filterValue) <= row.original.scryfallData.cmc,
} as { [key: string]: FilterFn<CardData> }

export const localization = {
  filterSetName: 'Equals',
  filterSetNameMulti: 'In',
  filterColorArrayIncludesAll: 'Includes All',
  filterColorArrayIncludesAny: 'Includes Any',
  filterColorArrayExcludesAll: 'Excludes All',
  filterColorArrayExcludesAny: 'Excludes Any',
  filterWeakIncludes: 'Weak Includes',
  filterCmcEquals: 'Equals',
  filterCmcNotEquals: 'Not Equals',
  filterCmcGreaterThan: 'Greater Than',
  filterCmcGreaterThanOrEqualTo: 'Greater Than/Equal',
  filterCmcLessThan: 'Less Than',
  filterCmcLessThanOrEqualTo: 'Less Than/Equal',
}


export const filtersDefinition = {
  filterFns,
  localization,
}

export default filtersDefinition
