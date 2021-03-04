import React from 'react';
import { observer } from 'mobx-react';

import '../style.css';
import { useMst } from '../models';
import { ITextureEditorModel } from '../models/TextureEditorModel';

const { useEffect, useRef } = React;

export const ShapePreview = observer(() => {
  const store:ITextureEditorModel = useMst();
  const { shapePreview: { setup } } = store;

  const threeContainerRef = useRef<HTMLDivElement>();

  // THREE rendering setup
  useEffect(() => {
    if (!threeContainerRef) { return; }
    setup(threeContainerRef.current);
  }, [threeContainerRef]);

  // @ts-ignore
  return (<div ref={threeContainerRef} id="3d-preview-container" />);
});
