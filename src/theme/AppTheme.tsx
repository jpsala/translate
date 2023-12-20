import { ThemeProvider } from '@emotion/react';
import { CssBaseline } from '@mui/material';

import { defaultTheme } from './default.theme';

export const AppTheme = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider theme={ defaultTheme }>
      <CssBaseline />
      { children }
    </ThemeProvider>
  )
}
