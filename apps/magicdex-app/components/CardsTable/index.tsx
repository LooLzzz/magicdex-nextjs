import { CardData } from '@/types'
import { MantineReactTable, MRT_ColumnDef } from 'mantine-react-table'
import { useMemo } from 'react'


export default function CardsTable({
  cards,
  isLoading,
  error,
}: {
  cards: CardData[],
  isLoading: boolean,
  error?: Error,
}) {
  const columns = useMemo<MRT_ColumnDef<CardData>[]>(() => [
    // {
    //   accessorKey: 'id',
    //   header: 'ID',
    // },
    // {
    //   accessorKey: 'ownerId',
    //   header: 'Owner ID',
    // },
    {
      accessorKey: 'scryfallId',
      header: 'Scryfall ID',
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
    },
  ], [])

  return (
    <MantineReactTable
      columns={columns}
      data={isLoading ? [] : cards}
      enableRowSelection
      mantineToolbarAlertBannerProps={
        error
          ? {
              color: 'error',
              children: 'Error loading data',
            }
          : null
      }
      state={{
        isLoading,
        showProgressBars: isLoading,
      }}
    />

    // <Text>
    //   {
    //     error
    //       ? `Error loading cards: ${error}`
    //       : isLoading
    //         ? 'Loading...'
    //         : cards?.length === 0
    //           ? <Title order={3}>No cards found</Title>
    //           : <ul>
    //             {cards.map(card => (
    //               <li key={card.id}>
    //                 {Object.keys(card).sort().map(key => (
    //                   <React.Fragment key={key}>
    //                     {key}: <Code>{card[key]}</Code>
    //                     <br />
    //                   </React.Fragment>
    //                 ))}
    //               </li>
    //             ))}
    //           </ul>
    //   }
    // </Text>
  )
}
