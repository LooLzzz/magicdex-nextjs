import CardImage from '@/components/CardImage'
import { ScryfallCardData } from '@/types/scryfall'
import { Text, Tooltip } from '@mantine/core'
import { FloatingPosition } from '@mantine/core/lib/Floating'
import { ComponentPropsWithoutRef, forwardRef } from 'react'

export interface ItemProps extends ComponentPropsWithoutRef<'div'> {
  label: string,
  value: string,
  cardData: ScryfallCardData,
  floatingTooltipPosition?: FloatingPosition,
}


const SelectCarditem = forwardRef<HTMLDivElement, ItemProps>(
  function SelectCarditem({ label, value, cardData, floatingTooltipPosition, ...props }: ItemProps, ref) {
    return (
      <Tooltip.Floating
        position={floatingTooltipPosition}
        bg='transparent'
        label={
          <CardImage
            tiltEnabled={false}
            glareEnabled={false}
            aspectRatioProps={{ w: CardImage.defaultWidth * 0.7 }}
            card={{ ...cardData, foil: false } as undefined}
          />
        }>
        <Text ref={ref} {...props}>
          {label}
        </Text>
      </Tooltip.Floating>
    )
  }
)

export default SelectCarditem
