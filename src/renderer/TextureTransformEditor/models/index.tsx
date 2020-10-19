import { createContext, useContext } from 'react';
import makeInspectable from 'mobx-devtools-mst';

import { ITextureTransformEditorModel, TextureTransformEditorModel } from './TextureTransformEditorModel';

export const textureTransformEditorStore = makeInspectable(TextureTransformEditorModel.create());
// @ts-ignore
window.editorStore = textureTransformEditorStore;
const TextureTransformEditorStoreContext = createContext<ITextureTransformEditorModel>(
  textureTransformEditorStore,
);

export const { Provider } = TextureTransformEditorStoreContext;

export function useMst() {
  const store = useContext(TextureTransformEditorStoreContext);
  return store;
}
