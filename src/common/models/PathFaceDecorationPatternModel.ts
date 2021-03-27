import { Instance, types } from 'mobx-state-tree';

export const PathFaceDecorationPatternModel = types.model('PathFaceDecorationPattern', {
  pathD: types.string,
  sourceFileName: types.string,
  isPositive: types.boolean,
  useAlphaTexturePreview: types.optional(types.boolean, true),
}).actions((self) => ({
  setUseAlphaTexturePreview(useAlpha) {
    self.useAlphaTexturePreview = useAlpha;
  },
  setIsPositive(isPositive) {
    self.isPositive = isPositive;
  },
}));

export interface IPathFaceDecorationPatternModel extends Instance<typeof PathFaceDecorationPatternModel> {}
