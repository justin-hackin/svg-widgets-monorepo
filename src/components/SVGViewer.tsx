// import { useQueryParam, StringParam, JsonParam } from 'use-query-params';
import range from 'lodash-es/range';
import React, { useState } from 'react';
import isNaN from 'lodash-es/isNaN';
import ReactResizeDetector from 'react-resize-detector';
import { ReactSVGPanZoom, INITIAL_VALUE, TOOL_PAN } from 'react-svg-pan-zoom';
import {
  PyramidNet, StyleSpec, PyramidNetSpec, PyramidGeometrySpec,
} from './PyramidNet';
import { GridPattern } from './GridPattern';
import { AscendantEdgeTabsSpec, BaseEdgeConnectionTabSpec } from '../util/shapes';

const PHI = (1 + Math.sqrt(5)) / 2;
let relativeStrokeDasharray = range(15).reduce((acc, i) => {
  const mux = Math.sqrt(3) * i;
  acc.push(mux * PHI, mux);
  return acc;
}, []);
relativeStrokeDasharray = relativeStrokeDasharray.concat(relativeStrokeDasharray.slice(0).reverse());

const interFaceScoreDashSpec = {
  relativeStrokeDasharray,
  strokeDashLength: 10,
  strokeDashOffsetRatio: 0.75,
};

const tabScoreDashSpec = {
  relativeStrokeDasharray: [2, 1],
  strokeDashLength: 0.1,
  strokeDashOffsetRatio: 0,
};

const ascendantEdgeTabsSpec: AscendantEdgeTabsSpec = {
  tabDepthToTraversalLength: 0.04810606060599847,
  roundingDistance: 0.3,
  flapRoundingDistance: 2,
  tabsCount: 3,
  midpointDepthToTabDepth: 0.6,
  tabStartGapToTabDepth: 0.5,
  holeReachToTabDepth: 0.1,
  holeWidthRatio: 0.4,
  holeFlapTaperAngle: Math.PI / 10,
  tabWideningAngle: Math.PI / 6,
  scoreDashSpec: tabScoreDashSpec,
};

const pyramidGeometry:PyramidGeometrySpec = {
  relativeFaceEdgeLengths: [40, 30, 50],
  faceCount: 4,
  firstEdgeLengthToShapeHeight: 2,
};

const baseEdgeTabSpec:BaseEdgeConnectionTabSpec = {
  tabDepthToAscendantEdgeLength: 1.5,
  roundingDistance: 1.5,
  holeDepthToTabDepth: 0.5,
  holeTaper: Math.PI / 4.5,
  holeBreadthToHalfWidth: 0.5,
  finDepthToTabDepth: 1.1,
  finTipDepthToFinDepth: 1.1,
  scoreDashSpec: tabScoreDashSpec,
};

const styleSpec:StyleSpec = {
  dieLineProps: { fill: 'none', strokeWidth: 0.05 },
  cutLineProps: { stroke: '#FF244D' },
  scoreLineProps: { stroke: '#BDFF48' },
  designBoundaryProps: { stroke: 'none', fill: 'rgba(0, 52, 255, 0.53)' },
};

const pyramidNetSpec: PyramidNetSpec = {
  pyramidGeometry,
  styleSpec,
  shapeHeightInCm: 2.2,
  dieLinesSpec: {
    baseEdgeTabSpec,
    ascendantEdgeTabsSpec,
    interFaceScoreDashSpec,
  },
};

const svgDimensions = { width: 1024, height: 960 };
const isValidNumber = (num) => typeof num === 'number' && !isNaN(num);
export function SVGViewer() {
  // TODO: make this work
  // const [value = INITIAL_VALUE, setValue] = useQueryParam('ReactSVGPanZoomValue', JsonParam);
  // const [tool = TOOL_PAN, setTool] = useQueryParam('ReactSVGPanZoomTool', StringParam);
  const [value, setValue] = useState(INITIAL_VALUE);
  const [tool, setTool] = useState(TOOL_PAN);
  const patternId = 'grid-pattern';
  return (
    <div style={{ width: '100%', height: '100%', position: 'absolute' }}>
      <ReactResizeDetector handleWidth handleHeight>
        {({ width, height }) => ((!isValidNumber(width) || !isValidNumber(height)) ? <div /> : (
          <ReactSVGPanZoom
            value={value}
            width={width}
            height={height}
            background="#454545"
            SVGBackground={`url(#${patternId})`}
            tool={tool}
            onChangeValue={(val) => {
              setValue(val);
            }}
            onChangeTool={setTool}
            id="viewer"
          >
            <svg {...svgDimensions}>
              <GridPattern patternId={patternId} />
              <g transform="translate(300, 300) scale(4, 4) ">
                <PyramidNet
                  {...pyramidNetSpec}
                />
              </g>
            </svg>
          </ReactSVGPanZoom>
        ))}
      </ReactResizeDetector>
    </div>

  );
}
