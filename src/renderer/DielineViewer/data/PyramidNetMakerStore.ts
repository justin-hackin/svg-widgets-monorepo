/* eslint-disable max-classes-per-file */
import { set } from 'lodash';
import { action, observable } from 'mobx';
import ReactDOMServer from 'react-dom/server';
import React from 'react';
import {
  FaceBoundarySVG, PyramidNet, PyramidNetSpec, StoreSpec, StyleSpec,
} from '../components/PyramidNet';
import { CM_TO_PIXELS_RATIO } from '../util/geom';
import { polyhedra } from './polyhedra';
import { SVGWrapper } from './SVGWrapper';
import { PyramidNetStore } from './PyramidNetStore';

export class PyramidNetMakerStore implements StoreSpec {
  @observable
  public pyramidNetSpec:PyramidNetSpec = new PyramidNetStore();

  @observable
  public styleSpec:StyleSpec = {
    dieLineProps: { fill: 'none', strokeWidth: 1 },
    cutLineProps: { stroke: '#FF3A5E' },
    scoreLineProps: { stroke: '#BDFF48' },
    designBoundaryProps: { stroke: 'none', fill: 'rgb(68,154,255)' },
  };

  @observable
  public polyhedraPyramidGeometries = polyhedra;

  // eslint-disable-next-line class-methods-use-this
  getSetter(path) {
    return (value) => { set(this, path, value); };
  }

  // set to Glowforge bed dimensions
  @observable
  public svgDimensions = { width: CM_TO_PIXELS_RATIO * 49.5, height: CM_TO_PIXELS_RATIO * 27.9 };

  renderPyramidNetToString() {
    return ReactDOMServer.renderToString(React.createElement(
      // @ts-ignore
      SVGWrapper, this.svgDimensions,
      React.createElement(PyramidNet, { store: this }),
    ));
  }

  renderFaceBoundaryToString() {
    return ReactDOMServer.renderToString(React.createElement(FaceBoundarySVG, { store: this }));
  }

  @action
  setValueAtPath(path, value) {
    set(this, path, value);
  }
}

export const store = new PyramidNetMakerStore();
