import set from 'lodash-es/set';
import { observable, computed, action } from 'mobx';
import ReactDOMServer from 'react-dom/server';
import React from 'react';
import { offset } from '@flatten-js/polygon-offset';
import { subtract } from '@flatten-js/boolean-op';

// @ts-ignore
import { Point, Polygon } from '@flatten-js/core';
import {
  DieLinesSpec, PyramidNetSpec, StyleSpec, PyramidNet, FaceBoundarySVG,
} from '../components/PyramidNet';
import {
  CM_TO_PIXELS_RATIO, hingedPlot, PHI, triangleAnglesGivenSides,
} from '../util/geom';
import { polyhedra } from './polyhedra';
import { SVGWrapper } from '../components/SVGWrapper';

export class Store implements PyramidNetSpec {
  @observable
  public styleSpec:StyleSpec = {
    dieLineProps: { fill: 'none', strokeWidth: 1 },
    cutLineProps: { stroke: '#FF244D' },
    scoreLineProps: { stroke: '#BDFF48' },
    designBoundaryProps: { stroke: 'none', fill: 'rgb(68,154,255)' },
  };

  @observable
  public dieLinesSpec:DieLinesSpec = {
    ascendantEdgeTabsSpec: {
      tabDepthToTraversalLength: 0.04810606060599847,
      tabRoundingDistanceRatio: 0.75,
      flapRoundingDistanceRatio: 1,
      tabsCount: 3,
      midpointDepthToTabDepth: 0.6,
      tabStartGapToTabDepth: 0.5,
      holeReachToTabDepth: 0.1,
      holeWidthRatio: 0.4,
      holeFlapTaperAngle: Math.PI / 10,
      tabWideningAngle: Math.PI / 6,
    },
    baseEdgeTabSpec: {
      tabDepthToAscendantEdgeLength: 1.5,
      roundingDistanceRatio: 1.0,
      holeDepthToTabDepth: 0.5,
      holeTaper: Math.PI / 4.5,
      holeBreadthToHalfWidth: 0.5,
      finDepthToTabDepth: 1.1,
      finTipDepthToFinDepth: 1.1,
    },
  };

  @observable
  public baseScoreDashSpec = {
    relativeStrokeDasharray: [2, 1],
    strokeDashLength: 3,
    strokeDashOffsetRatio: 0,
  };

  @observable
  public interFaceScoreDashSpec = {
    relativeStrokeDasharray: [PHI, 1, 1 / PHI, 1, PHI],
    strokeDashLength: 10,
    strokeDashOffsetRatio: 0.75,
  };

  @observable
  public polyhedraPyramidGeometries = polyhedra;

  @observable
  public selectedShape: string = 'great-stellated-dodecahedron';

  @observable
  public shapeHeightInCm: number = 30;

  @observable
  public activeCutHolePatternD = '';

  @computed
  get pyramidGeometry() { return this.polyhedraPyramidGeometries[this.selectedShape]; }

  // eslint-disable-next-line class-methods-use-this
  getSetter(path) {
    return (value) => { set(this, path, value); };
  }

  // set to Glowforge bed dimensions
  @observable
  public svgDimensions = { width: CM_TO_PIXELS_RATIO * 49.5, height: CM_TO_PIXELS_RATIO * 27.9 };

  @computed
  get faceInteriorAngles():number[] {
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
    const {
      dieLinesSpec: { ascendantEdgeTabsSpec: { tabDepthToTraversalLength } },
    } = this;
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
    return `translate(0, ${this.insetPolygon.box.ymin}) scale(${
      this.insetPolygon.box.width / this.borderPolygon.box.width
    })`;
  }

  @action
  applyFaceHolePattern(svgString) {
    const parser = new window.DOMParser();
    const doc = parser.parseFromString(svgString, 'image/svg+xml');
    this.activeCutHolePatternD = doc.querySelector('path:last-of-type').getAttribute('d');
  }

  @action
  clearFaceHolePattern() {
    this.activeCutHolePatternD = '';
  }

  renderPyramidNetToString() {
    return ReactDOMServer.renderToString(React.createElement(
      // @ts-ignore
      SVGWrapper, this.svgDimensions,
      React.createElement(PyramidNet, { store: this }),
    ));
  }

  renderFaceBoundaryToString() {
    return ReactDOMServer.renderToString(React.createElement(FaceBoundarySVG, { store: this }));
  }
}

export const store = new Store();
// @ts-ignore
window.store = store;
