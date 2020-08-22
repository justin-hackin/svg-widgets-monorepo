import React from 'react';
import ReactResizeDetector from 'react-resize-detector';
import { isValidNumber } from '../../../util/geom';

export const ResizeDetector = (props) => (
  <ReactResizeDetector handleWidth handleHeight>
    {({ width, height }) => ((!isValidNumber(width) || !isValidNumber(height))
      ? (<div />)
      : props.children({ width, height }))}
  </ReactResizeDetector>
);
