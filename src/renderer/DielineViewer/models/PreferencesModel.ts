import { types, Instance } from 'mobx-state-tree';

const optionalModel = (modelDef) => types.optional(types.model(modelDef), {});

export const PreferencesModel = types.model({
  dieLineProps: optionalModel({
    fill: 'none',
    strokeWidth: 1,
  }),
  cutLineProps: optionalModel({
    stroke: '#FF3A5E',
  }),
  scoreLineProps: optionalModel({
    stroke: '#BDFF48',
  }),
  designBoundaryProps: optionalModel({
    stroke: 'none',
    fill: 'rgb(68,154,255)',
  }),
});

export interface IPreferencesModel extends Instance<typeof PreferencesModel> {}
