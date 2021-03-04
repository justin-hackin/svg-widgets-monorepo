import { Instance, types } from 'mobx-state-tree';

export const PathFaceDecorationPatternModel = types.model({
  pathD: types.string,
  sourceFileName: types.string,
  isPositive: types.boolean,
});

export interface IPathFaceDecorationPatternModel extends Instance<typeof PathFaceDecorationPatternModel> {}
