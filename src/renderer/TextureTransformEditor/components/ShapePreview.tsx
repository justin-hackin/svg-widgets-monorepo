import React from 'react';
import { observer } from 'mobx-react';

import '../style.css';
import { ITextureEditorModel } from '../models/TextureEditorModel';
import { useWorkspaceMst } from '../../DielineViewer/models/WorkspaceModel';

const { useEffect, useRef } = React;

export const ShapePreview = observer(() => {
  const workspaceStore = useWorkspaceMst();
  const store:ITextureEditorModel = workspaceStore.selectedStore.textureEditor;
  const { shapePreview: { setup, tearDown }, placementAreaDimensions, decorationBoundary } = store;

  const threeContainerRef = useRef<HTMLDivElement>();

  // THREE rendering setup
  useEffect(() => {
    if (!threeContainerRef || !placementAreaDimensions || !decorationBoundary) { return null; }
    setup(threeContainerRef.current);
    return (() => { tearDown(); });
  }, [threeContainerRef, placementAreaDimensions, decorationBoundary]);

  // @ts-ignore
  return (<div ref={threeContainerRef} id="3d-preview-container" />);
});
