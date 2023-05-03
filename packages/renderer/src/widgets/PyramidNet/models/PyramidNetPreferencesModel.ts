// Post-launch, migration schemes will be needed upon data shape changes
// in order to not invalidate localstorage after upgrade
import { Model, model, prop } from 'mobx-keystone';
import { startCase } from 'lodash';
import {
  colorPickerProp,
  numberTextProp,
  radioProp,
  sliderWithTextProp,
  switchProp,
} from '../../../common/keystone-tweakables/props';
import { PIXELS_PER_CM, PIXELS_PER_INCH } from '../../../common/util/units';
import { PRINT_REGISTRATION_TYPES } from '../../../WidgetWorkspace/models/PreferencesModel';

@model('PyramidNetPreferencesModel')
export class PyramidNetPreferencesModel extends Model({
  documentWidth: numberTextProp(PIXELS_PER_CM * 49.5, { useUnits: true }),
  documentHeight: numberTextProp(PIXELS_PER_CM * 27.9, { useUnits: true }),
  useClonesForBaseTabs: switchProp(false),
  useClonesForDecoration: switchProp(false),
  outerCutStrokeColor: colorPickerProp('#FF3A5E'),
  innerCutStrokeColor: colorPickerProp('#ff48f6'),
  scoreStrokeColor: colorPickerProp('#BDFF48'),
  registrationStrokeColor: colorPickerProp('#005eff'),
  strokeWidth: sliderWithTextProp(1, {
    labelOverride: 'Dieline Stroke Width',
    min: 0,
    max: 3,
    step: 0.01,
  }),
  needsTour: prop(true)
    .withSetter(),
  // TODO: how to do enum property in keystone
  printRegistrationType: radioProp<PRINT_REGISTRATION_TYPES>(PRINT_REGISTRATION_TYPES.LASER_CUTTER, {
    options: Object.values(PRINT_REGISTRATION_TYPES)
      .map((type) => ({
        value: type,
        label: startCase(type),
      })),
  }),
  registrationPadding: numberTextProp(PIXELS_PER_INCH * 0.5, { useUnits: true }),
  registrationMarkLength: numberTextProp(PIXELS_PER_INCH * 0.5, { useUnits: true }),
}) {
  get scoreProps() {
    return {
      stroke: this.scoreStrokeColor.value,
      strokeWidth: this.strokeWidth.value,
      fill: 'none',
    };
  }

  get outerCutProps() {
    return {
      stroke: this.outerCutStrokeColor.value,
      strokeWidth: this.strokeWidth.value,
      fill: 'none',
    };
  }

  get innerCutProps() {
    return {
      stroke: this.innerCutStrokeColor.value,
      strokeWidth: this.strokeWidth.value,
      fill: 'none',
    };
  }
}
