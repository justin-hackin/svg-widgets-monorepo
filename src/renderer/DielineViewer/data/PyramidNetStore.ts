import {
  action, computed, observable, reaction, runInAction,
} from 'mobx';

// @ts-ignore
import { Polygon } from '@flatten-js/core';
import { offset } from '@flatten-js/polygon-offset';
import { subtract } from '@flatten-js/boolean-op';
import {
  chunk, flatten, range, omit,
} from 'lodash';
import { polyhedra } from './polyhedra';
import {
  CM_TO_PIXELS_RATIO, polygonPointsGivenAnglesAndSides, triangleAnglesGivenSides,
} from '../../common/util/geom';
import { FaceDecorationSpec, PyramidNetSpec } from '../components/PyramidNet';
import { DashPatternStore } from './DashPatternStore';
import { AscendantEdgeTabsSpec } from '../util/shapes/ascendantEdgeConnectionTabs';
import { StrokeDashPathSpec } from '../util/shapes/strokeDashPath';
import { BaseEdgeConnectionTabSpec } from '../util/shapes/baseEdgeConnectionTab';
import { EVENTS } from '../../../main/ipc';
import { getTextureTransformMatrix } from '../../common/util/2d-transform';
import { closedPolygonPath } from '../util/shapes/generic';

const FACE_FIRST_EDGE_NORMALIZED_SIZE = 1000;

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
};
const jsonClone = (obj) => JSON.parse(JSON.stringify(obj));
export class PyramidNetStore {
  constructor(data = defaultNet) {
    this.loadSpec(data);
    reaction(() => this.faceDecoration, async (faceDecorationProxy) => {
      // TODO: this is kludge, will upgrading to mobx6 fix the need for "unproxying"?
      const faceDecoration = faceDecorationProxy && jsonClone(faceDecorationProxy);

      if (faceDecoration) {
        const croppedD = await globalThis.ipcRenderer.invoke(
          // boundaryPathD, texturePathD, textureTransformMatrixStr, isPositive
          EVENTS.INTERSECT_SVG,
          closedPolygonPath(this.normalizedBoundaryPoints).getD(),
          faceDecoration.pathD,
          this.faceDecorationPathMatrix,
          faceDecoration.isPositive,
        );

        runInAction(() => {
          this.activeCutHolePatternD = croppedD;
        });
      } else {
        this.activeCutHolePatternD = '';
      }
    });

    reaction(
      () => [this.normalizedBoundaryPoints, this.pyramidGeometryId, this.faceDecoration],
      (props) => {
        const [normalizedBoundaryPoints, pyramidGeometryId, faceDecoration] = props.map((prop) => jsonClone(prop));
        this.sendTextureEditorUpdate(normalizedBoundaryPoints, pyramidGeometryId, faceDecoration);
      },
    );
  }

  @observable
  public pyramidGeometryId;

  @observable
  public faceDecoration: FaceDecorationSpec;

  @action
  setPyramidGeometryId(id) {
    this.pyramidGeometryId = id;
    this.faceDecoration = null;
    this.activeCutHolePatternD = '';
  }

  @computed
  get normalizedBoundaryPoints() {
    return polygonPointsGivenAnglesAndSides(
      this.faceInteriorAngles,
      this.normalizedFaceEdgeLengths,
    );
  }

  @computed
  get pyramidGeometry() {
    return polyhedra[this.pyramidGeometryId];
  }

  @computed
  get faceDecorationPathMatrix() {
    const {
      origin, rotate, scale, translate,
    } = this.faceDecoration;
    return getTextureTransformMatrix(origin, scale, rotate, translate).toString();
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


  @computed
  get faceInteriorAngles(): number[] {
    return triangleAnglesGivenSides(this.normalizedFaceEdgeLengths);
  }

  @computed
  get boundaryPoints() {
    return polygonPointsGivenAnglesAndSides(this.faceInteriorAngles, this.actualFaceEdgeLengths);
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
  get faceEdgeNormalizer() {
    return FACE_FIRST_EDGE_NORMALIZED_SIZE / this.pyramidGeometry.relativeFaceEdgeLengths[0];
  }

  @computed
  get normalizedFaceEdgeLengths() {
    return this.pyramidGeometry.relativeFaceEdgeLengths.map(
      // @ts-ignore
      (val) => val * this.faceEdgeNormalizer,
    );
  }

  // factor to scale face lengths such that the first edge will be equal to 1
  @computed
  get faceLengthAdjustRatio() {
    const {
      pyramidGeometry: { relativeFaceEdgeLengths, diameter }, shapeHeightInCm,
    } = this;
    const baseEdgeLengthToShapeHeight = diameter / relativeFaceEdgeLengths[1];
    const heightInPixels = CM_TO_PIXELS_RATIO * shapeHeightInCm;
    const desiredFirstLength = heightInPixels / baseEdgeLengthToShapeHeight;
    return desiredFirstLength / this.normalizedFaceEdgeLengths[0];
  }

  @computed
  get actualFaceEdgeLengths() {
    return this.normalizedFaceEdgeLengths.map((len) => len * this.faceLengthAdjustRatio);
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
    const { x: inX, y: inY } = this.insetPolygon.vertices[0];
    return (new DOMMatrixReadOnly()).translate(inX, inY).scale(scale, scale);
  }

  @computed
  get pathScaleMatrix() {
    return (new DOMMatrixReadOnly()).scale(this.faceLengthAdjustRatio, this.faceLengthAdjustRatio);
  }

  exportToJSONString() {
    // activeCutHolePatternD is the only property that is derived from other properties but is not computed
    // in order to avoid the use of async computed plugin
    return JSON.stringify(omit(this, ['activeCutHolePatternD']), null, 2);
  }

  @action
  setFaceDecoration(faceDecoration) {
    this.faceDecoration = faceDecoration;
  }

  @action
  sendTextureEditorUpdate(
    normalizedBoundaryPoints = this.normalizedBoundaryPoints,
    pyramidGeometryId = this.pyramidGeometryId,
    faceDecoration = this.faceDecoration,
  ) {
    globalThis.ipcRenderer.send(EVENTS.UPDATE_TEXTURE_EDITOR,
      // @ts-ignore
      normalizedBoundaryPoints.map((pt) => ([pt.x, pt.y])),
      pyramidGeometryId,
      faceDecoration);
  }

  @action
  loadSpec(specData: PyramidNetSpec) {
    const {
      baseScoreDashSpec, interFaceScoreDashSpec, faceDecoration, ...rest
    } = specData;
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
    this.setFaceDecoration(faceDecoration);
  }
}
