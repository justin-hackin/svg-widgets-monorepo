import { StyledEngineProvider, Theme, ThemeProvider } from '@mui/material/styles';
import React, { useEffect } from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import { observer } from 'mobx-react';
import { useLocation } from 'wouter';
import { useWorkspaceMst, WorkspaceStoreProvider } from '../rootStore';
import { theme } from '../style';

declare module '@mui/styles/defaultTheme' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultTheme extends Theme {}
}

const WithStoreWrapper = observer(({ children }) => {
  const workspaceStore = useWorkspaceMst();
  const darkModeEnabled = workspaceStore.preferences.darkModeEnabled.value;
  const [location] = useLocation();

  useEffect(() => {
    const pathSegments = location.split('/').filter((part) => !!part);
    if (pathSegments?.[0] === 'widgets' && pathSegments?.[1] !== 'new') {
      workspaceStore.newWidgetStore(pathSegments[1]);
    }
  }, [location]);

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme(darkModeEnabled)}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </StyledEngineProvider>
  );
});

export function WidgetWorkspaceProvider({ children }) {
  return (
    <WorkspaceStoreProvider>
      <WithStoreWrapper>
        {children}
      </WithStoreWrapper>
    </WorkspaceStoreProvider>
  );
}
