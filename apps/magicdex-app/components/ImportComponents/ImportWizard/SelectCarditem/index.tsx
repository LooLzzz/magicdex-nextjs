import CardImage from '@/components/CardImage'
import { ScryfallCardData } from '@/types/scryfall'
import { Text, Tooltip } from '@mantine/core'
import { FloatingPosition } from '@mantine/core/lib/Floating'
import { ComponentPropsWithoutRef, forwardRef } from 'react'

export interface ItemProps extends ComponentPropsWithoutRef<'div'> {
  label: string,
  value: string,
  cardData: ScryfallCardData,
  displayPrice?: boolean,
  floatingTooltipPosition?: FloatingPosition,
}


const SelectCarditem = forwardRef<HTMLDivElement, ItemProps>(
  function SelectCarditem({ label, value, cardData, floatingTooltipPosition, displayPrice = false, ...props }: ItemProps, ref) {
    return (
      <Tooltip.Floating
        position={floatingTooltipPosition}
        bg='transparent'
        label={
          <CardImage
            displayPrice={displayPrice}
            tiltEnabled={false}
            glareEnabled={false}
            aspectRatioProps={{ w: CardImage.defaultWidth * 0.7 }}
            priceTextProps={{
              sx: theme => ({
                color: theme.colorScheme === 'dark' ? theme.colors.gray[0] : theme.colors.gray[9]
              })
            }}
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
