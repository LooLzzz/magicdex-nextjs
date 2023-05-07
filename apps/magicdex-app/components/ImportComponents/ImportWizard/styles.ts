import { createStyles } from '@mantine/core'


export default createStyles(theme => ({
  buttonRoot: {
    '&:disabled': {
      backgroundColor: (
        theme.colorScheme === 'dark'
          ? theme.colors.gray[7]
          : theme.colors.gray[4]
      ),
    },
  },
}))
