// import { useQueryParam, StringParam, JsonParam } from 'use-query-params';
import React, { useState } from 'react';
import ReactResizeDetector from 'react-resize-detector';
import { ReactSVGPanZoom, INITIAL_VALUE, TOOL_PAN } from 'react-svg-pan-zoom';
import { PyramidNet } from './PyramidNet';
import { GridPattern } from './GridPattern';

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
                <PyramidNet netSpec={{ faceEdgeLengths: [40, 30, 50], faceCount: 4 }} />
              </g>
            </svg>
          </ReactSVGPanZoom>
        ))}
      </ReactResizeDetector>
    </div>

  );
}
