import { createStyles } from '@mantine/core'


export default createStyles(theme => ({
  tableContainer: {
    // Firefox
    scrollbarWidth: 'none',

    // IE and Edge
    msOverflowStyle: 'none',

    // Chrome
    '&::-webkit-scrollbar': {
      display: 'none',
      // width: 7.5,
      // height: 7.5,
    },
    '&::-webkit-scrollbar-track': {
      // backgroundColor: 'rgb(0 0 0 / 40%)',
      // backgroundColor: 'transparent',
      // borderRadius: 7.5,
    },
    '&::-webkit-scrollbar-thumb': {
      // backgroundColor: '#d6dee1',
      // borderRadius: 7.5,
      // border: 'solid transparent',
      // backgroundClip: 'content-box',

      // backgroundColor: 'grey',
      // backgroundColor: '#dfdfdf',
      // borderRadius: 7.5,
    },
  },
}))
