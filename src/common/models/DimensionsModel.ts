import { types } from 'mobx-state-tree';

export const DimensionsModel = types.model('Dimensions', {
  width: types.number,
  height: types.number,
});
