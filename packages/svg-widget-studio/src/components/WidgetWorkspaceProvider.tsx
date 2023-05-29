import { StyledEngineProvider, Theme, ThemeProvider } from '@mui/material/styles';
import React, { useEffect } from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import { observer } from 'mobx-react';
import { useLocation } from 'wouter';
import { useWorkspaceMst, WorkspaceStoreProvider } from '../rootStore';
import { theme } from '../style';
import { widgetNameToWidgetClassMap } from '../internal/data';

declare module '@mui/styles/defaultTheme' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultTheme extends Theme {}
}

const WithStoreWrapper = observer(({ children }) => {
  const workspaceStore = useWorkspaceMst();
  const darkModeEnabled = workspaceStore.preferences.darkModeEnabled.value;
  const [location, navigate] = useLocation();

  useEffect(() => {
    const pathSegments = location.split('/').filter((part) => !!part);
    if (pathSegments?.[0] === 'widgets' && widgetNameToWidgetClassMap.has(pathSegments?.[1])) {
      workspaceStore.newWidgetStore(pathSegments[1]);
    }
  }, [location]);

  useEffect(() => {
    if (location === '/') {
      navigate('/new');
    }
  }, []);

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
