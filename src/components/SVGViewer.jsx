import React from 'react';
import { UncontrolledReactSVGPanZoom } from 'react-svg-pan-zoom';
import { PyramidNet } from './PyramidNet';

const svgDimensions = { width: 1024, height: 960 };
export default class SVGViewer extends React.PureComponent {
  render() {
    return (
      <div>
        <UncontrolledReactSVGPanZoom
          {...svgDimensions}
          ref={(Viewer) => { this.Viewer = Viewer; }}
        >
          <svg {...svgDimensions}>
            <g transform="translate(300, 300)">
              <PyramidNet netSpec={{ faceEdgeLengths: [40, 30, 50], faceCount: 4 }} />
            </g>
          </svg>
        </UncontrolledReactSVGPanZoom>
      </div>
    );
  }
}
