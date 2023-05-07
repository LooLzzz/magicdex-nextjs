import { CardTextPrice } from '@/components/CardsTable/CardText'
import { useScryfallCardPrintsQuery } from '@/services/hooks'
import { UserCardData } from '@/types/supabase'
import {
  AspectRatio,
  AspectRatioProps,
  Center,
  Group,
  LoadingOverlay,
  Overlay,
  Stack,
  StackProps,
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

export default function CardImage({
  card,
  displayPrice = false,
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
  tiltProps = {},
  aspectRatioProps = {},
  imageProps = {},
  ...rootProps
}:
  StackProps & {
    card?: UserCardData,
    displayPrice?: boolean,
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
    aspectRatioProps?: Omit<AspectRatioProps, 'ratio'> & { ratio?: number },
  }
) {
  const theme = useMantineTheme()
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

  const getCardImageUrl = ({ image_uris }: { image_uris?: UserCardData['image_uris'] } = {}) => (
    image_uris?.png
    ?? image_uris?.large
    ?? image_uris?.normal
    ?? image_uris?.small
  )

  // TODO: handle multi-faced cards

  useEffect(() => {
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
    <Center component={Stack} {...rootProps}>
      <AspectRatio
        ratio={ratio}
        {...aspectRatioProps}
      >
        <Tilt
          gyroscope
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
            src={getCardImageUrl(card?.lang === 'en' ? card : cardLangData?.data?.[0]) ?? '/cardback.png'}
            alt={card?.name ?? 'cardback'}
            width={width}
            height={height}
            placeholder={placeholder}
            blurDataURL={blurDataURL}
            {...imageProps}
            onLoadingComplete={event => { setLoaded(true); imageProps?.onLoadingComplete?.(event) }}
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

      {
        displayPrice
          ? (
            <Center component={Group} noWrap>
              <CardTextPrice
                sx={{ cursor: 'text' }}
                openTooltipToSides={openPriceTooltipToSides}
                data={card}
              />
            </Center>
          )
          : undefined
      }
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
