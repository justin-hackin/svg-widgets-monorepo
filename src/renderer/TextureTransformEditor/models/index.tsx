import { createContext, useContext } from 'react';
import { connectReduxDevtools } from 'mst-middlewares';
import makeInspectable from 'mobx-devtools-mst';
// only used in dev build hence lint squelch
// eslint-disable-next-line import/no-extraneous-dependencies
import remotedev from 'remotedev';

import { ITextureTransformEditorModel, TextureTransformEditorModel } from './TextureTransformEditorModel';

export const textureTransformEditorStore = TextureTransformEditorModel.create();
if (process.env.NODE_ENV !== 'production') {
  makeInspectable(textureTransformEditorStore);
  connectReduxDevtools(remotedev, textureTransformEditorStore);
}

const TextureTransformEditorStoreContext = createContext<ITextureTransformEditorModel>(
  textureTransformEditorStore,
);

export const { Provider } = TextureTransformEditorStoreContext;

export function useMst():ITextureTransformEditorModel {
  const store = useContext(TextureTransformEditorStoreContext);
  return store;
}
