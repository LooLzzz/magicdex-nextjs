import { CardImage } from '@/components'
import { UserCardData } from '@/types/supabase'
import { emblaAutoHeightEffect, translateRanges } from '@/utils'
import { Carousel, Embla } from '@mantine/carousel'
import { ActionIcon, Box, Center, Flex, Group, Paper, Stack, useMantineTheme } from '@mantine/core'
import { useMediaQuery, useViewportSize } from '@mantine/hooks'
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react'
import { MRT_Row, MRT_TableInstance } from 'mantine-react-table'
import React, { createContext, useEffect, useState } from 'react'
import CardText, { CardTextArtist, CardTextColorIndicator, CardTextPowerToughness, CardTextSet } from '../CardText'
import EditPanel from './EditPanel'


function CardInfo({ containerWidth, card }: {
  containerWidth: number,
  card: UserCardData,
}) {
  return (
    <Stack
      spacing='sm'
      // miw={containerWidth * 0.45}
      maw={containerWidth * 0.8}
      w='fit-content'
      style={{
        textAlign: 'center',
        whiteSpace: 'pre-wrap'
      }}
    >
      <Flex gap='sm' justify='center'>
        <CardText weight='bold'>{card.name}</CardText>
        <CardText containsManaSymbols>{card.mana_cost}</CardText>
      </Flex>
      <Flex gap='sm' justify='center'>
        <CardTextColorIndicator data={card} />
        <CardText replaceHyphen>{card.type_line}</CardText>
        <CardTextSet fontSize='1.75rem' data={card} />
      </Flex>
      <Stack spacing={7}>
        <CardText oracleText containsManaSymbols containsLoyaltySymbols manaSymbolSize='0.8em' ta='left'>{card.oracle_text}</CardText>
        <CardText flavorText phyrexian={card.lang === 'ph'} ta='left'>{card.flavor_text}</CardText>
      </Stack>
      <Flex gap='sm' justify='left' align='center'>
        <CardText ff='monospace'>{'#' + card.collector_number}</CardText>
        <CardTextArtist data={card} />
        <CardTextPowerToughness
          data={card}
          sx={{
            flex: 1,
            textAlign: 'right'
          }}
        />
      </Flex>
    </Stack>
  )
}

export default function DetailsPanel<T extends UserCardData>(
  { table, row }: {
    table: MRT_TableInstance<T>,
    row: MRT_Row<T>,
  }) {
  const theme = useMantineTheme()
  const [embla, setEmbla] = useState<Embla>(null)
  const { width: vwidth } = useViewportSize()
  const isLargerThanLg = useMediaQuery('(min-width: 1226px)', false)
  const isLargerThanMd = useMediaQuery('(min-width: 768px)', false)
  const [stagingAreaCard, setStagingAreaCard] = useState<UserCardData>(null)
  const tableContainerWidth = table.refs.tableContainerRef?.current?.clientWidth
  const containerWidth = tableContainerWidth * 0.925

  // run embla.reInit() after the carousel has been rendered
  setTimeout(() => embla?.reInit(), 100)

  useEffect(() => {
    if (embla)
      emblaAutoHeightEffect(embla)
  }, [embla])

  return (
    <Paper
      component={Flex}
      wrap={isLargerThanMd ? 'nowrap' : 'wrap'}
      gap='xl'
      align='flex-start'
      justify='center'

      bg={(
        theme.colorScheme === 'dark'
          ? theme.colors.gray[7]
          : theme.colors.gray[3]
      )}
      radius='md'
      p='md'
      pos='sticky'
      left={(tableContainerWidth - containerWidth) / 2}
      w={containerWidth}
    >
      <Center
        sx={theme => ({
          display: isLargerThanLg ? 'none' : undefined,
          paddingBottom: theme.spacing.md,
        })}
      >
        <CardImage
          displayTransform
          displayPrice
          openPriceTooltipToSides
          shouldTransfromTranslateImage={isLargerThanMd}
          shouldTransfromShrinkImage={isLargerThanMd}
          card={{
            ...row.original,
            ...stagingAreaCard,
          }}
          aspectRatioProps={{
            maw: CardImage.defaultWidth,
            miw: CardImage.defaultWidth * (isLargerThanMd ? translateRanges(vwidth, [0.8, 0.9], [768, 1226]) : 0.9),
          }}
        />
      </Center>

      <Carousel
        getEmblaApi={setEmbla}
        withKeyboardEvents={false}
        withControls={false}
        draggable={false}
        slideGap='md'
        align='center'
        w='100%'
      >
        <EmblaContext.Provider value={embla}>

          <Carousel.Slide>
            <Stack pos='relative'>
              <div style={{
                position: 'absolute',
                top: 0,
                right: 0,
              }}>
                <ActionIcon variant='transparent' onClick={() => embla.scrollNext()}>
                  <IconChevronRight />
                </ActionIcon>
              </div>

              <Center>
                {
                  row.original?.card_faces
                    ? (
                      <Box
                        component={isLargerThanMd && row.original.card_faces.length === 2 ? Group : Stack}
                        spacing='md'
                        align='center'
                        position='center'
                      >
                        {
                          row.original.card_faces.map((card_face, idx) => (
                            <CardInfo
                              key={idx}
                              containerWidth={containerWidth}
                              card={{
                                ...row.original,
                                ...card_face,
                              }}
                            />
                          ))
                        }
                      </Box>
                    )
                    : (
                      <CardInfo
                        containerWidth={containerWidth}
                        card={row.original}
                      />
                    )
                }
              </Center>
            </Stack>
          </Carousel.Slide>

          <Carousel.Slide>
            <Stack pos='relative'>
              <EditPanel
                card={row.original}
                onChange={setStagingAreaCard}
              />

              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
              }}>
                <ActionIcon variant='transparent' onClick={() => embla.scrollPrev()}>
                  <IconChevronLeft />
                </ActionIcon>
              </div>
            </Stack>
          </Carousel.Slide>

        </EmblaContext.Provider>
      </Carousel>
    </Paper>
  )
}

const EmblaContext = createContext<Embla>(null)

export {
  EmblaContext
}
