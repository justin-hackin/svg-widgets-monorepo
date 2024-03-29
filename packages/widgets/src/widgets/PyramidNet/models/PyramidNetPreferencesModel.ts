// Post-launch, migration schemes will be needed upon data shape changes
// in order to not invalidate localstorage after upgrade
import { Model, model } from 'mobx-keystone';
import { startCase } from 'lodash-es';
import {
  colorPickerProp,
  numberTextProp,
  PIXELS_PER_INCH,
  radioProp,
  sliderWithTextProp,
  switchProp,
} from 'svg-widget-studio';
import { action, observable } from 'mobx';
import { PRINT_REGISTRATION_TYPES } from '@/widgets/PyramidNet/types';

@model('PyramidNetPreferencesModel')
export class PyramidNetPreferencesModel extends Model({
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

  printRegistrationType: radioProp<PRINT_REGISTRATION_TYPES>(PRINT_REGISTRATION_TYPES.LASER_CUTTER, {
    options: Object.values(PRINT_REGISTRATION_TYPES),
    optionLabelMap: (opt: string) => startCase(opt),
  }),
  registrationPadding: numberTextProp(PIXELS_PER_INCH * 0.5, { useUnits: true }),
  registrationMarkLength: numberTextProp(PIXELS_PER_INCH * 0.5, { useUnits: true }),
}) {
  @observable
    tourIsActive = false;

  @action
  setTourIsActive(need) {
    this.tourIsActive = need;
  }

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
