import set from 'lodash-es/set';
import { observable, computed } from 'mobx';

import { DieLinesSpec, PyramidNetSpec, StyleSpec } from '~/components/PyramidNet';
import { PHI } from '~util/geom';
import { polyhedra } from '~data/polyhedra';

const tabScoreDashSpec = {
  relativeStrokeDasharray: [2, 1],
  strokeDashLength: 0.1,
  strokeDashOffsetRatio: 0,
};

export class Store implements PyramidNetSpec {
  @observable
  public styleSpec:StyleSpec = {
    dieLineProps: { fill: 'none', strokeWidth: 0.05 },
    cutLineProps: { stroke: '#FF244D' },
    scoreLineProps: { stroke: '#BDFF48' },
    designBoundaryProps: { stroke: 'none', fill: 'rgba(0, 52, 255, 0.53)' },
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
      scoreDashSpec: tabScoreDashSpec,
    },
    baseEdgeTabSpec: {
      tabDepthToAscendantEdgeLength: 1.5,
      roundingDistanceRatio: 1.0,
      holeDepthToTabDepth: 0.5,
      holeTaper: Math.PI / 4.5,
      holeBreadthToHalfWidth: 0.5,
      finDepthToTabDepth: 1.1,
      finTipDepthToFinDepth: 1.1,
      scoreDashSpec: tabScoreDashSpec,
    },
    interFaceScoreDashSpec: {
      relativeStrokeDasharray: [PHI, 1, 1 / PHI, 1, PHI],
      strokeDashLength: 1,
      strokeDashOffsetRatio: 0.75,
    },
  };

  @observable
  public polyhedraPyramidGeometries = polyhedra;

  @observable
  public selectedShape: string = 'great-stellated-dodecahedron';

  @observable
  public shapeHeightInCm: number = 2.2;

  savePyramidNet() {
    console.log('SAVING...');
    // @ts-ignore
    window.ipcRenderer.send('save-string', './test.svg', 'poo');// eslint-disable-line no-undef, max-len
  }

  @computed
  get pyramidGeometry() { return this.polyhedraPyramidGeometries[this.selectedShape]; }

  // eslint-disable-next-line class-methods-use-this
  getSetter(path) {
    return (value) => { set(this, path, value); };
  }
}

export const store = new Store();
