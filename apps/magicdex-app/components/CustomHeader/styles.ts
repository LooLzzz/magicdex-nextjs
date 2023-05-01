import { createStyles, rem } from '@mantine/core'


export default createStyles(theme => ({
  link: {
    display: 'flex',
    alignItems: 'center',
    height: '100%',
    paddingLeft: theme.spacing.md,
    paddingRight: theme.spacing.md,
    textDecoration: 'none',
    color: theme.white,
    fontWeight: 500,
    fontSize: theme.fontSizes.sm,

    [theme.fn.smallerThan('sm')]: {
      height: rem(42),
      display: 'flex',
      alignItems: 'center',
      width: '100%',
    },

    ...theme.fn.hover({
      backgroundColor:
        theme.colorScheme === 'dark'
          ? theme.fn.themeColor(theme.primaryColor, 9)
          : theme.fn.themeColor(theme.primaryColor, 5),
    }),

    borderBottom: `${rem(2.5)} transparent solid`,
    // borderRadius: theme.radius.md,
    transition: 'border 0.2s ease-in-out',

    '&.activeLink': {
      borderBottom: `${rem(2.5)} solid ${theme.colorScheme === 'dark'
        ? theme.fn.themeColor(theme.primaryColor, 2)
        : theme.fn.themeColor(theme.primaryColor, 1)}`,
    },

    '&.sidebar': {
      borderBottom: `0 solid transparent`,
      borderLeft: `${rem(3)} solid transparent`,
    },

    '&.activeLink&.sidebar': {
      borderLeft: `${rem(3)} solid ${theme.fn.themeColor(theme.primaryColor, 5)}`,
    },
  },

  subLink: {
    width: '100%',
    padding: `${theme.spacing.xs} ${theme.fn.themeColor(theme.primaryColor, 5)}`,
    borderRadius: theme.radius.md,

    ...theme.fn.hover({
      backgroundColor:
        theme.colorScheme === 'dark'
          ? theme.colors.dark[7]
          : theme.colors.gray[0],
    }),

    '&:active': theme.activeStyles,
  },

  dropdownFooter: {
    backgroundColor:
      theme.colorScheme === 'dark'
        ? theme.colors.dark[7]
        : theme.colors.gray[0],
    margin: `calc(${theme.spacing.md} * -1)`,
    marginTop: theme.spacing.sm,
    padding: `${theme.spacing.md} calc(${theme.spacing.md} * 2)`,
    paddingBottom: theme.spacing.xl,
    borderTop: `${rem(1)} solid ${theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[1]
      }`,
  },

  hiddenMobile: {
    [theme.fn.smallerThan('sm')]: {
      display: 'none',
    },
  },

  hiddenDesktop: {
    [theme.fn.largerThan('sm')]: {
      display: 'none',
    },
  },

  avatarHover: {
    '&::after': {
      content: '""',
      borderRadius: '10%',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      opacity: 0.1,
      backgroundColor: (
        theme.colorScheme === 'dark'
          ? theme.colors.gray[0]
          : theme.colors.gray[8]
      ),
    },
  },
}))

