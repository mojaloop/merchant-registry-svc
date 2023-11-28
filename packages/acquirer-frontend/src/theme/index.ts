import { extendTheme } from '@chakra-ui/react'

import '@fontsource/inter/100.css'
import '@fontsource/inter/200.css'
import '@fontsource/inter/300.css'
import '@fontsource/inter/400.css'
import '@fontsource/inter/600.css'
import '@fontsource/inter/700.css'
import '@fontsource/inter/800.css'
import '@fontsource/inter/900.css'

const theme = extendTheme({
  fonts: {
    heading: `'Inter', sans-serif`,
    body: `'Inter', sans-serif`,
  },
  breakpoints: {
    md: '50em',
    lg: '65em',
  },
  colors: {
    primary: '#005585',
    secondary: '#CCEDFF',
    accent: '#FC440F',
    info: '#3C8CFF',
    danger: '#CE4911',
    success: '#30D6A7',
    warning: '#F9C937',
    primaryBackground: '#E1E9F4',
  },
  styles: {
    global: {
      'input, textarea, select': {
        fontSize: '0.9375rem !important',
        _focusVisible: {
          borderColor: '#90CDF4 !important',
          boxShadow: '0 0 0 2px #90CDF4 !important',
        },
      },
    },
  },
})

export default theme
