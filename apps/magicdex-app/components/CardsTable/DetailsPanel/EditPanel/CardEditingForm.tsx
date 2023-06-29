import { FloatingLabelSelect, FloatingLabelTagsSelect, QuantityInput } from '@/components/CustomMantineInputs'
import SelectCarditem from '@/components/ImportComponents/ImportWizard/SelectCarditem'
import { useScryfallCardPrintsQuery, useUserCardsMutation } from '@/services/hooks'
import { UserCardData } from '@/types/supabase'
import { getCardFinishes, scryfallDataToUserCardData } from '@/utils'
import { Box, Center, Checkbox, Grid, Stack, rem } from '@mantine/core'
import { useForm } from '@mantine/form'
import { useMediaQuery, usePrevious } from '@mantine/hooks'
import { forwardRef, useCallback, useEffect, useImperativeHandle } from 'react'


export interface CardEditingFormHandle {
  getCurrentValue: () => UserCardData,
  submit: () => void,
}

export interface CardEditingFormProps {
  card: UserCardData,
  onChange?: (value?: UserCardData) => void,
  onDirtyChange?: (value: boolean) => void,
}

const CardEditingForm = forwardRef<CardEditingFormHandle, CardEditingFormProps>(
  function CardEditingForm({ card, onChange: handleOnChange, onDirtyChange: handleOnDirtyChange }, ref) {
    const isLargerThanMd = useMediaQuery('(min-width: 768px)', false)
    const form = useForm({
      initialValues: {
        ...card,
        set: `${card.set}:${card.collector_number}`,
      }
    })
    const isFormDirty = form?.isDirty()
    const prevIsFormDirty = usePrevious(isFormDirty)
    const { mutate: userCardsMutate } = useUserCardsMutation()
    const { data: cardPrintsData, isFetching: cardPrintsFetching } = useScryfallCardPrintsQuery({ name: card.name })
    const { data: cardLangsData, isFetching: cardLangsFetching } = useScryfallCardPrintsQuery({
      name: card.name,
      lang: 'any',
      set: form.values.set?.split(':', 1)[0],
      collector_number: form.values.set?.split(':')[1],
    })

    useEffect(() => {
      if (prevIsFormDirty !== isFormDirty)
        handleOnDirtyChange?.(isFormDirty)

      if (handleOnChange) {
        if (isFormDirty) {
          const newCard = {
            ...scryfallDataToUserCardData(
              cardLangsData?.data?.find(item => item.lang === form.values.lang)
            ),
            id: card.id,
            foil: form.values.foil,
            amount: form.values.amount,
            prices: cardPrintsData?.data?.find(item => form.values.set === `${item.set}:${item.collector_number}`)?.prices ?? {},
          }
          newCard['price_usd'] = undefined
          handleOnChange(newCard as undefined)
        }
        else {
          handleOnChange(null)
        }
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [form?.values])

    useEffect(() => {
      const finishes = getCardFinishes(
        cardPrintsData?.data?.find(item =>
          `${item.set}:${item.collector_number}` === form.values.set
        )
      )

      if (finishes.foil && finishes.nonfoil)
        form.setFieldValue('foil', form.values?.foil ?? false)
      else
        form.setFieldValue('foil', finishes.foil)

      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [form.values?.set])

    const handleSubmit = useCallback((values) => {
      userCardsMutate([values])
    }, [userCardsMutate])

    useImperativeHandle(ref, () => ({
      getCurrentValue: () => form?.values,
      submit: () => handleSubmit(form?.values),
    }), [form, handleSubmit])

    return (
      <Box component='form'>
        <Grid align='center' gutter='xs'>
          <Grid.Col sm={3}>
            <QuantityInput
              min={1}
              actionIconSize='sm'
              label='Amount'
              flexRootProps={{
                sx: theme => ({
                  backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.white
                }),
                py: '3px',
              }}
              {...form.getInputProps('amount')}
            />
          </Grid.Col>
          <Grid.Col sm={7}>
            <FloatingLabelSelect
              withinPortal
              loading={cardPrintsFetching}
              disabled={cardPrintsFetching || cardPrintsData?.data?.length <= 1}
              label='Set'
              data={cardPrintsData?.data?.map(item => ({
                value: `${item.set}:${item.collector_number}`,
                label: `${item.set_name} [#${item.collector_number}]`,
                cardData: item,
                displayPrice: true,
              })) ?? []}
              {...form.getInputProps('set')}
              onChange={value => {
                const newCard = cardPrintsData?.data?.find(item => `${item.set}:${item.collector_number}` === value)
                form.setValues({
                  lang: newCard?.lang ?? 'en',
                  scryfall_id: newCard?.id,
                })
                form.getInputProps('set').onChange(value)
              }}
              itemComponent={SelectCarditem}
            />
          </Grid.Col>
          <Grid.Col sm={2}>
            <FloatingLabelSelect
              withinPortal
              disabled={cardLangsFetching || cardLangsData?.data?.length <= 1}
              label='Lang'
              data={cardLangsData?.data?.map(item => ({
                value: item.lang,
                label: item.lang,
                cardData: item,
                floatingTooltipPosition: 'left',
                displayPrice: false,
              })) ?? []}
              loading={cardLangsFetching}
              {...form.getInputProps('lang')}
              onChange={value => {
                const newCard = cardLangsData?.data?.find(item => item.lang === value)
                form.setValues({
                  scryfall_id: newCard?.id,
                })
                form.getInputProps('lang').onChange(value)
              }}
              itemComponent={SelectCarditem}
            />
          </Grid.Col>

          <Grid.Col sm={3}>
            <FloatingLabelSelect
              withinPortal
              label='Condition'
              data={['NM', 'LP', 'MP', 'HP', 'DMG']}
              {...form.getInputProps('condition')}
              boxRootProps={{ miw: rem(100) }}
            />
          </Grid.Col>
          <Grid.Col sm={9} style={{ alignSelf: 'flex-start' }}>
            <FloatingLabelTagsSelect
              withinPortal
              initialDataValue={form.values.tags}
              label='Tags'
              {...form.getInputProps('tags')}
            />
          </Grid.Col>
          <Grid.Col pt='sm' sm={3}>
            <Box
              component={!isLargerThanMd ? Center : undefined}
              pl={isLargerThanMd ? 2.5 : 0}
            >
              <Stack w='fit-content'>
                <Checkbox
                  disabled={
                    Object.values(
                      getCardFinishes(
                        cardPrintsData?.data?.find(item =>
                          `${item.set}:${item.collector_number}` === form.values.set
                        )
                      )
                    ).filter(Boolean).length < 2
                  }
                  label='Foil'
                  checked={form.values.foil}
                  {...form.getInputProps('foil')}
                />
                <Checkbox
                  label='Signed'
                  checked={form.values.signed}
                  {...form.getInputProps('signed')}
                />
                <Checkbox
                  label='Altered'
                  checked={form.values.altered}
                  {...form.getInputProps('altered')}
                />
                <Checkbox
                  label='Misprint'
                  checked={form.values.misprint}
                  {...form.getInputProps('misprint')}
                />
              </Stack>
            </Box>
          </Grid.Col>
        </Grid>
      </Box>
    )
  }
)
export default CardEditingForm
