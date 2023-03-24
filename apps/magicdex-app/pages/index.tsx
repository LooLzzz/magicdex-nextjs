import { Center, Title, useMantineColorScheme } from '@mantine/core'


// TODO: all this

export default function HomePage() {
  const { colorScheme } = useMantineColorScheme()

  return (
    <Center>
      <Title>
        {'Current color scheme: '}
        <span style={{ color: colorScheme === 'dark' ? 'red' : 'blue' }}>
          {colorScheme}
        </span>
      </Title>
    </Center>
  )
}
