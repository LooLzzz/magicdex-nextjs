import { CardColor } from '@/types/scryfall'
import { UserCardData } from '@/types/supabase'
import { toTitleCase } from '@/utils'
import {
  Box,
  Center,
  Checkbox,
  CloseButton,
  clsx,
  Group,
  Menu,
  MultiSelectValueProps,
  Text,
  Tooltip
} from '@mantine/core'
import { MRT_ColumnDef } from 'mantine-react-table'
import { useMemo } from 'react'
import CardText from './CardText'


const cardRarityMap = {
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
export default function useColumnsDef(allSets: { set_name: string, set_id: string }[]) {
  const initialColumnSizing = {
    amount: 140,
    foil: 140,
    mana_cost: 170,
    price: 125,
    set: 140,
  }

  const columns = useMemo<MRT_ColumnDef<UserCardData>[]>(() => [
    {
      accessorKey: 'amount',
      header: 'Amount',
      filterFn: 'equals',
      columnFilterModeOptions: ['equals', 'notEquals', 'greaterThan', 'greaterThanOrEqualTo', 'lessThan', 'lessThanOrEqualTo'],
      enableColumnFilterModes: true,
      mantineFilterTextInputProps: {
        placeholder: 'by Amount',
        type: 'number',
      },
      Cell: ({ cell }) => (
        <Text align='right'>
          {cell.getValue<number>()}
        </Text>
      ),
    },

    {
      accessorKey: 'name',
      header: 'Name',
      columnFilterModeOptions: ['fuzzy', 'equals'],
      enableColumnFilterModes: true,
      mantineFilterTextInputProps: {
        placeholder: 'by Name',
      },
      Cell: ({ cell }) => (
        <CardText
          replaceHyphen
          lineClamp={2}
          title={cell.getValue<string>()}
          style={{ cursor: 'inherit' }}
        >
          {cell.getValue<string>()}
        </CardText>
      ),
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
        data: allSets.map(({ set_name, set_id }) => ({ value: set_name, label: set_name, chiplabel: set_id })) as undefined,
        valueComponent: ({ value, label, onRemove, classNames, chiplabel: chipLabel, ...rest }: MultiSelectValueProps & { value: string, chiplabel: string }) => (
          <div {...rest}>
            <Box
              sx={theme => ({
                display: 'flex',
                cursor: 'default',
                alignItems: 'center',
                backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.white,
                border: `1 solid ${theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.colors.gray[4]}`,
                paddingLeft: theme.spacing.xs,
                borderRadius: theme.radius.sm,
              })}
            >
              <Text size='xs'>{chipLabel}</Text>
              <CloseButton
                onMouseDown={onRemove}
                variant='transparent'
                iconSize={14}
              />
            </Box>
          </div>
        ),
      },
      Cell: ({ cell }) => (
        <Center>
          <Tooltip
            withArrow
            transitionProps={{ transition: 'pop' }}
            events={{ hover: true, focus: true, touch: true }}
            label={<>{cell.row.original.set_name} - <Text span italic>{toTitleCase(cell.row.original.rarity)}</Text></>}
          >
            <span>
              <CardText.Set
                disableTitle
                data={cell.row.original}
                classes={['ss-2x']}
                style={{ cursor: 'inherit' }}
              />
            </span>
          </Tooltip>
        </Center>
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
        data: Object.keys(cardRarityMap).map(toTitleCase) as undefined,
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
      Cell: ({ cell }) => (
        <CardText
          replaceHyphen
          lineClamp={2}
          title={cell.getValue<string>()}
          style={{ cursor: 'inherit' }}
        >
          {cell.getValue<string>()}
        </CardText>
      ),
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
      Cell: ({ cell }) => (
        <CardText
          containsManaSymbols
          title={`${cell.row.original.cmc} Cmc`}
          style={{ cursor: 'inherit' }}
        >
          {
            (
              cell.row.original.card_faces
                ? [
                  cell.row.original.card_faces[0].mana_cost,
                  cell.row.original.card_faces[1].mana_cost,
                ]
                : [cell.getValue<string>()]
            )
              .filter(value => value?.length)
              .join(' // ')
          }
        </CardText>
      ),
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
        data: ['W', 'U', 'B', 'R', 'G'] as undefined,
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
                  className={clsx([
                    'ms',
                    'ms-shadow',
                    'ms-cost',
                    'ms-' + color.toLowerCase(),
                  ])}
                />
              ))
            }
          </span>
          : null
      },
    },

    {
      accessorKey: 'foil',
      header: 'Foil',
      filterVariant: 'select',
      enableColumnFilterModes: false,
      mantineFilterTextInputProps: {
        placeholder: 'by Foil',
      },
      mantineFilterSelectProps: {
        data: ['True', 'False'] as undefined,
      },
      Cell: ({ cell }) => (
        <Group position='center'>
          <Checkbox readOnly
            classNames={{ input: 'cursor-not-allowed' }}
            checked={cell.getValue<boolean>()}
          />
        </Group>
      ),
    },

    {
      accessorKey: 'price_usd',
      header: 'Price',
      filterFn: 'equals',
      columnFilterModeOptions: ['equals', 'notEquals', 'greaterThan', 'greaterThanOrEqualTo', 'lessThan', 'lessThanOrEqualTo'],
      enableColumnFilterModes: true,
      mantineFilterTextInputProps: {
        placeholder: 'by Price',
      },
      Cell: ({ cell }) => {
        const { amount, price_usd } = cell.row.original

        return (
          <Text align='center'>
            {
              typeof price_usd === 'number'
                ? amount === 1
                  ? `$${price_usd}`
                  : <>
                    <Tooltip
                      withArrow
                      transitionProps={{ transition: 'pop' }}
                      events={{ hover: true, focus: true, touch: true }}
                      label='Price for x1'
                    >
                      <span>${price_usd}</span>
                    </Tooltip>
                    {' / '}
                    <Tooltip
                      withArrow
                      transitionProps={{ transition: 'pop' }}
                      events={{ hover: true, focus: true, touch: true }}
                      label={`Price for x${amount}`}
                    >
                      <span>${price_usd * amount}</span>
                    </Tooltip>
                  </>
                : <Text italic>N/A</Text>
            }
          </Text>
        )
      }
    },
  ], [allSets])

  return { columns, initialColumnSizing }
}
