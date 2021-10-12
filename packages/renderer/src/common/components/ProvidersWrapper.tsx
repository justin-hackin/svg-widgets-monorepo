import { StyledEngineProvider, Theme, ThemeProvider } from '@mui/material/styles';
import React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import { WorkspaceStoreProvider } from '../../WidgetWorkspace/models/WorkspaceModel';
import { theme } from '../style/style';

declare module '@mui/styles/defaultTheme' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultTheme extends Theme {}
}

export const ProvidersWrapper = ({ children }) => (
  <StyledEngineProvider injectFirst>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <WorkspaceStoreProvider>
        {children}
      </WorkspaceStoreProvider>
    </ThemeProvider>
  </StyledEngineProvider>
);
