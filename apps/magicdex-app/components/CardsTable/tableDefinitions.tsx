import { CardColor } from '@/types/scryfall'
import { UserCardData } from '@/types/supabase'
import { toTitleCase } from '@/utils'
import { Menu, Text, Tooltip } from '@mantine/core'
import { MRT_Cell, MRT_ColumnDef } from 'mantine-react-table'
import { useMemo } from 'react'


export const cardRarityMap = {
  common: 0,
  uncommon: 1,
  rare: 2,
  mythic: 3,
  special: 4,
  bonus: 5,
}

const CellWithLineClampText = <T,>({ cell, lineClamp = 2 }: { cell: MRT_Cell<T>, lineClamp: number }) => (
  <Text title={cell.getValue<string>()} lineClamp={lineClamp}>
    {cell.getValue<string>()}
  </Text>
)

/**
 * Basically just a `useMemo` hook that returns the columns definition for the table:
 * `useMemo(() => [...columnDef], [cards])`
 */
const useColumnsDef = (allSets: string[]) => {
  return useMemo<MRT_ColumnDef<UserCardData>[]>(() => [
    {
      accessorKey: 'amount',
      header: 'Amount',
      filterFn: 'equals',
      columnFilterModeOptions: ['equals', 'notEquals', 'greaterThan', 'greaterThanOrEqualTo', 'lessThan', 'lessThanOrEqualTo'],
      enableColumnFilterModes: true,
      enableFilterMatchHighlighting: false,
      mantineFilterTextInputProps: {
        placeholder: 'by Amount',
        type: 'number',
      },
    },

    {
      accessorKey: 'name',
      header: 'Name',
      columnFilterModeOptions: ['fuzzy', 'equals'],
      enableColumnFilterModes: true,
      mantineFilterTextInputProps: {
        placeholder: 'by Name',
      },
      Cell: CellWithLineClampText as undefined,
    },

    {
      accessorKey: 'set',
      header: 'Set',
      filterVariant: 'multi-select',
      filterFn: 'arrIncludesAny',
      enableColumnFilterModes: false,
      mantineFilterTextInputProps: {
        placeholder: 'by Set Name',
      },
      mantineFilterMultiSelectProps: {
        // TODO: get this from the metadata received from the API
        // TODO: find out how to separate 'dataValue' and 'displayValue' for the multi-select
        data: allSets as unknown as readonly string[] & string,
      },
      Cell: ({ cell }) => (
        <Tooltip
          withArrow
          label={cell.row.original.set_name + ' - ' + toTitleCase(cell.row.original.rarity)}
        >
          <span
            className={[
              'ss',
              'ss-fw',
              'ss-2x',
              'ss-' + cell.row.original.rarity.toLowerCase(),
              'ss-' + cell.row.original.set.toLowerCase(),
            ].join(' ')
            }
          />
        </Tooltip>
      ),
    },

    {
      accessorKey: 'rarity',
      header: 'Rarity',
      filterVariant: 'multi-select',
      filterFn: 'arrIncludesAny',
      enableColumnFilterModes: false,
      mantineFilterTextInputProps: {
        placeholder: 'by Rarity',
      },
      mantineFilterMultiSelectProps: {
        data: Object.keys(cardRarityMap).map(toTitleCase) as unknown as readonly string[] & string,
      },
      Cell: ({ cell }) => (
        toTitleCase(cell.getValue<string>())
      ),
    },

    {
      accessorFn: card => card.type_line.replace(/—/g, '-'),
      id: 'type_line',
      header: 'Type',
      filterFn: 'fuzzy',
      enableColumnFilterModes: false,
      mantineFilterTextInputProps: {
        placeholder: 'by Type',
      },
      Cell: CellWithLineClampText as undefined,
    },

    {
      accessorKey: 'mana_cost',
      header: 'Mana Cost',
      filterFn: 'equals',
      columnFilterModeOptions: ['equals', 'notEquals', 'greaterThan', 'greaterThanOrEqualTo', 'lessThan', 'lessThanOrEqualTo'],
      enableColumnFilterModes: true,
      enableFilterMatchHighlighting: false,
      mantineFilterTextInputProps: {
        title: 'by Converted Mana Cost',
        placeholder: 'by CMC',
        type: 'number',
      },
      Cell: ({ cell }) => {
        const cellValue = cell.getValue<string>()
        return cellValue?.length
          ? <span title={cellValue}>
            {
              [...cellValue.matchAll(/{(\w+)}/g)]
                .map(([_fullMatch, color], idx) => (
                  <span
                    key={idx}
                    style={{ margin: '0 1px' }}
                    className={[
                      'ms',
                      'ms-shadow',
                      'ms-cost',
                      'ms-' + color.toLowerCase(),
                    ].join(' ')}
                  />
                ))
            }
          </span>
          : null
      },
      // TODO: handle "not-regular" cards with 2 different mana costs (modals / doublefaced cards / split cards / etc.)
    },

    {
      accessorKey: 'color_identity',
      header: 'Color Identity',
      filterVariant: 'multi-select',
      filterFn: 'arrIncludesAll',
      columnFilterModeOptions: ['arrIncludesAll', 'arrIncludesAny', 'arrExcludesAny'],
      enableColumnFilterModes: true,
      renderColumnFilterModeMenuItems: ({ onSelectFilterMode, table }) => {
        const activeFilterFn = table.getState().columnFilterFns.color_identity
        return (
          <>
            <Menu.Item
              icon={<Text size='lg'>=</Text>}
              color={activeFilterFn === 'arrIncludesAll' ? 'blue' : undefined}
              onClick={() => onSelectFilterMode('arrIncludesAll')}
            >
              Include All
            </Menu.Item>
            <Menu.Item
              icon={<Text size='lg'>∈</Text>}
              color={activeFilterFn === 'arrIncludesAny' ? 'blue' : undefined}
              onClick={() => onSelectFilterMode('arrIncludesAny')}
            >
              Include Any
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item
              icon={<Text size='lg'>∉</Text>}
              color={activeFilterFn === 'arrExcludesAny' ? 'blue' : undefined}
              onClick={() => onSelectFilterMode('arrExcludesAny')}
            >
              Exclude Any
            </Menu.Item>
          </>
        )
      },
      mantineFilterMultiSelectProps: {
        title: 'by Colors',
        placeholder: 'by Colors',
        data: ['W', 'U', 'B', 'R', 'G', '∅'] as unknown as readonly string[] & string,
      },
      Cell: ({ cell }) => {
        const cellValue = cell.getValue<CardColor[]>()
        return cellValue?.length
          ? <span title={cellValue.map(v => `{${v}}`).join('')}>
            {
              cellValue.map((color, idx) => (
                <span
                  key={idx}
                  style={{ margin: '0 1px' }}
                  className={[
                    'ms',
                    'ms-shadow',
                    'ms-cost',
                    'ms-' + color.toLowerCase(),
                  ].join(' ')}
                />
              ))
            }
          </span>
          : null
      },
    }
  ], [allSets])
}

export {
  useColumnsDef
}
