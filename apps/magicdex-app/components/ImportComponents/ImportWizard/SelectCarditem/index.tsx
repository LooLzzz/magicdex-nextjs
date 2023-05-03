import CardImage from '@/components/CardImage'
import { ScryfallCardData } from '@/types/scryfall'
import { Text, Tooltip } from '@mantine/core'
import { ComponentPropsWithoutRef, forwardRef } from 'react'

export interface ItemProps extends ComponentPropsWithoutRef<'div'> {
  label: string,
  value: string,
  cardData: ScryfallCardData,
}


const SelectCarditem = forwardRef<HTMLDivElement, ItemProps>(
  function SelectCarditem({ label, value, cardData, ...props }: ItemProps, ref) {
    return (
      <Tooltip.Floating
        position='right'
        bg='transparent'
        label={
          <CardImage
            tiltEnabled={false}
            glareEnabled={false}
            aspectRatioProps={{ w: CardImage.defaultWidth * 0.7 }}
            card={cardData as undefined}
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
