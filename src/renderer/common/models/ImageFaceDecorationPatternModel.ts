import { Instance, types } from 'mobx-state-tree';

import { DimensionsModel } from './DimensionsModel';

export const ImageFaceDecorationPatternModel = types.model({
  imageData: types.string,
  dimensions: DimensionsModel,
  sourceFileName: types.string,
  isBordered: types.optional(types.boolean, true),
})
  .actions((self) => ({
    setIsBordered(isBordered) {
      self.isBordered = isBordered;
    },
  }));

export interface IImageFaceDecorationPatternModel extends Instance<typeof ImageFaceDecorationPatternModel> {}
