import { Model, model, prop } from 'mobx-keystone';
import { PIXELS_PER_CM, PIXELS_PER_INCH, UNITS } from '../../../common/util/units';
import { DimensionsModel } from '../../../common/models/DimensionsModel';
import { colorPickerProp, radioProp, switchProp } from '../../../common/util/controllable-property';
import { startCase } from 'lodash';

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
  dielineDocumentDimensions: prop<DimensionsModel>(() => new DimensionsModel({
    width: PIXELS_PER_CM * 49.5,
    height: PIXELS_PER_CM * 27.9,
  })),
  useClonesForBaseTabs: switchProp(false),
  useClonesForDecoration: switchProp(false),
  cutStrokeColor: colorPickerProp('#FF3A5E'),
  scoreStrokeColor: colorPickerProp('#BDFF48'),
  registrationStrokeColor: colorPickerProp('#005eff'),
  strokeWidth: prop(1),
  needsTour: prop(true).withSetter(),
  // TODO: how to do enum property in keystone
  printRegistrationType: radioProp(PRINT_REGISTRATION_TYPES.LASER_CUTTER, {
    options: Object.values(PRINT_REGISTRATION_TYPES).map((type) => ({ value: type, label: startCase(type) }))
  }),
  registrationPadding: prop(PIXELS_PER_INCH * 0.5),
  registrationMarkLength: prop(PIXELS_PER_INCH * 0.5),
}) {
  get scoreProps() {
    return { stroke: this.scoreStrokeColor.value, strokeWidth: this.strokeWidth, fill: 'none' };
  }

  get cutProps() {
    return { stroke: this.cutStrokeColor.value, strokeWidth: this.strokeWidth, fill: 'none' };
  }
}
