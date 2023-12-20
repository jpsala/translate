import { createTheme } from '@mui/material';
import { red } from '@mui/material/colors';


export const defaultTheme = createTheme({

  palette: {
    primary: {
      main: '#004052'
    },
    secondary: {
      main: '#656566'
    },
    error: {
      main: red.A400
    }
  }

});
