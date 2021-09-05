/* eslint-disable max-classes-per-file,no-param-reassign */
import ReactDOMServer from 'react-dom/server';
import React from 'react';

import {
  Model, modelAction, prop, model, fromSnapshot,
} from 'mobx-keystone';
import { computed, observable } from 'mobx';
import { PyramidNetModel } from './PyramidNetStore';
import { closedPolygonPath } from '../util/shapes/generic';
import { getBoundingBoxAttrs, pathDToViewBoxStr } from '../../../common/util/svg';
import { PyramidNetTestTabs } from '../widgets/PyramidNetTestTabs/PyramidNetTestTabsSvg';
import { SVGWrapper } from '../data/SVGWrapper';
import { TextureEditorModel } from '../../../common/components/TextureEditor/models/TextureEditorModel';
import { tryResolvePath } from '../../../common/util/mobx-keystone';
import { dashPatternsDefaultFn, StrokeDashPathPatternModel } from '../util/shapes/strokeDashPath';
import { RawFaceDecorationModel } from './RawFaceDecorationModel';

export const renderTestTabsToString = (widgetStore, preferencesStore): string => ReactDOMServer.renderToString(
  <SVGWrapper>
    <PyramidNetTestTabs preferencesStore={preferencesStore} widgetStore={widgetStore} />
  </SVGWrapper>,
);

export const DecorationBoundarySVG = ({ store }: { store: PyramidNetPluginModel }) => {
  const {
    pyramidNetSpec: { normalizedDecorationBoundaryPoints },
  } = store;
  const normalizedDecorationBoundaryPathD = closedPolygonPath(normalizedDecorationBoundaryPoints).getD();

  return (
    <svg viewBox={pathDToViewBoxStr(normalizedDecorationBoundaryPathD)}>
      <path fill="#FFD900" stroke="#000" d={normalizedDecorationBoundaryPathD} />
    </svg>
  );
};

@model('PyramidNetPluginModel')
export class PyramidNetPluginModel extends Model({
  pyramidNetSpec: prop<PyramidNetModel>(() => (new PyramidNetModel({}))).withSetter(),
  textureEditor: prop<TextureEditorModel>(() => (new TextureEditorModel({}))),
  dashPatterns: prop<StrokeDashPathPatternModel[]>(dashPatternsDefaultFn),
}) {
  @observable
  textureEditorOpen = false;

  @computed
  get shapeDefinition() {
    return this.pyramidNetSpec;
  }

  @computed
  get boundingBox() {
    return getBoundingBoxAttrs(this.pyramidNetSpec.netPaths.cut.getD());
  }

  @modelAction
  setTextureEditorOpen(isOpen) {
    if (this.pyramidNetSpec.faceDecoration instanceof RawFaceDecorationModel) {
      // texture editor directly references faceDecoration and will not render TextureSvg if it is Raw
      this.pyramidNetSpec.resetFaceDecoration();
    }
    this.textureEditorOpen = isOpen;
  }

  @modelAction
  renderDecorationBoundaryToString():string {
    // @ts-ignore
    return ReactDOMServer.renderToString(React.createElement(DecorationBoundarySVG, { store: this }));
  }

  @modelAction
  getFileBasename() {
    return `${
      tryResolvePath(this, ['pyramidNetSpec', 'pyramid', 'shapeName']) || 'shape'
    }__${
      tryResolvePath(this, ['pyramidNetSpec', 'faceDecoration', 'pattern', 'sourceFileName']) || 'undecorated'
    }`;
  }

  @modelAction
  onFileOpen(filePath, fileData) {
    this.setPyramidNetSpec(fromSnapshot<PyramidNetModel>(fileData));
  }
}
