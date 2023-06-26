import { ColumnFiltersContext } from '@/components/CardsTable/filtersDef'
import { FloatingLabelSelect, FloatingLabelTagsSelect, QuantityInput } from '@/components/CustomMantineInputs'
import SelectCarditem from '@/components/ImportComponents/ImportWizard/SelectCarditem'
import { useScryfallCardPrintsQuery, useUserCardsMutation } from '@/services/hooks'
import { UserCardData } from '@/types/supabase'
import { getCardFinishes } from '@/utils'
import { Checkbox, Grid, Stack, rem, JsonInput } from '@mantine/core'
import { useForm } from '@mantine/form'
import { forwardRef, useImperativeHandle, useState } from 'react'

// TODO: make an info panel with edit functionality


export interface CardEditingFormHandle {
  getCurrentValue: () => UserCardData,
}

export interface CardEditingFormProps {
  card: UserCardData,
}


const CardEditingForm = forwardRef<CardEditingFormHandle, CardEditingFormProps>(
  function CardEditingForm({ card }, ref) {
    useImperativeHandle(ref, () => ({
      getCurrentValue: () => card,
    }), [card])

    return (
      <JsonInput
        defaultValue={JSON.stringify(card, null, 2)}
        minRows={30}
      />
    )

    // const form = useForm()
    // const [selectedCard, setSelectedCard] = useState<string>()
    // const [columnFilters, setColumnFilters] = useContext(ColumnFiltersContext)
    // const { mutate: userCardsMutate, isLoading: isMutating } = useUserCardsMutation()
    // const { data: cardPrintsData, isFetching: cardPrintsFetching } = useScryfallCardPrintsQuery({ name: selectedCard })
    // const { data: cardLangsData, isFetching: cardLangsFetching } = useScryfallCardPrintsQuery({
    //   name: selectedCard,
    //   lang: 'any',
    //   set: form.values.set?.split(':', 1)[0],
    //   collector_number: form.values.set?.split(':')[1],
    // })

    // const handleChipsOnChanged = (value: string[]) => {
    //   setColumnFilters([
    //     ...columnFilters.filter(item => item.id !== 'tags'),
    //     { id: 'tags', value }
    //   ])
    // }

    // const handleOnClick = ({ inc, foil }: { inc?: number, foil?: boolean }) => {
    //   userCardsMutate([{
    //     id: card.id,
    //     altered: card.altered,
    //     amount: inc === undefined ? card.amount : inc,
    //     condition: card.condition,
    //     foil: foil ?? card.foil,
    //     misprint: card.misprint,
    //     scryfall_id: card.scryfall_id,
    //     signed: card.signed,
    //     tags: card.tags,
    //     override_card_data: card.override_card_data,
    //   }])
    // }

    // return (
    //   <form
    //   // onSubmit={form.onSubmit(handleSubmit)}
    //   // onReset={() => resetForm()}
    //   >
    //     <Grid align='center' gutter='xs'>
    //       <Grid.Col sm={3}>
    //         <QuantityInput
    //           min={1}
    //           disabled={!selectedCard}
    //           actionIconSize='sm'
    //           label='Amount'
    //           {...form.getInputProps('amount')}
    //         />
    //       </Grid.Col>
    //       <Grid.Col sm={7}>
    //         <FloatingLabelSelect
    //           loading={cardPrintsFetching}
    //           disabled={!selectedCard || cardPrintsFetching || cardPrintsData?.data?.length <= 1}
    //           label='Set'
    //           data={cardPrintsData?.data?.map(item => ({
    //             value: `${item.set}:${item.collector_number}`,
    //             label: `${item.set_name} [#${item.collector_number}]`,
    //             cardData: item,
    //             displayPrice: true,
    //           })) ?? []}
    //           {...form.getInputProps('set')}
    //           onChange={value => {
    //             form.setValues({
    //               lang: cardPrintsData?.data?.find(item =>
    //                 `${item.set}:${item.collector_number}` === value
    //               )?.lang ?? 'en'
    //             })
    //             form.getInputProps('set').onChange(value)
    //           }}
    //           itemComponent={SelectCarditem}
    //         />
    //       </Grid.Col>
    //       <Grid.Col sm={2}>
    //         <FloatingLabelSelect
    //           disabled={!selectedCard || cardLangsFetching || cardLangsData?.data?.length <= 1}
    //           label='Lang'
    //           data={cardLangsData?.data?.map(item => ({
    //             value: item.lang,
    //             label: item.lang,
    //             cardData: item,
    //             floatingTooltipPosition: 'left',
    //             displayPrice: false,
    //           })) ?? []}
    //           loading={cardLangsFetching}
    //           {...form.getInputProps('lang')}
    //           itemComponent={SelectCarditem}
    //         />
    //       </Grid.Col>

    //       <Grid.Col sm={3}>
    //         <FloatingLabelSelect
    //           disabled={!selectedCard}
    //           label='Condition'
    //           data={['NM', 'LP', 'MP', 'HP', 'DMG']}
    //           {...form.getInputProps('condition')}
    //           boxRootProps={{ miw: rem(100) }}
    //         />
    //       </Grid.Col>
    //       <Grid.Col sm={9} style={{ alignSelf: 'flex-start' }}>
    //         <FloatingLabelTagsSelect
    //           disabled={!selectedCard}
    //           label='Tags'
    //           {...form.getInputProps('tags')}
    //         />
    //       </Grid.Col>
    //       <Grid.Col pt='sm' sm={3}>
    //         <Stack>
    //           <Checkbox
    //             disabled={
    //               !selectedCard
    //               || Object.values(
    //                 getCardFinishes(
    //                   cardPrintsData?.data?.find(item =>
    //                     `${item.set}:${item.collector_number}` === form.values.set
    //                   )
    //                 )
    //               ).filter(Boolean).length < 2
    //             }
    //             label='Foil'
    //             checked={form.values.foil}
    //             {...form.getInputProps('foil')}
    //           />
    //           <Checkbox
    //             disabled={!selectedCard}
    //             label='Signed'
    //             checked={form.values.signed}
    //             {...form.getInputProps('signed')}
    //           />
    //           <Checkbox
    //             disabled={!selectedCard}
    //             label='Altered'
    //             checked={form.values.altered}
    //             {...form.getInputProps('altered')}
    //           />
    //           <Checkbox
    //             disabled={!selectedCard}
    //             label='Misprint'
    //             checked={form.values.misprint}
    //             {...form.getInputProps('misprint')}
    //           />
    //         </Stack>
    //       </Grid.Col>
    //     </Grid>
    //   </form>
    // )
  }
)
export default CardEditingForm
