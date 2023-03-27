import { ActionIcon, Container, Group } from '@mantine/core'
import { IconBrandInstagram, IconBrandTwitter, IconBrandYoutube } from '@tabler/icons-react'
import useStyles from './styles'


export default function CustomFooter() {
  const { classes } = useStyles()

  return (
    <div className='mantine-footer'>
      <Container className={classes.inner}>
        {/* <Image alt='Magicdex logo' src={'logo.png'} width={150} /> */}

        <Group spacing={0} className={classes.links} position='right' noWrap>
          <ActionIcon size='lg'>
            <IconBrandTwitter size='1.05rem' stroke={1.5} />
          </ActionIcon>
          <ActionIcon size='lg'>
            <IconBrandYoutube size='1.05rem' stroke={1.5} />
          </ActionIcon>
          <ActionIcon size='lg'>
            <IconBrandInstagram size='1.05rem' stroke={1.5} />
          </ActionIcon>
        </Group>
      </Container>
    </div>
  )
}
