import { types, Instance, SnapshotIn } from 'mobx-state-tree';
import { PIXELS_PER_CM, PIXELS_PER_INCH, UNITS } from '../../../common/util/units';
import { DimensionsModel } from '../../../common/models/DimensionsModel';

// reassignment of a mst-persist store will cause undisposed onSnapshot
// see: https://github.com/agilgur5/mst-persist/issues/20

// eslint-disable-next-line @typescript-eslint/no-use-before-define
export interface IPreferencesModel extends Instance<typeof PreferencesModel> {}

export enum PRINT_REGISTRATION_TYPES {
  LASER_CUTTER = 'laser-cutter',
  GRAPHTEC_OPTICAL = 'graphtec-optical',
  NONE = 'none',
}

export const defaultPreferences: SnapshotIn<IPreferencesModel> = {
  useClonesForBaseTabs: false,
  useClonesForDecoration: false,
  displayUnit: 'cm',
  cutStrokeColor: '#FF3A5E',
  scoreStrokeColor: '#BDFF48',
  registrationStrokeColor: '#005eff',
  strokeWidth: 1,
  dielineDocumentDimensions: {
    width: PIXELS_PER_CM * 49.5,
    height: PIXELS_PER_CM * 27.9,
  },
  needsTour: true,
  printRegistrationType: PRINT_REGISTRATION_TYPES.LASER_CUTTER,
  registrationPadding: PIXELS_PER_INCH * 0.5,
  registrationMarkLength: PIXELS_PER_INCH * 0.5,
};

export const PreferencesModel = types.model('Preferences', {
  displayUnit: types.refinement(types.string, (val) => val in UNITS),
  dielineDocumentDimensions: DimensionsModel,
  useClonesForBaseTabs: types.boolean,
  useClonesForDecoration: types.boolean,
  cutStrokeColor: types.string,
  scoreStrokeColor: types.string,
  strokeWidth: types.number,
  needsTour: types.boolean,
  printRegistrationType: types.string,
  registrationStrokeColor: types.string,
  registrationPadding: types.number,
  registrationMarkLength: types.number,
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
  setNeedsTour(needsTour) {
    self.needsTour = needsTour;
  },
}));
