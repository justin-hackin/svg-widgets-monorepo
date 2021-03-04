// from file menu template upload
import { Instance, types } from 'mobx-state-tree';

export const RawFaceDecorationModel = types.model({
  dValue: types.string,
});

export interface IRawFaceDecorationModel extends Instance<typeof RawFaceDecorationModel> {}
