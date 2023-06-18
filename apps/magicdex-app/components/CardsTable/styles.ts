import { createStyles } from '@mantine/core'


export default createStyles(theme => ({
  tableContainer: {
    '::-webkit-scrollbar': {
      display: 'none',
      // width: 7.5,
      // height: 7.5,
    },
    '::-webkit-scrollbar-track': {
      // backgroundColor: 'rgb(0 0 0 / 40%)',
      // backgroundColor: 'transparent',
      // borderRadius: 7.5,
    },
    '::-webkit-scrollbar-thumb': {
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


// ::-webkit-scrollbar {
//   width: 20px;
// }

// ::-webkit-scrollbar-track {
//   background-color: transparent;
// }

// ::-webkit-scrollbar-thumb {
//   background-color: #d6dee1;
//   border-radius: 20px;
//   border: 6px solid transparent;
//   background-clip: content-box;
// }

// ::-webkit-scrollbar-thumb:hover {
//   background-color: #a8bbbf;
// }
