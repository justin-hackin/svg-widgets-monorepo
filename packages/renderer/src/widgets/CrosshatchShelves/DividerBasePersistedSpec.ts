import { Model, model } from 'mobx-keystone';
import { numberTextProp } from '../../common/keystone-tweakables/props';
import { PIXELS_PER_INCH } from '../../common/util/units';

@model('DividerBasePersistedSpec')
export class DividerBasePersistedSpec extends Model({
  shelfWidth: numberTextProp(96 * PIXELS_PER_INCH, {
    useUnits: true,
  }),
  shelfHeight: numberTextProp(48 * PIXELS_PER_INCH, {
    useUnits: true,
  }),
  shelfDepth: numberTextProp(24 * PIXELS_PER_INCH, {
    useUnits: true,
  }),
  cubbyWidth: numberTextProp(10 * PIXELS_PER_INCH, {
    useUnits: true,
  }),
  materialThickness: numberTextProp(0.5 * PIXELS_PER_INCH, {
    useUnits: true,
  }),
}) {
}
