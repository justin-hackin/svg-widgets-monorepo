import * as React from 'react';
import ReactResizeDetector from 'react-resize-detector';
import { isValidNumber } from '../../../../../util/geom';

export const ResizeDetector = (props) => (
  <ReactResizeDetector handleWidth handleHeight>
    {({ width, height }) => {
      console.log(height, width);
      return ((!isValidNumber(width) || !isValidNumber(height))
        ? (<div />)
        : props.children({ width, height }));
    }}
  </ReactResizeDetector>
);
