import React, { useState } from 'react';
import { ReactSVGPanZoom, INITIAL_VALUE, TOOL_PAN } from 'react-svg-pan-zoom';
import { ResizeDetector } from './ResizeDetector';

export const ResizableZoomPan = ({ children, ...props }) => {
  const [viewValue, setValue] = useState(INITIAL_VALUE);
  const [tool, setTool] = useState(TOOL_PAN);
  return (
    <>
      <ResizeDetector>
        {(dimensions) => (
          <ReactSVGPanZoom
            value={viewValue}
            background="#454545"
            tool={tool}
            onChangeValue={(val) => {
              setValue(val);
            }}
            onChangeTool={setTool}
            {...props}
            {...dimensions}
          >
            {children}
          </ReactSVGPanZoom>
        )}
      </ResizeDetector>
    </>
  );
};
