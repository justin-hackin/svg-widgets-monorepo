import { Model, model, prop } from 'mobx-keystone';
import { startCase } from 'lodash';
import { PIXELS_PER_CM, PIXELS_PER_INCH, UNITS } from '../../../common/util/units';
import {
  colorPickerProp, numberTextProp, radioProp, switchProp,
} from '../../../common/util/controllable-property';

export enum PRINT_REGISTRATION_TYPES {
  LASER_CUTTER = 'laser-cutter',
  GRAPHTEC_OPTICAL = 'graphtec-optical',
  NONE = 'none',
}

// NOTE: after modifying schema, running `workpsaceStore.resetPreferences()` is required
// in order to invalidate the persist cache
// Post-launch, migration schemes will be upon data shape changes
@model('PreferencesModel')
export class PreferencesModel extends Model({
  displayUnit: radioProp(UNITS.cm, {
    options: Object.values(UNITS).map((unit) => ({ value: unit })),
    isRow: true,
  }),
  // TODO: make enum
  documentWidth: numberTextProp(PIXELS_PER_CM * 49.5, { useUnits: true }),
  documentHeight: numberTextProp(PIXELS_PER_CM * 27.9, { useUnits: true }),
  useClonesForBaseTabs: switchProp(false),
  useClonesForDecoration: switchProp(false),
  cutStrokeColor: colorPickerProp('#FF3A5E'),
  scoreStrokeColor: colorPickerProp('#BDFF48'),
  registrationStrokeColor: colorPickerProp('#005eff'),
  strokeWidth: prop(1),
  needsTour: prop(true).withSetter(),
  // TODO: how to do enum property in keystone
  printRegistrationType: radioProp(PRINT_REGISTRATION_TYPES.LASER_CUTTER, {
    options: Object.values(PRINT_REGISTRATION_TYPES).map((type) => ({ value: type, label: startCase(type) })),
  }),
  registrationPadding: numberTextProp(PIXELS_PER_INCH * 0.5, { useUnits: true }),
  registrationMarkLength: numberTextProp(PIXELS_PER_INCH * 0.5, { useUnits: true }),
}) {
  get scoreProps() {
    return { stroke: this.scoreStrokeColor.value, strokeWidth: this.strokeWidth, fill: 'none' };
  }

  get cutProps() {
    return { stroke: this.cutStrokeColor.value, strokeWidth: this.strokeWidth, fill: 'none' };
  }
}
