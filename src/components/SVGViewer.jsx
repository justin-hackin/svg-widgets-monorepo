import React from 'react';
import { UncontrolledReactSVGPanZoom } from 'react-svg-pan-zoom';
import { PyramidNet } from './PyramidNet';

export default class SVGViewer extends React.PureComponent {
  render() {
    return (
      <div>
        <UncontrolledReactSVGPanZoom
          width={1024}
          height={576}
          ref={(Viewer) => { this.Viewer = Viewer; }}
        >
          <svg width={617} height={316}>
            <g transform="translate(100, 100)">
              <PyramidNet netSpec={{ faceEdgeLengths: [30, 10, 30], faceCount: 10 }} />
            </g>
          </svg>
        </UncontrolledReactSVGPanZoom>
      </div>
    );
  }
}
