import React from 'react';
import ReactResizeDetector from 'react-resize-detector';
import { isValidNumber } from '../../../../common/util/geom';

export const ResizeDetector = ({ children }) => (
  <ReactResizeDetector handleWidth handleHeight>
    {({ width, height }) => ((!isValidNumber(width) || !isValidNumber(height))
      ? (<div />)
      : children({ width, height }))}
  </ReactResizeDetector>
);
