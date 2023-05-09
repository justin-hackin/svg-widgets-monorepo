import { StyledEngineProvider, Theme, ThemeProvider } from '@mui/material/styles';
import React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import { observer } from 'mobx-react';
import { useWorkspaceMst, WorkspaceStoreProvider } from '../../WidgetWorkspace/models/WorkspaceModel';
import { theme } from '../style/style';

declare module '@mui/styles/defaultTheme' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultTheme extends Theme {}
}

const StylesWrapper = observer(({ children }) => {
  const workspaceStore = useWorkspaceMst();
  const darkModeEnabled = workspaceStore.preferences.darkModeEnabled.value;
  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme(darkModeEnabled)}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </StyledEngineProvider>
  );
});

export function ProvidersWrapper({ children }) {
  return (
    <WorkspaceStoreProvider>
      <StylesWrapper>
        {children}
      </StylesWrapper>
    </WorkspaceStoreProvider>
  );
}
