import { ActionIcon, Container, Flex, Group, Image, Text, Tooltip } from '@mantine/core'
import { IconBrandInstagram, IconBrandTwitter, IconBrandYoutube } from '@tabler/icons-react'
import useStyles from './styles'


export default function CustomFooter() {
  const { classes } = useStyles()

  return (
    <div className='mantine-footer'>
      <Container className={classes.inner}>
        {/* <Image alt='Magicdex logo' src={'logo.png'} width={150} /> */}

        <Flex
          w='100%'
          wrap='nowrap'
          justify='center'
          align='center'
          className={classes.links}
        >
          <Group noWrap spacing={0}>
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

          <Text size='sm' align='center' style={{ flexGrow: 1 }}>
            {'Made with '}
            <span role='img' aria-label='heart'>{'❤️ '}</span>
            {'by '}
            <Tooltip.Floating
              sx={{ backgroundColor: 'transparent' }}
              position='top'
              label={<Image radius={10} width={80} alt="LooLzzz's Avatar" src='https://avatars.githubusercontent.com/u/8081213' />}
            >
              <Text color='blue' component='a' href='http://github.com/LooLzzz'>
                LooLzzz
              </Text>
            </Tooltip.Floating>
          </Text>
        </Flex>

      </Container>
    </div >
  )
}
