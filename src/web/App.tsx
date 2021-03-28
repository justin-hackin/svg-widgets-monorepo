import { render } from 'react-dom';
import React from 'react';

import { ProvidersWrapper } from '../common/components/ProvidersWrapper';
import { TextureEditor } from '../common/components/TextureEditor';

const App = () => (
  <ProvidersWrapper>
    <TextureEditor />
  </ProvidersWrapper>
);

render(
  (<App />),
  document.getElementById('app'),
);
