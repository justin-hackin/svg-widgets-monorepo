import { ExtendedModel, model } from 'mobx-keystone';
import Flatten from '@flatten-js/core';
import { computed } from 'mobx';
import React from 'react';
import { round } from 'lodash';
import { DividerBaseSavedModel } from './DividerBaseSavedModel';
import { augmentSegmentEndpoints, getPositiveSlopeSlatSegments, notchPanel } from './util';
import { PathData } from '../../common/path/PathData';
import { getBoundingBoxAttrs } from '../../common/util/svg';
import { DisjunctWidgetAssetMember } from '../../WidgetWorkspace/widget-types/DisjunctAssetsDefinition';
import { switchProp } from '../../common/keystone-tweakables/props';
import Point = Flatten.Point;
import point = Flatten.point;
import segment = Flatten.segment;
import Segment = Flatten.Segment;

const reflectByWidth = (pt: Point, width: number) => (point(width - pt.x, pt.y));

interface SegmentInfo {
  length: number,
  copies: number,
  firstIndex: number,
}

@model('DiamondGridDividerSavedModel')
export class DiamondGridDividerSavedModel extends ExtendedModel(DividerBaseSavedModel, {
  flushPostProcess: switchProp(false),
}) {
  @computed
  get positiveCrosshatchSegments() {
    return getPositiveSlopeSlatSegments(
      this.shelfWidth.value, this.shelfHeight.value,
      this.cubbyWidth.value, this.materialThickness.value,
    ).map((seg) => augmentSegmentEndpoints(seg, this.matThicknessAdjust));
  }

  @computed
  get crosshatchProfilePath() {
    return this.positiveCrosshatchSegments.reduce((path, segment) => path
      .move(segment.ps).line(segment.pe)
      .move(reflectByWidth(segment.ps, this.shelfWidth.value))
      .line(reflectByWidth(segment.pe, this.shelfWidth.value)),
    new PathData());
  }

  @computed
  get uniqueSegmentsInfo(): SegmentInfo[] {
    // could iterate over only half but this complicates case of centerd crosshatch
    return this.positiveCrosshatchSegments
      .map((segment) => round(segment.length, 10))
      .reduce((acc, segLen, index) => {
        // could be more efficient, meh
        const lengthMatch = acc.find(({ length }) => length === segLen);
        if (lengthMatch) {
          lengthMatch.copies += 2;
        } else {
          acc.push({
            length: segLen,
            firstIndex: index,
            copies: 2,
          });
        }
        return acc;
      }, [] as SegmentInfo[]);
  }

  @computed
  get matThicknessAdjust(): number {
    return ((this.flushPostProcess.value ? 1 : -1) * (this.materialThickness.value / 2));
  }

  getMirroredSegment(seg: Segment) {
    const mirrorStart = reflectByWidth(seg.ps, this.shelfWidth.value);
    const mirrorEnd = reflectByWidth(seg.pe, this.shelfWidth.value);
    return segment(mirrorStart, mirrorEnd);
  }

  getFirstPanelNotchCenter(segIndex: number): number {
    const targetSeg = this.positiveCrosshatchSegments[segIndex];
    const firstIntersectionSegment = this.positiveCrosshatchSegments.find((seg) => {
      const mirrorSegment = this.getMirroredSegment(seg);
      const intersection = mirrorSegment.intersect(targetSeg);
      return intersection.length > 0;
    });
    return targetSeg.intersect(this.getMirroredSegment(firstIntersectionSegment))[0].distanceTo(targetSeg.ps)[0];
  }

  getNumIntersectionsForPanel(segIndex: number) {
    const targetSeg = this.positiveCrosshatchSegments[segIndex];
    return this.positiveCrosshatchSegments
      .reduce((numIntersects, seg) => (
        this.getMirroredSegment(seg).intersect(targetSeg).length ? numIntersects + 1 : numIntersects
      ), 0);
  }

  @computed
  get panelAssetMembers(): DisjunctWidgetAssetMember[] {
    return this.uniqueSegmentsInfo.map(({ length, copies, firstIndex }, index) => {
      const start = this.getFirstPanelNotchCenter(firstIndex);
      const path = notchPanel(
        start, length, this.shelfDepth.value,
        this.getNumIntersectionsForPanel(firstIndex),
        this.cubbyWidth.value, this.materialThickness.value,
      );
      const d = path.getD();
      const { width, height } = getBoundingBoxAttrs(d);
      return {
        name: `Panel ${index + 1}`,
        documentAreaProps: { width, height },
        copies,
        Component: () => (
          <g>
            <path d={d} fill="none" stroke="red" strokeWidth={4} />
          </g>
        ),
      };
    });
  }
}
