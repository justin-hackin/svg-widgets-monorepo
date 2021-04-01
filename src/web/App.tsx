import React from 'react';

import '../common/style/index.css';

import { ProvidersWrapper } from '../common/components/ProvidersWrapper';
import { TextureEditor } from '../common/components/TextureEditor';

if (process.env.BUILD_ENV === 'web') {
  window.globalThis.ipcRenderer = {
    on: () => {},
    invoke: () => {},
  };
}

declare let module: Record<string, unknown>;
export const App = () => (
  <ProvidersWrapper>
    <TextureEditor />
  </ProvidersWrapper>
);
