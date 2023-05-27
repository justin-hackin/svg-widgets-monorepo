import React from 'react';
import ReactResizeDetector from 'react-resize-detector';

export const isValidNumber = (num) => typeof num === 'number' && !Number.isNaN(num);

export function ResizeDetector({ children }) {
  return (
    <ReactResizeDetector handleWidth handleHeight>
      {({ width, height }) => ((!isValidNumber(width) || !isValidNumber(height))
        ? (<div />)
        : children({ width, height }))}
    </ReactResizeDetector>
  );
}
