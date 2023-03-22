import { createStyles, rem } from '@mantine/core'


export default createStyles(theme => ({
  link: {
    display: 'flex',
    alignItems: 'center',
    height: '100%',
    paddingLeft: theme.spacing.md,
    paddingRight: theme.spacing.md,
    textDecoration: 'none',
    color: theme.colorScheme === 'dark' ? theme.white : theme.black,
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
          ? theme.colors.dark[6]
          : theme.colors.gray[0],
    }),

    borderBottom: `${rem(2.5)} transparent solid`,
    // borderRadius: theme.radius.md,
    transition: 'border 0.2s ease-in-out',

    '&.activeLink': {
      borderBottom: `${rem(2.5)} solid ${theme.primaryColor}`,
    },

    '&.sidebar': {
      borderBottom: `0 solid transparent`,
      borderLeft: `${rem(3)} solid transparent`,
    },

    '&.activeLink&.sidebar': {
      borderLeft: `${rem(3)} solid ${theme.primaryColor}`,

      // justifyContent: 'space-between',
      // '&:before': {
      //   // draw a triangle
      //   content: '""',
      //   width: 0,
      //   height: 0,
      //   borderStyle: 'solid',
      //   borderWidth: `${rem(10)} 0 ${rem(10)} ${rem(15)}`,
      //   borderColor: `transparent transparent transparent ${theme.primaryColor}`,
      // },
    },
  },

  subLink: {
    width: '100%',
    padding: `${theme.spacing.xs} ${theme.spacing.md}`,
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
}))

