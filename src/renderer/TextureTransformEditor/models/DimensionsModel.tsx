import { types } from 'mobx-state-tree';

export const DimensionsModel = types.model({
  width: types.number,
  height: types.number,
});
