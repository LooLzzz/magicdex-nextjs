import { CardTextPrice } from '@/components/CardsTable/CardText'
import { useScryfallCardPrintsQuery } from '@/services/hooks'
import { CardLayout } from '@/types/scryfall'
import { UserCardData } from '@/types/supabase'
import {
  AspectRatio,
  AspectRatioProps,
  Box,
  Button,
  Center,
  Group,
  LoadingOverlay,
  Overlay,
  Stack,
  StackProps,
  TextProps,
  useMantineTheme
} from '@mantine/core'
import Image, { ImageProps } from 'next/image'
import { useEffect, useState } from 'react'
import Tilt, { GlareProps, TiltProps } from 'react-parallax-tilt'
import { cardbackSmallBase64 } from './cardbackBase64'
// import useStyles from './styles'


const defaultWidth = 256
const defaultHeight = 357
const defaultAspectRatio = defaultWidth / defaultHeight
const defaultTiltMaxAngle = 10
const defaultGlareBorderRadius = '4.75% / 3.5%'
const defaultGlarePosition = 'all'
const defaultGlareMaxOpacity = 0.15
const defaultTransitionSpeedMs = 330

enum CardTransformEnum {
  None,
  DFC, // Double Faced Card
  Rotate90Clockwise,
  Rotate90Anticlockwise,
  Rotate180,
}

function parseCardTransformType({ layout, keywords }: {
  layout?: CardLayout,
  keywords?: string[]
} = {}): CardTransformEnum {
  switch (layout) {
    case 'transform':
    case 'modal_dfc':
    case 'double_faced_token':
    case 'reversible_card':
      return CardTransformEnum.DFC

    case 'split':
    case 'planar':
      return (
        keywords.find(keyword => keyword.toLowerCase() === 'aftermath')
          ? CardTransformEnum.Rotate90Anticlockwise
          : CardTransformEnum.Rotate90Clockwise
      )

    case 'flip':
      return CardTransformEnum.Rotate180

    default:
      return CardTransformEnum.None
  }
}

export default function CardImage({
  card,
  displayTransform = false,
  displayPrice = false,
  shouldTransfromTranslateImage = true,
  openPriceTooltipToSides = false,
  width = defaultWidth,
  height = defaultHeight,
  ratio = defaultAspectRatio,
  placeholder = 'blur',
  blurDataURL = cardbackSmallBase64,
  tiltEnabled = true,
  glareEnabled = true,
  tiltMaxAngleX = defaultTiltMaxAngle,
  tiltMaxAngleY = defaultTiltMaxAngle,
  glareBorderRadius = defaultGlareBorderRadius,
  glarePosition = defaultGlarePosition,
  glareMaxOpacity = defaultGlareMaxOpacity,
  priceTextProps = {},
  tiltProps = {},
  aspectRatioProps = {},
  imageProps = {},
  ...rootProps
}:
  StackProps & {
    card?: UserCardData,
    displayTransform?: boolean,
    displayPrice?: boolean,
    shouldTransfromTranslateImage?: boolean,
    openPriceTooltipToSides?: boolean,
    width?: ImageProps['width'],
    height?: ImageProps['height'],
    placeholder?: ImageProps['placeholder'],
    blurDataURL?: ImageProps['blurDataURL'],
    ratio?: AspectRatioProps['ratio'],
    tiltEnabled?: TiltProps['tiltEnable']
    glareEnabled?: GlareProps['glareEnable']
    tiltMaxAngleX?: TiltProps['tiltMaxAngleX']
    tiltMaxAngleY?: TiltProps['tiltMaxAngleY']
    glareBorderRadius?: GlareProps['glareBorderRadius']
    glarePosition?: GlareProps['glarePosition']
    glareMaxOpacity?: GlareProps['glareMaxOpacity']
    tiltProps?: Omit<TiltProps & GlareProps, 'tiltEnable' | 'glareEnable' | 'tiltMaxAngleX' | 'tiltMaxAngleY' | 'glareBorderRadius' | 'glarePosition' | 'glareMaxOpacity'>,
    imageProps?: Omit<ImageProps, 'src' | 'alt' | 'width' | 'height' | 'placeholder' | 'blurDataURL'>,
    priceTextProps?: TextProps,
    aspectRatioProps?: Omit<AspectRatioProps, 'ratio'> & { ratio?: number },
  }
) {
  const theme = useMantineTheme()
  const [isCardTransformed, setCardTransformed] = useState(false)
  const [isLoaded, setLoaded] = useState(false)
  const {
    data: cardLangData,
    isFetching: cardLangFetching,
  } = useScryfallCardPrintsQuery(
    card,
    {
      enabled: card?.lang !== undefined && card?.lang !== 'en',
      queryKey: ['card-image'],
    },
  )
  const [imageCssTransform, setImageCssTransform] = useState<string>()
  const cardTransformType = parseCardTransformType(card ?? {})

  const getCardImageUrl = ({ card_faces, image_uris }: {
    card_faces?: UserCardData['card_faces']
    image_uris?: UserCardData['image_uris']
  } = {}) => {
    if (card_faces && cardTransformType === CardTransformEnum.DFC)
      image_uris = card_faces[isCardTransformed ? 1 : 0].image_uris

    return (
      image_uris?.png
      ?? image_uris?.large
      ?? image_uris?.normal
      ?? image_uris?.small
      ?? '/cardback.png'
    )
  }

  const handleTransformCard = () => {
    switch (cardTransformType) {
      case CardTransformEnum.DFC:
        setImageCssTransform('scaleX(0)')
        setTimeout(() => {
          setImageCssTransform('scaleX(1)')
          setCardTransformed(!isCardTransformed)
          setLoaded(false)
        }, defaultTransitionSpeedMs / 2)
        break

      case CardTransformEnum.Rotate180:
        setImageCssTransform(!isCardTransformed ? 'rotate(180deg)' : undefined)
        setCardTransformed(!isCardTransformed)
        break

      case CardTransformEnum.Rotate90Clockwise:
        setImageCssTransform(!isCardTransformed ? `rotate(90deg) scale(0.825) ${shouldTransfromTranslateImage ? 'translateX(-35%) translateY(7%)' : ''}` : undefined)
        setCardTransformed(!isCardTransformed)
        break

      case CardTransformEnum.Rotate90Anticlockwise:
        setImageCssTransform(!isCardTransformed ? `rotate(-90deg) scale(0.825) ${shouldTransfromTranslateImage ? 'translateX(35%) translateY(-7%)' : ''}` : undefined)
        setCardTransformed(!isCardTransformed)
        break
    }
  }

  useEffect(() => {
    setCardTransformed(false)
    setImageCssTransform(undefined)
    setLoaded(!(
      card?.lang
      || card?.image_uris?.png
      || card?.image_uris?.large
      || card?.image_uris?.normal
      || card?.image_uris?.small
    ))
  }, [
    card?.lang,
    card?.image_uris?.png,
    card?.image_uris?.large,
    card?.image_uris?.normal,
    card?.image_uris?.small
  ])

  return (
    <Center component={Stack} spacing={10} {...rootProps}>
      <Box style={{
        transition: `all ${cardTransformType === CardTransformEnum.DFC ? defaultTransitionSpeedMs / 2 : defaultTransitionSpeedMs}ms cubic-bezier(0.75, 0, 0.25, 1)`,
        transform: imageCssTransform,
      }}
      >
        <AspectRatio
          ratio={ratio}
          {...aspectRatioProps}
        >
          <Tilt
            // gyroscope
            tiltReverse
            tiltEnable={tiltEnabled}
            glareEnable={glareEnabled}
            tiltMaxAngleX={tiltMaxAngleX}
            tiltMaxAngleY={tiltMaxAngleY}
            glareBorderRadius={glareBorderRadius}
            glarePosition={glarePosition}
            glareMaxOpacity={glareMaxOpacity}
            {...tiltProps}
          >
            <Image
              src={getCardImageUrl(card?.lang === 'en' ? card : cardLangData?.data?.[0])}
              alt={card?.name ?? 'cardback'}
              width={width}
              height={height}
              placeholder={placeholder}
              blurDataURL={blurDataURL}
              {...imageProps}
              onLoadingComplete={event => {
                setLoaded(true)
                imageProps?.onLoadingComplete?.(event)
              }}
              style={{
                width: '100%',
                height: '100%',
                ...imageProps?.style,
              }}
            />
            {card?.foil && (
              <Overlay
                style={{
                  backgroundImage: 'URL(/card-foil-overlay.png)',
                  mixBlendMode: theme.colorScheme === 'dark' ? 'lighten' : 'hard-light',
                  opacity: theme.colorScheme === 'dark' ? 0.75 : 0.5,
                  borderRadius: glareBorderRadius,
                }}
              />
            )}
            <LoadingOverlay
              visible={((card?.image_uris ?? false) && !isLoaded) || cardLangFetching}
              opacity={0.9}
              radius={glareBorderRadius}
            />
          </Tilt>
        </AspectRatio>
      </Box>

      <Stack spacing={7.5}>
        {
          displayPrice
            ? (
              <Center component={Group} noWrap>
                <CardTextPrice
                  {...priceTextProps}
                  style={{ cursor: 'text', ...priceTextProps?.style }}
                  openTooltipToSides={openPriceTooltipToSides}
                  data={card}
                />
              </Center>
            )
            : undefined
        }

        {
          displayTransform && cardTransformType !== CardTransformEnum.None
            ? (
              <Button compact
                sx={{ 'box-shadow': '0px 3px 1px -2px rgba(0,0,0,0.2), 0px 2px 2px 0px rgba(0,0,0,0.14), 0px 1px 5px 0px rgba(0,0,0,0.12)' }}
                onClick={handleTransformCard}
              >
                {
                  cardTransformType === CardTransformEnum.DFC
                    ? 'Transform'
                    : cardTransformType === CardTransformEnum.Rotate180
                      ? 'Flip'
                      : 'Rotate'
                }
                {
                  isCardTransformed ? ' ↪' : ' ↩'
                }
              </Button>
            )
            : undefined
        }
      </Stack>

    </Center>
  )
}

CardImage.defaultAspectRatio = defaultAspectRatio
CardImage.defaultGlareBorderRadius = defaultGlareBorderRadius
CardImage.defaultGlareMaxOpacity = defaultGlareMaxOpacity
CardImage.defaultGlarePosition = defaultGlarePosition
CardImage.defaultHeight = defaultHeight
CardImage.defaultTiltMaxAngle = defaultTiltMaxAngle
CardImage.defaultWidth = defaultWidth

export {
  defaultAspectRatio,
  defaultGlareBorderRadius,
  defaultGlareMaxOpacity,
  defaultGlarePosition,
  defaultHeight,
  defaultTiltMaxAngle,
  defaultWidth,
}
