import { createContext, useContext } from 'react';
import { connectReduxDevtools } from 'mst-middlewares';
import makeInspectable from 'mobx-devtools-mst';
// only used in dev build hence lint squelch
// eslint-disable-next-line import/no-extraneous-dependencies
import remotedev from 'remotedev';

import { ITextureEditorModel, TextureEditorModel } from './TextureEditorModel';

export const textureTransformEditorStore = TextureEditorModel.create();
if (process.env.NODE_ENV !== 'production') {
  makeInspectable(textureTransformEditorStore);
  connectReduxDevtools(remotedev, textureTransformEditorStore);
}

const TextureTransformEditorStoreContext = createContext<ITextureEditorModel>(
  textureTransformEditorStore,
);

export const { Provider } = TextureTransformEditorStoreContext;

export function useMst() {
  return useContext(TextureTransformEditorStoreContext);
}
