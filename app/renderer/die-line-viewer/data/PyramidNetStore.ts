import { action, computed, observable } from 'mobx';
// @ts-ignore
import { Point, Polygon } from '@flatten-js/core';
import { offset } from '@flatten-js/polygon-offset';
import { subtract } from '@flatten-js/boolean-op';
import { chunk, flatten, range } from 'lodash';
import { polyhedra } from './polyhedra';
import {
  CM_TO_PIXELS_RATIO, hingedPlot, triangleAnglesGivenSides,
} from '../util/geom';
import { PyramidNetSpec } from '../components/PyramidNet';
import { DashPatternStore } from './DashPatternStore';
import { AscendantEdgeTabsSpec } from '../util/shapes/ascendantEdgeConnectionTabs';
import { StrokeDashPathSpec } from '../util/shapes/strokeDashPath';
import { BaseEdgeConnectionTabSpec } from '../util/shapes/baseEdgeConnectionTab';


const defaultNet:PyramidNetSpec = {
  pyramidGeometryId: 'small-triambic-icosahedron',
  ascendantEdgeTabsSpec: {
    flapRoundingDistanceRatio: 1,
    holeFlapTaperAngle: 0.3141592653589793,
    holeReachToTabDepth: 0.1,
    holeWidthRatio: 0.4,
    midpointDepthToTabDepth: 0.64527027,
    tabDepthToTraversalLength: 0.04810606060599847,
    tabRoundingDistanceRatio: 0.75,
    tabStartGapToTabDepth: 1,
    tabWideningAngle: 0.19634954084936207,
    tabsCount: 3,
  },
  baseEdgeTabSpec: {
    finDepthToTabDepth: 1.1,
    finOffsetRatio: 0.75,
    holeBreadthToHalfWidth: 0.25,
    holeDepthToTabDepth: 0.5,
    holeTaper: 0.6981317007977318,
    roundingDistanceRatio: 1,
    tabDepthToAscendantEdgeLength: 1.5,
  },
  baseScoreDashSpec: {
    strokeDashPathPatternId: 'base',
    strokeDashLength: 11,
    strokeDashOffsetRatio: 0,
  },
  interFaceScoreDashSpec: {
    strokeDashPathPatternId: 'base',
    strokeDashLength: 11,
    strokeDashOffsetRatio: 0,
  },
  shapeHeightInCm: 40,
  // eslint-disable-next-line max-len
  // activeCutHolePatternD: 'M 0 0 L -57.974609 44.90625 L -45.988281 65.666016 L 45.943359 65.666016 L 57.943359 44.880859 L 0 0 z M 95.287109 73.808594 L 91.423828 80.498047 L 140.51562 108.8418 L 95.287109 73.808594 z M -95.318359 73.832031 L -140.37109 108.73047 L -91.46875 80.498047 L -95.318359 73.832031 z M -36.097656 112.4707 L -36.097656 184.61719 L 36.052734 184.61719 L 36.052734 112.4707 L -36.097656 112.4707 z M -82.904297 129.60156 L -115.7168 148.54102 L -82.904297 167.48828 L -82.904297 129.60156 z M 82.859375 129.60156 L 82.859375 167.48828 L 115.66602 148.54102 L 82.859375 129.60156 z M 190.19922 147.32617 L 189.49805 148.54102 L 235.46484 228.16016 L 294.55664 228.16016 L 190.19922 147.32617 z M -190.23047 147.34961 L -294.55664 228.16016 L -235.50781 228.16016 L -189.54297 148.54102 L -190.23047 147.34961 z M -153.95898 180.50977 L -190.02734 242.99414 L -127.54492 279.06836 L -91.46875 216.58398 L -153.95898 180.50977 z M 153.9082 180.50977 L 91.423828 216.58398 L 127.5 279.06836 L 189.98438 242.99414 L 153.9082 180.50977 z M -45.988281 231.42383 L -91.958984 311.04297 L -45.988281 390.65625 L 45.943359 390.65625 L 91.910156 311.04297 L 45.943359 231.42383 L -45.988281 231.42383 z M -317.55078 274.9668 L -317.55078 347.11719 L -245.39844 347.11719 L -245.39844 274.9668 L -317.55078 274.9668 z M 245.35352 274.9668 L 245.35352 347.11719 L 317.50586 347.11719 L 317.50586 274.9668 L 245.35352 274.9668 z M -364.35547 292.0957 L -397.16406 311.04297 L -364.35547 329.98242 L -364.35547 292.0957 z M -198.59375 292.0957 L -198.59375 329.98242 L -165.78516 311.04297 L -198.59375 292.0957 z M 198.54883 292.0957 L 165.74023 311.04297 L 198.54883 329.98242 L 198.54883 292.0957 z M 364.3125 292.0957 L 364.3125 329.98242 L 397.11914 311.04297 L 364.3125 292.0957 z M -435.41016 343.00977 L -471.48047 405.49414 L -408.99609 441.56445 L -372.91992 379.08594 L -435.41016 343.00977 z M -127.54492 343.00977 L -190.02734 379.08594 L -153.95898 441.56445 L -91.46875 405.49414 L -127.54492 343.00977 z M 127.5 343.00977 L 91.423828 405.49414 L 153.9082 441.56445 L 189.98438 379.08594 L 127.5 343.00977 z M 435.36133 343.00977 L 372.87695 379.08594 L 408.95312 441.56445 L 471.43555 405.49414 L 435.36133 343.00977 z M -327.44141 393.92383 L -363.58594 456.52148 L -199.36719 456.52148 L -235.50781 393.92383 L -327.44141 393.92383 z M 235.46484 393.92383 L 199.32227 456.52148 L 363.53711 456.52148 L 327.39648 393.92383 L 235.46484 393.92383 z M -564.76562 437.46094 L -589.37305 456.52148 L -526.85156 456.52148 L -526.85156 437.46094 L -564.76562 437.46094 z M -36.097656 437.46094 L -36.097656 456.52148 L 36.052734 456.52148 L 36.052734 437.46094 L -36.097656 437.46094 z M 526.80664 437.46094 L 526.80664 456.52148 L 589.37305 456.52148 L 564.76562 437.46094 L 526.80664 437.46094 z M -480.04492 454.59766 L -480.04492 456.52148 L -476.71289 456.52148 L -480.04492 454.59766 z M -82.904297 454.59766 L -86.236328 456.52148 L -82.904297 456.52148 L -82.904297 454.59766 z M 82.859375 454.59766 L 82.859375 456.52148 L 86.191406 456.52148 L 82.859375 454.59766 z M 480 454.59766 L 476.66797 456.52148 L 480 456.52148 L 480 454.59766 z ',
  // textureTransform: 'matrix(2.92536738408143 0 0 2.92536738408143 -916.7077843292918 -309.4212556146076)',
};

export class PyramidNetStore {
  constructor(data = defaultNet) {
    // @ts-ignore
    ipcRenderer.on('die>request-shape-update', () => {
      this.sendTextureEditorUpdate();
    });
    this.loadSpec(data);
    // no-op on initial BrowserWindow instantiation, ensures texture fitting is updated upon dieline viewer reload
    this.sendTextureEditorUpdate();
  }

  @observable
  public pyramidGeometryId;

  @action
  setPyramidGeometryId(id) {
    this.activeCutHolePatternD = '';
    this.textureTransform = '';
    this.pyramidGeometryId = id;
    this.sendTextureEditorUpdate();
  }

  @action
  sendTextureEditorUpdate() {
    // @ts-ignore
    ipcRenderer.send('tex>shape-update', this.boundaryPoints.map((pt) => pt.toArray()), this.pyramidGeometryId);
  }

  @computed
  get pyramidGeometry() {
    return polyhedra[this.pyramidGeometryId];
  }

  @observable
  public ascendantEdgeTabsSpec: AscendantEdgeTabsSpec;

  @observable
  public baseEdgeTabSpec: BaseEdgeConnectionTabSpec;

  @observable
  public baseScoreDashSpec: StrokeDashPathSpec;

  @observable
  public interFaceScoreDashSpec: StrokeDashPathSpec;

  @observable
  public shapeHeightInCm: number;

  @observable
  public activeCutHolePatternD: string;

  @observable
  public textureTransform: string;

  @computed
  get faceInteriorAngles(): number[] {
    return triangleAnglesGivenSides(this.pyramidGeometry.relativeFaceEdgeLengths);
  }

  @computed
  get boundaryPoints() {
    const p1 = new Point(0, 0);
    const p2 = Point.fromPolar([Math.PI - this.faceInteriorAngles[0], this.actualFaceEdgeLengths[0]]);
    const p3 = hingedPlot(p1, p2, this.faceInteriorAngles[0], this.actualFaceEdgeLengths[1]);
    return [p1, p2, p3];
  }

  @computed
  get tabIntervalRatios() {
    const {
      tabsCount, tabStartGapToTabDepth, tabDepthToTraversalLength, holeWidthRatio,
    } = this.ascendantEdgeTabsSpec;
    const offsetRatio = tabDepthToTraversalLength * tabStartGapToTabDepth;
    const intervalRatio = (1 - offsetRatio) / tabsCount;
    const tabWidthRatio = intervalRatio * holeWidthRatio;
    return range(tabsCount)
      .map((index) => [
        offsetRatio + index * intervalRatio,
        offsetRatio + index * intervalRatio + tabWidthRatio,
      ]);
  }

  @computed
  get tabGapIntervalRatios() {
    return chunk([0, ...flatten(this.tabIntervalRatios), 1], 2);
  }

  @computed
  get actualFaceEdgeLengths() {
    const {
      pyramidGeometry: { relativeFaceEdgeLengths, diameter }, shapeHeightInCm,
    } = this;
    const baseEdgeLengthToShapeHeight = diameter / relativeFaceEdgeLengths[1];
    const heightInPixels = CM_TO_PIXELS_RATIO * shapeHeightInCm;
    const desiredFirstLength = heightInPixels / baseEdgeLengthToShapeHeight;
    const faceLengthAdjustRatio = desiredFirstLength / relativeFaceEdgeLengths[0];
    return relativeFaceEdgeLengths.map((len) => len * faceLengthAdjustRatio);
  }

  @computed
  get ascendantEdgeTabDepth() {
    const { ascendantEdgeTabsSpec: { tabDepthToTraversalLength } } = this;
    return this.actualFaceEdgeLengths[0] * tabDepthToTraversalLength;
  }

  @computed
  get borderPolygon() {
    const poly = new Polygon();
    poly.addFace(this.boundaryPoints);
    return poly;
  }

  @computed
  get insetPolygon() {
    return offset(this.borderPolygon, -this.ascendantEdgeTabDepth);
  }

  @computed
  get borderOverlay() {
    // TODO: can be converted to a path inset using @flatten-js/polygon-offset
    return subtract(this.borderPolygon, this.insetPolygon);
  }
  // get borderInsetFaceHoleTransform() {
  //   return `translate(${this.insetPolygon.vertices[0].x}, ${this.insetPolygon.vertices[0].y}) scale(${
  //     (this.insetPolygon.box.width) / this.borderPolygon.box.width
  //   })`;

  @computed
  get borderInsetFaceHoleTransformMatrix() {
    const scale = (this.insetPolygon.box.width) / this.borderPolygon.box.width;
    return `translate(${this.insetPolygon.vertices[0].x}, ${this.insetPolygon.vertices[0].y}) scale(${scale}, ${scale})`
  }

  @action
  setFaceHoleProperties(d, transform) {
    this.activeCutHolePatternD = d;
    this.textureTransform = transform;
  }

  @action
  clearFaceHolePattern() {
    this.activeCutHolePatternD = '';
  }

  exportToJSONString() {
    return JSON.stringify(this, null, 2);
  }

  loadSpec(specData: PyramidNetSpec) {
    const { baseScoreDashSpec, interFaceScoreDashSpec, ...rest } = specData;
    Object.assign(this, rest);
    this.baseScoreDashSpec = new DashPatternStore(
      baseScoreDashSpec.strokeDashPathPatternId,
      baseScoreDashSpec.strokeDashLength,
      baseScoreDashSpec.strokeDashOffsetRatio,
    );
    this.interFaceScoreDashSpec = new DashPatternStore(
      interFaceScoreDashSpec.strokeDashPathPatternId,
      interFaceScoreDashSpec.strokeDashLength,
      interFaceScoreDashSpec.strokeDashOffsetRatio,
    );
  }
}
