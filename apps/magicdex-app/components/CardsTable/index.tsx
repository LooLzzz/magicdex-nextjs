import cardbackImage from '@/public/cardback.png'
import { CardData } from '@/types/firestore'
import { Grid, JsonInput } from '@mantine/core'
import { MantineReactTable, MRT_ExpandedState, MRT_SortingState, MRT_TableInstance } from 'mantine-react-table'
import Image from 'next/image'
import { useRef, useState } from 'react'
import { cardbackSmallBase64 } from './cardbackBase64'
import filtersDefinition from './filtersDefinitions'
import { useColumnsDef } from './tableDefinitions'


export default function CardsTable({
  cards,
  isLoading,
  error,
}: {
  cards: CardData[],
  isLoading: boolean,
  error?: Error,
}) {
  const tableInstanceRef = useRef<MRT_TableInstance<CardData>>(null)
  const [expandedRows, setExpandedRows] = useState<MRT_ExpandedState>({})
  const [sortingRows, setSortingRows] = useState<MRT_SortingState>([{ id: 'scryfallData.name', desc: false }])
  const columns = useColumnsDef(cards)

  return (
    <MantineReactTable
      tableInstanceRef={tableInstanceRef}
      columns={columns}
      data={cards}
      state={{
        expanded: expandedRows,
        isLoading,
        showProgressBars: isLoading,
        sorting: sortingRows,
      }}
      mantineTableProps={{
        sx: {
          // hide 'Expand' column label
          '& th:first-of-type': {
            '& :last-child': {
              display: 'none',
            },
          },
        },
      }}

      filterFns={filtersDefinition.filterFns}
      localization={filtersDefinition.localization as unknown}
      enableColumnFilterModes
      enableColumnResizing
      autoResetExpanded
      enableMultiSort
      enableRowSelection={false}
      enableExpandAll={false}

      mantineToolbarAlertBannerProps={
        error
          ? {
            color: 'error',
            children: `Error loading data: ${error.message}`,
          }
          : undefined
      }

      onSortingChange={sortingUpdater => {
        (typeof sortingUpdater === 'boolean' || typeof sortingUpdater === 'object')
          ? setSortingRows(sortingUpdater)
          : setSortingRows(sortingUpdater(sortingRows))
      }}
      onExpandedChange={expandedUpdater => {
        if (typeof expandedUpdater === 'boolean' || typeof expandedUpdater === 'object') {
          // expan/close all
          setExpandedRows(expandedUpdater)
        } else {
          // single row expand/close
          // keep only a single row open at a time
          const expandedUpdaterResult = expandedUpdater(expandedRows)
          if (Object.keys(expandedUpdaterResult).length > 1) {
            const diff = Object.keys(expandedUpdaterResult).filter(key => !Object.keys(expandedRows).includes(key))
            setExpandedRows({ [diff[0]]: true })
          } else {
            setExpandedRows(expandedUpdaterResult)
          }
        }
      }}

      renderDetailPanel={cell => (
        <Grid columns={2}>
          <Grid.Col md={2} lg={1} sx={{ textAlign: 'center' }}>
            <Image
              src={cell.row.original.scryfallData.card_faces ? cell.row.original.scryfallData.card_faces[0].image_uris.png : cell.row.original.scryfallData.image_uris.png || cardbackImage}
              alt={cell.row.original.scryfallData.name}
              placeholder='blur'
              blurDataURL={cardbackSmallBase64}
              width={256}
              height={357}
            />
          </Grid.Col>
          <Grid.Col md={2} lg={1}>
            <JsonInput
              // sx={{ flex: 1 }}
              formatOnBlur
              minRows={20}
              defaultValue={JSON.stringify(cell.row.original.scryfallData)}
            />
          </Grid.Col>
        </Grid>
      )}
    />
  )
}
