import CardImage from '@/components/CardImage'
import { useScryfallBulkQuery, useUserCardsMutation } from '@/services/hooks'
import { ScryfallCardData } from '@/types/scryfall'
import { getCardFinishes } from '@/utils'
import {
  ActionIcon,
  Button,
  Divider,
  Grid,
  Group,
  List,
  LoadingOverlay,
  Paper,
  Stack,
  Text,
  Textarea,
  Tooltip,
  em,
  rem,
} from '@mantine/core'
import { useListState, useMediaQuery } from '@mantine/hooks'
import { notifications } from '@mantine/notifications'
import { IconEdit, IconTrash } from '@tabler/icons-react'
import { useEffect, useRef, useState } from 'react'
import useStyles from './styles'


interface CardQueryParam {
  originalText: string,
  name: string,
  amount: number,
  set: string,
  collectorNumber: string,
  lang: string,
  foil: boolean,
}

type StagingArea = (ScryfallCardData & { amount: number })

export default function ImportBulk() {
  const { classes, theme } = useStyles()
  const smallerThanSm = useMediaQuery(`(max-width: ${em(theme.breakpoints.sm)})`)
  const [textareaText, setTextareaText] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [cardQueryParams, setCardQueryParams] = useState<CardQueryParam[]>([])
  const [settledQueries, setSettledQueries] = useState(0)
  const [stagingArea, stagingAreaHandlers] = useListState<StagingArea>([])
  const { flatData, isLoading: isBulkQueryLoading } = useScryfallBulkQuery(cardQueryParams, {
    onSettled: (data, error) => setSettledQueries(v => v + 1)
  })
  const { mutate: userCardsMutate, isLoading: isMutating } = useUserCardsMutation({
    onSuccess: () => handleReset()
  })

  const parseTextRowToCardQueryParams = (text: string): CardQueryParam => {
    const nameAmountMatch = text.match(/^x?(?<amount>\d*)x? ?(?<name>.+?)(?=$|(?:\s\[))/i)
    const setidMatch = text.match(/\[(?![#@])(?<setid>\S+?)(?<!F)\]/i)
    const collectorNumberMatch = text.match(/\[#(?<collectorNumber>\S+?)\]/)
    const langMatch = text.match(/\[@(?<lang>\w+?)\]/)
    const foilMatch = text.match(/\[F\]/i)

    const amount = Number(nameAmountMatch?.groups?.amount)
    return {
      originalText: text,
      name: nameAmountMatch?.groups?.name,
      amount: Math.max(1, isNaN(amount) ? 1 : amount),
      set: setidMatch?.groups?.setid,
      collectorNumber: collectorNumberMatch?.groups?.collectorNumber,
      lang: langMatch?.groups?.lang,
      foil: foilMatch?.length > 0
    }
  }

  const handleReset = () => {
    // TODO: add confirmation dialog
    setTextareaText('')
    setCardQueryParams([])
    stagingAreaHandlers.setState([])
  }

  const handleSubmit = () => {
    const mergedCards = (
      // aggregate cards with the same params
      textareaText
        .split('\n')
        .filter(Boolean)
        .map(row => parseTextRowToCardQueryParams(row.trim()))
        .reduce((acc, card) => {
          const key = JSON.stringify({
            name: card.name,
            set: card.set,
            cn: card.collectorNumber,
            lang: card.lang,
            foil: card.foil
          })
          if (acc[key])
            acc[key].amount += card.amount
          else
            acc[key] = card
          return acc
        }, {} as Record<string, CardQueryParam>)
    )

    setSettledQueries(0)
    setCardQueryParams(Object.values(mergedCards))

    if (stagingArea.length > 0 && Object.values(mergedCards).length === 0)
      handleCardMutate()
  }

  const handleCardMutate = () => {
    const success: StagingArea[] = []
    const failed: CardQueryParam[] = []

    flatData.forEach((card, i) => {
      const { amount } = cardQueryParams[i]
      let foil = cardQueryParams[i].foil
      const finishes = getCardFinishes(card)

      if (!finishes.foil && foil)
        foil = false
      else if (!finishes.nonfoil && !foil)
        foil = true

      if (card)
        success.push({ ...card, amount, foil })
      else
        failed.push(cardQueryParams[i])
    })

    if (failed.length === 0) {
      userCardsMutate(
        ([...success, ...stagingArea]).map(card => ({
          altered: false,
          amount: card.amount,
          condition: 'NM',
          foil: card.foil,
          misprint: false,
          scryfall_id: card.id,
          signed: false,
          tags: [],
          override_card_data: {}
        }))
      )
      return
    }

    if (failed.length > 0) {
      notifications.show({
        title: 'Warning',
        color: 'yellow',
        message: (
          <>
            Failed to parse {failed.length} card{failed.length > 1 ? 's' : ''}.
            <br />
            Please review the remaining rows and try again.
          </>
        ),
      })
    }

    setCardQueryParams([])
    setTextareaText(failed.map(card => card.originalText).join('\n'))
    stagingAreaHandlers.append(...success)
  }

  useEffect(() => {
    // focus on Card List Textarea 150ms after mount
    setTimeout(() => textareaRef?.current?.focus(), 150)
  }, [])

  useEffect(() => {
    if (settledQueries > 0 && settledQueries === cardQueryParams.length)
      handleCardMutate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settledQueries, cardQueryParams.length])

  return (
    <Paper
      w='100%'
      pos='relative'
      radius={10}
      px={rem(30)}
      py={rem(20)}
    >
      <LoadingOverlay
        visible={isBulkQueryLoading || isMutating}
        overlayBlur={1.75}
        radius='sm'
      />

      <Stack spacing='lg'>
        <Text size={'2rem'} weight='bold' tt='uppercase'>
          📋 Bulk Import
        </Text>

        <Textarea
          autosize
          ref={textareaRef}
          value={textareaText}
          onChange={event => setTextareaText(event.currentTarget.value)}
          minRows={12}
          maxRows={24}
          label='Card List'
          placeholder={[
            "Paste your collection here, the supported format is:",
            "x2 cardname [setid] [#collectorNumber] [@lang] [foil]",
            "",
            // "Fuzzy name search is supported.",
            // "",
            "------------------------",
            "",
            "2 fireball [m12] [F]",
            "glory [@he]",
            "x3 Garruk's Gorehorn [#306]",
            "1x Garruk's Gorehorn [#108]",
            "..."
          ].join('\n')}
        />

        {
          stagingArea.length === 0
            ? undefined
            : (
              <>
                <Divider />

                <List>
                  <Tooltip.Group openDelay={500} closeDelay={100}>
                    {
                      stagingArea.map((card, idx) => {
                        const cardText = [
                          `x${card.amount}`,
                          card.name,
                          `[${card.set.toUpperCase()}]`,
                          `[#${card.collector_number}]`,
                          card.foil
                            ? '[F]'
                            : undefined,
                          `[@${card.lang}]`,
                        ].filter(Boolean).join(' ')
                        return (
                          <List.Item key={idx}>
                            <Tooltip
                              events={{ hover: true, focus: true, touch: true }}
                              bg='transparent'
                              position={smallerThanSm ? 'top' : 'right'}
                              label={
                                <CardImage
                                  tiltEnabled={false}
                                  glareEnabled={false}
                                  aspectRatioProps={{ w: CardImage.defaultWidth * 0.7 }}
                                  card={card as undefined}
                                />
                              }
                            >
                              <Group spacing={rem(7.5)} sx={{ cursor: 'help' }}>
                                <Text>
                                  {cardText}
                                </Text>
                                <ActionIcon
                                  variant='filled'
                                  color='red'
                                  size='sm'
                                  onClick={() => stagingAreaHandlers.remove(idx)}
                                >
                                  <IconTrash />
                                </ActionIcon>
                                <ActionIcon
                                  variant='filled'
                                  color='theme'
                                  size='sm'
                                  onClick={() => {
                                    setTextareaText(prevText => (
                                      prevText
                                        ? prevText + '\n' + cardText
                                        : cardText
                                    ))
                                    stagingAreaHandlers.remove(idx)
                                  }}
                                >
                                  <IconEdit />
                                </ActionIcon>
                              </Group>
                            </Tooltip>
                          </List.Item>
                        )
                      })
                    }
                  </Tooltip.Group>
                </List>
              </>
            )
        }


        <Grid>
          <Grid.Col span='auto' />
          <Grid.Col span='content'>
            <Button
              sx={{ boxShadow: '0px 3px 1px -2px rgba(0,0,0,0.2), 0px 2px 2px 0px rgba(0,0,0,0.14), 0px 1px 5px 0px rgba(0,0,0,0.12)' }}
              variant='filled'
              color='orange'
              onClick={handleReset}
            >
              {/* TODO: add popup "are you sure?" */}
              Reset
            </Button>
          </Grid.Col>
          <Grid.Col span='content'>
            <Button
              sx={{ boxShadow: '0px 3px 1px -2px rgba(0,0,0,0.2), 0px 2px 2px 0px rgba(0,0,0,0.14), 0px 1px 5px 0px rgba(0,0,0,0.12)' }}
              disabled={textareaText?.length === 0 && stagingArea.length === 0}
              onClick={handleSubmit}
              classNames={{ root: classes.buttonRoot }}
            >
              {
                stagingArea.length === 0
                  ? 'Submit Cards'
                  : 'Resubmit Cards'
              }
            </Button>
          </Grid.Col>
        </Grid>
      </Stack>

    </Paper>
  )
}
