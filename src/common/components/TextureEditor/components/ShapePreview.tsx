import React from 'react';
import { observer } from 'mobx-react';

import clsx from 'clsx';
import { ITextureEditorModel } from '../models/TextureEditorModel';
import { useWorkspaceMst } from '../../../../renderer/DielineViewer/models/WorkspaceModel';
import { useStyles } from '../../../style/style';
import { TOUR_ELEMENT_CLASSES } from '../../../util/analytics';

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

  return (
    <div
      ref={threeContainerRef}
      className={clsx(classes.shapePreviewContainer, TOUR_ELEMENT_CLASSES.SHAPE_PREVIEW_AREA)}
    />
  );
});
