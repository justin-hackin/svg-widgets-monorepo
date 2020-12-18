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
  designBoundarySettings: optionalModel({
    stroke: 'rgb(68,154,255)',
  }),
}).views((self) => ({
  get scoreProps() {
    return { ...self.dieLineSettings, ...self.scoreSettings };
  },
  get cutProps() {
    return { ...self.dieLineSettings, ...self.cutSettings };
  },
  get designBoundaryProps() {
    return { ...self.dieLineSettings, ...self.designBoundarySettings };
  },
}));

export interface IPreferencesModel extends Instance<typeof PreferencesModel> {}
