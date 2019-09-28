import React from 'react';
import { UncontrolledReactSVGPanZoom } from 'react-svg-pan-zoom';
import { PolygonPath } from './PolygonPath';

export default class SVGViewer extends React.PureComponent {
  componentDidMount() {
    this.Viewer.fitToViewer();
  }

  render() {
    return (
      <div>
        <UncontrolledReactSVGPanZoom
          width={1024}
          height={576}
          ref={(Viewer) => { this.Viewer = Viewer; }}
        >
          <svg width={617} height={316}>
            {' '}
            <PolygonPath points={[[108, 108.5], [180, 209.5]]} />
            {/* or <svg viewBox="0 0 617 316" */}
            <g fillOpacity=".5" strokeWidth="4">
              <rect x="400" y="40" width="100" height="200" fill="#4286f4" stroke="#f4f142" />
              <circle cx="108" cy="108.5" r="100" fill="#0ff" stroke="#0ff" />
              <circle cx="180" cy="209.5" r="100" fill="#ff0" stroke="#ff0" />
              <circle cx="220" cy="109.5" r="100" fill="#f0f" stroke="#f0f" />
            </g>
          </svg>
        </UncontrolledReactSVGPanZoom>
      </div>
    );
  }
}
