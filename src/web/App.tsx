import React from 'react';

import '../common/style/index.css';

import { ProvidersWrapper } from '../common/components/ProvidersWrapper';
import { TextureEditor } from '../common/components/TextureEditor';

declare let module: Record<string, unknown>;
export const App = () => (
  <ProvidersWrapper>
    <TextureEditor />
  </ProvidersWrapper>
);
