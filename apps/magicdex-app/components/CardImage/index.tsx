import { UserCardData } from '@/types/supabase'
import { AspectRatio, AspectRatioProps, Overlay } from '@mantine/core'
import Image, { ImageProps } from 'next/image'
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
  React.HTMLAttributes<HTMLDivElement> & {
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
  // const { classes } = useStyles()
  // TODO: handle multi-faced cards

  return (
    <div {...rootProps}>
      <Tilt
        tiltEnable={tiltEnabled}
        glareEnable={glareEnabled}
        tiltMaxAngleX={tiltMaxAngleX}
        tiltMaxAngleY={tiltMaxAngleY}
        glareBorderRadius={glareBorderRadius}
        glarePosition={glarePosition}
        glareMaxOpacity={glareMaxOpacity}
        {...tiltProps}
      >
        <AspectRatio
          ratio={ratio}
          {...aspectRatioProps}
        >
          <Image
            src={card?.image_uris?.png ?? '/cardback.png'}
            alt={card?.name ?? 'cardback'}
            width={width}
            height={height}
            placeholder={placeholder}
            blurDataURL={blurDataURL}
            {...imageProps}
          />
          {card?.foil && (
            <Overlay
              style={{
                backgroundImage: 'URL(card-foil-overlay.png)',
                mixBlendMode: 'lighten',
                opacity: 0.75,
                borderRadius: glareBorderRadius,
              }}
            />
          )}
        </AspectRatio>
      </Tilt>
    </div>
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
