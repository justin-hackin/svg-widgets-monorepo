import { ThemeProvider } from '@material-ui/styles';
import React from 'react';

import { WorkspaceStoreProvider } from '../../renderer/DielineViewer/models/WorkspaceModel';
import { theme } from '../style/style';

export const ProvidersWrapper = ({ children }) => (
  <ThemeProvider theme={theme}>
    <WorkspaceStoreProvider>
      {children}
    </WorkspaceStoreProvider>
  </ThemeProvider>
);
