import { CardData } from '@/types/firestore'
import { CardColor, CardRarity } from '@/types/scryfall'
import { toTitleCase } from '@/utils'
import { Menu, Text } from '@mantine/core'
import { MRT_ColumnDef } from 'mantine-react-table'
import { useMemo } from 'react'


export const cardRarityMap = {
  common: 0,
  uncommon: 1,
  rare: 2,
  mythic: 3,
  special: 4,
  bonus: 5,
}

/**
 * Basically just a `useMemo` hook that returns the columns definition for the table:
 * `useMemo(() => [...columnDef], [cards])`
 */
const useColumnsDef = (cards: CardData[]) => {
  return useMemo<MRT_ColumnDef<CardData>[]>(() => [
    {
      accessorKey: 'amount',
      header: 'Amount',
      columnFilterModeOptions: ['equals', 'betweenInclusive', 'greaterThanOrEqualTo', 'lessThanOrEqualTo'],
      filterFn: 'equals',
      enableColumnFilterModes: true,
      enableFilterMatchHighlighting: false,
      mantineFilterTextInputProps: {
        type: 'number',
      },
    },

    {
      accessorKey: 'scryfallData.set',
      header: 'Set',
      filterVariant: 'multi-select',
      filterFn: 'setNameMulti',  // custom filter function, check 'MantineReactTable.filterFns' prop
      columnFilterModeOptions: ['setNameMulti', 'setName'],
      enableColumnFilterModes: false,
      mantineFilterMultiSelectProps: {
        data: [...new Set(cards.map(card => card.scryfallData.set_name))].sort() as unknown as readonly string[] & string,
      },
      // TODO: render set symbol (https://keyrune.andrewgioia.com/)
    },

    {
      accessorKey: 'scryfallData.name',
      header: 'Name',
      columnFilterModeOptions: ['fuzzy', 'contains', 'startsWith', 'endsWith'],
      enableColumnFilterModes: true,
    },

    {
      accessorKey: 'scryfallData.rarity',
      header: 'Rarity',
      sortingFn: (rowA, rowB, columnId) => cardRarityMap[rowA.getValue<CardRarity>(columnId)] - cardRarityMap[rowB.getValue<CardRarity>(columnId)],
      filterVariant: 'multi-select',
      filterFn: 'weakIncludes',
      enableColumnFilterModes: false,
      mantineFilterMultiSelectProps: {
        data: Object.keys(cardRarityMap).map(toTitleCase) as unknown as readonly string[] & string,
      },
      Cell: ({ cell }) => (
        toTitleCase(cell.getValue<string>())
      ),
    },

    {
      accessorFn: card => card.scryfallData.type_line.replace(/—/g, '-'),
      id: 'scryfallData.type_line',
      header: 'Type',
      columnFilterModeOptions: ['fuzzy', 'contains', 'startsWith', 'endsWith'],
      enableColumnFilterModes: true,
    },

    {
      accessorKey: 'scryfallData.mana_cost',
      header: 'Mana Cost',
      enableColumnFilterModes: true,
      columnFilterModeOptions: ['cmcEquals', 'cmcNotEquals', 'cmcGreaterThan', 'cmcGreaterThanOrEqualTo', 'cmcLessThan', 'cmcLessThanOrEqualTo'],
      filterFn: 'cmcEquals',
      enableFilterMatchHighlighting: false,
      mantineFilterTextInputProps: {
        type: 'number',
        placeholder: 'Filter by CMC',
      },
      renderColumnFilterModeMenuItems: ({ onSelectFilterMode }) => (
        <>
          <Menu.Item icon={<Text size='lg'>=</Text>} key='cmcEquals' onClick={() => onSelectFilterMode('cmcEquals')}>
            Equals
          </Menu.Item>
          <Menu.Item icon={<Text size='lg'>≠</Text>} key='cmcNotEquals' onClick={() => onSelectFilterMode('cmcNotEquals')}>
            Not Equals
          </Menu.Item>
          <Menu.Divider />
          <Menu.Item icon={<Text size='lg'>{'>'}</Text>} key='cmcGreaterThan' onClick={() => onSelectFilterMode('cmcGreaterThan')}>
            Greater Than
          </Menu.Item>
          <Menu.Item icon={<Text size='lg'>≥</Text>} key='cmcGreaterThanOrEqualTo' onClick={() => onSelectFilterMode('cmcGreaterThanOrEqualTo')}>
            Greater Than Or Equal To
          </Menu.Item>
          <Menu.Item icon={<Text size='lg'>{'<'}</Text>} key='cmcLessThan' onClick={() => onSelectFilterMode('cmcLessThan')}>
            Less Than
          </Menu.Item>
          <Menu.Item icon={<Text size='lg'>≤</Text>} key='cmcLessThanOrEqualTo' onClick={() => onSelectFilterMode('cmcLessThanOrEqualTo')}>
            Less Than Or Equal To
          </Menu.Item>
        </>
      )
      // TODO: render color symbols (https://mana.andrewgioia.com/)
      // TODO: handle "not-regular" cards with 2 different mana costs (modals / doublefaced cards / split cards / etc.)
    },

    {
      accessorKey: 'scryfallData.color_identity',
      header: 'Color Identity',
      enableColumnFilterModes: true,
      filterVariant: 'multi-select',
      columnFilterModeOptions: ['colorArrayIncludesAll', 'colorArrayIncludesAny', 'colorArrayExcludesAll', 'colorArrayExcludesAny'],
      filterFn: 'colorArrayIncludesAll',  // custom filter function, check 'MantineReactTable.filterFns' prop
      mantineFilterMultiSelectProps: {
        data: ['W', 'U', 'B', 'R', 'G', '∅'] as unknown as readonly string[] & string,
      },
      renderColumnFilterModeMenuItems: ({ onSelectFilterMode }) => (
        <>
          <Menu.Item key='colorArrayIncludesAll' onClick={() => onSelectFilterMode('colorArrayIncludesAll')}>
            Includes All
          </Menu.Item>
          <Menu.Item key='colorArrayIncludesAny' onClick={() => onSelectFilterMode('colorArrayIncludesAny')}>
            Includes Any
          </Menu.Item>
          {/* <Menu.Item key='colorArrayExcludesAll' onClick={() => onSelectFilterMode('colorArrayExcludesAll')}>
            Excludes All
          </Menu.Item>  // this Filter is a bit redundant.. */}
          <Menu.Item key='colorArrayExcludesAny' onClick={() => onSelectFilterMode('colorArrayExcludesAny')}>
            Excludes Any
          </Menu.Item>
        </>
      ),
      Cell: ({ cell }) => {
        const cellValue = cell.getValue<CardColor[]>()
        return cellValue?.length
          ? cellValue.map(color => `{${color}}`)  // TODO: render color symbols (https://mana.andrewgioia.com/)
          : '∅'
      },
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [cards])
}

export {
  useColumnsDef
}
