import { UserCardData } from '@/types/supabase'
import { AspectRatio, AspectRatioProps, Box, BoxProps, LoadingOverlay, Overlay, useMantineTheme } from '@mantine/core'
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
  BoxProps & {
    card?: UserCardData,
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

  // TODO: handle multi-faced cards

  useEffect(() => {
    setLoaded(false)
  }, [card?.image_uris?.png])

  return (
    <Box {...rootProps}>
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
            src={card?.image_uris?.png ?? '/cardback.png'}
            alt={card?.name ?? 'cardback'}
            width={width}
            height={height}
            placeholder={placeholder}
            blurDataURL={blurDataURL}
            {...imageProps}
            onLoad={event => { setLoaded(true); imageProps?.onLoad?.(event) }}
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
            visible={card?.image_uris && !isLoaded}
            opacity={0.9}
            radius={glareBorderRadius}
          />
        </Tilt>
      </AspectRatio>
    </Box>
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
