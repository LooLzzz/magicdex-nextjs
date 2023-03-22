import { Button, Group, useMantineColorScheme } from '@mantine/core'
import { showNotification } from '@mantine/notifications'
import useStyles from './styles'


export default function HomePage() {
  const { classes } = useStyles()
  const { colorScheme, toggleColorScheme } = useMantineColorScheme()

  const handleToggleColorScheme = () => {
    toggleColorScheme()
    showNotification({
      title: 'Color scheme toggled',
      message: `Current color scheme is now ${colorScheme === 'dark' ? 'light' : 'dark'}`,
      color: colorScheme === 'dark' ? 'red' : 'blue',
    })
  }

  return (
    <div>
      <h1>
        Current color scheme:&nbsp;
        <span style={{ color: colorScheme === 'dark' ? 'red' : 'blue' }}>
          {colorScheme}
        </span>
      </h1>

      <Group mt={50} position='center'>
        <Button onClick={handleToggleColorScheme} size='xl'>
          Toggle color scheme
        </Button>
      </Group>
    </div>
  )
}
