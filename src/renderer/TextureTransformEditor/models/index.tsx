import { createContext, useContext } from 'react';
import { connectReduxDevtools } from 'mst-middlewares';
import makeInspectable from 'mobx-devtools-mst';
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

export function useMst() {
  const store = useContext(TextureTransformEditorStoreContext);
  return store;
}
