import React from 'react';
import { render } from 'react-dom';
import { observer } from 'mobx-react';
import { WidgetWorkspace } from './WidgetWorkspace';
import { useWorkspaceMst } from './WidgetWorkspace/models/WorkspaceModel';
import { ProvidersWrapper } from './common/components/ProvidersWrapper';
import { IS_WEB_BUILD } from '../../common/constants';
import { TextureEditor } from './widgets/PyramidNet/components/TextureEditorDrawer/components/TextureEditor';

const AllRoutes = observer(() => {
  const workspaceStore = useWorkspaceMst();
  const { AdditionalMainContent } = workspaceStore.selectedStore;
  return (
    <>
      <WidgetWorkspace />
      { AdditionalMainContent && (<AdditionalMainContent />)}
    </>
  );
});

const App = IS_WEB_BUILD ? () => (
  <ProvidersWrapper>
    <TextureEditor />
  </ProvidersWrapper>
) : () => (
  <ProvidersWrapper>
    <AllRoutes />
  </ProvidersWrapper>
);

render(
  (<App />),
  document.getElementById('app'),
);
