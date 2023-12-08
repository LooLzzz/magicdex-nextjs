import { createStyles } from '@mantine/core'


export default createStyles(theme => ({
  icon: {
    color: theme.colorScheme === 'dark' ? theme.colors.dark[3] : theme.colors.gray[5],
  },

  name: {
    cursor: 'pointer',
    '&:hover + svg': {
      display: 'block',
    },
  },

  iconPencil: {
    display: 'none',
    '&:hover': {
      display: 'block',
    },
  },

  nameInput: {
    height: 'auto',
    lineHeight: 'inherit',
  },
}))
