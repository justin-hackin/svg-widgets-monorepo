import React from 'react';
import { observer } from 'mobx-react';

import { ITextureEditorModel } from '../models/TextureEditorModel';
import { useWorkspaceMst } from '../../../../renderer/DielineViewer/models/WorkspaceModel';
import { useStyles } from '../../../style/style';

const { useEffect, useRef } = React;

export const ShapePreview = observer(() => {
  const workspaceStore = useWorkspaceMst();
  const classes = useStyles();
  const store:ITextureEditorModel = workspaceStore.selectedStore.textureEditor;
  const { shapePreview: { setup, tearDown } } = store;

  const threeContainerRef = useRef<HTMLDivElement>();

  // THREE rendering setup
  useEffect(() => {
    if (!threeContainerRef) { return null; }
    setup(threeContainerRef.current);
    return (() => { tearDown(); });
  }, [threeContainerRef]);

  return (<div ref={threeContainerRef} className={classes.shapePreviewContainer} />);
});
