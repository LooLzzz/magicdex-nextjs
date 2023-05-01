import { CardImage } from '@/components'
import { UserCardData } from '@/types/supabase'
import { Carousel, Embla } from '@mantine/carousel'
import { ActionIcon, Center, Flex, JsonInput, Paper, Stack } from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react'
import { MRT_Row, MRT_TableInstance } from 'mantine-react-table'
import { useState } from 'react'
import CardText from '../CardText'


export default function DetailsPanel<T extends UserCardData>(
  { table, row }: {
    table: MRT_TableInstance<T>,
    row: MRT_Row<T>,
  }) {
  const [embla, setEmbla] = useState<Embla>(null)
  const isSmallerThanLg = useMediaQuery('(max-width: 1100px)', false)
  const tableContainerWidth = table.refs.tableContainerRef?.current?.clientWidth
  const containerWidth = tableContainerWidth * 0.925

  // run embla.reInit() after the carousel has been rendered
  setTimeout(() => embla?.reInit(), 100)

  // TODO: handle double-face cards
  return (
    <Paper
      bg={'gray'}
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
              <ActionIcon variant='light' onClick={() => embla.scrollNext()}>
                <IconChevronRight />
              </ActionIcon>
            </div>

            <Center sx={{ display: !isSmallerThanLg ? 'none' : undefined }}>
              <CardImage
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
                  <CardText.Set fontSize={'1.25rem'} data={row.original} />
                </Flex>
                <Stack spacing={7}>
                  <CardText oracleText containsManaSymbols ta='left'>{row.original.oracle_text}</CardText>
                  <CardText flavorText ta='left'>{row.original.flavor_text}</CardText>
                </Stack>
                <Flex gap='sm' justify='left'>
                  <CardText ff='monospace'>{'#' + row.original.collector_number}</CardText>
                  <Flex gap={3} align='center'>
                    <span className='ms ms-shadow ms-artist-nib' />
                    <CardText weight={400} ff='monospace' tt='uppercase'>{row.original.artist}</CardText>
                  </Flex>
                </Flex>
              </Stack>
            </Center>
          </Stack>
        </Carousel.Slide>

        <Carousel.Slide>
          <Stack pos='relative'>
            <JsonInput
              formatOnBlur
              minRows={10}
              defaultValue={JSON.stringify(row.original, null, 2)}
            />

            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
            }}>
              <ActionIcon variant='light' onClick={() => embla.scrollPrev()}>
                <IconChevronLeft />
              </ActionIcon>
            </div>
          </Stack>
        </Carousel.Slide>

      </Carousel>
    </Paper>
  )
}
