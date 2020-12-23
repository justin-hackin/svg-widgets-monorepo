import { types, Instance } from 'mobx-state-tree';

const optionalModel = (modelDef) => types.optional(types.model(modelDef), {});

export const PreferencesModel = types.model({
  dieLineSettings: optionalModel({
    fill: 'none',
    strokeWidth: 1,
  }),
  cutSettings: optionalModel({
    stroke: '#FF3A5E',
  }),
  scoreSettings: optionalModel({
    stroke: '#BDFF48',
  }),
}).views((self) => ({
  get scoreProps() {
    return { ...self.dieLineSettings, ...self.scoreSettings };
  },
  get cutProps() {
    return { ...self.dieLineSettings, ...self.cutSettings };
  },
}));

export interface IPreferencesModel extends Instance<typeof PreferencesModel> {}
