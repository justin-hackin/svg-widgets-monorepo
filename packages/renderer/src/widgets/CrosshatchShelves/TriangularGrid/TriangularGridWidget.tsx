import {
  ExtendedModel, model, Model, prop,
} from 'mobx-keystone';
import React from 'react';
import { computed } from 'mobx';
import { flatten, range } from 'lodash';
import Flatten from '@flatten-js/core';
import { numberTextProp, sliderWithTextProp, switchProp } from '../../../common/keystone-tweakables/props';
import { PIXELS_PER_INCH } from '../../../common/util/units';
import { BaseWidgetClass } from '../../../WidgetWorkspace/widget-types/BaseWidgetClass';
import { DisjunctAssetsDefinition } from '../../../WidgetWorkspace/widget-types/DisjunctAssetsDefinition';
import { PathData } from '../../../common/path/PathData';
import { pathDToViewBoxStr } from '../../../common/util/svg';
import { closedPolygonPath } from '../../../common/path/shapes/generic';
import point = Flatten.point;
import segment = Flatten.segment;
import Segment = Flatten.Segment;

const segmentsToLinePath = (segments: Segment[]): PathData => segments.reduce(
  (path, segment) => path.move(segment.ps).line(segment.pe),
  new PathData(),
);

export const polarPoint = (theta: number, length: number) => point(
  Math.cos(theta) * length, Math.sin(theta) * length,
);

const getPolygonPoints = (radius: number, sides: number) => range(0, sides)
  .map((index) => polarPoint(index * (1 / 3) * Math.PI, radius));

const POLYGON_SIDES = 6;
@model('TriangularGridDividerSavedModel')
export class TriangularGridDividerSavedModel extends Model({
  hexagonHeight: numberTextProp(24 * PIXELS_PER_INCH, {
    useUnits: true,
  }),
  materialThickness: numberTextProp(0.5 * PIXELS_PER_INCH, {
    useUnits: true,
  }),
  subdivisions: sliderWithTextProp(5, {
    min: 2, max: 10, step: 1,
  }),
  postProcessVertexEdges: switchProp(true),
}) {
  @computed
  get wallVertices() {
    return getPolygonPoints(this.hexagonHeight.value / 2, POLYGON_SIDES);
  }

  @computed
  get wallSegments() {
    return range(0, POLYGON_SIDES).map((i) => segment(
      this.wallVertices[i], this.wallVertices[(i + 1) % POLYGON_SIDES],
    ));
  }

  @computed
  get wallSegmentsPathD() {
    return closedPolygonPath(this.wallVertices).getD();
  }

  @computed
  get perSlopeDividerProfileSegments(): Segment[][] {
    const subs = this.subdivisions.value;
    const segLen = this.wallSegments[0].length;
    return range(0, POLYGON_SIDES / 2).map((i) => {
      const startSeg = this.wallSegments[i];
      const endSeg = this.wallSegments[i + (POLYGON_SIDES / 2)];
      return range(0, subs + 1).map((j) => {
        const fencepostWidth = segLen / subs;
        const traversal = j * fencepostWidth;
        const startPt = j === 0 ? startSeg.ps.clone() : startSeg.pointAtLength(traversal);
        const endPt = j === 0 ? endSeg.pe.clone() : endSeg.pointAtLength(segLen - traversal);
        return segment(startPt, endPt);
      });
    });
  }

  @computed
  get crosshatchProfilePathD() {
    return segmentsToLinePath(flatten(this.perSlopeDividerProfileSegments)).getD();
  }

  @computed
  get panelIntersectionDistances(): number[][] {
    return this.perSlopeDividerProfileSegments[0]
      .map((baseSegment) => [
        ...this.perSlopeDividerProfileSegments[1], ...this.perSlopeDividerProfileSegments[2],
      ]
        .reduce((interDist, testSegment) => {
          const inter = baseSegment.intersect(testSegment);
          if (inter.length) {
            const thisDist = baseSegment.ps.distanceTo(inter[0])[0];
            interDist.push(thisDist);
          }
          return interDist;
        }, [] as number[]).sort());
  }
}

@model('TriangularGridWidgetModel')
export class TriangularGridWidgetModel extends ExtendedModel(BaseWidgetClass, {
  savedModel: prop(() => new TriangularGridDividerSavedModel({})),
}) {
  // eslint-disable-next-line class-methods-use-this
  getFileBasename() {
    return 'TriangularGrid';
  }

  specFileExtension = 'hexd';

  @computed
  get assetDefinition() {
    return new DisjunctAssetsDefinition([
      {
        name: 'Profile view',
        documentAreaProps: {
          viewBox: pathDToViewBoxStr(this.savedModel.wallSegmentsPathD),
        },
        Component: () => (
          <g>
            <path
              d={this.savedModel.crosshatchProfilePathD}
              fill="none"
              stroke="#ddd"
              strokeWidth={this.savedModel.materialThickness.value}
            />
            <path
              d={this.savedModel.wallSegmentsPathD}
              fill="none"
              stroke="#ddd"
              strokeWidth={1}
            />
          </g>
        ),
      },
    ], 0, true);
  }
}
