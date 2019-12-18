import { action, computed, observable } from 'mobx';
// @ts-ignore
import { Point, Polygon } from '@flatten-js/core';
import { offset } from '@flatten-js/polygon-offset';
import { subtract } from '@flatten-js/boolean-op';
import chunk from 'lodash-es/chunk';
import flatten from 'lodash-es/flatten';
import range from 'lodash-es/range';
import { polyhedra } from './polyhedra';
import {
  CM_TO_PIXELS_RATIO, hingedPlot, triangleAnglesGivenSides,
} from '../util/geom';
import { AscendantEdgeTabsSpec, BaseEdgeConnectionTabSpec, StrokeDashPathSpec } from '../util/shapes';
import { PyramidNetSpec } from '../components/PyramidNet';
import { DashPatternStore } from './DashPatternStore';

const defaultNet:PyramidNetSpec = {
  pyramidGeometryId: 'icosphere',
  ascendantEdgeTabsSpec: {
    flapRoundingDistanceRatio: 1,
    holeFlapTaperAngle: Math.PI / 10,
    holeReachToTabDepth: 0.1,
    holeWidthRatio: 0.4,
    midpointDepthToTabDepth: 0.6,
    tabDepthToTraversalLength: 0.04810606060599847,
    tabRoundingDistanceRatio: 0.75,
    tabsCount: 3,
    tabStartGapToTabDepth: 0.5,
    tabWideningAngle: Math.PI / 6,
  },
  baseEdgeTabSpec: {
    finDepthToTabDepth: 1.1,
    finTipDepthToFinDepth: 1.1,
    holeBreadthToHalfWidth: 0.5,
    holeDepthToTabDepth: 0.5,
    holeTaper: Math.PI / 4.5,
    roundingDistanceRatio: 1.0,
    tabDepthToAscendantEdgeLength: 1.5,
  },
  baseScoreDashSpec: {
    strokeDashPathPatternId: 'base',
    strokeDashLength: 3,
    strokeDashOffsetRatio: 0,
  },
  interFaceScoreDashSpec: {
    strokeDashPathPatternId: 'interface',
    strokeDashLength: 300,
    strokeDashOffsetRatio: 0.75,
  },
  shapeHeightInCm: 40,
};

export class PyramidNetStore {
  @observable
  public pyramidGeometryId;

  @action
  setPyramidGeometryId(id) {
    this.activeCutHolePatternD = '';
    this.textureImportWidth = 0;
    this.pyramidGeometryId = id;
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
  public textureImportWidth: number;

  constructor(data = defaultNet) {
    this.loadSpec(data);
  }

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
      pyramidGeometry: { relativeFaceEdgeLengths, firstEdgeLengthToShapeHeight }, shapeHeightInCm,
    } = this;
    const heightInPixels = CM_TO_PIXELS_RATIO * shapeHeightInCm;
    const desiredFirstLength = heightInPixels / firstEdgeLengthToShapeHeight;
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

  @computed
  get borderInsetFaceHoleTransform() {
    // borderPolygon ymin is 0
    const textureDifferenceScale = this.borderPolygon.box.width / this.textureImportWidth;
    return `translate(0, ${this.insetPolygon.box.ymin}) scale(${
      (textureDifferenceScale * this.insetPolygon.box.width) / this.borderPolygon.box.width
    })`;
  }

  @action
  applyFaceHolePattern(svgString) {
    const parser = new window.DOMParser();
    const doc = parser.parseFromString(svgString, 'image/svg+xml');
    this.textureImportWidth = parseFloat(
      doc.querySelector('svg').getAttribute('viewBox').split(' ')[2],
    );
    this.activeCutHolePatternD = doc.querySelector('path:last-of-type').getAttribute('d');
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
