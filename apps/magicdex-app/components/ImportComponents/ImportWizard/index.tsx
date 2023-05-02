import { CardImage, FloatingLabelInput } from '@/components'
import { ActionIcon, Button, Checkbox, Grid, Paper, Stack, Text, rem, Flex } from '@mantine/core'
import { useForm } from '@mantine/form'
import { IconPlus } from '@tabler/icons-react'


export default function ImportWizard() {
  const form = useForm({
    initialValues: {
      name: '',
      amount: '',
      set: '',
      language: '',
      condition: '',
      tags: [],
      foil: false,
      signed: false,
      altered: false,
      misprint: false,
    },
  })

  const handleSubmit = (values) => {
    console.log({ values })
    // TODO: submit
  }

  return (
    <Paper radius={10} px={rem(30)} py={rem(20)}>
      <Stack>
        <Text size={'2rem'} weight={600} tt='uppercase'>
          🧙‍♂️ Import Wizard <Text italic component='span' size={'1.2rem'}>(of the Coast™)</Text>
        </Text>

        <form
          onSubmit={form.onSubmit(handleSubmit)}
          onReset={form.onReset}
        >
          <Grid align='center' gutter='xl'>
            <Grid.Col sm={12} md={3} {...{ align: 'center' }}>
              <CardImage
                aspectRatioProps={{
                  maw: CardImage.defaultWidth,
                  miw: CardImage.defaultWidth * 0.8,
                }}
              />
            </Grid.Col>

            <Grid.Col span='auto'>
              <Grid align='center' gutter='xs'>
                <Grid.Col span={11}>
                  <FloatingLabelInput
                    label='Card Name'
                    {...form.getInputProps('name')}
                  />
                </Grid.Col>
                <Grid.Col pt='md' span={1}>
                  <Flex justify='flex-end'>
                    <ActionIcon variant='filled' color={null}>
                      <IconPlus />
                    </ActionIcon>
                  </Flex>
                </Grid.Col>
                <Grid.Col span={3}>
                  <FloatingLabelInput
                    label='Amount'
                    {...form.getInputProps('amount')}
                  />
                </Grid.Col>
                <Grid.Col span={7}>
                  <FloatingLabelInput
                    label='Set'
                    {...form.getInputProps('set')}
                  />
                </Grid.Col>
                <Grid.Col span={2}>
                  <FloatingLabelInput
                    label='Lang'
                    {...form.getInputProps('language')}
                  />
                </Grid.Col>

                <Grid.Col span={3}>
                  <FloatingLabelInput
                    label='Condition'
                    {...form.getInputProps('condition')}
                  />
                </Grid.Col>
                <Grid.Col span={9} style={{ alignSelf: 'flex-start' }}>
                  <FloatingLabelInput
                    label='Tags'
                    {...form.getInputProps('tags')}
                  />
                </Grid.Col>
                <Grid.Col pt='sm' span={12}>
                  <Stack>
                    <Checkbox
                      label='Foil'
                      {...form.getInputProps('foil')}
                    />
                    <Checkbox
                      label='Signed'
                      {...form.getInputProps('signed')}
                    />
                    <Checkbox
                      label='Altered'
                      {...form.getInputProps('altered')}
                    />
                    <Checkbox
                      label='Misprint'
                      {...form.getInputProps('misprint')}
                    />
                  </Stack>
                </Grid.Col>
              </Grid>
            </Grid.Col>
          </Grid>

          <Grid>
            <Grid.Col span='auto' />
            <Grid.Col span='content'>
              <Button type='reset' variant='default' >Reset</Button>
            </Grid.Col>
            <Grid.Col span='content'>
              <Button type='submit'>Save</Button>
            </Grid.Col>
          </Grid>
        </form>
      </Stack>
    </Paper>
  )
}
