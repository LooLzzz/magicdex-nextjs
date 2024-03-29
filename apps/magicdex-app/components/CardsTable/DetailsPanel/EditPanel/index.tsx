import { ColumnFiltersContext } from '@/components/CardsTable/filtersDef'
import { useUserCardsMutation } from '@/services/hooks'
import { UserCardData } from '@/types/supabase'
import { ActionIcon, Badge, Box, Button, Chip, Divider, Group, SimpleGrid, Stack, Text, Transition, } from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import { modals } from '@mantine/modals'
import { IconCheck, IconTrash, IconX } from '@tabler/icons-react'
import { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { EmblaContext } from '..'
import CardEditingForm, { CardEditingFormHandle } from './CardEditingForm'


export default function EditPanel({ card, onChange: handleOnChange }: {
  card: UserCardData,
  onChange?: (UserCardData) => void,
}) {
  const embla = useContext(EmblaContext)
  const [columnFilters, setColumnFilters] = useContext(ColumnFiltersContext)
  const cardEditingFormRef = useRef<CardEditingFormHandle>(null)
  const [isEditing, setEditing] = useState(false)
  const [isFormDirty, setFormDirty] = useState(false)
  const isLargerThanSm = useMediaQuery('(min-width: 576px)', false)
  const { mutate: userCardsMutate } = useUserCardsMutation()

  useEffect(() => {
    setTimeout(() => {
      embla?.reInit()
    }, 100)
  }, [embla, isEditing])

  useEffect(() => {
    if (!isEditing)
      handleOnChange?.(null)
  }, [isEditing, handleOnChange])

  const openDeleteModal = useCallback(() =>
    modals.openConfirmModal({
      title: <Text size='xl' weight='bold'>Delete Card Confirmation</Text>,
      centered: true,
      children: (
        <Text size='md'>
          Are you sure you want to delete this card?
          <br />
          This action is irreversible.
        </Text>
      ),
      labels: { confirm: 'Yeet', cancel: 'Cancel' },
      confirmProps: {
        color: 'red',
        sx: { boxShadow: '0px 3px 1px -2px rgba(0,0,0,0.2), 0px 2px 2px 0px rgba(0,0,0,0.14), 0px 1px 5px 0px rgba(0,0,0,0.12)' }
      },
      onConfirm: () => userCardsMutate([{
        ...card,
        amount: 0,
      }]),
    }), [card, userCardsMutate])

  const handleChipsOnChanged = useCallback((value: string[]) => {
    setColumnFilters([
      ...columnFilters.filter(item => item.id !== 'tags'),
      { id: 'tags', value }
    ])
  }, [setColumnFilters, columnFilters])

  const handleSaveOnClick = useCallback(() => {
    if (isEditing)
      cardEditingFormRef?.current?.submit()

    setEditing(!isEditing)
  }, [isEditing, cardEditingFormRef])

  return (
    <Box>
      <Group spacing='xs' pb='xl' sx={{ justifyContent: 'flex-end' }}>
        <Transition mounted={isEditing} duration={150} transition='slide-left' timingFunction='ease-in-out'>
          {styles =>
            <Group spacing='xs' style={styles}>
              <ActionIcon
                size='lg'
                onClick={openDeleteModal}
              >
                <IconTrash />
              </ActionIcon>
              <Button
                variant='default'
                onClick={() => setEditing(false)}
              >
                Cancel
              </Button>
            </Group>
          }
        </Transition>

        <Button
          sx={{ boxShadow: !(isEditing && !isFormDirty) && '0px 3px 1px -2px rgba(0,0,0,0.2), 0px 2px 2px 0px rgba(0,0,0,0.14), 0px 1px 5px 0px rgba(0,0,0,0.12)' }}
          onClick={handleSaveOnClick}
          disabled={isEditing && !isFormDirty}
        >
          {isEditing ? 'Save' : 'Edit'}
        </Button>
      </Group>

      {
        isEditing
          ? <CardEditingForm
            ref={cardEditingFormRef}
            card={card}
            onChange={handleOnChange}
            onDirtyChange={setFormDirty}
          />
          : <SimpleGrid w='100%' spacing='xl' cols={isLargerThanSm ? 2 : 1}>
            <Stack spacing={7.5} align='left' justify='center' w='fit-content' sx={{ justifySelf: 'center', paddingTop: 7.5 }}>
              <Group noWrap position='center'>
                <Text>Amount</Text>
                <Badge color='dark' variant='light'>x{card.amount}</Badge>
              </Group>
              <Group noWrap position='center'>
                <Text>Condition</Text>
                <Badge color='dark' variant='light'>{card.condition}</Badge>
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
              <Text weight='bold' size={24}>Tags</Text>
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
                    : (
                      <Text ff='Determination Mono' size='xl'>
                        * But nobody came.
                      </Text>
                    )
                }
              </Group>
            </Stack>
          </SimpleGrid>
      }
    </Box>
  )
}
