import { StyledEngineProvider, Theme, ThemeProvider } from '@mui/material/styles';
import React, { useEffect } from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import { observer } from 'mobx-react';
import { Router, RouterProps, useLocation } from 'wouter';
import { useWorkspaceMst, workspaceStore, WorkspaceStoreProvider } from '../rootStore';
import { theme } from '../style';
import { widgetNameToWidgetClassMap } from '../internal/data';

declare module '@mui/styles/defaultTheme' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultTheme extends Theme {}
}

type ProviderProps = {
  baseRoute?: string,
  children: RouterProps['children'],
  fallbackToNew?: boolean
};

const HasRouterWrapper = ({ children, fallbackToNew = true }: Omit<ProviderProps, 'baseRoute'>) => {
  const [location, navigate] = useLocation();

  useEffect(() => {
    const pathSegments = location.split('/').filter((part) => !!part);
    if (pathSegments?.[0] === 'widgets' && widgetNameToWidgetClassMap.has(pathSegments?.[1])) {
      workspaceStore.newWidgetStore(pathSegments[1]);
    }
  }, [location]);

  useEffect(() => {
    if (location === '/' && fallbackToNew) {
      navigate('/new');
    }
  }, []);
  return children;
};

const HasStoreWrapper = observer((
  { children, baseRoute, fallbackToNew }: ProviderProps,
) => {
  const workspaceStore = useWorkspaceMst();
  const darkModeEnabled = workspaceStore.preferences.darkModeEnabled.value;

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme(darkModeEnabled)}>
        <CssBaseline />
        <Router base={baseRoute || ''}>
          {/* @ts-ignore */}
          <HasRouterWrapper fallbackToNew={fallbackToNew}>
            {children}
          </HasRouterWrapper>
        </Router>
      </ThemeProvider>
    </StyledEngineProvider>
  );
});

export function WidgetWorkspaceProvider({ children, baseRoute, fallbackToNew }: ProviderProps) {
  return (
    <WorkspaceStoreProvider>
      <HasStoreWrapper baseRoute={baseRoute} fallbackToNew={fallbackToNew}>
        {children}
      </HasStoreWrapper>
    </WorkspaceStoreProvider>
  );
}
