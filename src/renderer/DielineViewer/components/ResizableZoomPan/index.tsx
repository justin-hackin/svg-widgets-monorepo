import React from 'react';
import {
  ReactSVGPanZoom, INITIAL_VALUE, TOOL_PAN, POSITION_LEFT,
} from 'react-svg-pan-zoom';
import { ResizeDetector } from './components/ResizeDetector';

const BACKGROUND_COLOR = '#454545';
const { useState } = React;

export const ResizableZoomPan = ({ children, onChange = null, ...props }) => {
  const [viewValue, setValue] = useState(INITIAL_VALUE);
  const [tool, setTool] = useState(TOOL_PAN);
  return (
    <>
      <ResizeDetector>
        {(dimensions) => (
          <ReactSVGPanZoom
            value={viewValue}
            background={BACKGROUND_COLOR}
            tool={tool}
            toolbarProps={{ position: POSITION_LEFT }}
            customMiniature={() => null}
            onChangeValue={(val) => {
              if (onChange) {
                onChange(val);
              }
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
