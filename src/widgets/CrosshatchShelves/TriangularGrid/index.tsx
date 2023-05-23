import React from 'react';
import { computed } from 'mobx';
import { flatten, range } from 'lodash-es';
import Flatten from '@flatten-js/core';
import { ExtendedModel } from 'mobx-keystone';
import { LicenseWatermarkContent } from '@/widgets/LicenseWatermarkContent';
import { BaseWidgetClass } from '@/WidgetWorkspace/widget-types/BaseWidgetClass';
import { assertNotNullish } from '@/common/util/assert';
import { PathData } from '@/common/PathData';
import { numberTextProp, sliderWithTextProp, switchProp } from '../../../common/keystone-tweakables/props';
import { PIXELS_PER_INCH } from '../../../common/util/units';
import {
  DisjunctAssetsDefinition,
  DisjunctWidgetAssetMember,
} from '../../../WidgetWorkspace/widget-types/DisjunctAssetsDefinition';
import { pathDToViewBoxStr } from '../../../common/util/svg';
import { closedPolygonPath } from '../../../common/shapes/generic';
import { TRI_NOTCH_LEVEL, triNotchPanel } from './util';
import { augmentSegmentEndpoints } from '../util';
import { widgetModel } from '../../../WidgetWorkspace/models/WorkspaceModel';
import widgetPreview from '../previews/triangle-grid-divider.png';
import point = Flatten.point;
import segment = Flatten.segment;
import Segment = Flatten.Segment;

const triNotchLevelToLabel = (level: TRI_NOTCH_LEVEL) => {
  switch (level) {
    case TRI_NOTCH_LEVEL.BOTTOM:
      return 'Bottom';
    case TRI_NOTCH_LEVEL.MID:
      return 'Middle';
    case TRI_NOTCH_LEVEL.TOP:
      return 'Top';
    default:
      throw new Error('unexpected notch level');
  }
};

const isMiddleOfRange = (index: number, rangeLength: number) => index === Math.round((rangeLength - 1) / 2);

const segmentsToLinePath = (segments: Segment[]): PathData => segments.reduce(
  (path, segment) => path.move(segment.ps).line(segment.pe),
  new PathData(),
);

export const polarPoint = (theta: number, length: number) => point(Math.cos(theta) * length, Math.sin(theta) * length);

const getPolygonPoints = (radius: number, sides: number) => range(0, sides)
  .map((index) => polarPoint(index * (1 / 3) * Math.PI, radius));

const POLYGON_SIDES = 6;

@widgetModel('TriangleGridDivider', widgetPreview)
export class TriangularGridWidgetModel extends ExtendedModel(BaseWidgetClass, {
  hexagonWidth: numberTextProp(24 * PIXELS_PER_INCH, {
    useUnits: true,
  }),
  hexagonDepth: numberTextProp(12 * PIXELS_PER_INCH, {
    useUnits: true,
  }),
  materialThickness: numberTextProp(0.5 * PIXELS_PER_INCH, {
    useUnits: true,
  }),
  subdivisions: sliderWithTextProp(5, {
    min: 2, max: 10, step: 1,
  }),
  postProcessVertexEdges: switchProp(false),

}) {
  spacingMarginRatio = 1.1;

  @computed
  get hexagonRadius() {
    return this.hexagonWidth.value / 2;
  }

  @computed
  get wallVertices() {
    return getPolygonPoints(this.hexagonRadius, POLYGON_SIDES);
  }

  @computed
  get hexagonHeight() {
    return 2 * Math.sin(Math.PI / 3) * this.hexagonRadius;
  }

  @computed
  get wallSegments() {
    return range(0, POLYGON_SIDES)
      .map((i) => segment(this.wallVertices[i], this.wallVertices[(i + 1) % POLYGON_SIDES]));
  }

  @computed
  get wallSegmentsPathD() {
    return closedPolygonPath(this.wallVertices).getD();
  }

  @computed
  get perSlopeDividerProfileSegments(): Segment[][] {
    const subs = this.subdivisions.value;
    const segLen = this.wallSegments[0].length;
    const halfPolygonSides = POLYGON_SIDES / 2;
    return range(0, halfPolygonSides).map((i) => {
      const startSeg = this.wallSegments[i];
      const endSeg = this.wallSegments[i + (POLYGON_SIDES / 2)];
      return range(0, subs + 1).map((j) => {
        const fencepostWidth = segLen / subs;
        const traversal = j * fencepostWidth;
        const startPt = j === 0 ? startSeg.ps.clone() : startSeg.pointAtLength(Math.min(traversal, startSeg.length));
        const endPt = j === 0 ? endSeg.pe.clone() : endSeg.pointAtLength(Math.min(segLen - traversal, endSeg.length));
        assertNotNullish(startPt);
        assertNotNullish(endPt);
        const toWallSegment = segment(startPt, endPt);
        return [0, subs].includes(j)
          ? augmentSegmentEndpoints(toWallSegment, -1 * this.cornerFittingRetractionDistance)
          : toWallSegment;
      });
    });
  }

  @computed
  get crosshatchProfilePathD() {
    return segmentsToLinePath(flatten(this.perSlopeDividerProfileSegments)).getD();
  }

  @computed
  get cornerFittingRetractionDistance() {
    return this.postProcessVertexEdges.value ? 0 : (this.materialThickness.value / 2) / Math.tan(Math.PI / 6);
  }

  @computed
  get subdivisionsFencepostsMiddleEnd() {
    return Math.ceil((this.subdivisions.value + 1) / 2);
  }

  @computed
  get panelIntersectionDistances(): number[][] {
    return this.perSlopeDividerProfileSegments[0]
      .slice(0, this.subdivisionsFencepostsMiddleEnd)
      .map((baseSegment) => [
        ...this.perSlopeDividerProfileSegments[1],
        ...this.perSlopeDividerProfileSegments[2],
      ]
        .reduce((interDist, testSegment) => {
          const inter = baseSegment.intersect(testSegment);
          if (inter.length) {
            const thisDist = baseSegment.ps.distanceTo(inter[0])[0];
            const ROUNDING_CUTOFF = 0.00001;
            // filter out intersections at vertices of hexagon
            if (thisDist > ROUNDING_CUTOFF && Math.abs(baseSegment.length - thisDist) > ROUNDING_CUTOFF) {
              interDist.push(thisDist);
            }
          }
          return interDist;
          // eslint-disable-next-line no-nested-ternary
        }, [] as number[]).sort((a, b) => (a === b ? 0 : (a < b ? -1 : 1))));
  }

  @computed
  get panelAssetMembers(): DisjunctWidgetAssetMember[] {
    return flatten([TRI_NOTCH_LEVEL.BOTTOM, TRI_NOTCH_LEVEL.MID, TRI_NOTCH_LEVEL.TOP]
      .map((notchLevel) => (this.perSlopeDividerProfileSegments[0]
        .slice(0, this.subdivisionsFencepostsMiddleEnd)
        .map((segment, index) => {
          // first item will have double the copies because it it same as last
          const panelPathD = triNotchPanel(
            segment.length,
            this.hexagonDepth.value,
            this.panelIntersectionDistances[index],
            this.materialThickness.value,
            notchLevel,
          ).getD();
          const transX = (notchLevel - 0.5) * this.hexagonHeight * this.spacingMarginRatio;
          const transY = (index * this.hexagonDepth.value + (this.hexagonHeight / 2)) * this.spacingMarginRatio;
          return {
            name: `${triNotchLevelToLabel(notchLevel)}_${index + 1}`,
            documentAreaProps: { viewBox: `${transX} ${transY} ${segment.length} ${this.hexagonDepth.value}` },
            copies: isMiddleOfRange(index, this.subdivisions.value + 1) ? 3 : 6,
            Component: () => (
              <g transform={`translate(${transX}, ${transY})`}>
                <path fill="none" strokeWidth={this.materialThickness.value / 20} stroke="red" d={panelPathD} />
              </g>
            ),
          };
        }))));
  }

  fileBasename = 'TriangularGrid';

  @computed
  get assetDefinition() {
    return new DisjunctAssetsDefinition([
      {
        name: 'Profile view',
        documentAreaProps: {
          viewBox: pathDToViewBoxStr(this.wallSegmentsPathD),
        },
        Component: () => (
          <g>
            <path
              d={this.crosshatchProfilePathD}
              fill="none"
              stroke="#ddd"
              strokeWidth={this.materialThickness.value}
            />
            <path
              d={this.wallSegmentsPathD}
              fill="none"
              stroke="#ddd"
              strokeWidth={1}
            />
          </g>
        ),
      },
      ...this.panelAssetMembers,
    ]);
  }

  WatermarkContent = LicenseWatermarkContent;
}
