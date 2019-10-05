import React from 'react';
import { PyramidNet } from './PyramidNet';

const svgDimensions = { width: 1024, height: 576 };
export default class SVGViewer extends React.PureComponent {
  render() {
    return (
      <div>
        <svg {...svgDimensions}>
          <g transform="translate(300, 300)">
            <PyramidNet netSpec={{ faceEdgeLengths: [30, 10, 30], faceCount: 5 }} />
          </g>
        </svg>
      </div>
    );
  }
}
