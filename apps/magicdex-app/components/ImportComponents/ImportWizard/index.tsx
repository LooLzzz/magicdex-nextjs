import {
  CardImage,
  FloatingLabelAutocomplete,
  FloatingLabelSelect,
  FloatingLabelTagsSelect,
  QuantityInput,
} from '@/components'
import {
  useScryfallAutocompleteQuery,
  useScryfallCardPrintsQuery,
  useUserCardsMutation
} from '@/services/hooks'
import { ScryfallCardData } from '@/types/scryfall'
import {
  ActionIcon,
  Button,
  Checkbox,
  Divider,
  Flex,
  Grid,
  Group,
  List,
  LoadingOverlay,
  Paper,
  Stack,
  Text,
  Tooltip,
  em,
  rem,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { getHotkeyHandler, useHotkeys, useListState, useMediaQuery } from '@mantine/hooks'
import { notifications } from '@mantine/notifications'
import { IconEdit, IconPlus, IconTrash } from '@tabler/icons-react'
import { useEffect, useRef, useState } from 'react'
import SelectCarditem from './SelectCarditem'
import useStyles from './styles'
import { BaseCardData, placeholderFormValues } from './types'


function _getFinishes(cardData: ScryfallCardData, mergeEtchedWithFoil = true) {
  const finishes = Object.fromEntries(
    cardData?.finishes?.map(item => ([item, true]))
    ?? []
  )

  if (mergeEtchedWithFoil) {
    finishes.foil = finishes.foil || finishes.etched || false
    delete finishes.etched
  }

  return finishes
}

export default function ImportWizard() {
  const { classes, theme } = useStyles()
  const smallerThanSm = useMediaQuery(`(max-width: ${em(theme.breakpoints.sm)})`)
  const nameInputRef = useRef<HTMLInputElement>(null)
  const focusNameInput = () => nameInputRef.current?.focus()
  const form = useForm({ initialValues: placeholderFormValues.empty })
  const [selectedCard, setSelectedCard] = useState<string>()
  const [stagingArea, stagingAreaHandlers] = useListState<{ cardData: ScryfallCardData, formValues: BaseCardData }>([])
  const { mutate: userCardsMutate, isLoading: isMutating } = useUserCardsMutation({
    onSuccess: () => {
      notifications.show({
        title: 'Success',
        color: 'green',
        message: `${stagingArea.length} card(s) were successfully added to your collection`,
      })
      stagingAreaHandlers.setState([])
    },
    onError: (error) => {
      notifications.show({
        title: 'Error',
        color: 'red',
        message: (<>
          Something went wrong while adding cards to your collection.
          <br />
          Error Message: {error.message}
        </>),
      })
    },
  })

  const { data: autocompleteData, isFetching: autocompleteFetching } = useScryfallAutocompleteQuery(form.values.name)
  const { data: cardPrintsData, isFetching: cardPrintsFetching } = useScryfallCardPrintsQuery({ name: selectedCard })
  const { data: cardLangsData, isFetching: cardLangsFetching } = useScryfallCardPrintsQuery({
    name: selectedCard,
    lang: 'any',
    set: form.values.set?.split(':', 1)[0],
    collector_number: form.values.set?.split(':')[1],
  })

  function resetForm({ includeStagingArea = false } = {}) {
    setSelectedCard(null)
    form.reset()
    if (includeStagingArea)
      stagingAreaHandlers.setState([])

    if (!smallerThanSm)
      focusNameInput()
  }

  function handleAddCurrentValuesToStagingArea({ resetForm: _resetForm = false } = {}) {
    const cardData = (
      cardLangsData?.data?.find(item => item.lang === form.values.lang)
      ?? cardPrintsData?.data?.find(item => form.values.set === `${item.set}:${item.collector_number}`)
    )
    if (!cardData)
      return

    stagingAreaHandlers.append({
      cardData,
      formValues: form.values,
    })

    if (_resetForm)
      resetForm()
  }

  function handleSubmit(values: BaseCardData) {
    userCardsMutate(stagingArea)
  }

  useHotkeys([
    ['Enter', () => selectedCard && handleAddCurrentValuesToStagingArea({ resetForm: true })],
  ])

  useEffect(() => {
    // focus on CardNameInput 150ms after mount
    setTimeout(() => focusNameInput(), 150)
  }, [])

  useEffect(() => {
    if (!selectedCard) {
      // reset all fields except 'name'
      const { name, ...rest } = placeholderFormValues.empty
      return form.setValues(rest)
    }

    if (form.values?.amount) {
      // dont initialize the form in case the user is editing the data
      // this means that the user has pressed the 'edit' button on a card in the staging area
      // 'values.amount' is checked arbitrarily because it's the first field to be filled
      return
    }

    const latestPrint = cardPrintsData?.data?.[0]
    if (latestPrint)
      form.setValues(placeholderFormValues.initial(latestPrint))

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCard, cardPrintsData])

  useEffect(() => {
    const finishes = _getFinishes(
      cardPrintsData?.data?.find(item =>
        `${item.set}:${item.collector_number}` === form.values.set
      )
    )

    if (finishes.foil && finishes.nonfoil)
      form.setFieldValue('foil', form.values?.foil ?? false)
    else
      form.setFieldValue('foil', finishes.foil)

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.values?.set])

  return (
    <Paper
      pos='relative'
      radius={10}
      px={rem(30)}
      py={rem(20)}
    >
      <LoadingOverlay
        visible={isMutating}
        overlayBlur={1.75}
        radius='sm'
      />

      <form
        onSubmit={form.onSubmit(handleSubmit)}
        onReset={() => resetForm({ includeStagingArea: true })}
      >
        <Stack spacing='lg'>
          <Text size={'2rem'} weight='bold' tt='uppercase'>
            🧙‍♂️ Import Wizard <Text italic component='span' size={'1.2rem'}>(of the Coast™)</Text>
          </Text>


          <Grid align='center' gutter='xl'>
            <Grid.Col sm={12} md={3} {...{ align: 'center' }}>
              <CardImage
                displayPrice
                openPriceTooltipToSides
                card={{
                  ...cardLangsData?.data?.find(item => item.lang === form.values.lang),
                  foil: form.values.foil,
                  amount: form.values.amount,
                } as undefined}
                aspectRatioProps={{
                  maw: CardImage.defaultWidth,
                  miw: CardImage.defaultWidth * 0.8,
                }}
              />
            </Grid.Col>

            <Grid.Col span='auto'>
              <Grid align='center' gutter='xs'>
                <Grid.Col span={12}>
                  <Flex wrap='nowrap' align='center'>
                    <FloatingLabelAutocomplete
                      ref={nameInputRef}
                      hoverOnSearchChange
                      label='Card Name'
                      description='At least 2 characters are required.'
                      placeholder='Search for a card...'
                      data={autocompleteData?.data ?? []}
                      loading={autocompleteFetching}
                      onKeyDown={getHotkeyHandler([
                        ['Enter', () => selectedCard && handleAddCurrentValuesToStagingArea({ resetForm: true })],
                      ])}
                      boxRootProps={{ sx: { flex: 1 } }}
                      {...form.getInputProps('name')}
                      onItemSubmit={({ value }) => setSelectedCard(value)}
                      onChange={value => { form.getInputProps('name').onChange(value); setSelectedCard(null) }}
                    />
                    {
                      !smallerThanSm
                        ?
                        <ActionIcon
                          disabled={!selectedCard}
                          variant='filled'
                          color='theme'
                          top={rem(5)}
                          ml={rem(10)}
                          onClick={() => handleAddCurrentValuesToStagingArea({ resetForm: true })}
                        >
                          <IconPlus />
                        </ActionIcon>
                        : undefined
                    }
                  </Flex>
                </Grid.Col>
                <Grid.Col sm={3}>
                  <QuantityInput
                    min={1}
                    disabled={!selectedCard}
                    actionIconSize='sm'
                    label='Amount'
                    {...form.getInputProps('amount')}
                  />
                </Grid.Col>
                <Grid.Col sm={7}>
                  <FloatingLabelSelect
                    loading={cardPrintsFetching}
                    disabled={!selectedCard || cardPrintsFetching}
                    label='Set'
                    data={cardPrintsData?.data?.map(item => ({
                      value: `${item.set}:${item.collector_number}`,
                      label: `${item.set_name} [#${item.collector_number}]`,
                      cardData: item,
                    })) ?? []}
                    {...form.getInputProps('set')}
                    onChange={value => {
                      form.setValues({
                        lang: cardPrintsData?.data?.find(item =>
                          `${item.set}:${item.collector_number}` === value
                        )?.lang ?? 'en'
                      })
                      form.getInputProps('set').onChange(value)
                    }}
                    itemComponent={SelectCarditem}
                  />
                </Grid.Col>
                <Grid.Col sm={2}>
                  <FloatingLabelSelect
                    disabled={!selectedCard || cardLangsFetching}
                    label='Lang'
                    data={cardLangsData?.data?.map(item => ({
                      value: item.lang,
                      label: item.lang,
                      cardData: item,
                      floatingTooltipPosition: 'left',
                    })) ?? []}
                    loading={cardLangsFetching}
                    {...form.getInputProps('lang')}
                    itemComponent={SelectCarditem}
                  />
                </Grid.Col>

                <Grid.Col sm={3}>
                  <FloatingLabelSelect
                    disabled={!selectedCard}
                    label='Condition'
                    data={['NM', 'LP', 'MP', 'HP', 'DMG']}
                    {...form.getInputProps('condition')}
                    boxRootProps={{ miw: rem(100) }}
                  />
                </Grid.Col>
                <Grid.Col sm={9} style={{ alignSelf: 'flex-start' }}>
                  <FloatingLabelTagsSelect
                    disabled={!selectedCard}
                    label='Tags'
                    {...form.getInputProps('tags')}
                  />
                </Grid.Col>
                <Grid.Col pt='sm' sm={3}>
                  <Stack>
                    <Checkbox
                      disabled={
                        !selectedCard
                        || Object.values(
                          _getFinishes(
                            cardPrintsData?.data?.find(item =>
                              `${item.set}:${item.collector_number}` === form.values.set
                            )
                          )
                        ).filter(Boolean).length < 2
                      }
                      label='Foil'
                      checked={form.values.foil}
                      {...form.getInputProps('foil')}
                    />
                    <Checkbox
                      disabled={!selectedCard}
                      label='Signed'
                      checked={form.values.signed}
                      {...form.getInputProps('signed')}
                    />
                    <Checkbox
                      disabled={!selectedCard}
                      label='Altered'
                      checked={form.values.altered}
                      {...form.getInputProps('altered')}
                    />
                    <Checkbox
                      disabled={!selectedCard}
                      label='Misprint'
                      checked={form.values.misprint}
                      {...form.getInputProps('misprint')}
                    />
                  </Stack>
                </Grid.Col>
              </Grid>
            </Grid.Col>
          </Grid>

          <Divider
            labelPosition='center'
            label={
              smallerThanSm
                ? <ActionIcon
                  disabled={!selectedCard}
                  variant='filled'
                  color='theme'
                  onClick={() => handleAddCurrentValuesToStagingArea({ resetForm: true })}
                >
                  <IconPlus />
                </ActionIcon>
                : undefined
            }
          />

          {
            stagingArea.length === 0
              ? (
                <Text italic>New cards will be displayed here.</Text>
              )
              : (
                <List>
                  <Tooltip.Group openDelay={500} closeDelay={100}>
                    {
                      stagingArea.map((item, index) => (
                        <List.Item key={index}>
                          <Tooltip
                            events={{ hover: true, focus: true, touch: true }}
                            bg='transparent'
                            position={smallerThanSm ? 'top' : 'right'}
                            label={
                              <CardImage
                                tiltEnabled={false}
                                glareEnabled={false}
                                aspectRatioProps={{ w: CardImage.defaultWidth * 0.7 }}
                                card={{ ...item.cardData, ...item.formValues } as undefined}
                              />
                            }
                          >
                            <Group spacing={rem(7.5)} sx={{ cursor: 'help' }}>
                              <Text>
                                {[
                                  `x${item.formValues.amount}`,
                                  item.cardData.name,
                                  `[${item.cardData.set.toUpperCase()}]`,
                                  `[#${item.cardData.collector_number}]`,
                                  item.formValues.foil
                                    ? '[F]'
                                    : undefined
                                  ,
                                  `[@${item.cardData.lang}]`,
                                ].filter(Boolean).join(' ')}
                              </Text>
                              <ActionIcon
                                variant='filled'
                                color='red'
                                size='sm'
                                onClick={() => stagingAreaHandlers.remove(index)}
                              >
                                <IconTrash />
                              </ActionIcon>
                              <ActionIcon
                                variant='filled'
                                color='theme'
                                size='sm'
                                onClick={() => {
                                  setSelectedCard(item.cardData.name)
                                  form.setValues(item.formValues)
                                  stagingAreaHandlers.remove(index)
                                }}
                              >
                                <IconEdit />
                              </ActionIcon>
                            </Group>
                          </Tooltip>
                        </List.Item>
                      ))
                    }
                  </Tooltip.Group>
                </List>
              )
          }

          <Grid>
            <Grid.Col span='auto' />
            <Grid.Col span='content'>
              <Button
                type='reset'
                variant='filled'
                color='orange'
              >
                {/* TODO: add popup "are you sure?" */}
                Reset
              </Button>
            </Grid.Col>
            <Grid.Col span='content'>
              <Button
                disabled={stagingArea.length === 0}
                onClick={() => form.onSubmit(handleSubmit)()}
                classNames={{ root: classes.buttonRoot }}
              >
                Submit Cards
              </Button>
            </Grid.Col>
          </Grid>
        </Stack>
      </form >
    </Paper >
  )
}
