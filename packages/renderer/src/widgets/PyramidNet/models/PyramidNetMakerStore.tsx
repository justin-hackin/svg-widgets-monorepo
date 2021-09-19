/* eslint-disable max-classes-per-file,no-param-reassign */
import ReactDOMServer from 'react-dom/server';
import React from 'react';

import {
  fromSnapshot, model, Model, modelAction, prop,
} from 'mobx-keystone';
import { computed, observable } from 'mobx';
import { PyramidNetModel } from './PyramidNetStore';
import { getBoundingBoxAttrs, pathDToViewBoxStr } from '../../../common/util/svg';
import { PyramidNetTestTabs } from '../../PyramidNetTestTabs/PyramidNetTestTabsSvg';
import { SVGWrapper } from '../../../WidgetWorkspace/components/SVGWrapper';
import { RawFaceDecorationModel } from './RawFaceDecorationModel';
import { TextureEditorModel }
  from '../components/TextureEditorDrawer/components/TextureEditor/models/TextureEditorModel';
import { closedPolygonPath } from '../../../common/path/shapes/generic';
import { dashPatternsDefaultFn, StrokeDashPathPatternModel } from '../../../common/path/shapes/strokeDashPath';

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
  insertNewDashPattern() {
    this.dashPatterns.push(
      new StrokeDashPathPatternModel({ relativeStrokeDasharray: [20, 10, 5, 7] }),
    );
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
      this.pyramidNetSpec.pyramid.shapeName.value || 'shape'
    }__${
      this.pyramidNetSpec.faceDecorationSourceFileName || 'undecorated'
    }`;
  }

  @modelAction
  onFileOpen(filePath, fileData) {
    this.setPyramidNetSpec(fromSnapshot<PyramidNetModel>(fileData));
  }
}
