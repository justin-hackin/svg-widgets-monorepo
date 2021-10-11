import { model, Model } from 'mobx-keystone';
import { computed } from 'mobx';
import { PathData } from '../../common/path/PathData';
import { numberTextProp, radioProp } from '../../common/keystone-tweakables/props';
import { PointTuple } from '../../common/util/geom';

enum REMAINDER_SIZES {
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
}

const getMarginLength = (panelLength: number, numNotches: number, notchSpacing: number, notchThickness: number) => {
  const notchesCoverage = (numNotches - 1) * notchSpacing + numNotches * notchThickness;
  return (panelLength - notchesCoverage) / 2;
};

const PIXELS_PER_INCH = 96;
const notchedPanel = (
  panelLength: number, panelDepth: number,
  numNotches: number, notchSpacing: number, notchThickness: number, invertXY = false,
):PathData => {
  const pt = (x:number, y: number) => (invertXY ? [y, x] : [x, y]) as PointTuple;
  const path = new PathData();
  const notchMargins = getMarginLength(panelLength, numNotches, notchSpacing, notchThickness);
  const notchDepth = panelDepth / 2;
  path.move([0, 0]);
  for (let i = 0; i < numNotches; i += 1) {
    const notchStartX = i * (notchThickness + notchSpacing) + notchMargins;
    path.line(pt(notchStartX, 0))
      .line(pt(notchStartX, notchDepth))
      .line(pt(notchStartX + notchThickness, notchDepth))
      .line(pt(notchStartX + notchThickness, 0));
  }
  return path
    .line(pt(panelLength, 0))
    .line(pt(panelLength, panelDepth))
    .line(pt(0, panelDepth)).close();
};

const cubbiesDecrementOptions = Object.values(REMAINDER_SIZES).map((size, index) => ({ value: index, label: size }));

@model('CrosshatchShelvesSavedModel')
export class CrosshatchShelvesSavedModel extends Model({
  shelfWidth: numberTextProp(96 * PIXELS_PER_INCH, {
    useUnits: true,
  }),
  shelfHeight: numberTextProp(48 * PIXELS_PER_INCH, {
    useUnits: true,
  }),
  shelfDepth: numberTextProp(24 * PIXELS_PER_INCH, {
    useUnits: true,
  }),
  cubbyWidth: numberTextProp(8 * PIXELS_PER_INCH, {
    useUnits: true,
  }),
  materialThickness: numberTextProp(0.5 * PIXELS_PER_INCH, {
    useUnits: true,
  }),
  widthCubbiesDecrement: radioProp(0, {
    labelOverride: 'Left/right section size',
    options: cubbiesDecrementOptions,
    valueParser: parseInt,
    isRow: true,
  }),
  heightCubbiesDecrement: radioProp(0, {
    labelOverride: 'Top/bottom section size',
    options: cubbiesDecrementOptions,
    valueParser: parseInt,
    isRow: true,
  }),
}) {
  @computed
  get numCubbiesWide() {
    return Math.floor((this.shelfWidth.value - this.materialThickness.value)
      / (this.cubbyWidth.value + this.materialThickness.value)) - this.widthCubbiesDecrement.value;
  }

  @computed
  get numCubbiesHigh() {
    return Math.floor((this.shelfHeight.value - this.materialThickness.value)
      / (this.cubbyWidth.value + this.materialThickness.value)) - this.heightCubbiesDecrement.value;
  }

  @computed
  get horizontalPanel() {
    return notchedPanel(
      this.shelfWidth.value, this.shelfDepth.value,
      this.numCubbiesWide + 1, this.cubbyWidth.value, this.materialThickness.value,
    );
  }

  @computed
  get verticalPanel() {
    return notchedPanel(
      this.shelfHeight.value, this.shelfDepth.value,
      this.numCubbiesHigh + 1, this.cubbyWidth.value, this.materialThickness.value, true,
    );
  }

  @computed
  get strokeWidth() {
    return Math.max(this.shelfHeight.value, this.shelfWidth.value) * 0.001;
  }

  @computed
  get crossSectionPath() {
    const path = new PathData();
    const widthMargins = getMarginLength(
      this.shelfWidth.value, this.numCubbiesWide + 1, this.cubbyWidth.value, this.materialThickness.value,
    );
    for (let i = 0; i <= this.numCubbiesWide; i += 1) {
      const x = widthMargins + (this.materialThickness.value / 2)
        + (i * (this.cubbyWidth.value + this.materialThickness.value));
      path.move([x, 0]).line([x, this.shelfHeight.value]);
    }

    const heightMargins = getMarginLength(
      this.shelfHeight.value, this.numCubbiesHigh + 1, this.cubbyWidth.value, this.materialThickness.value,
    );
    for (let i = 0; i <= this.numCubbiesHigh; i += 1) {
      const y = heightMargins + (this.materialThickness.value / 2)
        + (i * (this.cubbyWidth.value + this.materialThickness.value));
      path.move([0, y]).line([this.shelfWidth.value, y]);
    }
    return path;
  }
}
