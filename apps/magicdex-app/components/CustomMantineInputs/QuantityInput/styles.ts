import { createStyles, rem } from '@mantine/core'


export default createStyles((theme, { disabled, floating }: { disabled: boolean, floating: boolean }) => ({
  flexWrapper: {
    borderRadius: theme.radius.sm,
    border: `${rem(1)} solid ${theme.colorScheme === 'dark' ? theme.colors.dark[4] : '#d9dde3'}`,
    backgroundColor: (
      disabled
        ? theme.colorScheme === 'dark' ? '#2b2e34' : '#eef0f3'
        : theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.white
      // : theme.colorScheme === 'dark' ? '#25262b' : theme.white
    ),

    '&:focus-within': {
      borderColor: theme.colors[theme.primaryColor][6],
    },
  },

  root: {
    position: 'relative',
    flex: 1,
    textAlign: 'center',
  },

  required: {
    transition: 'opacity 150ms ease',
    opacity: floating ? 1 : 0,
  },

  label: {
    zIndex: 2,
    userSelect: 'none',
    cursor: disabled ? 'not-allowed' : undefined,
    color: floating
      ? theme.colorScheme === 'dark'
        ? theme.white
        : theme.black
      : theme.colorScheme === 'dark'
        ? theme.colors.dark[3]
        : theme.colors.gray[5],
    fontSize: floating ? theme.fontSizes.xs : theme.fontSizes.sm,
    fontWeight: floating ? 500 : 400,
    flex: 1,

    transition: '150ms ease',
    position: floating ? 'absolute' : undefined,
    // transform: floating ? `translate(${rem(-53)}, ${rem(-28)})` : 'none',
    top: -26,
    left: -30,
  },

  wrapper: {
    // flex: 1,
    // display: 'flex',
    // alignItems: 'center',
    // justifyContent: 'center',
  },

  input: {
    display: floating ? undefined : 'none',
    backgroundColor: 'transparent !important',
    textAlign: 'center',
    padding: 0,
    // paddingTop: 0,
    // paddingBottom: 0,
    // paddingRight: `${theme.spacing.sm} !important`,
    // paddingLeft: `${theme.spacing.sm} !important`,
    height: rem(28),
    flex: 1,
    lineHeight: '1em',

    '&::placeholder': {
      transition: 'color 150ms ease',
      color: !floating ? 'transparent' : undefined,
    },
  },

  controls: {
    color: `${theme.colorScheme === 'dark' ? theme.white : theme.colors.gray[7]} !important`,
    // pointerEvents: 'none',
    // backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.white,
    // border: `${rem(1)} solid ${theme.colorScheme === 'dark' ? 'transparent' : theme.colors.gray[3]}`,

    '&:disabled': {
      cursor: 'not-allowed !important',
      opacity: 0.4,
      // borderColor: theme.colorScheme === 'dark' ? 'transparent' : theme.colors.gray[3],
      // backgroundColor: 'transparent',
    },
  },
}))
