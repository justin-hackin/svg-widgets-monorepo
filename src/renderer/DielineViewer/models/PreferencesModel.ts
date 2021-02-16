import { types, Instance, SnapshotIn } from 'mobx-state-tree';
import { CM_TO_PIXELS_RATIO, UNITS } from '../../common/util/units';

// reassignment of a mst-persist store will cause undisposed onSnapshot
// see: https://github.com/agilgur5/mst-persist/issues/20
// thus, avoid types.optional for defaults and define separately so preferences can be reset

// eslint-disable-next-line @typescript-eslint/no-use-before-define
export interface IPreferencesModel extends Instance<typeof PreferencesModel> {}

export const defaultPreferences: SnapshotIn<IPreferencesModel> = {
  useClones: false,
  displayUnit: 'cm',
  cutStrokeColor: '#FF3A5E',
  scoreStrokeColor: '#BDFF48',
  strokeWidth: 1,
  dielineDocumentDimensions: {
    width: CM_TO_PIXELS_RATIO * 49.5,
    height: CM_TO_PIXELS_RATIO * 27.9,
  },
};

export const PreferencesModel = types.model({
  displayUnit: types.refinement(types.string, (val) => val in UNITS),
  dielineDocumentDimensions: types.model({
    width: types.number,
    height: types.number,
  }),
  useClones: types.boolean,
  cutStrokeColor: types.string,
  scoreStrokeColor: types.string,
  strokeWidth: types.number,
}).views((self) => ({
  get scoreProps() {
    return { stroke: self.scoreStrokeColor, strokeWidth: self.strokeWidth, fill: 'none' };
  },
  get cutProps() {
    return { stroke: self.cutStrokeColor, strokeWidth: self.strokeWidth, fill: 'none' };
  },
})).actions((self) => ({
  reset() {
    Object.assign(self, defaultPreferences);
  },
}));
