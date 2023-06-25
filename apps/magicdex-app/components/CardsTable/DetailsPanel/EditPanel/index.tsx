import { ColumnFiltersContext } from '@/components/CardsTable/filtersDef'
import { useUserCardsMutation } from '@/services/hooks'
import { UserCardData } from '@/types/supabase'
import { Badge, Box, Button, Chip, Divider, Group, SimpleGrid, Stack, Text } from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import { IconCheck, IconX } from '@tabler/icons-react'
import { useQueryClient } from '@tanstack/react-query'
import { useContext } from 'react'

// TODO: make an info panel with edit functionality


export default function EditPanel({ card }: {
  card: UserCardData
}) {
  const queryClient = useQueryClient()
  const isLargerThanSm = useMediaQuery('(min-width: 576px)', false)
  // const isLargerThanMd = useMediaQuery('(min-width: 768px)', false)
  // const isLargerThanMd = useMediaQuery('(min-width: 36rem)', false)
  const [columnFilters, setColumnFilters] = useContext(ColumnFiltersContext)
  const { mutate: userCardsMutate, isLoading: isMutating } = useUserCardsMutation({
    onSettled: async () => {
      await queryClient.invalidateQueries({
        predicate: query => query.queryKey.includes('user-card-data')
      })
    },
  })

  const handleChipsOnChanged = (value: string[]) => {
    setColumnFilters([
      ...columnFilters.filter(item => item.id !== 'tags'),
      { id: 'tags', value }
    ])
  }

  const handleOnClick = ({ inc, foil }: { inc?: number, foil?: boolean }) => {
    userCardsMutate([{
      id: card.id,
      altered: card.altered,
      amount: inc === undefined ? card.amount : inc,
      condition: card.condition,
      foil: foil ?? card.foil,
      misprint: card.misprint,
      scryfall_id: card.scryfall_id,
      signed: card.signed,
      tags: card.tags,
      override_card_data: card.override_card_data,
    }])
  }

  return (
    <Box>
      <Group pb='xl' sx={{ justifyContent: 'flex-end' }}>
        <Button>Edit</Button>
      </Group>

      <SimpleGrid w='100%' spacing='xl' cols={isLargerThanSm ? 2 : 1}>
        <Stack spacing={7.5} align='left' justify='center' w='fit-content' sx={{ justifySelf: 'center', paddingTop: 7.5 }}>
          <Group noWrap position='center'>
            <Text>Amount</Text>
            <Badge color='gray' variant='light'>x{card.amount}</Badge>
          </Group>
          <Group noWrap position='center'>
            <Text>Condition</Text>
            <Badge color='gray' variant='light'>{card.condition}</Badge>
          </Group>
          <Divider w='100%' />
          <Stack spacing={7.5} align='center'>
            <Badge variant={card.foil ? 'filled' : 'outline'} rightSection={card.foil ? <IconCheck size='1rem' /> : <IconX size='1rem' />}>Foil</Badge>
            <Badge variant={card.signed ? 'filled' : 'outline'} rightSection={card.signed ? <IconCheck size='1rem' /> : <IconX size='1rem' />}>Signed</Badge>
            <Badge variant={card.altered ? 'filled' : 'outline'} rightSection={card.altered ? <IconCheck size='1rem' /> : <IconX size='1rem' />}>Altered</Badge>
            <Badge variant={card.misprint ? 'filled' : 'outline'} rightSection={card.misprint ? <IconCheck size='1rem' /> : <IconX size='1rem' />}>Misprint</Badge>
          </Stack>
        </Stack>

        <Stack spacing='xs' sx={{ justifySelf: isLargerThanSm ? 'left' : 'center' }}>
          <Text weight='bold' size='xl'>Tags</Text>
          <Group spacing={7.5}>
            {
              card.tags?.length > 0
                ? (
                  <Chip.Group
                    multiple
                    value={columnFilters.find(item => item.id === 'tags')?.value as string[] ?? []}
                    onChange={handleChipsOnChanged}
                  >
                    {
                      card.tags.map(tag => (
                        <Chip key={tag} value={tag}>
                          {tag}
                        </Chip>
                      ))
                    }
                  </Chip.Group>
                )
                : '• But nobody came.'
            }
          </Group>
        </Stack>
      </SimpleGrid>
    </Box>
  )
}
