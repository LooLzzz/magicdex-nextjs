import { CardImage } from '@/components'
import { UserCardData } from '@/types/supabase'
import { emblaAutoHeightEffect } from '@/utils'
import { Carousel, Embla } from '@mantine/carousel'
import { ActionIcon, Center, Flex, JsonInput, Paper, Stack, useMantineTheme } from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react'
import { MRT_Row, MRT_TableInstance } from 'mantine-react-table'
import { useEffect, useState } from 'react'
import CardText, { CardTextArtist, CardTextPowerToughness, CardTextSet } from '../CardText'


export default function DetailsPanel<T extends UserCardData>(
  { table, row }: {
    table: MRT_TableInstance<T>,
    row: MRT_Row<T>,
  }) {
  const theme = useMantineTheme()
  const [embla, setEmbla] = useState<Embla>(null)
  const isLargerThanLg = useMediaQuery('(min-width: 1226px)', false)
  const tableContainerWidth = table.refs.tableContainerRef?.current?.clientWidth
  const containerWidth = tableContainerWidth * 0.925

  // run embla.reInit() after the carousel has been rendered
  setTimeout(() => embla?.reInit(), 100)

  useEffect(() => {
    if (embla)
      emblaAutoHeightEffect(embla)
  }, [embla])

  // TODO: handle multi-faced cards
  return (
    <Paper
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
      <Carousel
        getEmblaApi={setEmbla}
        withControls={false}
        draggable={false}
        slideGap='md'
        align='center'
      >

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

            <Center sx={{ display: isLargerThanLg ? 'none' : undefined }}>
              <CardImage
                displayPrice
                openPriceTooltipToSides
                card={row.original}
                aspectRatioProps={{
                  maw: CardImage.defaultWidth,
                  miw: CardImage.defaultWidth * 0.8,
                }}
              />
            </Center>

            <Center>
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
                  <CardText weight='bold'>{row.original.name}</CardText>
                  <CardText containsManaSymbols>{row.original.mana_cost}</CardText>
                </Flex>
                <Flex gap='sm' justify='center'>
                  <CardText replaceHyphen>{row.original.type_line}</CardText>
                  <CardTextSet fontSize={'1.75rem'} data={row.original} />
                </Flex>
                <Stack spacing={7}>
                  <CardText oracleText containsManaSymbols manaSymbolSize='0.8em' ta='left'>{row.original.oracle_text}</CardText>
                  <CardText flavorText phyrexian={row.original.lang == 'ph'} ta='left'>{row.original.flavor_text}</CardText>
                </Stack>
                <Flex gap='sm' justify='left' align='center'>
                  <CardText ff='monospace'>{'#' + row.original.collector_number}</CardText>
                  <CardTextArtist data={row.original} />
                  <CardTextPowerToughness
                    data={row.original}
                    sx={{
                      flex: 1,
                      textAlign: 'right'
                    }}
                  />
                </Flex>
              </Stack>
            </Center>
          </Stack>
        </Carousel.Slide>

        <Carousel.Slide>
          <Stack pos='relative'>
            {/* TODO: make an info panel with edit functionality */}
            <JsonInput
              formatOnBlur
              minRows={20}
              defaultValue={JSON.stringify(row.original, null, 2)}
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

      </Carousel>
    </Paper>
  )
}
